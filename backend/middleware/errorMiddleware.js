const multer = require('multer');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors;

  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with this unique field already exists.';
    errors = err.errors.map((item) => item.message);
  }

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation failed.';
    errors = err.errors.map((item) => item.message);
  }

  if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    message = 'Invalid related record supplied.';
  }

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded image is too large.' : err.message;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication token.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
