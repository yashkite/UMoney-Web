// umoney-backend/controllers/googleAuth.js

const passport = require('passport');
const jwt = require('jsonwebtoken');

// Logic for handling Google authentication
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'] // Specify the required scope
});

exports.googleAuthCallback = (req, res, next) => {
  // Use custom callback to handle token generation and redirection
  passport.authenticate('google', { failureRedirect: '/api/auth/login-failed', session: false }, (err, user, info) => { // Disable session creation
    if (err) {
      console.error("Google auth callback error:", err);
      return res.redirect('/api/auth/login-failed'); // Redirect to failure route
    }
    if (!user) {
       console.error("Google auth callback: No user found.");
      return res.redirect('/api/auth/login-failed'); // Redirect to failure route
    }

    // Generate JWT token upon successful Google auth using JWT_SECRET from environment variables
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend, passing the token
    // Ensure FRONTEND_URL is configured in your environment variables
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login/success?token=${token}`);

  })(req, res, next);
};

exports.loginFailed = (req, res, next) => {
    res.status(401).json({ message: 'Google authentication failed.' });
};