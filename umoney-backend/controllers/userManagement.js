// umoney-backend/controllers/userManagement.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createDefaultCategories } = require('../utils/categoryUtils');

// Logic for handling user management
exports.getCurrentUser = async (req, res, next) => {
  // ensureAuth middleware should have populated req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user data not found.' });
  }

  console.log('getCurrentUser: User from request:', req.user);

  // Generate a new token for API usage
  const token = jwt.sign(
    { id: req.user.id },
    process.env.JWT_SECRET || 'your-jwt-secret-key',
    { expiresIn: '24h' }
  );

  // Create a user object with only the necessary fields
  const userResponse = {
    id: req.user._id,
    googleId: req.user.googleId,
    name: req.user.displayName,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone, // Include phone field
    profilePicture: req.user.profilePicture,
    setupComplete: req.user.setupComplete
  };

  console.log('getCurrentUser: Sending user data:', userResponse);

  // Send user data and token
  res.json({
    user: userResponse,
    token: token
  });
};

exports.generateToken = (req, res, next) => {
    // ensureAuth middleware should have populated req.user
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user data not found.' });
    }
    // Generate a new token
    const token = jwt.sign(
        { id: req.user.id },
        process.env.JWT_SECRET || 'your-jwt-secret-key',
        { expiresIn: '24h' }
    );
    res.json({ token });
};

exports.setupUser = async (req, res, next) => {
    const {
      displayName,
      firstName,
      lastName,
      dateOfBirth,
      employmentType,
      estimatedMonthlyIncome,
      estimatedMonthlyExpenses,
      preferredCurrency
    } = req.body;
    const userId = req.user.id; // Assuming ensureAuth middleware adds user to req

    // Basic validation
    if (!displayName || !dateOfBirth || !employmentType || !preferredCurrency) {
      return res.status(400).json({ message: 'Missing required setup fields: displayName, dateOfBirth, employmentType, preferredCurrency.' });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Update user fields
      user.displayName = displayName;
      user.firstName = firstName || user.firstName; // Keep existing if not provided
      user.lastName = lastName || user.lastName;   // Keep existing if not provided
      user.dateOfBirth = dateOfBirth;
      user.employmentType = employmentType;
      user.estimatedMonthlyIncome = estimatedMonthlyIncome === undefined || estimatedMonthlyIncome === null ? user.estimatedMonthlyIncome : estimatedMonthlyIncome; // Keep existing if null/undefined
      user.estimatedMonthlyExpenses = estimatedMonthlyExpenses === undefined || estimatedMonthlyExpenses === null ? user.estimatedMonthlyExpenses : estimatedMonthlyExpenses; // Keep existing if null/undefined
      user.preferredCurrency = preferredCurrency;
      user.setupComplete = true; // Mark setup as complete

      await user.save();

      // Create default categories for the user if they don't exist
      await createDefaultCategories(user._id);

      res.json({ message: 'User setup completed successfully.', user });

    } catch (error) {
      console.error('Error saving user setup:', error);
       if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
      res.status(500).json({ message: 'Server error during user setup.' });
      // Consider next(error)
    }
};