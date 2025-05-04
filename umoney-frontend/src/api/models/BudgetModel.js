// umoney-frontend/src/api/models/BudgetModel.js
import { API_BASE_URL, getHeaders, handleResponse } from '../utils/api';

export const BudgetModel = {
  /**
   * Get budget preferences for the current user
   * @returns {Promise<Object>} - Budget preferences object
   */
  async getBudgetPreferences() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/budget-preferences`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budget preferences API not found, returning mock data');
        return {
          needs: 50,
          wants: 30,
          savings: 20
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching budget preferences:', error);
      return {
        needs: 50,
        wants: 30,
        savings: 20
      };
    }
  },

  /**
   * Update budget preferences for the current user
   * @param {Object} preferences - Budget preferences object
   * @returns {Promise<Object>} - Updated budget preferences
   */
  async updateBudgetPreferences(preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/preferences`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(preferences),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budget preferences API not found, returning mock success response');
        return {
          success: true,
          message: 'Budget preferences updated successfully (mock)',
          data: preferences
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error updating budget preferences:', error);
      throw error;
    }
  },

  /**
   * Get budgets for a specific month
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Array>} - Array of budget objects
   */
  async getBudgets(month) {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${month}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budgets API not found, returning mock data');
        // Return mock data for current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (month === currentMonth) {
          return [
            { _id: 'b1', categoryId: { _id: 'c1', name: 'Groceries' }, month, budgetedAmount: 500 },
            { _id: 'b2', categoryId: { _id: 'c2', name: 'Utilities' }, month, budgetedAmount: 150 },
            { _id: 'b3', categoryId: { _id: 'c3', name: 'Entertainment' }, month, budgetedAmount: 100 },
          ];
        }
        return [];
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  /**
   * Get budget overview (summary)
   * @returns {Promise<Object>} - Budget overview object
   */
  async getBudgetOverview() {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/overview`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budget overview API not found, returning mock data');
        return {
          totalBudgeted: 750,
          totalSpent: 520,
          remaining: 230,
          categories: [
            { name: 'Groceries', budgeted: 500, spent: 350, remaining: 150 },
            { name: 'Utilities', budgeted: 150, spent: 120, remaining: 30 },
            { name: 'Entertainment', budgeted: 100, spent: 50, remaining: 50 }
          ]
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching budget overview:', error);
      return {
        totalBudgeted: 0,
        totalSpent: 0,
        remaining: 0,
        categories: []
      };
    }
  },

  /**
   * Create or update a budget entry
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} - Created or updated budget
   */
  async createBudget(budgetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budgets API not found, returning mock success response');
        return {
          success: true,
          message: 'Budget created successfully (mock)',
          data: {
            _id: `mock-budget-${Date.now()}`,
            ...budgetData
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  /**
   * Delete a budget entry
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteBudget(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Budgets API not found, returning mock success response');
        return {
          success: true,
          message: 'Budget deleted successfully (mock)'
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }
};
