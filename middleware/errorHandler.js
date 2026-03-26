// Error handler middleware - return structured JSON and avoid leaking internal details
module.exports = function (err, req, res, next) {
  // prefer an explicit status code if set by earlier code
  const status = err.status || err.statusCode || 500;
  // log full error server-side for debugging
  console.error(err && err.stack ? err.stack : err);
  res.status(status).json({
    message: status === 500 ? 'Gabim i brendshëm i serverit' : err.message || 'Gabim',
    error: err.code || undefined
  });
};
