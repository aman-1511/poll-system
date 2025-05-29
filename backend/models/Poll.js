const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  timeout: {
    type: Number,
    required: true,
    default: 60 // Default 60 seconds
  },
  answers: {
    type: Map,
    of: String,
    default: {}
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  results: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

const Poll = mongoose.model('Poll', PollSchema);

module.exports = Poll; 