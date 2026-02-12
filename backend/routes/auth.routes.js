const express = require('express');
const router = express.Router();

const {
  login,
  refreshToken,
  logout,
  getMe,
  getAdmins,
  register,
  forgotPassword,
  resetPassword,
  unlockAccount
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  loginSchema,
  registerSchema,
  refreshTokenSchema
} = require('../utils/validators/auth.validator');

// Public routes
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Super Admin only
router.get('/admins', protect, authorize('super_admin'), getAdmins);

router.post(
  '/register',
  protect,
  authorize('super_admin'),
  validate(registerSchema),
  register
);

router.post(
  '/unlock/:id',
  protect,
  authorize('super_admin'),
  unlockAccount
);

module.exports = router;
