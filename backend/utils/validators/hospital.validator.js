const Joi = require('joi');

/**
 * Create hospital validation schema
 */
const createHospitalSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Hospital name must be at least 3 characters',
      'string.max': 'Hospital name cannot exceed 100 characters',
      'any.required': 'Hospital name is required'
    }),
  code: Joi.string()
    .alphanum()
    .min(3)
    .max(10)
    .required()
    .messages({
      'string.alphanum': 'Hospital code must be alphanumeric',
      'string.min': 'Hospital code must be at least 3 characters',
      'string.max': 'Hospital code cannot exceed 10 characters',
      'any.required': 'Hospital code is required'
    }),
  location: Joi.object({
    address: Joi.string()
      .required()
      .messages({ 'any.required': 'Address is required' }),
    city: Joi.string()
      .required()
      .messages({ 'any.required': 'City is required' }),
    state: Joi.string()
      .required()
      .messages({ 'any.required': 'State is required' }),
    zipCode: Joi.string()
      .required()
      .messages({ 'any.required': 'Zip code is required' })
  }).required(),
  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^[\d\s\-+()]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Contact email is required'
      }),
    website: Joi.string().pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/).optional().allow('').messages({
      'string.pattern.base': 'Please provide a valid website URL'
    }),
    emergencyHotline: Joi.string().optional().allow('')
  }).required(),
  emergencyServices: Joi.object({
    available: Joi.boolean().default(true),
    description: Joi.string().max(500).optional().allow(''),
    operatingHours: Joi.object({
      is24x7: Joi.boolean().default(true),
      openTime: Joi.string().optional(),
      closeTime: Joi.string().optional()
    }).optional()
  }).optional(),
  departments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        floor: Joi.string().optional(),
        headOfDepartment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
      })
    )
    .optional(),
  hospitalType: Joi.string()
    .valid('public', 'private')
    .default('private'),
  status: Joi.string()
    .valid('active', 'inactive', 'maintenance')
    .default('active'),
  metadata: Joi.object({
    establishedYear: Joi.number()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    accreditation: Joi.array().items(Joi.string()).optional(),
    specializations: Joi.array().items(Joi.string()).optional()
  }).optional()
});

/**
 * Update hospital validation schema
 */
const updateHospitalSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional()
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^[\d\s\-+()]+$/).optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/).optional().allow('').messages({
      'string.pattern.base': 'Please provide a valid website URL'
    }),
    emergencyHotline: Joi.string().optional().allow('')
  }).optional(),
  emergencyServices: Joi.object({
    available: Joi.boolean().optional(),
    description: Joi.string().max(500).optional().allow(''),
    operatingHours: Joi.object({
      is24x7: Joi.boolean().optional(),
      openTime: Joi.string().optional(),
      closeTime: Joi.string().optional()
    }).optional()
  }).optional(),
  departments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        floor: Joi.string().optional(),
        headOfDepartment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
      })
    )
    .optional(),
  hospitalType: Joi.string().valid('public', 'private').optional(),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional(),
  metadata: Joi.object({
    establishedYear: Joi.number()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    accreditation: Joi.array().items(Joi.string()).optional(),
    specializations: Joi.array().items(Joi.string()).optional()
  }).optional()
}).min(1);

/**
 * Query hospitals validation schema
 */
const queryHospitalsSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional().allow(''),
  city: Joi.string().optional().allow(''),
  search: Joi.string().optional().allow(''),
  sortBy: Joi.string().valid('name', 'createdAt', 'status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHospitalSchema,
  updateHospitalSchema,
  queryHospitalsSchema
};
