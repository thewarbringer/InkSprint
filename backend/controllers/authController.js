const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.gmail,
  totalGames: user.totalGames,
  rating: user.rating,
  gamesHistory: user.gamesHistory || [],
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
