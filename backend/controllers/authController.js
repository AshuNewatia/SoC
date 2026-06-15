import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// ==========================================
// 1. STANDARD EMAIL/PASSWORD AUTHENTICATION
// ==========================================

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hasPassword: true // Mark that they have a local password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Safety check: If they signed up with OAuth but never set a password
    if (!user.password || !user.hasPassword) {
      return res.status(401).json({ message: 'Please sign in using your Google or GitHub account.' });
    }

    // Compare password with hashed version
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ==========================================
// 2. OAUTH AUTHENTICATION (GOOGLE & GITHUB)
// ==========================================

// @desc    Google OAuth Login/Signup
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      // Dynamic environment variable!
      redirect_uri: `${process.env.CLIENT_URL}/oauth/callback`, 
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = userResponse.data;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    // INTERCEPT: If user doesn't exist, they are signing up.
    if (!user) {
      // Create a short-lived temp token containing their Google info
      const tempToken = jwt.sign(
        { email, name, googleId, avatar: picture, provider: 'google' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      // Tell the frontend to redirect to Create Profile
      return res.status(200).json({
        action: 'requires_profile_creation',
        tempToken,
        message: 'Redirecting to complete profile...'
      });
    } 
    
    // LOGIN: User already exists.
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// @desc    GitHub OAuth Login/Signup
// @route   POST /api/auth/github
export const githubAuth = async (req, res) => {
  try {
    const { code } = req.body;

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' },
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: githubId, login, avatar_url, email } = userResponse.data;
    const userEmail = email || `${login}@github.user`; 

    let user = await User.findOne({ $or: [{ githubId }, { email: userEmail }] });

    // INTERCEPT
    if (!user) {
      const tempToken = jwt.sign(
        { email: userEmail, name: login, githubId, avatar: avatar_url, provider: 'github' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      return res.status(200).json({
        action: 'requires_profile_creation',
        tempToken,
        message: 'Redirecting to complete profile...'
      });
    } 
    
    // LOGIN
    if (!user.githubId) {
      user.githubId = githubId;
      await user.save();
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error('GitHub Auth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'GitHub authentication failed' });
  }
};

// ==========================================
// 3. PROFILE COMPLETION (OAUTH HANDOFF)
// ==========================================

// @desc    Complete OAuth profile with password
// @route   POST /api/auth/complete-oauth
export const completeOAuthProfile = async (req, res) => {
  try {
    const { tempToken, password, name } = req.body;

    // Verify the temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    // Check if user already got created somehow
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user using decoded data from Google/GitHub + new password
    const user = await User.create({
      name: name || decoded.name,
      email: decoded.email,
      password: hashedPassword,
      hasPassword: true,
      avatar: decoded.avatar,
      googleId: decoded.provider === 'google' ? decoded.googleId : undefined,
      githubId: decoded.provider === 'github' ? decoded.githubId : undefined,
    });

    // Generate the real session token
    const token = generateToken(user._id);

    res.status(201).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });

  } catch (error) {
    console.error('Profile Completion Error:', error);
    res.status(400).json({ message: 'Invalid or expired token. Please try signing up again.' });
  }
};