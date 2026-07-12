const mongoose = require('mongoose');

const gameHistoryEntrySchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    trim: true,
  },
  roomName: {
    type: String,
    trim: true,
    default: '',
  },
  winner: {
    type: String,
    trim: true,
    default: null,
  },
  result: {
    type: String,
    enum: ['win', 'loss'],
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalGames: {
    type: Number,
    default: 0,
  },
  gamesHistory: {
    type: [gameHistoryEntrySchema],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
