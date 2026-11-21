const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { success, fail } = require('../utils/http');
const ROLES = ['OPERATOR', 'GURU', 'SISWA'];

async function list(req, res) {
  const role = req.query.role;
  if (role && !ROLES.includes(role)) return fail(res, 400, 'Filter role tidak valid.');
  const sql = 'SELECT id_user, username, role, nama_lengkap, nisn, created_at FROM pengguna' + (role ? ' WHERE role = ?' : '') + ' ORDER BY nama_lengkap';
  const [rows] = await db.execute(sql, role ? [role] : []);
  return success(res, rows);
}

async function create(req, res) {
  const { username, password, role, nama_lengkap, nisn = null } = req.body || {};
  if (!username || !password || password.length < 8 || !nama_lengkap || !ROLES.includes(role)) return fail(res, 400, 'Username, nama, role valid, dan password minimal 8 karakter wajib diisi.');
  if (role === 'SISWA') {
    if (!/^\d{10}$/.test(nisn || '')) return fail(res, 400, 'Akun SISWA wajib memiliki NISN 10 digit.', [{ field: 'nisn', detail: 'NISN harus terdiri dari 10 digit.' }]);
    const [student] = await db.execute('SELECT nisn FROM siswa WHERE nisn = ?', [nisn]);
    if (!student.length) return fail(res, 400, 'NISN siswa tidak ditemukan.', [{ field: 'nisn', detail: 'Tambahkan data siswa terlebih dahulu.' }]);
  }
  const [result] = await db.execute('INSERT INTO pengguna (username, password, role, nama_lengkap, nisn) VALUES (?, ?, ?, ?, ?)', [username, await bcrypt.hash(password, 10), role, nama_lengkap, role === 'SISWA' ? nisn : null]);
  const [rows] = await db.execute('SELECT id_user, username, role, nama_lengkap, nisn FROM pengguna WHERE id_user = ?', [result.insertId]);
  return success(res, rows[0], 'Akun berhasil dibuat.', 201);
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID pengguna tidak valid.');
  const { nama_lengkap, role, password, nisn } = req.body || {};
  if (role && !ROLES.includes(role)) return fail(res, 400, 'Role tidak valid.');
  if (password !== undefined && password.length < 8) return fail(res, 400, 'Password minimal 8 karakter.');
  if (role === 'SISWA' && !/^\d{10}$/.test(nisn || '')) return fail(res, 400, 'Akun SISWA wajib memiliki NISN 10 digit.');
  const assignments = []; const values = [];
  if (nama_lengkap !== undefined) { assignments.push('nama_lengkap = ?'); values.push(nama_lengkap); }
  if (role !== undefined) { assignments.push('role = ?'); values.push(role); assignments.push('nisn = ?'); values.push(role === 'SISWA' ? (nisn || null) : null); }
  else if (nisn !== undefined) { assignments.push('nisn = ?'); values.push(nisn || null); }
  if (password) { assignments.push('password = ?'); values.push(await bcrypt.hash(password, 10)); }
  if (!assignments.length) return fail(res, 400, 'Tidak ada field yang dapat diperbarui.');
  values.push(id);
  const [result] = await db.execute(`UPDATE pengguna SET ${assignments.join(', ')} WHERE id_user = ?`, values);
  if (!result.affectedRows) return fail(res, 404, 'Pengguna tidak ditemukan.');
  const [rows] = await db.execute('SELECT id_user, username, role, nama_lengkap, nisn FROM pengguna WHERE id_user = ?', [id]);
  return success(res, rows[0], 'Akun berhasil diperbarui.');
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID pengguna tidak valid.');
  if (id === req.user.id_user) return fail(res, 400, 'Akun yang sedang digunakan tidak dapat dihapus.');
  const [result] = await db.execute('DELETE FROM pengguna WHERE id_user = ?', [id]);
  if (!result.affectedRows) return fail(res, 404, 'Pengguna tidak ditemukan.');
  return success(res, null, 'Akun berhasil dihapus.');
}

module.exports = { list, create, update, remove };
