const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const hospitalRoutes = require('./hospital.routes');
const staffRoutes = require('./staff.routes');
const resourceRoutes = require('./resource.routes');
const dashboardRoutes = require('./dashboard.routes');
const logRoutes = require('./log.routes');
const feedbackRoutes = require('./feedback.routes');
const reportRoutes = require('./report.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/staff', staffRoutes);
router.use('/resources', resourceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
