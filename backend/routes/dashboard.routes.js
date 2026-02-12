const express = require('express');
const router = express.Router();

const {
  getOverview,
  getHospitalStats,
  getResourceSummary
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// GET dashboard overview
router.get('/overview', getOverview);

// GET hospital statistics
router.get('/hospitals/stats', getHospitalStats);

// GET resource summary
router.get('/resources/summary', getResourceSummary);

module.exports = router;
