const express = require('express');
const { getLogs } = require('../controllers/log.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'hospital_admin'));

router.get('/', getLogs);

module.exports = router;
