/**
 * CSRF Token Utilities
 * 
 * Functions for handling CSRF tokens in the frontend application.
 */

/**
 * Get the CSRF token from cookies
 * @returns {string|null} The CSRF token or null if not found
 */
export const getCsrfToken = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('XSRF-TOKEN=')) {
      return cookie.substring('XSRF-TOKEN='.length, cookie.length);
    }
  }
  return null;
};

/**
 * Add CSRF token to request headers
 * @param {Object} headers - The headers object to add the token to
 * @returns {Object} The updated headers object
 */
export const addCsrfToken = (headers = {}) => {
  const token = getCsrfToken();
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token
    };
  }
  return headers;
};

/**
 * Fetch a new CSRF token from the server
 * @returns {Promise<string>} A promise that resolves to the new CSRF token
 */
export const fetchCsrfToken = async () => {
  try {
    // Make a GET request to an endpoint that returns a CSRF token
    const response = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    // The token will be set in cookies by the server
    // We can also get it from the response if needed
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

/**
 * Initialize CSRF protection by fetching a token
 * Call this when the app starts
 */
export const initCsrfProtection = async () => {
  try {
    await fetchCsrfToken();
    console.log('CSRF protection initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
};