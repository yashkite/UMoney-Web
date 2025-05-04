import { apiUtils } from '../api/utils/api';
const { API_BASE_URL, getHeaders, handleResponse } = apiUtils;

export const BudgetModel = {
  /**
   * Update user's budget preferences
   * @param {number} needs - Percentage for needs category (0-100)
   * @param {number} wants - Percentage for wants category (0-100)
   * @param {number} savings - Percentage for savings category (0-100)
   * @returns {Promise<Object>} - Response with updated budget preferences
   */
  async updateBudgetPreferences(needs, wants, savings) {
    console.log('BudgetModel: Updating budget preferences...');
    console.log('BudgetModel: Needs:', needs, 'Wants:', wants, 'Savings:', savings);

    try {
      // Validate that percentages sum to 100%
      const total = needs + wants + savings;
      if (Math.abs(total - 100) >= 0.01) {
        throw new Error('Budget percentages must sum to 100%');
      }

      const response = await fetch(`${API_BASE_URL}/auth/budget-preferences`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          budgetPreferences: {
            needs: { percentage: needs },
            wants: { percentage: wants },
            savings: { percentage: savings }
          }
        }),
        credentials: 'include'
      });

      console.log('BudgetModel: Response status:', response.status);

      // If the API endpoint doesn't exist yet, return mock data
      if (response.status === 404) {
        console.log('BudgetModel: API endpoint not found, returning mock success response');
        return {
          success: true,
          message: 'Budget preferences updated successfully (mock)',
          budgetPreferences: {
            needs: { percentage: needs },
            wants: { percentage: wants },
            savings: { percentage: savings }
          }
        };
      }

      const result = await handleResponse(response);
      console.log('BudgetModel: API response:', result);
      return result;
    } catch (error) {
      console.error('BudgetModel: Error updating budget preferences:', error);
      throw error;
    }
  },

  /**
   * Get user's current budget preferences
   * @returns {Promise<Object>} - User's budget preferences
   */
  async getBudgetPreferences() {
    console.log('BudgetModel: Getting budget preferences...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/budget-preferences`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      console.log('BudgetModel: Response status:', response.status);

      // If the API endpoint doesn't exist yet, return mock data
      if (response.status === 404) {
        console.log('BudgetModel: API endpoint not found, returning mock data');
        return {
          success: true,
          budgetPreferences: {
            needs: { percentage: 50 },
            wants: { percentage: 30 },
            savings: { percentage: 20 }
          }
        };
      }

      const result = await handleResponse(response);
      console.log('BudgetModel: API response:', result);
      return result;
    } catch (error) {
      console.error('BudgetModel: Error getting budget preferences:', error);
      throw error;
    }
  }
};