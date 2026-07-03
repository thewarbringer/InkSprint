const express = require('express');
const { createGame } = require('../controllers/activeGameController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', requireAuth, createGame);

module.exports = router;
