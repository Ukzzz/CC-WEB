const express = require('express');
const router = express.Router();

const {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByHospital
} = require('../controllers/staff.controller');
const { protect, hasPermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createStaffSchema,
  updateStaffSchema,
  queryStaffSchema
} = require('../utils/validators/staff.validator');

// All routes are protected
router.use(protect);

// GET all staff
router.get('/', validate(queryStaffSchema, 'query'), getStaff);

// GET staff by hospital
router.get('/hospital/:hospitalId', getStaffByHospital);

// GET single staff member
router.get('/:id', getStaffMember);

// POST create staff
router.post(
  '/',
  hasPermission('manage_staff'),
  validate(createStaffSchema),
  createStaff
);

// PUT update staff
router.put(
  '/:id',
  hasPermission('manage_staff'),
  validate(updateStaffSchema),
  updateStaff
);

// DELETE staff (soft delete)
router.delete('/:id', hasPermission('manage_staff'), deleteStaff);

module.exports = router;
