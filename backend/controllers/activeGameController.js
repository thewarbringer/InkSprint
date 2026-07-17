const ActiveGame = require('../models/ActiveGame');
const EndedGame = require('../models/EndedGame');
const { broadcastToRoom } = require('../wsServer');
const categories = require('../categories.json');
const { canStartGame, MIN_PLAYERS_TO_START, MAX_PLAYERS_PER_ROOM, isValidRoomCapacity } = require('../utils/gameValidation');

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const getRandomWord = () => {
  const index = Math.floor(Math.random() * categories.length);
  return categories[index] || '';
};

const User = require('../models/User');
const { updateUserGameHistory } = require('../utils/gameHistory');
const { buildRankedResults } = require('../utils/gameResults');

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

  if (!isValidRoomCapacity(maxPlayers)) {
    return res.status(400).json({ message: `Room capacity must be between ${MIN_PLAYERS_TO_START} and ${MAX_PLAYERS_PER_ROOM} players.` });
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
    const activeGame = await ActiveGame.findOne({ roomId }).lean();
    if (activeGame) {
      return res.status(200).json({ game: activeGame });
    }

    const endedGame = await EndedGame.findOne({ roomId }).lean();
    if (!endedGame) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    return res.status(200).json({ game: endedGame });
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

    if (!canStartGame(game)) {
      return res.status(400).json({ message: `At least ${MIN_PLAYERS_TO_START} players are required to start the game.` });
    }

    game.state = 'started';
    game.roundsDone = 0;
    game.timerSeconds = 45;
    game.players.forEach((player) => {
      player.hold = false;
    });
    game.currentWord = getRandomWord();
    await game.save();

    broadcastToRoom(roomId, {
      type: 'start',
      roomId,
      word: game.currentWord,
      roundsDone: game.roundsDone,
      rounds: game.rounds,
      timerSeconds: game.timerSeconds,
      players: game.players.map((playerEntry) => ({
        username: playerEntry.username,
        scores: playerEntry.scores || 0,
        hold: Boolean(playerEntry.hold),
      })),
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

// End / archive an active game immediately (callable from client)
exports.endGame = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) return res.status(400).json({ message: 'roomId is required.' });

  try {
    const game = await ActiveGame.findOne({ roomId });
    if (!game) return res.status(404).json({ message: 'Game not found.' });

    const rankedResults = buildRankedResults(game.players || []);
    const topIsDraw = rankedResults.length > 0 && rankedResults[0]?.isDraw;
    const winnerUsername = topIsDraw ? null : (rankedResults[0]?.username || null);

    await EndedGame.findOneAndUpdate(
      { roomId: game.roomId },
      {
        roomId: game.roomId,
        roomName: game.roomName,
        maxPlayers: game.maxPlayers,
        rounds: game.rounds,
        privateRoom: game.privateRoom,
        state: 'ended',
        winner: winnerUsername,
        players: (game.players || []).map((player) => ({
          username: player.username,
          scores: player.scores || 0,
          hold: Boolean(player.hold),
        })),
      },
      { upsert: true, new: true }
    );

    await updateUserGameHistory(User, game, winnerUsername, rankedResults);
    await ActiveGame.deleteOne({ _id: game._id });

    broadcastToRoom(roomId, {
      type: 'gameOver',
      roomId,
      state: 'over',
    });

    return res.status(200).json({ message: 'Game ended and archived.' });
  } catch (error) {
    console.error('End game error:', error);
    return res.status(500).json({ message: error.message || 'Unable to end game.' });
  }
};
