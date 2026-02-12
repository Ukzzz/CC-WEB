const Log = require('../models/Log');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get system logs
 * @route   GET /api/v1/logs
 * @access  Super Admin
 */
exports.getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, user } = req.query;

  const query = {};
  if (action) query.action = new RegExp(action, 'i');
  if (user) query.user = user;
  
  // Hospital admins can only see their own hospital's logs
  if (req.admin.role === 'hospital_admin' && req.admin.hospital) {
    query.hospital = req.admin.hospital;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    Log.find(query)
      .populate('user', 'name email role')
      .populate('hospital', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Log.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200, 
      { 
        logs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }, 
      'Logs retrieved successfully'
    )
  );
});
