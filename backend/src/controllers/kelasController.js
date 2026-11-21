const db = require('../config/database');
const { success, fail } = require('../utils/http');

function classPhase(level) {
  if (level <= 2) return 'A';
  if (level <= 4) return 'B';
  return 'C';
}

function parseClass(body = {}) {
  const name = typeof body.nama_kelas === 'string' ? body.nama_kelas.trim() : '';
  const level = Number(body.tingkat);
  const room = typeof body.ruang === 'string' ? body.ruang.trim() : '';
  const capacity = body.kapasitas === undefined ? 32 : Number(body.kapasitas);
  if (!name || name.length > 20 || !Number.isInteger(level) || level < 1 || level > 6
      || !Number.isInteger(capacity) || capacity < 1 || capacity > 500
      || (body.ruang !== undefined && typeof body.ruang !== 'string')) {
    return null;
  }
  return { name, level, room: room || null, capacity };
}

async function list(req, res) {
  const [rows] = await db.execute(
    `SELECT k.id_kelas, k.id_tahun_ajaran, k.nama_kelas, k.tingkat, k.fase,
            k.kapasitas, k.ruang, k.status, ta.nama_tahun_ajaran,
            MAX(CASE WHEN pg.peran = 'Wali Kelas' AND pg.status = 'Aktif'
                     THEN g.nama_lengkap END) AS wali_kelas,
            COUNT(DISTINCT CASE WHEN sk.status = 'Aktif' THEN sk.nisn END) AS jumlah_siswa
     FROM kelas k
     JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = k.id_tahun_ajaran
     LEFT JOIN penugasan_guru pg
       ON pg.id_kelas = k.id_kelas AND pg.id_tahun_ajaran = k.id_tahun_ajaran
     LEFT JOIN guru g ON g.id_guru = pg.id_guru AND g.status = 'Aktif'
     LEFT JOIN siswa_kelas sk
       ON sk.id_kelas = k.id_kelas AND sk.id_tahun_ajaran = k.id_tahun_ajaran
     GROUP BY k.id_kelas, k.id_tahun_ajaran, k.nama_kelas, k.tingkat, k.fase,
              k.kapasitas, k.ruang, k.status, ta.nama_tahun_ajaran
     ORDER BY ta.status = 'Aktif' DESC, k.tingkat, k.nama_kelas`,
  );
  return success(res, rows);
}

async function listActive(req, res) {
  const [rows] = await db.execute(
    `SELECT k.id_kelas, k.nama_kelas, k.tingkat, k.fase, ta.nama_tahun_ajaran
     FROM kelas k
     JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = k.id_tahun_ajaran
     WHERE k.status = 'Aktif' AND ta.status = 'Aktif'
     ORDER BY k.tingkat, k.nama_kelas`,
  );
  return success(res, rows);
}

async function create(req, res) {
  const data = parseClass(req.body);
  if (!data) return fail(res, 400, 'Nama kelas, tingkat 1–6, kapasitas, atau ruang tidak valid.');
  const [[year]] = await db.execute(
    "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  if (!year) return fail(res, 409, 'Tahun ajaran aktif belum tersedia.');
  try {
    const [result] = await db.execute(
      `INSERT INTO kelas (id_tahun_ajaran, nama_kelas, tingkat, fase, kapasitas, ruang)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [year.id_tahun_ajaran, data.name, data.level, classPhase(data.level), data.capacity, data.room],
    );
    return success(res, { id_kelas: result.insertId }, 'Kelas berhasil ditambahkan.', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Nama kelas sudah digunakan pada tahun ajaran aktif.');
    throw error;
  }
}

async function update(req, res) {
  const id = Number(req.params.id);
  const data = parseClass(req.body);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID kelas tidak valid.');
  if (!data || !['Aktif', 'Nonaktif'].includes(req.body?.status || 'Aktif')) {
    return fail(res, 400, 'Data kelas tidak valid.');
  }
  try {
    const [result] = await db.execute(
      `UPDATE kelas
       SET nama_kelas = ?, tingkat = ?, fase = ?, kapasitas = ?, ruang = ?, status = ?
       WHERE id_kelas = ?`,
      [data.name, data.level, classPhase(data.level), data.capacity, data.room, req.body.status || 'Aktif', id],
    );
    if (!result.affectedRows) return fail(res, 404, 'Kelas tidak ditemukan.');
    return success(res, { id_kelas: id }, 'Data kelas berhasil diperbarui.');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Nama kelas sudah digunakan pada tahun ajaran ini.');
    throw error;
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID kelas tidak valid.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [classes] = await conn.execute(
      'SELECT id_kelas, id_tahun_ajaran FROM kelas WHERE id_kelas = ? FOR UPDATE',
      [id],
    );
    if (!classes.length) {
      await conn.rollback();
      return fail(res, 404, 'Kelas tidak ditemukan.');
    }
    const [[placement]] = await conn.execute(
      `SELECT COUNT(*) AS total FROM siswa_kelas
       WHERE id_kelas = ? AND id_tahun_ajaran = ? AND status = 'Aktif'`,
      [id, classes[0].id_tahun_ajaran],
    );
    if (Number(placement.total) > 0) {
      await conn.rollback();
      return fail(res, 409, 'Kelas masih memiliki siswa aktif. Pindahkan siswa sebelum menonaktifkan kelas.');
    }
    await conn.execute("UPDATE kelas SET status = 'Nonaktif' WHERE id_kelas = ?", [id]);
    await conn.execute(
      `UPDATE penugasan_guru
       SET status = 'Selesai', tanggal_selesai = CURRENT_DATE()
       WHERE id_kelas = ? AND id_tahun_ajaran = ? AND status = 'Aktif'`,
      [id, classes[0].id_tahun_ajaran],
    );
    await conn.commit();
    return success(res, null, 'Kelas dinonaktifkan; riwayat tetap tersimpan.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { list, listActive, create, update, remove };
