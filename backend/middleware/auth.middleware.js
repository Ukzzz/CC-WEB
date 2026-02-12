const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLE_PERMISSIONS } = require('../utils/constants');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin and attach to request
    const admin = await Admin.findById(decoded.id).select('-refreshTokens');

    if (!admin) {
      throw new ApiError(401, 'Admin not found.');
    }

    if (!admin.isActive) {
      throw new ApiError(403, 'Account has been deactivated.');
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please refresh your token.');
    }
    throw error;
  }
});

/**
 * Role-based access control
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      throw new ApiError(
        403,
        `Role '${req.admin.role}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

/**
 * Permission-based access control
 * @param  {...string} permissions - Required permissions
 */
const hasPermission = (...permissions) => {
  return (req, res, next) => {
    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Get default permissions for role from constants
    const rolePermissions = ROLE_PERMISSIONS[req.admin.role] || [];
    
    // Combine role-based permissions with explicit admin permissions
    const allPermissions = new Set([...rolePermissions, ...(req.admin.permissions || [])]);

    const hasAllPermissions = permissions.every((permission) =>
      allPermissions.has(permission)
    );

    if (!hasAllPermissions) {
      throw new ApiError(403, 'Insufficient permissions to access this resource.');
    }
    next();
  };
};

/**
 * Check if admin has read-only role
 */
const isReadOnly = (req, res, next) => {
  if (req.admin.role === 'read_only_auditor') {
    throw new ApiError(403, 'Read-only auditors cannot perform write operations.');
  }
  next();
};

/**
 * Restrict write operations for read-only auditor
 */
const requireWriteAccess = (req, res, next) => {
  if (req.admin.role === 'read_only_auditor') {
    throw new ApiError(403, 'Read-only auditors cannot create, update, or delete data.');
  }
  next();
};

module.exports = {
  protect,
  authorize,
  hasPermission,
  isReadOnly,
  requireWriteAccess
};
