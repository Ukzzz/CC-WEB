const ApiError = require('../utils/ApiError');

/**
 * Global Error Handler Middleware
 * Handles all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    const message = 'Validation Error';
    error = new ApiError(400, message, errors);
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;
