const express = require('express');
const router = express.Router();

const {
  getStaffReport,
  getResourceReport,
  getFeedbackReport,
  exportCSV,
  exportPDF
} = require('../controllers/report.controller');
const { protect, hasPermission } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Report endpoints with date range filters
router.get('/staff', hasPermission('view_staff'), getStaffReport);
router.get('/resources', hasPermission('view_resources'), getResourceReport);
router.get('/feedback', hasPermission('view_feedback'), getFeedbackReport);

// Export endpoints
router.get('/:type/export/csv', hasPermission('view_analytics'), exportCSV);
router.get('/:type/export/pdf', hasPermission('view_analytics'), exportPDF);

module.exports = router;
