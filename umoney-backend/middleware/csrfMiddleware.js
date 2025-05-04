/**
 * CSRF Middleware
 * 
 * This middleware adds the CSRF token to the response headers and cookies
 * for the frontend to use in subsequent requests.
 */

const csrfMiddleware = (req, res, next) => {
  // Skip for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Only set the token if the CSRF protection is active and the token exists
  if (req.csrfToken) {
    const token = req.csrfToken();
    
    // Set CSRF token in a cookie that the frontend can read
    // httpOnly: false allows JavaScript to read the cookie
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Also set the token in the response header for API clients
    res.setHeader('X-CSRF-Token', token);
  }
  
  next();
};

module.exports = csrfMiddleware;