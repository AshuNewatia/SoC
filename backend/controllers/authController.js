import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import nodemailer from 'nodemailer';

import { getRoleFromEmail } from "../utils/getRoleFromEmail.js";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith('@iiti.ac.in')) {
      return res.status(403).json({ message: 'Access denied. Only official @iiti.ac.in emails are allowed.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = getRoleFromEmail(email);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hasPassword: true,   
      role
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);

      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!user.hasPassword || !user.password) {
      return res.status(401).json({
        message:
          "This account was created using Google/GitHub login.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Login Attempt:", {
      email,
      match: isMatch,
    });

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.CLIENT_URL}/oauth/callback`, 
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = userResponse.data;

    if (!email.endsWith('@iiti.ac.in')) {
      return res.status(403).json({ message: 'Access denied. Please sign in with your official institute Google account.' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const tempToken = jwt.sign(
        { email, name, googleId, avatar: picture, provider: 'google' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      return res.status(200).json({
        action: 'requires_profile_creation',
        tempToken,
        message: 'Redirecting to complete profile...'
      });
    } 
    
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    const role = getRoleFromEmail(email);
    const token = generateToken(user._id);
    return res.status(200).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export const githubAuth = async (req, res) => {
  try {
    const { code } = req.body;

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.CLIENT_URL}/oauth/callback`,
    }, {
      headers: { Accept: 'application/json' },
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: githubId, login, avatar_url } = userResponse.data;
    let userEmail = userResponse.data.email;

    if (!userEmail) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      const primaryEmailObj = emailResponse.data.find(
        (e) => e.primary && e.verified
      );
      
      if (primaryEmailObj) {
        userEmail = primaryEmailObj.email;
      }
    }

    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Could not retrieve a valid email from your GitHub account. Please ensure you have a verified email on GitHub.' 
      });
    }

    let user = await User.findOne({ $or: [{ githubId }, { email: userEmail }] });

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
    
    if (!user.githubId) {
      user.githubId = githubId;
      await user.save();
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });

  } catch (error) {
    console.error('GitHub Auth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'GitHub authentication failed.' });
  }
};

export const completeOAuthProfile = async (req, res) => {
  try {
    const { tempToken, password, name } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || decoded.name,
      email: decoded.email,
      password: hashedPassword,
      hasPassword: true,
      avatar: decoded.avatar,
      googleId: decoded.provider === 'google' ? decoded.googleId : undefined,
      githubId: decoded.provider === 'github' ? decoded.githubId : undefined,
      role: getRoleFromEmail(decoded.email),
    });
    const token = generateToken(user._id);

    res.status(201).json({
      action: 'login',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }
    });

  } catch (error) {
    console.error('Profile Completion Error:', error);
    res.status(400).json({ message: 'Invalid or expired token. Please try signing up again.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, year, branch, oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required to set a new one" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect old password" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (year) user.year = year;
    if (branch) user.branch = branch;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: { _id: user._id, name: user.name, year: user.year, branch: user.branch, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.error("PROFILE UPDATE CRASH:", error);
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "CampusFlow - Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error while sending email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, resetOtp: otp, otpExpires: { $gt: Date.now() } });
    
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};
