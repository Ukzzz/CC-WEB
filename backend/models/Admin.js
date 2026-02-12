const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Never return password in queries
    },
    name: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
      }
    },
    role: {
      type: String,
      enum: {
        values: ['super_admin', 'hospital_admin', 'staff_manager', 'read_only_auditor'],
        message: 'Role must be super_admin, hospital_admin, staff_manager, or read_only_auditor'
      },
      default: 'hospital_admin'
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null // Only required for hospital_admin, staff_manager
    },
    permissions: [
      {
        type: String,
        enum: [
          'manage_hospitals',
          'manage_staff',
          'manage_resources',
          'view_users',
          'manage_users',
          'view_analytics',
          'view_staff',
          'view_resources',
          'view_hospitals',
          'view_feedback',
          'view_logs',
          'manage_shifts'
        ]
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    // Password reset fields
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    // Account lockout fields
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ hospital: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
adminSchema.methods.getFullName = function () {
  return `${this.name.firstName} ${this.name.lastName}`;
};

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Ensure virtuals are included when converting to JSON
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);
