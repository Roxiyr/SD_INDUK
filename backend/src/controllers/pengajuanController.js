const db = require('../config/database');
const { success, fail } = require('../utils/http');

const editableStudentFields = new Set([
  'nama_panggilan',
  'tempat_lahir',
  'agama',
  'kewarganegaraan',
  'bahasa_sehari_hari',
  'alamat',
  'nomor_telepon',
  'bertempat_tinggal_pada',
]);

async function teacherCanSeeStudent(idUser, nisn) {
  const [rows] = await db.execute(
    `SELECT 1
     FROM guru g
     JOIN penugasan_guru pg ON pg.id_guru = g.id_guru AND pg.status = 'Aktif'
     JOIN siswa_kelas sk
       ON sk.id_kelas = pg.id_kelas
      AND sk.id_tahun_ajaran = pg.id_tahun_ajaran
      AND sk.status = 'Aktif'
     JOIN tahun_ajaran ta
       ON ta.id_tahun_ajaran = sk.id_tahun_ajaran AND ta.status = 'Aktif'
     WHERE g.id_user = ? AND g.status = 'Aktif' AND sk.nisn = ?
     LIMIT 1`,
    [idUser, nisn],
  );
  return rows.length > 0;
}

async function list(req, res) {
  let condition = '';
  const params = [];
  if (req.user.role === 'SISWA') {
    if (!req.user.nisn) return fail(res, 403, 'Akun siswa belum terhubung ke profil.');
    condition = 'WHERE p.nisn = ?';
    params.push(req.user.nisn);
  } else if (req.user.role === 'GURU') {
    condition = `WHERE EXISTS (
      SELECT 1
      FROM guru g
      JOIN penugasan_guru pg ON pg.id_guru = g.id_guru AND pg.status = 'Aktif'
      JOIN siswa_kelas sk ON sk.id_kelas = pg.id_kelas
        AND sk.id_tahun_ajaran = pg.id_tahun_ajaran AND sk.status = 'Aktif'
      JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = sk.id_tahun_ajaran AND ta.status = 'Aktif'
      WHERE g.id_user = ? AND g.status = 'Aktif' AND sk.nisn = p.nisn
    )`;
    params.push(req.user.id_user);
  }
  const [rows] = await db.execute(
    `SELECT p.id_pengajuan, p.nisn, s.nama_lengkap, p.jenis_perubahan,
            p.data_sebelum, p.data_diajukan, p.status, p.catatan_peninjau,
            p.diajukan_pada, p.ditinjau_pada
     FROM pengajuan_perubahan_data p
     JOIN siswa s ON s.nisn = p.nisn
     ${condition}
     ORDER BY p.diajukan_pada DESC`,
    params,
  );
  return success(res, rows);
}

async function create(req, res) {
  const nisn = req.user.role === 'SISWA' ? req.user.nisn : req.body?.nisn;
  const requested = req.body?.data_diajukan;
  const kind = typeof req.body?.jenis_perubahan === 'string'
    ? req.body.jenis_perubahan.trim()
    : '';
  if (!nisn || typeof nisn !== 'string' || !/^\d{10}$/.test(nisn)) {
    return fail(res, 400, 'NISN siswa tidak valid.');
  }
  if (req.user.role === 'GURU' && !(await teacherCanSeeStudent(req.user.id_user, nisn))) {
    return fail(res, 403, 'Anda tidak ditugaskan untuk siswa tersebut.');
  }
  if (!requested || typeof requested !== 'object' || Array.isArray(requested)
      || !kind || kind.length > 80) {
    return fail(res, 400, 'Jenis perubahan dan data yang diajukan wajib diisi.');
  }
  const entries = Object.entries(requested);
  if (!entries.length || entries.some(([field, value]) =>
    !editableStudentFields.has(field) || typeof value !== 'string' || value.length > 2000,
  )) {
    return fail(res, 400, 'Data berisi kolom yang tidak dapat diajukan atau formatnya tidak valid.');
  }
  const [students] = await db.execute(
    'SELECT nisn FROM siswa WHERE nisn = ? LIMIT 1',
    [nisn],
  );
  if (!students.length) return fail(res, 404, 'Siswa tidak ditemukan.');
  const [pending] = await db.execute(
    "SELECT id_pengajuan FROM pengajuan_perubahan_data WHERE nisn = ? AND status = 'Menunggu' LIMIT 1",
    [nisn],
  );
  if (pending.length) return fail(res, 409, 'Siswa masih memiliki pengajuan yang menunggu tinjauan.');
  const columns = entries.map(([field]) => `\`${field}\``).join(', ');
  const [before] = await db.execute(
    `SELECT ${columns} FROM siswa WHERE nisn = ?`,
    [nisn],
  );
  const [result] = await db.execute(
    `INSERT INTO pengajuan_perubahan_data
       (nisn, id_pemohon, jenis_perubahan, data_sebelum, data_diajukan)
     VALUES (?, ?, ?, ?, ?)`,
    [nisn, req.user.id_user, kind, JSON.stringify(before[0]), JSON.stringify(requested)],
  );
  return success(res, { id_pengajuan: result.insertId }, 'Pengajuan berhasil dikirim.', 201);
}

async function cancel(req, res) {
  if (req.user.role !== 'SISWA' || !req.user.nisn) {
    return fail(res, 403, 'Hanya siswa yang dapat membatalkan pengajuannya sendiri.');
  }
  const [result] = await db.execute(
    `UPDATE pengajuan_perubahan_data
     SET status = 'Dibatalkan'
     WHERE id_pengajuan = ? AND nisn = ? AND status = 'Menunggu'`,
    [req.params.id, req.user.nisn],
  );
  if (!result.affectedRows) return fail(res, 404, 'Pengajuan menunggu tidak ditemukan.');
  return success(res, null, 'Pengajuan berhasil dibatalkan.');
}

async function review(req, res) {
  const id = Number(req.params.id);
  const { status, catatan_peninjau: note = '' } = req.body || {};
  if (!Number.isInteger(id) || id < 1
      || !['Disetujui', 'Ditolak'].includes(status)
      || typeof note !== 'string' || note.length > 2000) {
    return fail(res, 400, 'Status atau catatan peninjauan tidak valid.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [requests] = await conn.execute(
      `SELECT id_pengajuan, nisn, data_diajukan, status
       FROM pengajuan_perubahan_data
       WHERE id_pengajuan = ?
       FOR UPDATE`,
      [id],
    );
    if (!requests.length || requests[0].status !== 'Menunggu') {
      await conn.rollback();
      return fail(res, 404, 'Pengajuan menunggu tidak ditemukan.');
    }
    const request = requests[0];
    if (status === 'Disetujui') {
      const submitted = typeof request.data_diajukan === 'string'
        ? JSON.parse(request.data_diajukan)
        : request.data_diajukan;
      const entries = Object.entries(submitted || {});
      if (!entries.length || entries.some(([field, value]) =>
        !editableStudentFields.has(field) || typeof value !== 'string',
      )) {
        await conn.rollback();
        return fail(res, 400, 'Data pengajuan tidak valid dan tidak dapat diterapkan.');
      }
      await conn.execute(
        `UPDATE siswa SET ${entries.map(([field]) => `\`${field}\` = ?`).join(', ')}
         WHERE nisn = ?`,
        [...entries.map(([, value]) => value), request.nisn],
      );
    }
    await conn.execute(
      `UPDATE pengajuan_perubahan_data
       SET status = ?, id_peninjau = ?, catatan_peninjau = ?, ditinjau_pada = CURRENT_TIMESTAMP
       WHERE id_pengajuan = ?`,
      [status, req.user.id_user, note.trim() || null, id],
    );
    await conn.commit();
    return success(res, { id_pengajuan: id, status }, `Pengajuan ${status.toLowerCase()}.`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { list, create, cancel, review };
