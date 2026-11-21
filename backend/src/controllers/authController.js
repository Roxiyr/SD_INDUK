const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { success, fail } = require('../utils/http');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res, 400, 'Username dan password wajib diisi.');
  const [rows] = await db.execute('SELECT id_user, username, password, role, nama_lengkap, nisn FROM pengguna WHERE username = ?', [username]);
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) return fail(res, 401, 'Username atau kata sandi tidak sesuai.');
  const { password: omitted, ...user } = rows[0]; // eslint-disable-line no-unused-vars
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  return success(res, { token, user }, 'Login berhasil.');
}

async function me(req, res) {
  const [rows] = await db.execute('SELECT id_user, username, role, nama_lengkap, nisn, created_at FROM pengguna WHERE id_user = ?', [req.user.id_user]);
  if (!rows.length) return fail(res, 404, 'Pengguna tidak ditemukan.');
  return success(res, rows[0]);
}

async function changePassword(req, res) {
  const { password_lama, password_baru } = req.body || {};
  if (!password_lama || !password_baru || password_baru.length < 8) return fail(res, 400, 'Password lama dan password baru minimal 8 karakter wajib diisi.');
  const [rows] = await db.execute('SELECT password FROM pengguna WHERE id_user = ?', [req.user.id_user]);
  if (!rows.length || !(await bcrypt.compare(password_lama, rows[0].password))) return fail(res, 401, 'Password lama tidak sesuai.');
  await db.execute('UPDATE pengguna SET password = ? WHERE id_user = ?', [await bcrypt.hash(password_baru, 10), req.user.id_user]);
  return success(res, null, 'Kata sandi berhasil diubah.');
}

module.exports = { login, me, changePassword };
