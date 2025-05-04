// umoney-frontend/src/api/models/FinancialPlanningModel.js
import { API_BASE_URL, getHeaders, handleResponse } from '../utils/api';

export const FinancialPlanningModel = {
  /**
   * Get net worth for the current user
   * @returns {Promise<Object>} - Net worth object
   */
  async getNetWorth() {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-planning/net-worth`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Net worth API not found, returning mock data');
        return {
          totalAssets: 410000,
          totalLiabilities: 310000,
          netWorth: 100000,
          currency: 'INR'
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching net worth:', error);
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
        currency: 'INR'
      };
    }
  }
};
