// umoney-backend/controllers/logout.js

// Logic for handling user logout
exports.logoutUser = (req, res, next) => {
  // Helper function to clear cookies and respond
  function clearAuthAndRespond() {
    // Clear the auth cookie (assuming cookie name is 'auth')
    res.clearCookie('auth', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    // Return JSON response
    res.json({ message: 'Logged out successfully' });
  }

  // Check if user is authenticated via passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) {
        console.error("Logout error:", err);
        // Still attempt to clear cookie and respond
        clearAuthAndRespond();
        return next(err); // Optionally pass error to error handler
      }
      // Successful passport logout
      clearAuthAndRespond();
    });
  } else {
    // User might not be authenticated via session (e.g., only JWT) or already logged out
    clearAuthAndRespond();
  }
};