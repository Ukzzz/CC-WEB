const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital is required']
    },
    resourceType: {
      type: String,
      enum: {
        values: [
          'bed',
          'icu_bed',
          'ventilator',
          'emergency_ward',
          'ambulance',
          'oxygen_cylinder'
        ],
        message: 'Invalid resource type'
      },
      required: [true, 'Resource type is required']
    },
    category: {
      type: String,
      enum: {
        values: ['general', 'critical_care', 'emergency', 'pediatric', 'maternity'],
        message: 'Invalid category'
      },
      default: 'general'
    },
    total: {
      type: Number,
      required: [true, 'Total count is required'],
      min: [0, 'Total cannot be negative']
    },
    available: {
      type: Number,
      required: [true, 'Available count is required'],
      min: [0, 'Available count cannot be negative'],
      validate: {
        validator: function (v) {
          return v <= this.total;
        },
        message: 'Available count cannot exceed total count'
      }
    },
    occupied: {
      type: Number,
      default: 0,
      min: [0, 'Occupied count cannot be negative']
    },
    maintenance: {
      type: Number,
      default: 0,
      min: [0, 'Maintenance count cannot be negative']
    },
    location: {
      floor: {
        type: String,
        trim: true
      },
      wing: {
        type: String,
        trim: true
      },
      ward: {
        type: String,
        trim: true
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
resourceSchema.index({ hospital: 1, resourceType: 1 });
resourceSchema.index({ resourceType: 1, available: 1 });
resourceSchema.index({ hospital: 1, category: 1 });

// Virtual for availability percentage
resourceSchema.virtual('availabilityPercentage').get(function () {
  return this.total > 0 ? Math.round((this.available / this.total) * 100) : 0;
});

// Virtual for status
resourceSchema.virtual('status').get(function () {
  const percentage = this.availabilityPercentage;
  if (percentage === 0) return 'unavailable';
  if (percentage <= 20) return 'critical';
  if (percentage <= 50) return 'low';
  return 'available';
});

// Pre-save middleware to update lastUpdated
resourceSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to validate counts
resourceSchema.pre('save', function (next) {
  const sum = this.available + this.occupied + this.maintenance;
  if (sum > this.total) {
    const err = new Error(
      'Sum of available, occupied, and maintenance cannot exceed total'
    );
    return next(err);
  }
  next();
});

// Ensure virtuals are included
resourceSchema.set('toJSON', { virtuals: true });
resourceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Resource', resourceSchema);
