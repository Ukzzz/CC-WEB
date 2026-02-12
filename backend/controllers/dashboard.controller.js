const Hospital = require('../models/Hospital');
const Staff = require('../models/Staff');
const Resource = require('../models/Resource');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard overview
 * @route   GET /api/v1/dashboard/overview
 * @access  Protected
 */
exports.getOverview = asyncHandler(async (req, res) => {
  // Build query based on admin role
  const hospitalFilter =
    req.admin.role === 'hospital_admin' && req.admin.hospital
      ? { hospital: req.admin.hospital }
      : {};

  const hospitalIdFilter =
    req.admin.role === 'hospital_admin' && req.admin.hospital
      ? { _id: req.admin.hospital }
      : {};

  // Run all queries in parallel
  const [
    totalHospitals,
    activeHospitals,
    totalDoctors,
    totalNurses,
    totalStaff,
    bedResources,
    activeUsers
  ] = await Promise.all([
    // Hospital counts
    Hospital.countDocuments({ ...hospitalIdFilter }),
    Hospital.countDocuments({ ...hospitalIdFilter, status: 'active' }),

    // Doctor count
    Staff.countDocuments({
      ...hospitalFilter,
      role: 'doctor',
      status: 'active'
    }),

    // Nurse count
    Staff.countDocuments({
      ...hospitalFilter,
      role: 'nurse',
      status: 'active'
    }),

    // Total staff count
    Staff.countDocuments({
      ...hospitalFilter,
      status: 'active'
    }),

    // Bed resources aggregate
    Resource.aggregate([
      {
        $match: {
          ...hospitalFilter,
          resourceType: { $in: ['bed', 'icu_bed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBeds: { $sum: '$total' },
          availableBeds: { $sum: '$available' },
          occupiedBeds: { $sum: '$occupied' }
        }
      }
    ]),

    // Active users (only for super admin)
    req.admin.role === 'super_admin'
      ? User.countDocuments({ status: 'active' })
      : Promise.resolve(0)
  ]);

  // Extract bed stats
  const bedStats = bedResources[0] || {
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitals: {
          total: totalHospitals,
          active: activeHospitals
        },
        staff: {
          total: totalStaff,
          doctors: totalDoctors,
          nurses: totalNurses
        },
        beds: {
          total: bedStats.totalBeds,
          available: bedStats.availableBeds,
          occupied: bedStats.occupiedBeds
        },
        users: {
          active: activeUsers
        }
      },
      'Dashboard overview retrieved successfully'
    )
  );
});

/**
 * @desc    Get hospital statistics for dashboard
 * @route   GET /api/v1/dashboard/hospitals/stats
 * @access  Protected
 */
exports.getHospitalStats = asyncHandler(async (req, res) => {
  // For hospital admin, show only their hospital
  const matchStage =
    req.admin.role === 'hospital_admin' && req.admin.hospital
      ? { $match: { _id: req.admin.hospital } }
      : { $match: {} };

  const stats = await Hospital.aggregate([
    matchStage,
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get hospitals by city
  const hospitalsByCity = await Hospital.aggregate([
    matchStage,
    {
      $group: {
        _id: '$location.city',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        byStatus: stats,
        byCity: hospitalsByCity
      },
      'Hospital statistics retrieved successfully'
    )
  );
});

/**
 * @desc    Get resource summary for dashboard
 * @route   GET /api/v1/dashboard/resources/summary
 * @access  Protected
 */
exports.getResourceSummary = asyncHandler(async (req, res) => {
  // Build match based on admin role
  const matchStage =
    req.admin.role === 'hospital_admin' && req.admin.hospital
      ? { $match: { hospital: req.admin.hospital } }
      : { $match: {} };

  const resourceSummary = await Resource.aggregate([
    matchStage,
    {
      $group: {
        _id: '$resourceType',
        total: { $sum: '$total' },
        available: { $sum: '$available' },
        occupied: { $sum: '$occupied' },
        maintenance: { $sum: '$maintenance' }
      }
    },
    {
      $addFields: {
        availabilityPercentage: {
          $cond: {
            if: { $gt: ['$total', 0] },
            then: {
              $round: [{ $multiply: [{ $divide: ['$available', '$total'] }, 100] }, 1]
            },
            else: 0
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get critical resources (availability < 20%)
  const criticalResources = await Resource.find({
    ...(req.admin.role === 'hospital_admin' && req.admin.hospital
      ? { hospital: req.admin.hospital }
      : {}),
    $expr: {
      $and: [
        { $gt: ['$total', 0] },
        { $lt: [{ $divide: ['$available', '$total'] }, 0.2] }
      ]
    }
  })
    .populate('hospital', 'name code')
    .select('resourceType total available hospital')
    .limit(10)
    .lean();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: resourceSummary,
        critical: criticalResources
      },
      'Resource summary retrieved successfully'
    )
  );
});
