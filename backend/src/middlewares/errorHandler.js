const { fail } = require('../utils/http');

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(error);
  if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Data sudah terdaftar pada sistem.', [{ field: error.sqlMessage?.match(/'([^']+)'/)?.[1] || 'data', detail: 'Nilai harus unik.' }]);
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return fail(res, 400, 'Referensi data tidak ditemukan.');
  if (error.name === 'MulterError') return fail(res, 400, 'Unggahan file tidak valid atau melebihi batas ukuran.');
  console.error(error);
  return fail(res, 500, 'Terjadi kesalahan pada server.');
}

module.exports = errorHandler;
