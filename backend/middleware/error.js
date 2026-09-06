const { AppError } = require('../utils/appError');

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || (err.name === 'CastError' ? 400 : 500);
  const message = err.message || 'Server error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value already exists' });
  }
  if (err.name === 'MulterError' || err.message === 'Only image uploads are allowed') {
    return res.status(400).json({ success: false, message: err.message || 'Invalid file upload' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource identifier' });
  }
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong' : message,
  });
}

module.exports = { notFound, errorHandler };
