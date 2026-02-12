const express = require('express');
const router = express.Router();

const {
  getResources,
  getResource,
  createResource,
  updateResource,
  updateAvailability,
  deleteResource,
  getResourcesByHospital
} = require('../controllers/resource.controller');
const { protect, hasPermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createResourceSchema,
  updateResourceSchema,
  updateAvailabilitySchema,
  queryResourcesSchema
} = require('../utils/validators/resource.validator');

// All routes are protected
router.use(protect);

// GET all resources
router.get('/', validate(queryResourcesSchema, 'query'), getResources);

// GET resources by hospital
router.get('/hospital/:hospitalId', getResourcesByHospital);

// GET single resource
router.get('/:id', getResource);

// POST create resource
router.post(
  '/',
  hasPermission('manage_resources'),
  validate(createResourceSchema),
  createResource
);

// PUT update resource
router.put(
  '/:id',
  hasPermission('manage_resources'),
  validate(updateResourceSchema),
  updateResource
);

// PATCH quick update availability
router.patch(
  '/:id/availability',
  hasPermission('manage_resources'),
  validate(updateAvailabilitySchema),
  updateAvailability
);

// DELETE resource
router.delete('/:id', hasPermission('manage_resources'), deleteResource);

module.exports = router;
