const Joi = require('joi');

/**
 * Create resource validation schema
 */
const createResourceSchema = Joi.object({
  hospital: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Hospital must be a valid ID',
      'any.required': 'Hospital is required'
    }),
  resourceType: Joi.string()
    .valid('bed', 'icu_bed', 'ventilator', 'emergency_ward', 'ambulance', 'oxygen_cylinder')
    .required()
    .messages({
      'any.required': 'Resource type is required',
      'any.only': 'Invalid resource type'
    }),
  category: Joi.string()
    .valid('general', 'critical_care', 'emergency', 'pediatric', 'maternity')
    .default('general'),
  total: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Total count cannot be negative',
      'any.required': 'Total count is required'
    }),
  available: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Available count cannot be negative',
      'any.required': 'Available count is required'
    }),
  occupied: Joi.number().min(0).default(0),
  maintenance: Joi.number().min(0).default(0),
  location: Joi.object({
    floor: Joi.string().optional().allow(''),
    wing: Joi.string().optional().allow(''),
    ward: Joi.string().optional().allow('')
  }).optional()
});

/**
 * Update resource validation schema
 */
const updateResourceSchema = Joi.object({
  resourceType: Joi.string()
    .valid('bed', 'icu_bed', 'ventilator', 'emergency_ward', 'ambulance', 'oxygen_cylinder')
    .optional(),
  category: Joi.string()
    .valid('general', 'critical_care', 'emergency', 'pediatric', 'maternity')
    .optional(),
  total: Joi.number().min(0).optional(),
  available: Joi.number().min(0).optional(),
  occupied: Joi.number().min(0).optional(),
  maintenance: Joi.number().min(0).optional(),
  location: Joi.object({
    floor: Joi.string().optional().allow(''),
    wing: Joi.string().optional().allow(''),
    ward: Joi.string().optional().allow('')
  }).optional()
}).min(1);

/**
 * Update availability (quick update) validation schema
 */
const updateAvailabilitySchema = Joi.object({
  available: Joi.number().min(0).optional(),
  occupied: Joi.number().min(0).optional(),
  maintenance: Joi.number().min(0).optional()
}).min(1);

/**
 * Query resources validation schema
 */
const queryResourcesSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  hospital: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(''),
  resourceType: Joi.string()
    .valid('bed', 'icu_bed', 'ventilator', 'emergency_ward', 'ambulance', 'oxygen_cylinder')
    .optional().allow(''),
  category: Joi.string()
    .valid('general', 'critical_care', 'emergency', 'pediatric', 'maternity')
    .optional().allow(''),
  sortBy: Joi.string()
    .valid('resourceType', 'available', 'total', 'updatedAt')
    .default('updatedAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  updateAvailabilitySchema,
  queryResourcesSchema
};
