const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/** Memvalidasi kredensial login dan mengembalikan JWT serta konteks guru. @param {Object} req Body username/password. @param {Object} res Mengembalikan token atau 401. */
async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res
      .status(400)
      .json({ message: 'Username dan kata sandi wajib diisi.' });
  try {
    const [rows] = await pool.execute(
      'SELECT id_user, username, password, role, id_referensi, nama_lengkap FROM pengguna WHERE username = ?',
      [username],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(401)
        .json({ message: 'Username atau kata sandi salah.' });
    const context = await getContext(user);
    const token = jwt.sign(
      {
        id_user: user.id_user,
        username: user.username,
        role: user.role,
        id_referensi: user.id_referensi,
        nama_lengkap: user.nama_lengkap,
      },
      process.env.JWT_SECRET || 'dev-only-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );
    return res.json({ token, user: { ...context } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Gagal memproses login.', detail: error.message });
  }
}

/** Memuat kelas binaan dan penugasan untuk akun aktif. @param {Object} user Identitas akun. @returns {Object} Profil user dengan konteks akses terbaru. */
async function getContext(user) {
  let kelas_binaan = [];
  let mapel_diampu = [];
  if (user.role === 'GURU' && user.id_referensi) {
    const [classes] = await pool.execute(
      'SELECT id_kelas, nama_kelas, tingkat, tahun_pelajaran FROM kelas WHERE id_wali_kelas = ?',
      [user.id_referensi],
    );
    kelas_binaan = classes;
    const [assignments] = await pool.execute(
      'SELECT p.id_penugasan, p.id_kelas, p.id_mapel, p.tahun_pelajaran, k.nama_kelas, m.nama_mapel FROM penugasan_guru_mapel p JOIN kelas k ON k.id_kelas=p.id_kelas JOIN mapel m ON m.id_mapel=p.id_mapel WHERE p.id_guru=?',
      [user.id_referensi],
    );
    mapel_diampu = assignments;
  }
  return {
    id_user: user.id_user,
    username: user.username,
    role: user.role,
    id_referensi: user.id_referensi,
    nama_lengkap: user.nama_lengkap,
    is_wali_kelas: kelas_binaan.length > 0,
    kelas_binaan,
    mapel_diampu,
  };
}

/** Mengembalikan ulang profil dan hak akses terbaru. @param {Object} req Identitas terautentikasi. @param {Object} res Mengembalikan profil aktif. */
async function getMe(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id_user, username, role, id_referensi, nama_lengkap FROM pengguna WHERE id_user=?',
      [req.user.id_user],
    );
    if (!rows[0])
      return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    return res.json({ user: await getContext(rows[0]) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

/** Mengganti kata sandi akun yang sedang login. @param {Object} req Body password lama dan baru. @param {Object} res Mengembalikan status perubahan. */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8)
    return res
      .status(400)
      .json({ message: 'Kata sandi baru minimal 8 karakter.' });
  const [rows] = await pool.execute(
    'SELECT password FROM pengguna WHERE id_user=?',
    [req.user.id_user],
  );
  if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password)))
    return res.status(400).json({ message: 'Kata sandi lama tidak sesuai.' });
  await pool.execute('UPDATE pengguna SET password=? WHERE id_user=?', [
    await bcrypt.hash(newPassword, 10),
    req.user.id_user,
  ]);
  return res.json({ message: 'Kata sandi berhasil diubah.' });
}
module.exports = { login, getMe, getContext, changePassword };
