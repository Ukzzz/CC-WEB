const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const Staff = require('../models/Staff');
const Resource = require('../models/Resource');
const Feedback = require('../models/Feedback');
const Log = require('../models/Log');
const Hospital = require('../models/Hospital');

/**
 * @desc    Get staff report with date range filter
 * @route   GET /api/v1/reports/staff
 * @access  Admin
 */
exports.getStaffReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, hospital, department, role, status = 'active' } = req.query;

  const query = {};

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Hospital filter (enforce for non-super-admin)
  if (req.admin.role !== 'super_admin') {
    query.hospital = req.admin.hospital;
  } else if (hospital) {
    query.hospital = hospital;
  }

  if (department) query.department = department;
  if (role) query.role = role;
  if (status) query.status = status;

  const staff = await Staff.find(query)
    .populate('hospital', 'name code')
    .sort({ createdAt: -1 });

  // Summary statistics
  const summary = {
    total: staff.length,
    byRole: {},
    byDepartment: {},
    onCall: staff.filter(s => s.shift?.onCall).length
  };

  staff.forEach(s => {
    summary.byRole[s.role] = (summary.byRole[s.role] || 0) + 1;
    summary.byDepartment[s.department] = (summary.byDepartment[s.department] || 0) + 1;
  });

  res.status(200).json(
    new ApiResponse(200, { staff, summary }, 'Staff report generated successfully')
  );
});

/**
 * @desc    Get resource report with date range filter
 * @route   GET /api/v1/reports/resources
 * @access  Admin
 */
exports.getResourceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, hospital, type } = req.query;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (req.admin.role !== 'super_admin') {
    query.hospital = req.admin.hospital;
  } else if (hospital) {
    query.hospital = hospital;
  }

  if (type) query.type = type;

  const resources = await Resource.find(query)
    .populate('hospital', 'name code')
    .sort({ type: 1 });

  const summary = {
    total: resources.length,
    byType: {},
    critical: resources.filter(r => r.availabilityPercentage < 20).length,
    available: resources.filter(r => r.availabilityPercentage >= 50).length
  };

  resources.forEach(r => {
    if (!summary.byType[r.type]) {
      summary.byType[r.type] = { total: 0, available: 0, occupied: 0 };
    }
    summary.byType[r.type].total += r.quantity.total;
    summary.byType[r.type].available += r.quantity.available;
    summary.byType[r.type].occupied += r.quantity.occupied;
  });

  res.status(200).json(
    new ApiResponse(200, { resources, summary }, 'Resource report generated successfully')
  );
});

/**
 * @desc    Get feedback report with date range filter
 * @route   GET /api/v1/reports/feedback
 * @access  Admin
 */
exports.getFeedbackReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, hospital, status, category } = req.query;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (req.admin.role !== 'super_admin') {
    query.hospital = req.admin.hospital;
  } else if (hospital) {
    query.hospital = hospital;
  }

  if (status) query.status = status;
  if (category) query.category = category;

  const feedback = await Feedback.find(query)
    .populate('hospital', 'name code')
    .populate('resolvedBy', 'name email')
    .sort({ createdAt: -1 });

  const summary = {
    total: feedback.length,
    byStatus: {},
    byCategory: {},
    averageRating: 0,
    resolved: feedback.filter(f => f.status === 'resolved').length
  };

  let totalRating = 0;
  feedback.forEach(f => {
    summary.byStatus[f.status] = (summary.byStatus[f.status] || 0) + 1;
    summary.byCategory[f.category] = (summary.byCategory[f.category] || 0) + 1;
    totalRating += f.rating;
  });

  summary.averageRating = feedback.length ? (totalRating / feedback.length).toFixed(2) : 0;

  res.status(200).json(
    new ApiResponse(200, { feedback, summary }, 'Feedback report generated successfully')
  );
});

/**
 * @desc    Export report as CSV
 * @route   GET /api/v1/reports/:type/export/csv
 * @access  Admin
 */
exports.exportCSV = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, hospital } = req.query;

  let data = [];
  let filename = '';
  let headers = [];

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const hospitalFilter = {};
  if (req.admin.role !== 'super_admin') {
    hospitalFilter.hospital = req.admin.hospital;
  } else if (hospital) {
    hospitalFilter.hospital = hospital;
  }

  switch (type) {
    case 'staff':
      headers = ['Employee ID', 'First Name', 'Last Name', 'Role', 'Department', 'Status', 'Email', 'Phone', 'On Call', 'Created At'];
      data = await Staff.find({ ...dateFilter, ...hospitalFilter }).populate('hospital', 'name');
      filename = `staff_report_${Date.now()}.csv`;
      
      const staffRows = data.map(s => [
        s.employeeId,
        s.name.firstName,
        s.name.lastName,
        s.role,
        s.department,
        s.status,
        s.contact?.email || '',
        s.contact?.phone || '',
        s.shift?.onCall ? 'Yes' : 'No',
        s.createdAt.toISOString()
      ]);
      data = [headers, ...staffRows];
      break;

    case 'resources':
      headers = ['Type', 'Total', 'Available', 'Occupied', 'Maintenance', 'Location', 'Status', 'Updated At'];
      const resources = await Resource.find({ ...dateFilter, ...hospitalFilter }).populate('hospital', 'name');
      filename = `resources_report_${Date.now()}.csv`;
      
      const resourceRows = resources.map(r => [
        r.type,
        r.quantity.total,
        r.quantity.available,
        r.quantity.occupied,
        r.quantity.maintenance,
        `${r.location?.floor || ''} ${r.location?.wing || ''}`.trim(),
        r.status,
        r.updatedAt.toISOString()
      ]);
      data = [headers, ...resourceRows];
      break;

    case 'feedback':
      headers = ['User', 'Rating', 'Category', 'Status', 'Comment', 'Resolution Notes', 'Resolved At', 'Created At'];
      const feedback = await Feedback.find({ ...dateFilter, ...hospitalFilter }).populate('hospital', 'name');
      filename = `feedback_report_${Date.now()}.csv`;
      
      const feedbackRows = feedback.map(f => [
        f.userName || 'Anonymous',
        f.rating,
        f.category,
        f.status,
        `"${(f.comment || '').replace(/"/g, '""')}"`,
        `"${(f.resolutionNotes || '').replace(/"/g, '""')}"`,
        f.resolvedAt ? f.resolvedAt.toISOString() : '',
        f.createdAt.toISOString()
      ]);
      data = [headers, ...feedbackRows];
      break;

    default:
      res.status(400).json(new ApiResponse(400, null, 'Invalid report type. Use: staff, resources, or feedback'));
      return;
  }

  // Generate CSV string
  const csvContent = data.map(row => row.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

/**
 * @desc    Export report as PDF (returns data for frontend PDF generation)
 * @route   GET /api/v1/reports/:type/export/pdf
 * @access  Admin
 */
exports.exportPDF = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, hospital } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const hospitalFilter = {};
  if (req.admin.role !== 'super_admin') {
    hospitalFilter.hospital = req.admin.hospital;
  } else if (hospital) {
    hospitalFilter.hospital = hospital;
  }

  let reportData = {};
  let hospitalInfo = null;

  if (hospitalFilter.hospital) {
    hospitalInfo = await Hospital.findById(hospitalFilter.hospital).select('name code location');
  }

  switch (type) {
    case 'staff':
      const staff = await Staff.find({ ...dateFilter, ...hospitalFilter }).populate('hospital', 'name code');
      reportData = {
        title: 'Staff Report',
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        hospital: hospitalInfo,
        data: staff,
        summary: {
          total: staff.length,
          active: staff.filter(s => s.status === 'active').length,
          onCall: staff.filter(s => s.shift?.onCall).length
        }
      };
      break;

    case 'resources':
      const resources = await Resource.find({ ...dateFilter, ...hospitalFilter }).populate('hospital', 'name code');
      reportData = {
        title: 'Resource Report',
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        hospital: hospitalInfo,
        data: resources,
        summary: {
          total: resources.length,
          critical: resources.filter(r => r.availabilityPercentage < 20).length
        }
      };
      break;

    case 'feedback':
      const feedback = await Feedback.find({ ...dateFilter, ...hospitalFilter })
        .populate('hospital', 'name code')
        .populate('resolvedBy', 'name');
      const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
      reportData = {
        title: 'Feedback Report',
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        hospital: hospitalInfo,
        data: feedback,
        summary: {
          total: feedback.length,
          resolved: feedback.filter(f => f.status === 'resolved').length,
          averageRating: feedback.length ? (totalRating / feedback.length).toFixed(2) : 0
        }
      };
      break;

    default:
      res.status(400).json(new ApiResponse(400, null, 'Invalid report type'));
      return;
  }

  res.status(200).json(
    new ApiResponse(200, reportData, 'PDF report data generated successfully')
  );
});
