const Staff = require('../models/Staff');
const Hospital = require('../models/Hospital');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all staff
 * @route   GET /api/v1/staff
 * @access  Protected
 */
exports.getStaff = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    hospital,
    role,
    department,
    status,
    search,
    sortBy = 'createdAt',
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

  if (role) query.role = role;
  if (department) query.department = new RegExp(department, 'i');
  if (status) {
    query.status = status;
  } else {
    // Default: exclude terminated staff
    query.status = { $ne: 'terminated' };
  }

  if (search) {
    query.$or = [
      { 'name.firstName': new RegExp(search, 'i') },
      { 'name.lastName': new RegExp(search, 'i') },
      { employeeId: new RegExp(search, 'i') },
      { specialization: new RegExp(search, 'i') }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [staff, total] = await Promise.all([
    Staff.find(query)
      .populate('hospital', 'name code')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Staff.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        staff,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      },
      'Staff retrieved successfully'
    )
  );
});

/**
 * @desc    Get single staff member
 * @route   GET /api/v1/staff/:id
 * @access  Protected
 */
exports.getStaffMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findById(id).populate('hospital', 'name code location.city');

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Restrict hospital admin to their own hospital's staff
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== staff.hospital._id.toString()
  ) {
    throw new ApiError(403, 'Not authorized to view this staff member');
  }

  res.status(200).json(
    new ApiResponse(200, { staff }, 'Staff member retrieved successfully')
  );
});

/**
 * Check for shift conflicts with other staff in same department
 */
const checkShiftConflicts = async (hospital, department, shift, excludeStaffId = null) => {
  if (!shift || !shift.workingDays || shift.workingDays.length === 0) {
    return { hasConflict: false };
  }

  const query = {
    hospital,
    department,
    status: 'active',
    'shift.workingDays': { $in: shift.workingDays },
    'shift.type': shift.type
  };

  // Exclude current staff when updating
  if (excludeStaffId) {
    query._id = { $ne: excludeStaffId };
  }

  const conflictingStaff = await Staff.find(query).select('employeeId name shift').limit(3);

  if (conflictingStaff.length > 0) {
    return {
      hasConflict: true,
      conflicts: conflictingStaff.map(s => ({
        employeeId: s.employeeId,
        name: s.fullName,
        shift: s.shift
      }))
    };
  }

  return { hasConflict: false };
};

/**
 * @desc    Create staff member
 * @route   POST /api/v1/staff
 * @access  Admin
 */
exports.createStaff = asyncHandler(async (req, res) => {
  const { employeeId, hospital, department, shift } = req.body;

  // Hospital admin can only add staff to their hospital
  if (req.admin.role === 'hospital_admin' || req.admin.role === 'staff_manager') {
    if (req.admin.hospital?.toString() !== hospital) {
      throw new ApiError(403, 'Not authorized to add staff to this hospital');
    }
  }

  // Verify hospital exists
  const hospitalExists = await Hospital.findById(hospital);
  if (!hospitalExists) {
    throw new ApiError(404, 'Hospital not found');
  }

  // Check if employee ID already exists
  const existingStaff = await Staff.findOne({ employeeId: employeeId.toUpperCase() });
  if (existingStaff) {
    throw new ApiError(400, 'Employee ID already exists');
  }

  // Check for shift conflicts (unless override is set)
  if (shift && !shift.overrideConflicts) {
    const conflictCheck = await checkShiftConflicts(hospital, department, shift);
    if (conflictCheck.hasConflict) {
      throw new ApiError(409, 'Shift conflict detected. Set overrideConflicts to true or adjust shift.', {
        conflicts: conflictCheck.conflicts
      });
    }
  }

  const staff = await Staff.create(req.body);

  // Populate hospital info
  await staff.populate('hospital', 'name code');

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'CREATE_STAFF',
    user: req.admin._id,
    hospital: hospital,
    details: { 
      staffId: staff._id, 
      name: staff.name,
      role: staff.role 
    }
  }, req);

  res.status(201).json(
    new ApiResponse(201, { staff }, 'Staff member created successfully')
  );
});

/**
 * @desc    Update staff member
 * @route   PUT /api/v1/staff/:id
 * @access  Admin
 */
exports.updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingStaff = await Staff.findById(id);

  if (!existingStaff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Hospital admin can only update their own hospital's staff
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== existingStaff.hospital.toString()
  ) {
    throw new ApiError(403, 'Not authorized to update this staff member');
  }

  // Don't allow updating employeeId
  delete req.body.employeeId;

  // If changing hospital, validate permissions
  if (req.body.hospital && req.admin.role === 'hospital_admin') {
    throw new ApiError(403, 'Hospital admin cannot transfer staff to another hospital');
  }

  const staff = await Staff.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).populate('hospital', 'name code');

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'UPDATE_STAFF',
    user: req.admin._id,
    hospital: staff.hospital._id,
    details: { 
      staffId: staff._id, 
      changes: req.body 
    }
  }, req);

  res.status(200).json(
    new ApiResponse(200, { staff }, 'Staff member updated successfully')
  );
});

/**
 * @desc    Delete staff member
 * @route   DELETE /api/v1/staff/:id
 * @access  Admin
 */
exports.deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findById(id);

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Hospital admin can only delete their own hospital's staff
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== staff.hospital.toString()
  ) {
    throw new ApiError(403, 'Not authorized to delete this staff member');
  }

  // Soft delete - set status to terminated
  staff.status = 'terminated';
  await staff.save();

  // Log action
  const { createLog } = require('../utils/logger');
  createLog({
    action: 'DELETE_STAFF',
    user: req.admin._id,
    hospital: staff.hospital,
    details: { 
      staffId: staff._id, 
      name: staff.name 
    }
  }, req);

  res.status(200).json(
    new ApiResponse(200, null, 'Staff member removed successfully')
  );
});

/**
 * @desc    Get staff by hospital
 * @route   GET /api/v1/staff/hospital/:hospitalId
 * @access  Protected
 */
exports.getStaffByHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;

  // Restrict hospital admin to their own hospital
  if (
    req.admin.role === 'hospital_admin' &&
    req.admin.hospital?.toString() !== hospitalId
  ) {
    throw new ApiError(403, 'Not authorized to view staff of this hospital');
  }

  const staff = await Staff.find({
    hospital: hospitalId,
    status: { $ne: 'terminated' }
  })
    .select('employeeId name role department status shift')
    .sort({ role: 1, 'name.firstName': 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, { staff }, 'Staff retrieved successfully')
  );
});
