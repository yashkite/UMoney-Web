const passport = require('passport');
const User = require('../models/User');
const { loginUser, registerUser } = require('./standardAuth');
const { getCurrentUser, generateToken, setupUser } = require('./userManagement');
const { googleAuth, googleAuthCallback, loginFailed } = require('./googleAuth');
const { logoutUser } = require('./logout');
const { updateUserProfile } = require('./profileController');

// @desc    Authenticate user & get token (Login - Placeholder for standard login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = loginUser;

// @desc    Register user (Placeholder for standard registration)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = registerUser;

// @desc    Get current logged in user (from /current_user route)
// @route   GET /api/auth/current_user
// @access  Private
exports.getCurrentUser = getCurrentUser;

// @desc    Log user out
// @route   GET /api/auth/logout
// @access  Public
exports.logoutUser = logoutUser;

// @desc    Google Auth Consent Screen Trigger
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = googleAuth;

// @desc    Google Auth Callback Handler
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleAuthCallback = googleAuthCallback;

// @desc    Handle Google Login Failure
// @route   GET /api/auth/login-failed
// @access  Public
exports.loginFailed = loginFailed;

// @desc    Generate a new token for an already authenticated user
// @route   POST /api/auth/token
// @access  Private
exports.generateToken = generateToken;

// @desc    Save user setup information
// @route   POST /api/auth/setup
// @access  Private
exports.setupUser = setupUser;

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = updateUserProfile;
