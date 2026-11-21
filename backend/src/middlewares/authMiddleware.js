const jwt = require('jsonwebtoken');
const { fail } = require('../utils/http');

function authenticate(req, res, next) {
  const token = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return fail(res, 401, 'Token tidak valid atau sesi berakhir.');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return fail(res, 401, 'Token tidak valid atau sesi berakhir.');
  }
}

module.exports = authenticate;
