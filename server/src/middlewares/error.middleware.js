export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with that ${field} already exists.` : 'Duplicate field value entered.';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  res.status(status).json({ message });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
