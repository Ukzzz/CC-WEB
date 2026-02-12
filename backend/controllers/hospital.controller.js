const Hospital = require('../models/Hospital');
const Staff = require('../models/Staff');
const Resource = require('../models/Resource');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all hospitals
 * @route   GET /api/v1/hospitals
 * @access  Protected
 */
exports.getHospitals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    city,
    search,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { code: new RegExp(search, 'i') },
      { 'location.city': new RegExp(search, 'i') }
    ];
  }

  // For hospital_admin, restrict to their hospital only
  if (req.admin.role === 'hospital_admin' && req.admin.hospital) {
    query._id = req.admin.hospital;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [hospitals, total] = await Promise.all([
    Hospital.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Hospital.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      },
      'Hospitals retrieved successfully'
    )
  );
});

/**
 * @desc    Get single hospital
 * @route   GET /api/v1/hospitals/:id
 * @access  Protected
 */
exports.getHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Restrict hospital admin to their own hospital
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== id
  ) {
    throw new ApiError(403, 'Not authorized to view this hospital');
  }

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    throw new ApiError(404, 'Hospital not found');
  }

  res.status(200).json(
    new ApiResponse(200, { hospital }, 'Hospital retrieved successfully')
  );
});

/**
 * @desc    Create hospital
 * @route   POST /api/v1/hospitals
 * @access  Super Admin
 */
exports.createHospital = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Check if hospital code already exists
  const existingHospital = await Hospital.findOne({
    code: code.toUpperCase()
  });

  if (existingHospital) {
    throw new ApiError(400, 'Hospital with this code already exists');
  }

  const hospital = await Hospital.create(req.body);

  res.status(201).json(
    new ApiResponse(201, { hospital }, 'Hospital created successfully')
  );
});

/**
 * @desc    Update hospital
 * @route   PUT /api/v1/hospitals/:id
 * @access  Admin
 */
exports.updateHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Hospital admin can only update their own hospital
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== id
  ) {
    throw new ApiError(403, 'Not authorized to update this hospital');
  }

  // Don't allow updating code
  delete req.body.code;

  const hospital = await Hospital.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!hospital) {
    throw new ApiError(404, 'Hospital not found');
  }

  res.status(200).json(
    new ApiResponse(200, { hospital }, 'Hospital updated successfully')
  );
});

/**
 * @desc    Delete hospital (soft delete)
 * @route   DELETE /api/v1/hospitals/:id
 * @access  Super Admin
 */
exports.deleteHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hospital = await Hospital.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  );

  if (!hospital) {
    throw new ApiError(404, 'Hospital not found');
  }

  // Also deactivate associated staff
  await Staff.updateMany({ hospital: id }, { status: 'inactive' });

  res.status(200).json(
    new ApiResponse(200, null, 'Hospital deactivated successfully')
  );
});

/**
 * @desc    Get hospital statistics
 * @route   GET /api/v1/hospitals/:id/stats
 * @access  Protected
 */
exports.getHospitalStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Restrict hospital admin to their own hospital
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== id
  ) {
    throw new ApiError(403, 'Not authorized to view this hospital stats');
  }

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    throw new ApiError(404, 'Hospital not found');
  }

  // Get staff count by role
  const staffStats = await Staff.aggregate([
    { $match: { hospital: hospital._id, status: 'active' } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Get resource summary
  const resourceStats = await Resource.aggregate([
    { $match: { hospital: hospital._id } },
    {
      $group: {
        _id: '$resourceType',
        total: { $sum: '$total' },
        available: { $sum: '$available' },
        occupied: { $sum: '$occupied' }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hospital: {
          id: hospital._id,
          name: hospital.name,
          status: hospital.status
        },
        staff: staffStats,
        resources: resourceStats
      },
      'Hospital statistics retrieved successfully'
    )
  );
});
