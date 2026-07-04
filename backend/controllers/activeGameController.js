const ActiveGame = require('../models/ActiveGame');
const { broadcastToRoom } = require('../wsServer');

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
          ready: 'no',
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

exports.getAvailableGames = async (req, res) => {
  try {
    const games = await ActiveGame.find({
      privateRoom: 'no',
      state: 'waiting',
    })
      .select('roomId roomName maxPlayers players rounds')
      .lean();

    return res.status(200).json({ games });
  } catch (error) {
    console.error('Get available games error:', error);
    return res.status(500).json({ message: error.message || 'Unable to fetch available games.' });
  }
};

exports.joinGame = async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required.' });
  }

  try {
    const game = await ActiveGame.findOne({ roomId, state: 'waiting' });
    if (!game) {
      return res.status(404).json({ message: 'Room not found or is no longer joinable.' });
    }

    const existingPlayer = game.players.some((player) => player.username === req.user.username);
    if (existingPlayer) {
      return res.status(200).json({ game });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ message: 'This room is already full.' });
    }

    game.players.push({
      username: req.user.username,
      scores: 0,
      hold: false,
      ready: 'no',
    });

    await game.save();
    return res.status(200).json({ game });
  } catch (error) {
    console.error('Join game error:', error);
    return res.status(500).json({ message: error.message || 'Unable to join room.' });
  }
};

exports.getGameByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    const game = await ActiveGame.findOne({ roomId }).lean();
    if (!game) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    return res.status(200).json({ game });
  } catch (error) {
    console.error('Get game by room error:', error);
    return res.status(500).json({ message: error.message || 'Unable to fetch room details.' });
  }
};

exports.startGame = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required.' });
  }

  try {
    const game = await ActiveGame.findOne({ roomId, state: 'waiting' });
    if (!game) {
      return res.status(404).json({ message: 'Room not found or cannot be started.' });
    }

    if (game.players[0].username !== req.user.username) {
      return res.status(403).json({ message: 'Only the room host can start the game.' });
    }

    game.state = 'started';
    await game.save();

    broadcastToRoom(roomId, {
      type: 'start',
      roomId,
    });

    return res.status(200).json({ game });
  } catch (error) {
    console.error('Start game error:', error);
    return res.status(500).json({ message: error.message || 'Unable to start the game.' });
  }
};

exports.toggleReadyState = async (req, res) => {
  const { roomId } = req.params;
  const { ready } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required.' });
  }

  if (!['yes', 'no'].includes(ready)) {
    return res.status(400).json({ message: "Ready must be 'yes' or 'no'." });
  }

  try {
    const game = await ActiveGame.findOne({ roomId, state: 'waiting' });
    if (!game) {
      return res.status(404).json({ message: 'Room not found or cannot be updated.' });
    }

    const player = game.players.find((playerEntry) => playerEntry.username === req.user.username);
    if (!player) {
      return res.status(404).json({ message: 'Player not found in this room.' });
    }

    player.ready = ready;
    await game.save();

    broadcastToRoom(roomId, {
      type: 'playerUpdate',
      players: game.players.map((playerEntry, index) => ({
        username: playerEntry.username,
        ready: playerEntry.ready,
        isHost: index === 0,
      })),
    });

    return res.status(200).json({ game });
  } catch (error) {
    console.error('Toggle ready state error:', error);
    return res.status(500).json({ message: error.message || 'Unable to update ready state.' });
  }
};
