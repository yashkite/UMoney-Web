/**
 * CSRF Error Handler Middleware
 * 
 * This middleware catches CSRF token validation errors and returns a standardized
 * error response to the client.
 */
module.exports = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF token errors
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token. This might be due to an expired form or a cross-site request forgery attempt.',
        code: 'INVALID_CSRF_TOKEN'
      }
    });
  }
  
  // Pass all other errors to the next error handler
  next(err);
};