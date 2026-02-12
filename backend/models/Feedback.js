const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (patients)
    required: false // Can be anonymous or referenced
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['service', 'facility', 'staff', 'cleanliness', 'wait_time', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'in_progress', 'resolved', 'archived'],
    default: 'new'
  },
  // Resolution tracking
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

feedbackSchema.index({ hospital: 1, createdAt: -1 });
feedbackSchema.index({ status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

