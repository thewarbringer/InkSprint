const express = require('express');
const { createGame, getAvailableGames, joinGame, getGameByRoomId, toggleReadyState } = require('../controllers/activeGameController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', requireAuth, createGame);
router.post('/join', requireAuth, joinGame);
router.put('/:roomId/ready', requireAuth, toggleReadyState);
router.get('/available', getAvailableGames);
router.get('/:roomId', getGameByRoomId);

module.exports = router;
