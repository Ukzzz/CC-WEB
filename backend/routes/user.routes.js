const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUserStatus,
  getUserStats
} = require('../controllers/user.controller');
const { protect, hasPermission } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// GET user statistics
router.get('/stats', hasPermission('view_users'), getUserStats);

// GET all users
router.get('/', hasPermission('view_users'), getUsers);

// GET single user
router.get('/:id', hasPermission('view_users'), getUser);

// POST create user
router.post('/', hasPermission('manage_users'), createUser);

// PATCH update user status
router.patch('/:id/status', hasPermission('manage_users'), updateUserStatus);

module.exports = router;
