const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced middleware to check authentication via both session and JWT token
module.exports = {
  ensureAuth: async function (req, res, next) {
    // First check if user is authenticated via session (Passport)
    if (req.isAuthenticated()) {
      return next();
    }

    // If not authenticated via session, check for JWT token in Authorization header
    try {
      // Get token from Authorization header (format: "Bearer TOKEN")
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth Header:', authHeader);
        return res.status(401).json({ message: 'Not authorized, please log in' });
      }

      // Extract the token
      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, please log in' });
      }

      // Verify token using JWT_SECRET from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Find user by ID from token
      const user = await User.findById(decoded.id);
      console.log('User found:', user);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to request object
      req.user = user;
      return next();

    } catch (error) {
      console.error('Authentication error:', error.message);
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }
  }
};
