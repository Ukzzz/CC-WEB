const Feedback = require('../models/Feedback');
const Hospital = require('../models/Hospital');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all feedback
 * @route   GET /api/v1/feedback
 * @access  Protected
 */
exports.getFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, hospital, status, rating } = req.query;

  const query = {};

  // Hospital admin restriction
  if (req.admin.role === 'hospital_admin' && req.admin.hospital) {
    query.hospital = req.admin.hospital;
  } else if (hospital) {
    query.hospital = hospital;
  }

  if (status) query.status = status;
  if (rating) query.rating = rating;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [feedback, total] = await Promise.all([
    Feedback.find(query)
      .populate('hospital', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Feedback.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200, 
      { 
        feedback,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }, 
      'Feedback retrieved successfully'
    )
  );
});

/**
 * @desc    Create feedback (Simulating user submission)
 * @route   POST /api/v1/feedback
 * @access  Public (or semi-protected if simulating)
 */
exports.createFeedback = asyncHandler(async (req, res) => {
  const { hospital, rating, comment, userName, category } = req.body;

  const hospitalExists = await Hospital.findById(hospital);
  if (!hospitalExists) {
    throw new ApiError(404, 'Hospital not found');
  }

  const feedback = await Feedback.create({
    hospital,
    rating,
    comment,
    userName,
    category
  });

  res.status(201).json(
    new ApiResponse(201, { feedback }, 'Feedback submitted successfully')
  );
});
