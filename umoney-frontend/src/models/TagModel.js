import { apiUtils } from '../api/utils/api';
const { API_BASE_URL, getHeaders, handleResponse } = apiUtils;

export const TagModel = {
  async getTransactionTags(type) {
    try {
      console.log('TagModel: Fetching transaction tags for type:', type);
      const url = type ? `${API_BASE_URL}/transactions/tags?type=${type}` : `${API_BASE_URL}/transactions/tags`;
      console.log('TagModel: URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      console.log('TagModel: Response status:', response.status);

      if (response.status === 404) {
        console.log('Transaction tags API not found, returning mock data');

        // Return mock tags based on transaction type
        const mockTags = {
          needs: ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Healthcare', 'Insurance'],
          wants: ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Subscriptions', 'Hobbies'],
          savings: ['Emergency Fund', 'Retirement', 'Investments', 'Education', 'Home Purchase', 'Debt Repayment'],
          income: ['Salary', 'Freelance', 'Bonus', 'Interest', 'Dividends', 'Gifts']
        };

        return { success: true, data: type ? mockTags[type] || [] : mockTags };
      }

      const result = await handleResponse(response);
      console.log('TagModel: Tags data from API:', result);
      return result;
    } catch (error) {
      console.error('Error fetching transaction tags:', error);

      // Return mock data in case of error
      console.log('TagModel: Returning mock data due to error');
      const mockTags = {
        needs: ['Error-Rent', 'Error-Groceries', 'Error-Utilities'],
        wants: ['Error-Dining', 'Error-Entertainment', 'Error-Shopping'],
        savings: ['Error-Emergency', 'Error-Retirement', 'Error-Investments'],
        income: ['Error-Salary', 'Error-Freelance', 'Error-Bonus']
      };

      return {
        success: false,
        data: type ? mockTags[type] || [] : mockTags,
        error: error.message
      };
    }
  },

  async addTransactionTag(tagData) {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/tags`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tagData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Add transaction tag API not found, returning mock success response');
        return { success: true, message: 'Tag added successfully (mock)' };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error adding transaction tag:', error);
      throw error;
    }
  }
};