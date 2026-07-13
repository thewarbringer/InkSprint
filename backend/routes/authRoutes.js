const express = require('express');
const { signup, signin, googleSignin, me, updateAccount } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google-signin', googleSignin);
router.get('/me', requireAuth, me);
router.put('/update', requireAuth, updateAccount);

module.exports = router;
