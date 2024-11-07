const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Optional: Add more fields as needed
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;