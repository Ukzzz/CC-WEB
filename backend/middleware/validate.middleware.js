const ApiError = require('../utils/ApiError');

/**
 * Validation Middleware Factory
 * Creates middleware that validates request body against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      throw new ApiError(400, 'Validation Error', errors);
    }

    // Replace with validated and sanitized value
    req[property] = value;
    next();
  };
};

module.exports = validate;
