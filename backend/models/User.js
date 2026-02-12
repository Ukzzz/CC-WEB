const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true, // Allow null values while maintaining unique constraint
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    profile: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
      },
      dateOfBirth: {
        type: Date
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
      },
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      },
      avatar: {
        type: String,
        default: null
      }
    },
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0]
        }
      }
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      relationship: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended', 'pending_verification'],
        message: 'Invalid status value'
      },
      default: 'pending_verification'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastActive: {
      type: Date
    },
    deviceTokens: [
      {
        token: String,
        platform: {
          type: String,
          enum: ['ios', 'android']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ status: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'profile.firstName': 'text', 'profile.lastName': 'text' });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Ensure virtuals are included
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
