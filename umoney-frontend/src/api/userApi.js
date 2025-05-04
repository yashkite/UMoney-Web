// umoney-frontend/src/api/userApi.js

import {
  apiGet,
  apiPut
} from './utils/apiUtils';

/**
 * Get user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    return await apiGet('/auth/profile');
  } catch (error) {
    console.error('getUserProfile: Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} - Updated profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    return await apiPut('/auth/profile', profileData);
  } catch (error) {
    console.error('updateUserProfile: Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update budget preferences
 * @param {Object} budgetData - Budget preference data
 * @returns {Promise<Object>} - Updated budget preferences
 */
export const updateBudgetPreferences = async (budgetData) => {
  try {
    return await apiPut('/budgets/preferences', budgetData);
  } catch (error) {
    console.error('updateBudgetPreferences: Error updating budget preferences:', error);
    throw error;
  }
};

/**
 * Get budget preferences
 * @returns {Promise<Object>} - Budget preference data
 */
export const getBudgetPreferences = async () => {
  try {
    return await apiGet('/budgets/preferences');
  } catch (error) {
    console.error('getBudgetPreferences: Error fetching budget preferences:', error);
    return {
      needs: { percentage: 50 },
      wants: { percentage: 30 },
      savings: { percentage: 20 }
    };
  }
};

// Create a named object for default export
const userApiExports = {
  getUserProfile,
  updateUserProfile,
  updateBudgetPreferences,
  getBudgetPreferences
};

// Export all user API functions
export default userApiExports;
