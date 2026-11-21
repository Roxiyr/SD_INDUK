const { fail } = require('../utils/http');

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return fail(res, 403, 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.');
    return next();
  };
}

module.exports = { authorizeRoles };
