const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [100, 'Hospital name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Hospital code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Hospital code cannot exceed 10 characters']
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'Pakistan'
      }
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
      website: {
        type: String,
        trim: true
      },
      emergencyHotline: {
        type: String,
        trim: true
      }
    },
    emergencyServices: {
      available: {
        type: Boolean,
        default: true
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      operatingHours: {
        is24x7: {
          type: Boolean,
          default: true
        },
        openTime: {
          type: String,
          default: '00:00'
        },
        closeTime: {
          type: String,
          default: '23:59'
        }
      }
    },
    departments: [
      {
        name: {
          type: String,
          trim: true
        },
        floor: {
          type: String,
          trim: true
        },
        headOfDepartment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Staff'
        }
      }
    ],
    services: {
      is24x7: {
        type: Boolean,
        default: true
      },
      hasEmergency: {
        type: Boolean,
        default: true
      },
      hasAmbulance: {
        type: Boolean,
        default: false
      },
      hasBloodBank: {
        type: Boolean,
        default: false
      }
    },
    hospitalType: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: 'Hospital type must be public or private'
      },
      default: 'private'
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'maintenance'],
        message: 'Status must be active, inactive, or maintenance'
      },
      default: 'active'
    },
    metadata: {
      establishedYear: {
        type: Number,
        min: [1800, 'Established year must be after 1800'],
        max: [new Date().getFullYear(), 'Established year cannot be in the future']
      },
      accreditation: [String],
      specializations: [String]
    },
    logo: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
hospitalSchema.index({ name: 'text', 'location.city': 'text' });
hospitalSchema.index({ 'location.city': 1 });
hospitalSchema.index({ status: 1 });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function () {
  const loc = this.location;
  return `${loc.address}, ${loc.city}, ${loc.state} ${loc.zipCode}`;
});

// Ensure virtuals are included
hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
