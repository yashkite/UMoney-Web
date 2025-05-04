/**
 * CSRF Middleware
 * 
 * This middleware adds the CSRF token to the response headers
 * and sets it as a cookie for the frontend to use.
 */

const csrfMiddleware = (req, res, next) => {
  // Skip for non-HTML GET requests
  if (req.method === 'GET' && !req.path.includes('/api/auth/csrf-token')) {
    return next();
  }
  
  // Get the CSRF token from the request
  const csrfToken = req.csrfToken();
  
  // Set the token in the response headers
  res.set('XSRF-TOKEN', csrfToken);
  
  // Set the token as a cookie
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Allow JavaScript to read this cookie
    secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
    sameSite: 'strict', // Prevents the cookie from being sent in cross-site requests
    path: '/' // Available across the entire site
  });
  
  next();
};

module.exports = csrfMiddleware;