// umoney-frontend/src/api/models/FinancialGoalModel.js
import { API_BASE_URL, getHeaders, handleResponse } from '../utils/api';

export const FinancialGoalModel = {
  /**
   * Get all financial goals for the current user
   * @returns {Promise<Array>} - Array of financial goal objects
   */
  async getFinancialGoals() {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-goals`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Financial Goals API not found, returning mock data');
        return [
          { _id: '1', name: 'Retirement Fund', targetAmount: 500000, targetDate: '2040-12-31T00:00:00.000Z', currentProgress: 50000 },
          { _id: '2', name: 'House Down Payment', targetAmount: 100000, targetDate: '2028-06-30T00:00:00.000Z', currentProgress: 25000 },
        ];
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching financial goals:', error);
      return [];
    }
  },

  /**
   * Create a new financial goal
   * @param {Object} goalData - Financial goal data
   * @returns {Promise<Object>} - Created financial goal
   */
  async createFinancialGoal(goalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Financial Goals API not found, returning mock success response');
        return {
          success: true,
          message: 'Financial goal created successfully (mock)',
          data: {
            _id: `mock-goal-${Date.now()}`,
            ...goalData
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating financial goal:', error);
      throw error;
    }
  },

  /**
   * Update a financial goal
   * @param {string} id - Financial goal ID
   * @param {Object} goalData - Updated financial goal data
   * @returns {Promise<Object>} - Updated financial goal
   */
  async updateFinancialGoal(id, goalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Financial Goals API not found, returning mock success response');
        return {
          success: true,
          message: 'Financial goal updated successfully (mock)',
          data: {
            _id: id,
            ...goalData
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error updating financial goal:', error);
      throw error;
    }
  },

  /**
   * Delete a financial goal
   * @param {string} id - Financial goal ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteFinancialGoal(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Financial Goals API not found, returning mock success response');
        return {
          success: true,
          message: 'Financial goal deleted successfully (mock)'
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting financial goal:', error);
      throw error;
    }
  },

  /**
   * Add a contribution to a financial goal
   * @param {string} id - Financial goal ID
   * @param {Object} contributionData - Contribution data
   * @returns {Promise<Object>} - Updated financial goal
   */
  async addContribution(id, contributionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-goals/${id}/contribute`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contributionData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Financial Goals API not found, returning mock success response');
        return {
          success: true,
          message: 'Contribution added successfully (mock)',
          data: {
            _id: id,
            currentProgress: contributionData.amount
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error adding contribution to financial goal:', error);
      throw error;
    }
  }
};
