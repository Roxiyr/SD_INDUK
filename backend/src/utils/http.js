function success(res, data, message = 'Permintaan berhasil.', status = 200) {
  return res.status(status).json({ status: 'success', message, data });
}

function fail(res, status, message, errors) {
  const body = { status: 'error', message };
  if (errors?.length) body.errors = errors;
  return res.status(status).json(body);
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function fields(body, allowed) {
  const keys = Object.keys(body || {}).filter((key) => allowed.includes(key));
  return { keys, values: keys.map((key) => body[key]) };
}

module.exports = { success, fail, asyncHandler, fields };
