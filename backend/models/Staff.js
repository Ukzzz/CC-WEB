const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true
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
        values: ['doctor', 'nurse', 'technician', 'receptionist', 'admin_staff'],
        message: 'Invalid staff role'
      },
      required: [true, 'Staff role is required']
    },
    specialization: {
      type: String,
      trim: true,
      // Required only for doctors
      required: function () {
        return this.role === 'doctor';
      }
    },
    qualifications: [
      {
        degree: {
          type: String,
          trim: true
        },
        institution: {
          type: String,
          trim: true
        },
        year: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear()
        }
      }
    ],
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital association is required']
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
      },
      emergencyContact: {
        type: String,
        trim: true
      }
    },
    shift: {
      type: {
        type: String,
        enum: ['morning', 'afternoon', 'night', 'rotating'],
        default: 'morning'
      },
      timings: {
        start: {
          type: String,
          default: '09:00'
        },
        end: {
          type: String,
          default: '17:00'
        }
      },
      workingDays: [
        {
          type: String,
          enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
          ]
        }
      ],
      // Emergency on-call designation
      onCall: {
        type: Boolean,
        default: false
      },
      // Manual override flag by Hospital Admin (for conflict override)
      overrideConflicts: {
        type: Boolean,
        default: false
      }
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'on_leave', 'terminated'],
        message: 'Invalid status value'
      },
      default: 'active'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    profileImage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
staffSchema.index({ hospital: 1, department: 1, status: 1 });
staffSchema.index({ role: 1, hospital: 1 });
staffSchema.index({ 'name.firstName': 'text', 'name.lastName': 'text' });

// Virtual for full name
staffSchema.virtual('fullName').get(function () {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Ensure virtuals are included
staffSchema.set('toJSON', { virtuals: true });
staffSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Staff', staffSchema);
