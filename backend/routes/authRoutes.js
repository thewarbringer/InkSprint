const express = require('express');
const { signup, signin, me, googleSignin, discordSignin, updateAccount } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleSignin);
router.post('/google-signin', googleSignin);
router.post('/discord-signin', discordSignin);
router.get('/me', requireAuth, me);
router.put('/update', requireAuth, updateAccount);

module.exports = router;