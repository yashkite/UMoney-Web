/**
 * CSRF Middleware
 * 
 * This middleware adds the CSRF token to the response headers and locals
 * for use in templates and API responses.
 */
module.exports = (req, res, next) => {
  // Skip CSRF for certain routes or methods if needed
  const skipCsrf = req.path === '/api/auth/google' || 
                  req.path === '/api/auth/google/callback' ||
                  req.method === 'GET';
  
  if (skipCsrf) {
    return next();
  }
  
  // Add CSRF token to response
  res.locals.csrfToken = req.csrfToken();
  
  // Also add it to a custom header for API clients
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false, // Client-side JavaScript needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  next();
};