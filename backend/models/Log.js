const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  }
}, {
  timestamps: true
});

logSchema.index({ createdAt: -1 });
logSchema.index({ hospital: 1 });

module.exports = mongoose.model('Log', logSchema);
