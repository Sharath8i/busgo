export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
