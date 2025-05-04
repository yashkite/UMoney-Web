const express = require('express');
const router = express.Router();
const passport = require('passport'); // Passport might still be needed for initializing auth strategies
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware
const authController = require('../controllers/authController'); // Import the controller
const budgetController = require('../controllers/budgetController'); // Import the budget controller

// @route   GET /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.get('/google', authController.googleAuth); // Use controller function

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback URL
// @access  Public
router.get('/google/callback', authController.googleAuthCallback); // Use controller function

// @route   GET /api/auth/current_user
// @desc    Get current logged-in user
// @access  Private (requires login)
router.get('/current_user', authMiddleware.ensureAuth, authController.getCurrentUser); // Use controller function

// @route   POST /api/auth/token
// @desc    Generate a new token for an authenticated user
// @access  Private (requires login)
router.post('/token', authMiddleware.ensureAuth, authController.generateToken); // Use controller function

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Public (no login required)
router.get('/logout', authController.logoutUser); // Use controller function

// Placeholder for login failure
router.get('/login-failed', authController.loginFailed); // Use controller function

// @route   POST /api/auth/setup
// @desc    Save user setup information
// @access  Private (requires login via authMiddleware)
router.post('/setup', authMiddleware.ensureAuth, authController.setupUser); // Use controller function

// @route   GET /api/auth/budget-preferences
// @desc    Get user's budget preferences
// @access  Private (requires login)
router.get('/budget-preferences', authMiddleware.ensureAuth, budgetController.getBudgetPreferences);

// @route   PUT /api/auth/budget-preferences
// @desc    Update user's budget preferences
// @access  Private (requires login)
router.put('/budget-preferences', authMiddleware.ensureAuth, budgetController.updateBudgetPreferences);

// @route   PUT /api/auth/profile
// @desc    Update user profile information
// @access  Private (requires login)
router.put('/profile', authMiddleware.ensureAuth, authController.updateUserProfile);

// @route   GET /api/auth/csrf-token
// @desc    Get a CSRF token
// @access  Public
router.get('/csrf-token', (req, res) => {
  // The CSRF token is automatically added to the response by the csrfMiddleware
  res.json({ success: true, csrfToken: req.csrfToken() });
});

module.exports = router;