/**
 * Application Constants
 */

// User Roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  STAFF_MANAGER: 'staff_manager',
  READ_ONLY_AUDITOR: 'read_only_auditor'
};

// Admin Permissions
const PERMISSIONS = {
  MANAGE_HOSPITALS: 'manage_hospitals',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_RESOURCES: 'manage_resources',
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_STAFF: 'view_staff',
  VIEW_RESOURCES: 'view_resources',
  VIEW_HOSPITALS: 'view_hospitals',
  VIEW_FEEDBACK: 'view_feedback',
  VIEW_LOGS: 'view_logs',
  MANAGE_SHIFTS: 'manage_shifts'
};

// Default permissions per role
const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS), // All permissions
  hospital_admin: [
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_RESOURCES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.VIEW_HOSPITALS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.MANAGE_SHIFTS
  ],
  staff_manager: [
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_SHIFTS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.VIEW_HOSPITALS
  ],
  read_only_auditor: [
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.VIEW_HOSPITALS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_ANALYTICS
  ]
};

// Staff Roles
const STAFF_ROLES = {
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  TECHNICIAN: 'technician',
  RECEPTIONIST: 'receptionist',
  ADMIN_STAFF: 'admin_staff'
};

// Resource Types
const RESOURCE_TYPES = {
  BED: 'bed',
  ICU_BED: 'icu_bed',
  VENTILATOR: 'ventilator',
  EMERGENCY_WARD: 'emergency_ward',
  AMBULANCE: 'ambulance',
  OXYGEN_CYLINDER: 'oxygen_cylinder'
};

// Status Values
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification'
};

// Shift Types
const SHIFT_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night',
  ROTATING: 'rotating'
};

// Days of Week
const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  STAFF_ROLES,
  RESOURCE_TYPES,
  STATUS,
  SHIFT_TYPES,
  DAYS_OF_WEEK,
  PAGINATION
};
