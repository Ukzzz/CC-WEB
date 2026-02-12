const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Generate Access Token
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

exports.loginUser = async (email, password) => {
  // Find admin with password and lockout fields
  const admin = await Admin.findOne({ email }).select('+password +lockUntil +failedLoginAttempts');

  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if account is locked
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    const remainingTime = Math.ceil((admin.lockUntil - new Date()) / 60000);
    throw new ApiError(423, `Account is locked. Try again in ${remainingTime} minutes.`);
  }

  // If lock has expired, reset the lock
  if (admin.lockUntil && admin.lockUntil <= new Date()) {
    admin.lockUntil = null;
    admin.failedLoginAttempts = 0;
  }

  // Check if account is active
  if (!admin.isActive) {
    throw new ApiError(403, 'Account has been deactivated. Contact support.');
  }

  // Verify password
  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    // Increment failed login attempts
    admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
    
    // Lock account if max attempts exceeded
    if (admin.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      admin.lockUntil = new Date(Date.now() + LOCK_TIME);
      await admin.save();
      throw new ApiError(423, `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed login attempts. Try again in 30 minutes.`);
    }
    
    await admin.save();
    const remainingAttempts = MAX_LOGIN_ATTEMPTS - admin.failedLoginAttempts;
    throw new ApiError(401, `Invalid email or password. ${remainingAttempts} attempts remaining.`);
  }

  // Reset failed login attempts on successful login
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;

  // Generate tokens
  const accessToken = generateAccessToken(admin._id);
  const refreshToken = generateRefreshToken(admin._id);

  // Save refresh token to database
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

  admin.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshTokenExpiry
  });

  // Update last login
  admin.lastLogin = new Date();

  // Limit stored refresh tokens to 5
  if (admin.refreshTokens.length > 5) {
    admin.refreshTokens = admin.refreshTokens.slice(-5);
  }

  await admin.save();

  // Remove password from response
  admin.password = undefined;
  admin.refreshTokens = undefined;

  return { admin, accessToken, refreshToken };
};

exports.refreshAuthToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find admin with this refresh token
    const admin = await Admin.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });

    if (!admin) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Check if refresh token is expired in database
    const tokenData = admin.refreshTokens.find((t) => t.token === refreshToken);
    if (tokenData && new Date(tokenData.expiresAt) < new Date()) {
      // Remove expired token
      admin.refreshTokens = admin.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await admin.save();
      throw new ApiError(401, 'Refresh token expired');
    }

    // Generate new access token
    const accessToken = generateAccessToken(admin._id);

    return { accessToken };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    throw error;
  }
};

exports.logoutUser = async (adminId, refreshToken) => {
  if (refreshToken) {
    await Admin.findByIdAndUpdate(adminId, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  } else {
    // If no refresh token provided, clear all tokens (logout from all devices)
    await Admin.findByIdAndUpdate(adminId, {
      $set: { refreshTokens: [] }
    });
  }
};

exports.getProfile = async (adminId) => {
  const admin = await Admin.findById(adminId).populate(
    'hospital',
    'name code location.city'
  );
  return admin;
};

exports.getAllAdmins = async () => {
  const admins = await Admin.find().populate('hospital', 'name code');
  return admins.map(admin => {
    const adminObj = admin.toObject();
    delete adminObj.password;
    delete adminObj.refreshTokens;
    return adminObj;
  });
};

exports.registerAdmin = async (adminData) => {
  const { email } = adminData;
  
  // Check if email already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, 'Email already registered');
  }

  // Create admin
  const admin = await Admin.create(adminData);

  // Remove sensitive data
  admin.password = undefined;
  admin.refreshTokens = undefined;
  
  return admin;
};

/**
 * Forgot Password - Generate reset token
 */
exports.forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email });
  
  if (!admin) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a reset link will be sent.' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set expiry (1 hour)
  admin.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  admin.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  
  await admin.save({ validateBeforeSave: false });

  // In production, send email with reset link
  // For now, return the token (would be sent via email)
  return { 
    message: 'Password reset token generated.',
    resetToken // In production, this would be sent via email, not returned
  };
};

/**
 * Reset Password - Use reset token to set new password
 */
exports.resetPassword = async (resetToken, newPassword) => {
  // Hash the provided token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Find admin with valid reset token
  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetToken +passwordResetExpires');

  if (!admin) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Set new password
  admin.password = newPassword;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  
  await admin.save();

  return { message: 'Password reset successful' };
};

/**
 * Unlock Account - Admin function to unlock locked accounts
 */
exports.unlockAccount = async (adminId) => {
  const admin = await Admin.findById(adminId);
  
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  return { message: 'Account unlocked successfully' };
};
