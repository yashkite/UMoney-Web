// umoney-frontend/src/api/models/LiabilityModel.js
import { API_BASE_URL, getHeaders, handleResponse } from '../utils/api';

export const LiabilityModel = {
  /**
   * Get all liabilities for the current user
   * @returns {Promise<Array>} - Array of liability objects
   */
  async getLiabilities() {
    try {
      const response = await fetch(`${API_BASE_URL}/liabilities`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Liabilities API not found, returning mock data');
        return [
          { _id: 'l1', name: 'Student Loan', type: 'Loan', balance: 25000, interestRate: 4.5, dateAdded: '2021-08-01T00:00:00.000Z' },
          { _id: 'l2', name: 'Credit Card Debt', type: 'Credit Card', balance: 5000, interestRate: 18.9, dateAdded: '2024-02-15T00:00:00.000Z' },
          { _id: 'l3', name: 'Mortgage', type: 'Mortgage', balance: 280000, interestRate: 3.2, dateAdded: '2022-03-15T00:00:00.000Z' },
        ];
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      return [];
    }
  },

  /**
   * Create a new liability
   * @param {Object} liabilityData - Liability data
   * @returns {Promise<Object>} - Created liability
   */
  async createLiability(liabilityData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liabilities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(liabilityData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Liabilities API not found, returning mock success response');
        return {
          success: true,
          message: 'Liability created successfully (mock)',
          data: {
            _id: `mock-liability-${Date.now()}`,
            ...liabilityData,
            dateAdded: new Date().toISOString()
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating liability:', error);
      throw error;
    }
  },

  /**
   * Update a liability
   * @param {string} id - Liability ID
   * @param {Object} liabilityData - Updated liability data
   * @returns {Promise<Object>} - Updated liability
   */
  async updateLiability(id, liabilityData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liabilities/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(liabilityData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Liabilities API not found, returning mock success response');
        return {
          success: true,
          message: 'Liability updated successfully (mock)',
          data: {
            _id: id,
            ...liabilityData
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error updating liability:', error);
      throw error;
    }
  },

  /**
   * Delete a liability
   * @param {string} id - Liability ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteLiability(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/liabilities/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Liabilities API not found, returning mock success response');
        return {
          success: true,
          message: 'Liability deleted successfully (mock)'
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting liability:', error);
      throw error;
    }
  }
};
