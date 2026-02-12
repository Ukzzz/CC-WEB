const express = require('express');
const { getFeedback, createFeedback } = require('../controllers/feedback.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public route for submission (in a real app this might be authenticated for Users)
router.post('/', createFeedback);

// Protected routes for viewing
router.use(protect);
router.get('/', authorize('super_admin', 'hospital_admin'), getFeedback);

module.exports = router;
