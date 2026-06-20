import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 

export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // FIX 1: Use decoded.userId (Matches your authController generateToken function)
      req.user = await User.findById(decoded.userId).select('-password');

      // FIX 2: Check if the user was deleted from the database
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
