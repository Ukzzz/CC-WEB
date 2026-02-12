const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const { createLog } = require('../utils/logger');

/**
 * @desc    Login admin
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { admin, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Log login action
  createLog({
    action: 'LOGIN',
    user: admin._id,
    hospital: admin.hospital,
    details: { role: admin.role }
  }, req);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          hospital: admin.hospital
        },
        accessToken,
        refreshToken
      },
      'Login successful'
    )
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAuthToken(refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      'Token refreshed successfully'
    )
  );
});

/**
 * @desc    Logout admin
 * @route   POST /api/v1/auth/logout
 * @access  Protected
 */
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(req.admin._id, refreshToken);

  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

/**
 * @desc    Get current admin profile
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
exports.getMe = asyncHandler(async (req, res) => {
  const admin = await authService.getProfile(req.admin._id);

  res.status(200).json(
    new ApiResponse(200, { admin }, 'Profile retrieved successfully')
  );
});

/**
 * @desc    Get all admins (Super Admin only)
 * @route   GET /api/v1/auth/admins
 * @access  Super Admin
 */
exports.getAdmins = asyncHandler(async (req, res) => {
  const admins = await authService.getAllAdmins();

  res.status(200).json(
    new ApiResponse(200, { admins }, 'Admins retrieved successfully')
  );
});

/**
 * @desc    Register new admin (Super Admin only)
 * @route   POST /api/v1/auth/register
 * @access  Super Admin
 */
exports.register = asyncHandler(async (req, res) => {
  const admin = await authService.registerAdmin(req.body);

  res.status(201).json(
    new ApiResponse(201, { admin }, 'Admin created successfully')
  );
});

/**
 * @desc    Forgot password - request reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  res.status(200).json(
    new ApiResponse(200, result, 'Password reset requested')
  );
});

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);

  res.status(200).json(
    new ApiResponse(200, result, 'Password reset successful')
  );
});

/**
 * @desc    Unlock locked account (Super Admin only)
 * @route   POST /api/v1/auth/unlock/:id
 * @access  Super Admin
 */
exports.unlockAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await authService.unlockAccount(id);

  // Log unlock action
  createLog({
    action: 'UNLOCK_ACCOUNT',
    user: req.admin._id,
    details: { unlockedAdminId: id }
  }, req);

  res.status(200).json(
    new ApiResponse(200, result, 'Account unlocked successfully')
  );
});
