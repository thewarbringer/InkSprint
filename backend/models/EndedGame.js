const mongoose = require('mongoose');

const endedGameSchema = new mongoose.Schema({
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
    default: 'ended',
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
      },
    ],
    default: [],
  },
}, {
  timestamps: true,
});

const EndedGame = mongoose.model('EndedGame', endedGameSchema);

module.exports = EndedGame;
