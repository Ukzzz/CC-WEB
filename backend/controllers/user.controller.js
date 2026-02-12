const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Admin
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { 'profile.firstName': new RegExp(search, 'i') },
      { 'profile.lastName': new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -deviceTokens')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean({ virtuals: true }),
    User.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      },
      'Users retrieved successfully'
    )
  );
});

/**
 * @desc    Create new user (Admin manual registration)
 * @route   POST /api/v1/users
 * @access  Admin
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, password, bloodGroup, gender, dateOfBirth } = req.body;

  const userExists = await User.findOne({ phone });
  if (userExists) {
    throw new ApiError(400, 'User with this phone already exists');
  }

  const user = await User.create({
    profile: {
      firstName,
      lastName,
      // Convert empty strings to undefined to bypass enum validation
      bloodGroup: bloodGroup || undefined,
      gender,
      dateOfBirth
    },
    phone,
    email,
    password, // Will be hashed by pre-save hook
    status: 'active',
    isVerified: true // Admin created users are auto-verified
  });

  res.status(201).json(
    new ApiResponse(201, { user }, 'User created successfully')
  );
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Admin
 */
exports.getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -deviceTokens')
    .lean({ virtuals: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Admin
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const validStatuses = ['active', 'inactive', 'suspended'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be active, inactive, or suspended');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select('-password -deviceTokens');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, { user }, `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`)
  );
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Admin
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();

  const statusCounts = {
    total: totalUsers,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending_verification: 0
  };

  stats.forEach((stat) => {
    if (statusCounts.hasOwnProperty(stat._id)) {
      statusCounts[stat._id] = stat.count;
    }
  });

  // Get recent registrations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...statusCounts,
        recentRegistrations
      },
      'User statistics retrieved successfully'
    )
  );
});
