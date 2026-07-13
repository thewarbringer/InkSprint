const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { OAuth2Client } = require('google-auth-library');
const oAuth2Client = new OAuth2Client();

const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.gmail,
  totalGames: user.totalGames,
  rating: user.rating,
<<<<<<< HEAD
  profilePicture: user.profilePicture || null,
=======
  gamesHistory: user.gamesHistory || [],
>>>>>>> c27c185caac0c93b4d0e49985f2f6109770a273d
  createdAt: user.createdAt,
});

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.gmail,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ gmail: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.trim(),
      gmail: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();
    const token = createToken(user);

    return res.status(201).json({ user: buildUserResponse(user), token });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Unable to create account. Please try again.' });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ gmail: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google sign-in. Please use the Google button to log in.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user);
    return res.status(200).json({ user: buildUserResponse(user), token });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Unable to sign in. Please try again.' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: buildUserResponse(user) });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ message: 'Unable to retrieve user profile.' });
  }
};

exports.googleSignin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential (ID token) is required.' });
  }

  try {
    const clientID = process.env.GOOGLE_CLIENT_ID || '52241668622-mm2p36hvtjgsp6qffi4psegevmq8forh.apps.googleusercontent.com';
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: clientID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google credential.' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Unable to retrieve email from Google account.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists by email
    let user = await User.findOne({ gmail: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this Google email. Please sign up first.' });
    }

    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      await user.save();
    }

    const token = createToken(user);
    return res.status(200).json({ user: buildUserResponse(user), token });
  } catch (error) {
    console.error('Google signin error:', error);
    return res.status(500).json({ message: 'Unable to sign in with Google. Please try again.' });
  }
};
