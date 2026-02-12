const Joi = require('joi');

/**
 * Create staff validation schema
 */
const createStaffSchema = Joi.object({
  employeeId: Joi.string()
    .max(20)
    .required()
    .messages({
      'any.required': 'Employee ID is required'
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
    .valid('doctor', 'nurse', 'technician', 'receptionist', 'admin_staff')
    .required()
    .messages({
      'any.required': 'Staff role is required',
      'any.only': 'Invalid staff role'
    }),
  specialization: Joi.string()
    .when('role', {
      is: 'doctor',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Specialization is required for doctors'
    }),
  qualifications: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().min(1950).max(new Date().getFullYear()).optional()
      })
    )
    .optional(),
  department: Joi.string()
    .required()
    .messages({
      'any.required': 'Department is required'
    }),
  hospital: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Hospital must be a valid ID',
      'any.required': 'Hospital is required'
    }),
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
        'any.required': 'Email is required'
      }),
    emergencyContact: Joi.string().optional()
  }).required(),
  shift: Joi.object({
    type: Joi.string()
      .valid('morning', 'afternoon', 'night', 'rotating')
      .default('morning'),
    timings: Joi.object({
      start: Joi.string().default('09:00'),
      end: Joi.string().default('17:00')
    }).optional(),
    workingDays: Joi.array()
      .items(
        Joi.string().valid(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
      )
      .optional()
  }).optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'on_leave', 'terminated')
    .default('active'),
  joiningDate: Joi.date().optional()
});

/**
 * Update staff validation schema
 */
const updateStaffSchema = Joi.object({
  name: Joi.object({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional()
  }).optional(),
  role: Joi.string()
    .valid('doctor', 'nurse', 'technician', 'receptionist', 'admin_staff')
    .optional(),
  specialization: Joi.string().optional(),
  qualifications: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().min(1950).max(new Date().getFullYear()).optional()
      })
    )
    .optional(),
  department: Joi.string().optional(),
  hospital: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^[\d\s\-+()]+$/).optional(),
    email: Joi.string().email().optional(),
    emergencyContact: Joi.string().optional()
  }).optional(),
  shift: Joi.object({
    type: Joi.string().valid('morning', 'afternoon', 'night', 'rotating').optional(),
    timings: Joi.object({
      start: Joi.string().optional(),
      end: Joi.string().optional()
    }).optional(),
    workingDays: Joi.array()
      .items(
        Joi.string().valid(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
      )
      .optional()
  }).optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'on_leave', 'terminated')
    .optional()
}).min(1);

/**
 * Query staff validation schema
 */
const queryStaffSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  hospital: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(''),
  role: Joi.string()
    .valid('doctor', 'nurse', 'technician', 'receptionist', 'admin_staff')
    .optional().allow(''),
  department: Joi.string().optional().allow(''),
  status: Joi.string()
    .valid('active', 'inactive', 'on_leave', 'terminated')
    .optional().allow(''),
  search: Joi.string().optional().allow(''),
  sortBy: Joi.string()
    .valid('name.firstName', 'role', 'department', 'createdAt')
    .default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  queryStaffSchema
};
