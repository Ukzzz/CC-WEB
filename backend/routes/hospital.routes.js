const express = require('express');
const router = express.Router();

const {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalStats
} = require('../controllers/hospital.controller');
const { protect, authorize, hasPermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createHospitalSchema,
  updateHospitalSchema,
  queryHospitalsSchema
} = require('../utils/validators/hospital.validator');

// All routes are protected
router.use(protect);

// GET all hospitals
router.get('/', validate(queryHospitalsSchema, 'query'), getHospitals);

// GET single hospital
router.get('/:id', getHospital);

// GET hospital statistics
router.get('/:id/stats', getHospitalStats);

// POST create hospital (Super Admin only)
router.post(
  '/',
  authorize('super_admin'),
  validate(createHospitalSchema),
  createHospital
);

// PUT update hospital
router.put(
  '/:id',
  hasPermission('manage_hospitals'),
  validate(updateHospitalSchema),
  updateHospital
);

// DELETE hospital (Super Admin only)
router.delete('/:id', authorize('super_admin'), deleteHospital);

module.exports = router;
