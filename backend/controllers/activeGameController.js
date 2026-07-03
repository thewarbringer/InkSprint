const ActiveGame = require('../models/ActiveGame');

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateRoomId = () => {
  let id = '';
  for (let i = 0; i < 8; i += 1) {
    id += ALPHANUMERIC_CHARS[Math.floor(Math.random() * ALPHANUMERIC_CHARS.length)];
  }
  return id;
};

const generateUniqueRoomId = async () => {
  let roomId = generateRoomId();
  let exists = await ActiveGame.exists({ roomId });
  let attempts = 0;

  while (exists && attempts < 10) {
    roomId = generateRoomId();
    exists = await ActiveGame.exists({ roomId });
    attempts += 1;
  }

  if (exists) {
    throw new Error('Unable to generate unique room ID. Please try again.');
  }

  return roomId;
};

exports.createGame = async (req, res) => {
  const { roomName, maxPlayers, rounds, privateRoom } = req.body;

  if (!roomName || !maxPlayers || !rounds) {
    return res.status(400).json({ message: 'roomName, maxPlayers, and rounds are required.' });
  }

  try {
    const roomId = await generateUniqueRoomId();

    const game = new ActiveGame({
      roomId,
      roomName: roomName.trim() || 'Sprint Room',
      maxPlayers: Number(maxPlayers),
      rounds: Number(rounds),
      privateRoom: privateRoom === 'yes' ? 'yes' : 'no',
      state: 'waiting',
      players: [
        {
          username: req.user.username,
          scores: 0,
          hold: false,
        },
      ],
    });

    await game.save();

    return res.status(201).json({ game });
  } catch (error) {
    console.error('Create game error:', error);
    return res.status(500).json({ message: error.message || 'Unable to create game.' });
  }
};
