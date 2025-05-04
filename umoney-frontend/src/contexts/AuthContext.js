import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthController } from '../controllers/AuthController';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider: Initializing...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log('AuthProvider: State initialized', { user, loading, isAuthenticated });

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      console.log('checkAuth: Starting authentication check');
      const token = localStorage.getItem('authToken');

      if (token) {
        console.log('checkAuth: Token found, fetching user data from API');
        // Try to get user data from API
        const userData = await AuthController.getCurrentUser();
        console.log('checkAuth: Received user data from API:', userData);

        if (userData) {
          // Use the API data directly - don't merge with localStorage
          // This ensures we always use the latest data from the server
          console.log('checkAuth: Setting user state with API data');
          setUser(userData);
          setIsAuthenticated(true);

          // Update localStorage with the latest data from the API
          localStorage.setItem('userData', JSON.stringify({
            name: userData.name || '',
            phone: userData.phone || ''
          }));

          console.log('checkAuth: User authenticated successfully');
        } else {
          console.log('checkAuth: No user data received from API');
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('userData');
        }
      } else {
        console.log('checkAuth: No token found');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('checkAuth: Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
      console.log('checkAuth: Authentication check completed');
    }
  };

  // Login function
  const login = async (token) => {
    try {
      console.log('login: Starting login with token');
      const userData = await AuthController.login(token);
      console.log('login: Received user data from API:', userData);

      if (userData) {
        // Use the API data directly - don't merge with localStorage
        // This ensures we always use the latest data from the server
        const userToStore = {
          ...userData
        };

        console.log('login: Setting user state with:', userToStore);
        setUser(userToStore);
        setIsAuthenticated(true);

        // Store the user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify({
          name: userData.name || '',
          phone: userData.phone || ''
        }));

        console.log('login: User data stored in localStorage');
        console.log('login: User logged in successfully');

        return userToStore;
      }
      console.log('login: No user data received from API');
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      console.log('login: Login process completed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the API logout function
            await AuthController.logout();
            console.log('logout: API logout successful');
   } catch (error) {
     console.error('logout: Logout API error:', error);
     // Continue with local logout even if API call fails
   } finally {
     // Clear all auth state regardless of API response
     setUser(null);
     setIsAuthenticated(false);
     localStorage.removeItem('authToken');
     localStorage.removeItem('userData');
     console.log('logout: User logged out');

      // Clear any session storage items that might contain sensitive data
      sessionStorage.clear();

      console.log('Local auth state cleared');
    }
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
    console.log('updateUser: User updated', { user: userData });
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Value to be provided by the context
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
console.log('AuthProvider: Component initialized');

export default AuthContext;
