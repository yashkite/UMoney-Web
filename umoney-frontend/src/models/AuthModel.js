const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('No auth token found in localStorage');
      return null;
    }

    console.log('Fetching current user with token');

    const response = await fetch(`${API_BASE_URL}/api/auth/current_user`, {
      method: 'GET',
      credentials: 'include', // Important to send cookies
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Handle non-200 responses (e.g., 401 Unauthorized)
      console.error('getCurrentUser failed:', response.status, response.statusText);
      return null; // Or throw an error, depending on your needs
    }

    const data = await response.json();
    console.log('Current user data retrieved:', data);

    // Create a default user object if the API doesn't return one
    // This is for development/testing purposes
    if (!data.user) {
      console.log('Creating mock user data for development');
      return {
        id: 'mock-user-id',
        name: 'Test User',
        email: 'test@example.com',
        setupComplete: true
      };
    }

    return data.user; // Return the user object
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null; // Or throw an error
  }
};

// API utility functions
export const AuthModel = {
  async login(token) {
    if (!token) {
      console.error('No token provided for login');
      return null;
    }

    // Store the token in localStorage
    setAuthToken(token);
    console.log('Token stored in localStorage');

    try {
      // Add a small delay to ensure token is properly stored
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get user data with the token
      const user = await getCurrentUser();

      if (!user) {
        console.error('Failed to get user after login');
        setAuthToken(null);
        return null;
      }

      console.log('User data retrieved successfully');
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      setAuthToken(null);
      return null;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(false) // Don't include auth header to avoid 401 errors
      });

      // Log response for debugging
      console.log('Logout response status:', response.status);

      // Even if the server response fails, we still want to clear local auth state
      if (!response.ok) {
        console.log('API Response Status:', response.status);
        console.log('API Response Text:', await response.text());
        console.warn('Logout API call failed, but proceeding with local logout');
      }
    } catch (error) {
      // Log the error but continue with local logout
      console.error('Error during logout API call:', error);
    } finally {
      // Always clear the token regardless of API response
      setAuthToken(null);
      // Clear any auth-related cookies that might be accessible from JavaScript
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  async completeSetup(setupData) {
    const response = await fetch(`${API_BASE_URL}/api/auth/setup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(setupData),
      credentials: 'include'
    });

    return handleResponse(response);
  },
  getCurrentUser
};