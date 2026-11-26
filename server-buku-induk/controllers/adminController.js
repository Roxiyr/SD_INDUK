const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const entities = {
  guru: {
    table: 'guru',
    id: 'id_guru',
    fields: [
      'nomor_induk_guru',
      'nama_lengkap',
      'jenis_kelamin',
      'no_hp',
      'status_kepegawaian',
    ],
  },
  admin: {
    table: 'admin',
    id: 'id_admin',
    fields: [
      'nomor_induk_admin',
      'nama_lengkap',
      'jabatan',
      'status_kepegawaian',
    ],
  },
  kelas: {
    table: 'kelas',
    id: 'id_kelas',
    fields: [
      'nama_kelas',
      'tingkat',
      'fase',
      'tahun_pelajaran',
      'id_wali_kelas',
    ],
  },
  mapel: {
    table: 'mapel',
    id: 'id_mapel',
    fields: ['kode_mapel', 'nama_mapel', 'kategori_mapel', 'urutan_cetak'],
  },
  ekskul: {
    table: 'ekstrakurikuler',
    id: 'id_ekskul_master',
    fields: ['nama_ekskul', 'kategori_ekskul'],
  },
  'akun-guru': {
    table: 'pengguna',
    id: 'id_user',
    fields: ['username', 'password', 'id_referensi', 'nama_lengkap'],
  },
  penugasan: {
    table: 'penugasan_guru_mapel',
    id: 'id_penugasan',
    fields: ['id_guru', 'id_kelas', 'id_mapel', 'tahun_pelajaran'],
  },
};

/** Menghitung ringkasan statistik dashboard admin dan konfigurasi semester aktif. @param {Object} req Request admin. @param {Object} res Statistik dashboard. */
async function dashboard(_req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT (SELECT COUNT(*) FROM siswa) total_siswa,(SELECT COUNT(*) FROM guru) total_guru,(SELECT COUNT(*) FROM admin) total_admin,(SELECT COUNT(*) FROM kelas) total_kelas,(SELECT COUNT(*) FROM mapel) total_mapel,(SELECT COUNT(*) FROM ekstrakurikuler) total_ekskul',
    );
    const [school] = await pool.query(
      'SELECT tahun_ajaran_aktif,semester_aktif FROM profil_sekolah ORDER BY id_profil LIMIT 1',
    );
    return res.json({ ...rows[0], ...(school[0] || {}) });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

/** Mendaftar data master untuk entitas yang telah diizinkan. @param {Object} req Nama entitas dari URL. @param {Object} res Daftar baris master. */
async function list(req, res) {
  const e = entities[req.params.entity];
  if (!e) return res.status(404).json({ message: 'Entitas tidak tersedia.' });
  let sql = `SELECT * FROM ${e.table} ORDER BY ${e.id} DESC`;
  if (req.params.entity === 'akun-guru')
    sql =
      "SELECT u.id_user,u.username,u.id_referensi,u.nama_lengkap,u.role,g.nama_lengkap AS nama_guru,u.created_at FROM pengguna u LEFT JOIN guru g ON g.id_guru=u.id_referensi WHERE u.role='GURU' ORDER BY u.id_user DESC";
  if (req.params.entity === 'penugasan')
    sql =
      'SELECT p.*,g.nama_lengkap AS nama_guru,k.nama_kelas,m.nama_mapel FROM penugasan_guru_mapel p JOIN guru g ON g.id_guru=p.id_guru JOIN kelas k ON k.id_kelas=p.id_kelas JOIN mapel m ON m.id_mapel=p.id_mapel ORDER BY p.id_penugasan DESC';
  if (req.params.entity === 'kelas')
    sql =
      'SELECT k.*,g.nama_lengkap AS nama_wali_kelas FROM kelas k LEFT JOIN guru g ON g.id_guru=k.id_wali_kelas ORDER BY k.id_kelas DESC';
  const [rows] = await pool.query(sql);
  return res.json({ data: rows });
}

/** Memuat detail kelas beserta guru wali dan anggota siswa. @param {Object} req ID kelas dari URL. @param {Object} res Detail kelas dan roster aktif. */
async function getClassDetail(req, res) {
  const [classes] = await pool.execute(
    'SELECT k.*,g.nama_lengkap AS nama_wali_kelas FROM kelas k LEFT JOIN guru g ON g.id_guru=k.id_wali_kelas WHERE k.id_kelas=?',
    [req.params.id],
  );
  if (!classes[0])
    return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
  const [students] = await pool.execute(
    'SELECT nisn,nis,nama_lengkap,jenis_kelamin,status_siswa FROM siswa WHERE id_kelas=? ORDER BY nis ASC',
    [req.params.id],
  );
  return res.json({ data: { kelas: classes[0], siswa: students } });
}

/** Membuat data master atau akun guru dengan hash kata sandi. @param {Object} req Entitas dan field form. @param {Object} res Baris baru. */
async function create(req, res) {
  const e = entities[req.params.entity];
  if (!e) return res.status(404).json({ message: 'Entitas tidak tersedia.' });
  const b = { ...req.body };
  if (req.params.entity === 'akun-guru') {
    if (!b.password || !b.id_referensi)
      return res
        .status(400)
        .json({ message: 'Profil guru dan kata sandi awal wajib diisi.' });
    const [guru] = await pool.execute(
      'SELECT id_guru,nomor_induk_guru,nama_lengkap FROM guru WHERE id_guru=?',
      [b.id_referensi],
    );
    if (!guru[0])
      return res.status(400).json({ message: 'Profil guru tidak ditemukan.' });
    b.role = 'GURU';
    b.password = await bcrypt.hash(b.password, 10);
  }
  const fields = e.fields.filter((f) => b[f] !== undefined);
  if (!fields.length)
    return res.status(400).json({ message: 'Data tidak lengkap.' });
  if (req.params.entity === 'akun-guru') fields.push('role');
  const vals = fields.map((f) => b[f]);
  const [r] = await pool.execute(
    `INSERT INTO ${e.table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
    vals,
  );
  return res
    .status(201)
    .json({ id: r.insertId, message: 'Data berhasil ditambahkan.' });
}

/** Memperbarui record master berdasarkan daftar kolom terpilih. @param {Object} req ID dan field pembaruan. @param {Object} res Status perubahan. */
async function update(req, res) {
  const e = entities[req.params.entity];
  if (!e) return res.status(404).json({ message: 'Entitas tidak tersedia.' });
  const body = { ...req.body };
  if (req.params.entity === 'akun-guru' && body.id_referensi !== undefined) {
    const [guru] = await pool.execute(
      'SELECT id_guru FROM guru WHERE id_guru=?',
      [body.id_referensi],
    );
    if (!guru[0])
      return res.status(400).json({ message: 'Profil guru tidak ditemukan.' });
  }
  const fields = e.fields.filter(
    (f) =>
      body[f] !== undefined &&
      !(
        req.params.entity === 'akun-guru' &&
        f === 'password' &&
        !body.password
      ),
  );
  if (req.params.entity === 'akun-guru' && body.password) {
    body.password = await bcrypt.hash(body.password, 10);
    if (!fields.includes('password')) fields.push('password');
  }
  if (!fields.length)
    return res.status(400).json({ message: 'Tidak ada perubahan.' });
  const [r] = await pool.execute(
    `UPDATE ${e.table} SET ${fields.map((f) => `${f}=?`).join(',')} WHERE ${e.id}=?`,
    [...fields.map((f) => body[f]), req.params.id],
  );
  return r.affectedRows
    ? res.json({ message: 'Data diperbarui.' })
    : res.status(404).json({ message: 'Data tidak ditemukan.' });
}

/** Menghapus record master dan mengandalkan constraint relasi database. @param {Object} req Entitas/ID record. @param {Object} res Status penghapusan. */
async function remove(req, res) {
  const e = entities[req.params.entity];
  if (!e) return res.status(404).json({ message: 'Entitas tidak tersedia.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (req.params.entity === 'guru')
      await connection.execute(
        "DELETE FROM pengguna WHERE role='GURU' AND id_referensi=?",
        [req.params.id],
      );
    const [r] = await connection.execute(
      `DELETE FROM ${e.table} WHERE ${e.id}=?`,
      [req.params.id],
    );
    if (!r.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }
    await connection.commit();
    return res.json({ message: 'Data dihapus.' });
  } catch (error) {
    await connection.rollback();
    return res
      .status(409)
      .json({
        message: 'Data tidak dapat dihapus karena masih digunakan.',
        detail: error.message,
      });
  } finally {
    connection.release();
  }
}

/** Mengambil konfigurasi profil sekolah. @param {Object} req Request pengguna masuk. @param {Object} res Profil sekolah. */
async function getSchool(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM profil_sekolah ORDER BY id_profil LIMIT 1',
  );
  return res.json({ data: rows[0] || null });
}

/** Memperbarui konfigurasi sekolah utama. @param {Object} req Field profil sekolah. @param {Object} res Status pembaruan. */
async function updateSchool(req, res) {
  const fields = [
    'nama_sekolah',
    'npsn',
    'alamat_lengkap',
    'kelurahan',
    'kecamatan',
    'kota',
    'kode_pos',
    'nama_kepala_sekolah',
    'nip_kepala_sekolah',
    'tahun_ajaran_aktif',
    'semester_aktif',
    'logo_kop_url',
  ];
  const set = fields.filter((f) => req.body[f] !== undefined);
  if (!set.length)
    return res.status(400).json({ message: 'Tidak ada perubahan.' });
  await pool.execute(
    `UPDATE profil_sekolah SET ${set.map((f) => `${f}=?`).join(',')} ORDER BY id_profil LIMIT 1`,
    set.map((f) => req.body[f]),
  );
  return res.json({ message: 'Profil sekolah diperbarui.' });
}

/** Menghitung ringkasan sederhana dashboard guru. @param {Object} req Identitas guru. @param {Object} res Ringkasan kelas dan jumlah siswa. */
async function guruDashboard(req, res) {
  const [rows] = await pool.execute(
    'SELECT COUNT(DISTINCT k.id_kelas) kelas_binaan,(SELECT COUNT(*) FROM siswa s JOIN kelas x ON x.id_kelas=s.id_kelas WHERE x.id_wali_kelas=?) total_siswa FROM kelas k WHERE k.id_wali_kelas=?',
    [req.user.id_referensi, req.user.id_referensi],
  );
  return res.json(rows[0]);
}
/** Mengembalikan daftar ekskul untuk pilihan pada form asesmen wali. @param {Object} req Pengguna terautentikasi. @param {Object} res Daftar ekstrakurikuler. */
async function listEkskul(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM ekstrakurikuler ORDER BY nama_ekskul',
  );
  return res.json({ data: rows });
}

/** Mengembalikan URL gambar yang sudah disimpan middleware upload untuk foto atau logo sekolah. @param {Object} req Tipe gambar dan file terunggah. @param {Object} res URL publik berkas. */
function uploadImage(req, res) {
  if (!['siswa', 'logo'].includes(req.params.type))
    return res
      .status(400)
      .json({ message: 'Tipe gambar harus siswa atau logo.' });
  if (!req.file)
    return res.status(400).json({ message: 'File gambar wajib dipilih.' });
  return res.status(201).json({ url: `/uploads/${req.file.filename}` });
}
module.exports = {
  dashboard,
  list,
  getClassDetail,
  create,
  update,
  remove,
  getSchool,
  updateSchool,
  guruDashboard,
  listEkskul,
  uploadImage,
};
