const mongoose = require('mongoose');

const activeGameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  roomName: {
    type: String,
    required: true,
    trim: true,
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
  },
  rounds: {
    type: Number,
    required: true,
    min: 1,
  },
  privateRoom: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
    default: 'no',
  },
  state: {
    type: String,
    enum: ['started', 'waiting', 'ended'],
    required: true,
    default: 'waiting',
  },
  players: {
    type: [
      {
        username: {
          type: String,
          required: true,
          trim: true,
        },
        scores: {
          type: Number,
          default: 0,
          min: 0,
        },
        hold: {
          type: Boolean,
          default: false,
        },
        ready: {
          type: String,
          enum: ['yes', 'no'],
          required: true,
          default: 'no',
        },
      },
    ],
    default: [],
  },
}, {
  timestamps: true,
});

const ActiveGame = mongoose.model('ActiveGame', activeGameSchema);

module.exports = ActiveGame;
