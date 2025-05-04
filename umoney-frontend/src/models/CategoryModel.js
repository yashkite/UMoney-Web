import { apiUtils } from '../api/utils/api';
const { API_BASE_URL, getHeaders, handleResponse } = apiUtils;

export const CategoryModel = {
  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getCategories() {
    console.log('CategoryModel: Fetching categories from API...');

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      console.log('CategoryModel: Response status:', response.status);

      // If the API endpoint doesn't exist yet, return mock data
      if (response.status === 404) {
        console.log('CategoryModel: Categories API not found, returning mock data');
        return this._getMockCategories();
      }

      const data = await handleResponse(response);
      console.log('CategoryModel: Categories data from API:', data);
      return data;
    } catch (error) {
      console.error('CategoryModel: Error fetching categories:', error);

      // Return mock data in case of error
      console.log('CategoryModel: Returning mock data due to error');
      return [
        { _id: 'error-needs', name: 'Needs (Mock)', type: 'Needs', icon: 'pi pi-home' },
        { _id: 'error-wants', name: 'Wants (Mock)', type: 'Wants', icon: 'pi pi-shopping-bag' },
        { _id: 'error-savings', name: 'Savings (Mock)', type: 'Savings', icon: 'pi pi-wallet' },
        { _id: 'error-income', name: 'Income (Mock)', type: 'Income', icon: 'pi pi-money-bill' }
      ];
    }
  },

  /**
   * Get categories by type
   * @param {string} type - Category type (Income, Needs, Wants, Savings)
   * @returns {Promise<Array>} - Array of categories of the specified type
   */
  async getCategoriesByType(type) {
    console.log(`CategoryModel: Fetching categories of type ${type} from API...`);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/type/${type}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log(`CategoryModel: Categories by type API not found, filtering from all categories`);
        const allCategories = await this.getCategories();
        return allCategories.filter(category => category.type === type);
      }

      const data = await handleResponse(response);
      console.log(`CategoryModel: Categories of type ${type} from API:`, data);
      return data;
    } catch (error) {
      console.error(`CategoryModel: Error fetching categories of type ${type}:`, error);

      // Filter mock data by type
      const mockCategories = this._getMockCategories();
      return mockCategories.filter(category => category.type === type);
    }
  },

  /**
   * Get category statistics
   * @param {number} days - Number of days to include in statistics (default: 30)
   * @returns {Promise<Array>} - Array of category statistics
   */
  async getCategoryStats(days = 30) {
    console.log(`CategoryModel: Fetching category statistics for the last ${days} days...`);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/stats?days=${days}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('CategoryModel: Category stats API not found');
        return [];
      }

      const data = await handleResponse(response);
      console.log('CategoryModel: Category statistics from API:', data);
      return data;
    } catch (error) {
      console.error('CategoryModel: Error fetching category statistics:', error);
      return [];
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    console.log('CategoryModel: Creating new category:', categoryData);

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      const data = await handleResponse(response);
      console.log('CategoryModel: Created category:', data);
      return data;
    } catch (error) {
      console.error('CategoryModel: Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(id, categoryData) {
    console.log(`CategoryModel: Updating category ${id}:`, categoryData);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      const data = await handleResponse(response);
      console.log('CategoryModel: Updated category:', data);
      return data;
    } catch (error) {
      console.error(`CategoryModel: Error updating category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update category budget allocation
   * @param {string} id - Category ID
   * @param {Object} budgetData - Budget data (percentage and/or amount)
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategoryBudget(id, budgetData) {
    console.log(`CategoryModel: Updating category ${id} budget:`, budgetData);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/budget`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(budgetData)
      });

      const data = await handleResponse(response);
      console.log('CategoryModel: Updated category budget:', data);
      return data;
    } catch (error) {
      console.error(`CategoryModel: Error updating category ${id} budget:`, error);
      throw error;
    }
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} - Response data
   */
  async deleteCategory(id) {
    console.log(`CategoryModel: Deleting category ${id}`);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log('CategoryModel: Deleted category:', data);
      return data;
    } catch (error) {
      console.error(`CategoryModel: Error deleting category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reset categories to defaults
   * @returns {Promise<Object>} - Response data
   */
  async resetCategories() {
    console.log('CategoryModel: Resetting categories to defaults');

    try {
      const response = await fetch(`${API_BASE_URL}/categories/reset`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log('CategoryModel: Reset categories:', data);
      return data;
    } catch (error) {
      console.error('CategoryModel: Error resetting categories:', error);
      throw error;
    }
  },

  /**
   * Get mock categories for testing
   * @returns {Array} - Array of mock categories
   * @private
   */
  _getMockCategories() {
    return [
      { _id: 'needs-housing', name: 'Housing', type: 'Needs', subcategories: ['Rent', 'Mortgage', 'Property Tax', 'Repairs'], icon: 'pi pi-home' },
      { _id: 'needs-utilities', name: 'Utilities', type: 'Needs', subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone'], icon: 'pi pi-bolt' },
      { _id: 'needs-groceries', name: 'Groceries', type: 'Needs', subcategories: ['Food', 'Household Items'], icon: 'pi pi-shopping-cart' },
      { _id: 'needs-transportation', name: 'Transportation', type: 'Needs', subcategories: ['Car Payment', 'Gas', 'Public Transit', 'Maintenance'], icon: 'pi pi-car' },
      { _id: 'needs-insurance', name: 'Insurance', type: 'Needs', subcategories: ['Health', 'Auto', 'Home', 'Life'], icon: 'pi pi-shield' },
      { _id: 'needs-healthcare', name: 'Healthcare', type: 'Needs', subcategories: ['Doctor', 'Dentist', 'Medications', 'Therapy'], icon: 'pi pi-heart' },

      { _id: 'wants-dining', name: 'Dining Out', type: 'Wants', subcategories: ['Restaurants', 'Takeout', 'Delivery', 'Coffee Shops'], icon: 'pi pi-utensils' },
      { _id: 'wants-entertainment', name: 'Entertainment', type: 'Wants', subcategories: ['Movies', 'Concerts', 'Streaming Services', 'Books'], icon: 'pi pi-ticket' },
      { _id: 'wants-shopping', name: 'Shopping', type: 'Wants', subcategories: ['Clothing', 'Electronics', 'Home Decor', 'Gifts'], icon: 'pi pi-shopping-bag' },
      { _id: 'wants-travel', name: 'Travel', type: 'Wants', subcategories: ['Flights', 'Hotels', 'Rental Cars', 'Activities'], icon: 'pi pi-plane' },
      { _id: 'wants-hobbies', name: 'Hobbies', type: 'Wants', subcategories: ['Sports', 'Crafts', 'Gaming', 'Music'], icon: 'pi pi-star' },

      { _id: 'savings-emergency', name: 'Emergency Fund', type: 'Savings', subcategories: ['General Emergency'], icon: 'pi pi-exclamation-triangle' },
      { _id: 'savings-retirement', name: 'Retirement', type: 'Savings', subcategories: ['401k', 'IRA', 'Pension'], icon: 'pi pi-briefcase' },
      { _id: 'savings-investments', name: 'Investments', type: 'Savings', subcategories: ['Stocks', 'Bonds', 'Real Estate', 'Crypto'], icon: 'pi pi-chart-line' },
      { _id: 'savings-goals', name: 'Savings Goals', type: 'Savings', subcategories: ['Home', 'Car', 'Vacation', 'Education'], icon: 'pi pi-flag' },
      { _id: 'savings-debt', name: 'Debt Repayment', type: 'Savings', subcategories: ['Credit Card', 'Student Loans', 'Personal Loans'], icon: 'pi pi-credit-card' },

      { _id: 'income-salary', name: 'Salary', type: 'Income', subcategories: ['Regular Paycheck', 'Bonus', 'Commission'], icon: 'pi pi-money-bill' },
      { _id: 'income-freelance', name: 'Freelance', type: 'Income', subcategories: ['Client Payments', 'Contract Work'], icon: 'pi pi-users' },
      { _id: 'income-investments', name: 'Investment Income', type: 'Income', subcategories: ['Dividends', 'Interest', 'Capital Gains'], icon: 'pi pi-percentage' },
      { _id: 'income-other', name: 'Other Income', type: 'Income', subcategories: ['Gifts', 'Tax Refunds', 'Rental Income'], icon: 'pi pi-gift' }
    ];
  }
};