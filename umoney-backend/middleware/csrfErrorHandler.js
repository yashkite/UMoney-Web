/**
 * CSRF Error Handler Middleware
 * 
 * This middleware catches CSRF token validation errors and returns
 * a standardized error response.
 */

const csrfErrorHandler = (err, req, res, next) => {
  // Check if the error is a CSRF token error
  if (err.code === 'EBADCSRFTOKEN') {
    // Log the error (but don't expose details to the client)
    console.error('CSRF token validation failed:', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
        'origin': req.headers['origin']
      }
    });
    
    // Return a standardized error response
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_CSRF_TOKEN',
        message: 'Invalid or missing CSRF token'
      }
    });
  }
  
  // If it's not a CSRF error, pass it to the next error handler
  next(err);
};

module.exports = csrfErrorHandler;