const Resource = require('../models/Resource');
const Hospital = require('../models/Hospital');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const socket = require('../utils/socket');

/**
 * @desc    Get all resources
 * @route   GET /api/v1/resources
 * @access  Protected
 */
exports.getResources = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    hospital,
    resourceType,
    category,
    sortBy = 'updatedAt',
    order = 'desc'
  } = req.query;

  // Build query
  const query = {};

  // For hospital_admin, restrict to their hospital only
  if (req.admin.role === 'hospital_admin' && req.admin.hospital) {
    query.hospital = req.admin.hospital;
  } else if (hospital) {
    query.hospital = hospital;
  }

  if (resourceType) query.resourceType = resourceType;
  if (category) query.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [resources, total] = await Promise.all([
    Resource.find(query)
      .populate('hospital', 'name code')
      .populate('updatedBy', 'name.firstName name.lastName')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean({ virtuals: true }),
    Resource.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        resources,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      },
      'Resources retrieved successfully'
    )
  );
});

/**
 * @desc    Get single resource
 * @route   GET /api/v1/resources/:id
 * @access  Protected
 */
exports.getResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await Resource.findById(id)
    .populate('hospital', 'name code location.city')
    .populate('updatedBy', 'name.firstName name.lastName');

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Restrict hospital admin to their own hospital's resources
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== resource.hospital._id.toString()
  ) {
    throw new ApiError(403, 'Not authorized to view this resource');
  }

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Resource retrieved successfully')
  );
});

/**
 * @desc    Create resource
 * @route   POST /api/v1/resources
 * @access  Admin
 */
exports.createResource = asyncHandler(async (req, res) => {
  const { hospital, resourceType } = req.body;

  // Hospital admin can only add resources to their hospital
  if (req.admin.role === 'hospital_admin') {
    if (req.admin.hospital?.toString() !== hospital) {
      throw new ApiError(403, 'Not authorized to add resources to this hospital');
    }
  }

  // Verify hospital exists
  const hospitalExists = await Hospital.findById(hospital);
  if (!hospitalExists) {
    throw new ApiError(404, 'Hospital not found');
  }

  // Check if resource type already exists for this hospital
  const existingResource = await Resource.findOne({
    hospital,
    resourceType,
    category: req.body.category || 'general'
  });

  if (existingResource) {
    throw new ApiError(
      400,
      'This resource type already exists for this hospital. Please update existing resource.'
    );
  }

  // Add updatedBy
  req.body.updatedBy = req.admin._id;

  const resource = await Resource.create(req.body);

  // Populate references
  await resource.populate('hospital', 'name code');

  // Emit socket event
  const io = socket.getIO();
  io.to(hospital.toString()).emit('resourceUpdated', {
    type: 'create',
    resource
  });

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'CREATE_RESOURCE',
    user: req.admin._id,
    hospital: hospital,
    details: { 
      resourceId: resource._id, 
      type: resourceType, 
      total: resource.total 
    }
  }, req);

  res.status(201).json(
    new ApiResponse(201, { resource }, 'Resource created successfully')
  );
});

/**
 * @desc    Update resource
 * @route   PUT /api/v1/resources/:id
 * @access  Admin
 */
exports.updateResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingResource = await Resource.findById(id);

  if (!existingResource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Hospital admin can only update their own hospital's resources
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== existingResource.hospital.toString()
  ) {
    throw new ApiError(403, 'Not authorized to update this resource');
  }

  // Don't allow changing hospital
  delete req.body.hospital;

  // Update updatedBy
  req.body.updatedBy = req.admin._id;
  req.body.lastUpdated = new Date();

  // Use save() instead of findByIdAndUpdate so that the document-level
  // validator on `available` (which references `this.total`) works correctly.
  Object.assign(existingResource, req.body);
  await existingResource.save();

  const resource = await Resource.findById(id)
    .populate('updatedBy', 'name.firstName name.lastName');

  // Emit socket event
  const io = socket.getIO();
  io.to(existingResource.hospital.toString()).emit('resourceUpdated', {
    type: 'update',
    resource
  });

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'UPDATE_RESOURCE',
    user: req.admin._id,
    hospital: existingResource.hospital,
    details: { 
      resourceId: resource._id, 
      changes: req.body
    }
  }, req);

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Resource updated successfully')
  );
});

/**
 * @desc    Quick update resource availability
 * @route   PATCH /api/v1/resources/:id/availability
 * @access  Admin
 */
exports.updateAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { available, occupied, maintenance } = req.body;

  const resource = await Resource.findById(id);

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Hospital admin can only update their own hospital's resources
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== resource.hospital.toString()
  ) {
    throw new ApiError(403, 'Not authorized to update this resource');
  }

  // Validate counts don't exceed total
  const newAvailable = available !== undefined ? available : resource.available;
  const newOccupied = occupied !== undefined ? occupied : resource.occupied;
  const newMaintenance = maintenance !== undefined ? maintenance : resource.maintenance;

  if (newAvailable + newOccupied + newMaintenance > resource.total) {
    throw new ApiError(
      400,
      'Sum of available, occupied, and maintenance cannot exceed total'
    );
  }

  // Update fields
  if (available !== undefined) resource.available = available;
  if (occupied !== undefined) resource.occupied = occupied;
  if (maintenance !== undefined) resource.maintenance = maintenance;
  resource.updatedBy = req.admin._id;
  resource.lastUpdated = new Date();

  await resource.save();

  // Populate references
  await resource.populate('hospital', 'name code');
  await resource.populate('updatedBy', 'name.firstName name.lastName');

  // Emit socket event
  const io = socket.getIO();
  io.to(resource.hospital._id.toString()).emit('resourceUpdated', {
    type: 'update',
    resource
  });

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'UPDATE_AVAILABILITY',
    user: req.admin._id,
    hospital: resource.hospital._id,
    details: { 
      resourceId: resource._id, 
      available: resource.available,
      occupied: resource.occupied
    }
  }, req);

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Availability updated successfully')
  );
});

/**
 * @desc    Delete resource
 * @route   DELETE /api/v1/resources/:id
 * @access  Admin
 */
exports.deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await Resource.findById(id);

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Hospital admin can only delete their own hospital's resources
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== resource.hospital.toString()
  ) {
    throw new ApiError(403, 'Not authorized to delete this resource');
  }

  await Resource.findByIdAndDelete(id);

  // Emit socket event
  const io = socket.getIO();
  io.to(resource.hospital.toString()).emit('resourceUpdated', {
    type: 'delete',
    resourceId: id
  });

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'DELETE_RESOURCE',
    user: req.admin._id,
    hospital: resource.hospital,
    details: { 
      resourceId: id,
      type: resource.resourceType 
    }
  }, req);

  res.status(200).json(
    new ApiResponse(200, null, 'Resource deleted successfully')
  );
});

/**
 * @desc    Get resources by hospital
 * @route   GET /api/v1/resources/hospital/:hospitalId
 * @access  Protected
 */
exports.getResourcesByHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;

  // Restrict hospital admin to their own hospital
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== hospitalId
  ) {
    throw new ApiError(403, 'Not authorized to view resources of this hospital');
  }

  const resources = await Resource.find({ hospital: hospitalId })
    .select('resourceType category total available occupied maintenance status')
    .sort({ resourceType: 1 })
    .lean({ virtuals: true });

  res.status(200).json(
    new ApiResponse(200, { resources }, 'Resources retrieved successfully')
  );
});
