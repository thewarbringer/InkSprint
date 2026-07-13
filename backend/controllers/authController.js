const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.gmail,
  totalGames: user.totalGames,
  rating: user.rating,
  profilePicture: user.profilePicture || null,
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

exports.googleSignin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google token is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email.toLowerCase();

    let user = await User.findOne({ gmail: email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this Google email. Please sign up first.",
      });
    }

    // Link Google ID if not already linked
    if (!user.googleId) {
      user.googleId = payload.sub;
      if (payload.picture && !user.profilePicture) {
        user.profilePicture = payload.picture;
      }
      await user.save();
    }

    const jwtToken = createToken(user);

    return res.status(200).json({
      user: buildUserResponse(user),
      token: jwtToken,
    });
  } catch (err) {
    console.error("Google Login Error:", err);

    return res.status(500).json({
      message: "Google authentication failed.",
    });
  }
};

exports.discordSignin = async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({
        message: "Discord code and redirect URI are required.",
      });
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || clientId === "YOUR_DISCORD_CLIENT_ID") {
      return res.status(500).json({
        message: "Discord OAuth is not configured on the server.",
      });
    }

    // Exchange authorization code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Discord Token Exchange Error:", tokenData);
      return res.status(400).json({
        message: "Invalid or expired Discord authorization code.",
      });
    }

    const accessToken = tokenData.access_token;

    // Fetch user details from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error("Discord User Fetch Error:", userData);
      return res.status(400).json({
        message: "Failed to fetch user details from Discord.",
      });
    }

    const email = userData.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({
        message: "Unable to retrieve email from Discord account.",
      });
    }

    let user = await User.findOne({ gmail: email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this Discord email. Please sign up first.",
      });
    }

    // Link Discord ID if not already linked
    if (!user.discordId) {
      user.discordId = userData.id;
      if (userData.avatar && !user.profilePicture) {
        user.profilePicture = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
      }
      await user.save();
    }

    const jwtToken = createToken(user);

    return res.status(200).json({
      user: buildUserResponse(user),
      token: jwtToken,
    });
  } catch (err) {
    console.error("Discord Login Error:", err);
    return res.status(500).json({
      message: "Discord authentication failed.",
    });
  }
};

exports.updateAccount = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username && username.trim() !== user.username) {
      const trimmedName = username.trim();
      const existingUser = await User.findOne({ username: trimmedName, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      user.username = trimmedName;
    }

    if (email && email.trim().toLowerCase() !== user.gmail) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingEmail = await User.findOne({ gmail: normalizedEmail, _id: { $ne: user._id } });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email is already registered.' });
      }
      user.gmail = normalizedEmail;
    }

    if (password && password.length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const token = createToken(user);

    return res.status(200).json({ user: buildUserResponse(user), token });
  } catch (error) {
    console.error('Update account error:', error);
    return res.status(500).json({ message: 'Unable to update account. Please try again.' });
  }
};