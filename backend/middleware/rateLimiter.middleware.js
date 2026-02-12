const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Limits requests per IP to prevent abuse
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 1000 requests per window (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

/**
 * Auth Rate Limiter
 * Stricter limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * Create Custom Rate Limiter
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Max requests per window
 */
const createLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Rate limit exceeded.'
    }
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};
