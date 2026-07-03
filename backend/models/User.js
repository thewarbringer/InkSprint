const mongoose = require('mongoose');

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
  country: {
    type: String,
    trim: true,
  },
  totalGames: {
    type: Number,
    default: 0,
  },
  gamesHistory: {
    type: [
      {
        title: String,
        score: Number,
        playedAt: Date,
      },
    ],
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
