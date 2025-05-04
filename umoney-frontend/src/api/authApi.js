// umoney-frontend/src/api/authApi.js

import { 
  API_BASE_URL, 
  getAuthToken, 
  setAuthToken, 
  getHeaders, 
  handleResponse,
  apiGet,
  apiPost
} from './utils/apiUtils';

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} - User object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('getCurrentUser: No auth token found in localStorage');
      return null;
    }

    console.log('getCurrentUser: Fetching current user with token');

    const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('getCurrentUser failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('getCurrentUser: User data retrieved successfully', data);
    return data.user || data;
  } catch (error) {
    console.error('getCurrentUser: Error fetching current user:', error);
    return null;
  }
};

/**
 * Login with Google OAuth token
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object|null>} - User object or null if login failed
 */
export const login = async (token) => {
  if (!token) {
    console.error('login: No token provided for login');
    return null;
  }

  // Store the token in localStorage
  setAuthToken(token);
  console.log('login: Token stored in localStorage');

  try {
    // Add a small delay to ensure token is properly stored
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get user data with the token
    const user = await getCurrentUser();

    if (!user) {
      console.error('login: Failed to get user after login');
      setAuthToken(null);
      return null;
    }

    console.log('login: User data retrieved successfully');
    return user;
  } catch (error) {
    console.error('login: Error during login:', error);
    setAuthToken(null);
    return null;
  }
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  console.log('logout: Starting logout process');
  try {
    // Call the logout API endpoint
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('logout: Logout API call failed:', response.status, response.statusText);
    } else {
      console.log('logout: Logout API call successful');
    }
  } catch (error) {
    // Log the error but continue with local logout
    console.error('logout: Error during logout API call:', error);
  } finally {
    // Always clear the token regardless of API response
    setAuthToken(null);
    // Clear any auth-related cookies that might be accessible from JavaScript
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('logout: Local logout completed');
  }
};

/**
 * Complete the user setup process
 * @param {Object} setupData - User setup data
 * @returns {Promise<Object>} - Response data
 */
export const completeSetup = async (setupData) => {
  console.log('completeSetup: Starting with setupData:', setupData);
  return apiPost('/auth/setup', setupData);
};

// Export all auth API functions
export default {
  getCurrentUser,
  login,
  logout,
  completeSetup
};
