const jwt = require('jsonwebtoken');

/** Memvalidasi bearer token dan memasang identitas pengguna pada request. @param {Object} req Request Express. @param {Object} res Response Express. */
function verifyToken(req, res, next) { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) return res.status(401).json({ message: 'Token autentikasi diperlukan.' }); try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-secret'); return next(); } catch { return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' }); } }

/** Membatasi endpoint berdasarkan peran yang diizinkan. @param {...string} roles Peran yang boleh mengakses. @returns {Function} Middleware otorisasi. */
function requireRole(...roles) { return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Anda tidak memiliki akses ke fitur ini.' }); }
module.exports = { verifyToken, requireRole };
