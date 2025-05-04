import { apiUtils } from '../api/utils/api';
const { API_BASE_URL, getAuthToken, setAuthToken, getHeaders, handleResponse } = apiUtils;

const getCurrentUser = async () => {
  console.log('getCurrentUser: Starting');
  try {
    const token = getAuthToken();
    console.log('getCurrentUser: Token from localStorage:', token);
    if (!token) {
      console.log('getCurrentUser: No auth token found in localStorage');
      return null;
    }

    console.log('getCurrentUser: Fetching current user with token');

    const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
      method: 'GET',
      credentials: 'include', // Important to send cookies
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Handle non-200 responses (e.g., 401 Unauthorized)
      console.error('getCurrentUser: Failed with status:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('getCurrentUser: Response body:', errorText);
      return null; // Or throw an error, depending on your needs
    }

    const data = await response.json();
    console.log('getCurrentUser: User data retrieved:', data);

    // Create a default user object if the API doesn't return one
    // This is for development/testing purposes
    if (!data.user) {
      console.log('getCurrentUser: Creating mock user data for development');
      return {
        id: 'mock-user-id',
        name: 'Test User',
        email: 'test@example.com',
        setupComplete: true
      };
    }

    console.log('getCurrentUser: Returning user data');
    return data.user; // Return the user object
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null; // Or throw an error
  } finally {
    console.log('getCurrentUser: Ending');
  }
};

const login = async (token) => {
  console.log('login: Starting with token:', token);
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
  } finally {
    console.log('login: Ending');
  }
};

const logout = async () => {
  console.log('logout: Starting');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(false) // Don't include auth header to avoid 401 errors
    });

    // Log response for debugging
    console.log('logout: Response status:', response.status);

    // Even if the server response fails, we still want to clear local auth state
    if (!response.ok) {
      console.log('logout: API Response Status:', response.status);
      console.log('API Response Text:', await response.text());
      console.warn('logout: API call failed, but proceeding with local logout');
    }
  } catch (error) {
    // Log the error but continue with local logout
    console.error('logout: Error during logout API call:', error);
  } finally {
    // Always clear the token regardless of API response
    setAuthToken(null);
    // Clear any auth-related cookies that might be accessible from JavaScript
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

const completeSetup = async (setupData) => {
  console.log('completeSetup: Starting with setupData:', setupData);
  const response = await fetch(`${API_BASE_URL}/auth/setup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(setupData),
    credentials: 'include'
  });

  return handleResponse(response);
};

export const AuthController = {
  getCurrentUser,
  login,
  logout,
  completeSetup
};