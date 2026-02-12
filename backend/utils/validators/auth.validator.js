const Joi = require('joi');

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Register admin validation schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  name: Joi.object({
    firstName: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      })
  }).required(),
  role: Joi.string()
    .valid('super_admin', 'hospital_admin')
    .default('hospital_admin'),
  hospital: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .when('role', {
      is: 'hospital_admin',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.pattern.base': 'Hospital must be a valid ID',
      'any.required': 'Hospital is required for hospital admin'
    }),
  permissions: Joi.array()
    .items(
      Joi.string().valid(
        'manage_hospitals',
        'manage_staff',
        'manage_resources',
        'view_users',
        'manage_users',
        'view_analytics'
      )
    )
    .default(['view_users', 'view_analytics'])
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    })
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

module.exports = {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
