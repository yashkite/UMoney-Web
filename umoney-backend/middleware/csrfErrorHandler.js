/**
 * CSRF Error Handler
 * 
 * This middleware catches CSRF token validation errors and returns
 * a structured error response instead of the default error.
 */

const csrfErrorHandler = (err, req, res, next) => {
  // Check if the error is a CSRF token error
  if (err.code === 'EBADCSRFTOKEN') {
    // Log the error for monitoring
    console.error('CSRF attack detected:', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      headers: {
        'user-agent': req.get('user-agent'),
        'referer': req.get('referer'),
        'origin': req.get('origin')
      }
    });
    
    // Return a structured error response
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or missing CSRF token',
        code: 'INVALID_CSRF_TOKEN'
      }
    });
  }
  
  // If it's not a CSRF error, pass it to the next error handler
  return next(err);
};

module.exports = csrfErrorHandler;