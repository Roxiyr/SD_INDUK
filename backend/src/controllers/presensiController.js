const db = require('../config/database');
const { success, fail } = require('../utils/http');

const attendanceStatuses = new Set(['Hadir', 'Sakit', 'Izin', 'Alpa']);

function isValidDate(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return parsed.getUTCFullYear() === Number(year)
    && parsed.getUTCMonth() === Number(month) - 1
    && parsed.getUTCDate() === Number(day);
}

async function list(req, res) {
  const date = req.query.tanggal;
  const classId = req.query.id_kelas === undefined ? null : Number(req.query.id_kelas);
  if (!isValidDate(date) || (classId !== null && (!Number.isInteger(classId) || classId < 1))) {
    return fail(res, 400, 'Tanggal atau kelas tidak valid.');
  }
  const [[year]] = await db.execute(
    "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  if (!year) return success(res, { classes: [], students: [] });

  const params = [year.id_tahun_ajaran];
  let teacherCondition = '';
  if (req.user.role === 'GURU') {
    teacherCondition = `AND EXISTS (
      SELECT 1 FROM penugasan_guru pg
      JOIN guru g ON g.id_guru = pg.id_guru
      WHERE pg.id_kelas = k.id_kelas
        AND pg.id_tahun_ajaran = k.id_tahun_ajaran
        AND pg.status = 'Aktif' AND g.id_user = ? AND g.status = 'Aktif'
    )`;
    params.push(req.user.id_user);
  }
  const [classes] = await db.execute(
    `SELECT DISTINCT k.id_kelas, k.nama_kelas, k.tingkat, k.fase
     FROM kelas k
     WHERE k.id_tahun_ajaran = ? AND k.status = 'Aktif' ${teacherCondition}
     ORDER BY k.tingkat, k.nama_kelas`,
    params,
  );
  if (!classId) return success(res, { classes, students: [] });
  if (!classes.some((item) => Number(item.id_kelas) === classId)) {
    return fail(res, 403, 'Kelas tidak ditugaskan kepada akun Anda.');
  }
  const [students] = await db.execute(
    `SELECT s.nisn, s.nama_lengkap, COALESCE(p.status_kehadiran, '') AS status_kehadiran,
            COALESCE(p.keterangan, '') AS keterangan
     FROM siswa_kelas sk
     JOIN siswa s ON s.nisn = sk.nisn
     LEFT JOIN presensi_harian p
       ON p.nisn = sk.nisn AND p.id_tahun_ajaran = sk.id_tahun_ajaran
      AND p.id_kelas = sk.id_kelas AND p.tanggal = ?
     WHERE sk.id_kelas = ? AND sk.id_tahun_ajaran = ?
       AND sk.status = 'Aktif' AND s.status_siswa = 'Aktif'
     ORDER BY s.nama_lengkap`,
    [date, classId, year.id_tahun_ajaran],
  );
  return success(res, { classes, students });
}

async function save(req, res) {
  const classId = Number(req.body?.id_kelas);
  const date = req.body?.tanggal;
  const entries = req.body?.entries;
  if (!Number.isInteger(classId) || classId < 1 || !isValidDate(date)
      || !Array.isArray(entries) || !entries.length
      || entries.some((item) => !item || typeof item !== 'object'
        || !/^\d{10}$/.test(item.nisn || '')
        || !attendanceStatuses.has(item.status_kehadiran)
        || (item.keterangan !== undefined
          && (typeof item.keterangan !== 'string' || item.keterangan.length > 255)))
      || new Set(entries.map((item) => item?.nisn)).size !== entries.length) {
    return fail(res, 400, 'Kelas, tanggal, dan daftar kehadiran wajib valid.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [years] = await conn.execute(
      "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
    );
    if (!years.length) {
      await conn.rollback();
      return fail(res, 409, 'Tahun ajaran aktif belum tersedia.');
    }
    const yearId = years[0].id_tahun_ajaran;
    const [classes] = await conn.execute(
      `SELECT k.id_kelas
       FROM kelas k
       WHERE k.id_kelas = ? AND k.id_tahun_ajaran = ? AND k.status = 'Aktif'
         AND (? = 'OPERATOR' OR EXISTS (
           SELECT 1 FROM penugasan_guru pg
           JOIN guru g ON g.id_guru = pg.id_guru
           WHERE pg.id_kelas = k.id_kelas AND pg.id_tahun_ajaran = k.id_tahun_ajaran
             AND pg.status = 'Aktif' AND g.status = 'Aktif' AND g.id_user = ?
         ))
       LIMIT 1`,
      [classId, yearId, req.user.role, req.user.id_user],
    );
    if (!classes.length) {
      await conn.rollback();
      return fail(res, 403, 'Kelas tidak ditugaskan kepada akun Anda.');
    }
    const nisns = [...new Set(entries.map((item) => item.nisn))];
    const placeholders = nisns.map(() => '?').join(', ');
    const [placed] = await conn.execute(
      `SELECT nisn FROM siswa_kelas
       WHERE id_kelas = ? AND id_tahun_ajaran = ? AND status = 'Aktif'
         AND nisn IN (${placeholders})`,
      [classId, yearId, ...nisns],
    );
    if (placed.length !== nisns.length) {
      await conn.rollback();
      return fail(res, 400, 'Daftar berisi siswa yang bukan anggota aktif kelas tersebut.');
    }
    for (const item of entries) {
      await conn.execute(
        `INSERT INTO presensi_harian
          (nisn, id_kelas, id_tahun_ajaran, tanggal, status_kehadiran, keterangan, dicatat_oleh)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           id_kelas = VALUES(id_kelas),
           id_tahun_ajaran = VALUES(id_tahun_ajaran),
           status_kehadiran = VALUES(status_kehadiran),
           keterangan = VALUES(keterangan),
           dicatat_oleh = VALUES(dicatat_oleh)`,
        [item.nisn, classId, yearId, date, item.status_kehadiran, item.keterangan?.trim() || null, req.user.id_user],
      );
    }
    await conn.commit();
    return success(res, { saved: entries.length }, 'Presensi berhasil disimpan.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { list, save };
