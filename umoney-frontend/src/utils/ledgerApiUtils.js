import { getHeaders, getAuthToken, handleResponse } from './apiUtils';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Utility functions for interacting with the ledger API
 */
export const ledgerApiUtils = {
  /**
   * Get all ledgers for the current user
   * @returns {Promise<Array>} - Array of ledger objects
   */
  async getLedgers() {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      throw error;
    }
  },

  /**
   * Get a specific ledger for the current user
   * @param {string} ledgerType - Type of ledger (Income, Needs, Wants, Savings)
   * @returns {Promise<Object>} - Ledger object
   */
  async getLedger(ledgerType) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${ledgerType} ledger:`, error);
      throw error;
    }
  },

  /**
   * Get transactions for a specific ledger
   * @param {string} ledgerType - Type of ledger (Income, Needs, Wants, Savings)
   * @param {Object} filters - Query filters (startDate, endDate, category, search, limit)
   * @returns {Promise<Array>} - Array of transaction objects
   */
  async getLedgerTransactions(ledgerType, filters = {}) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user

      // Build query string from filters
      const queryString = Object.keys(filters)
        .filter(key => filters[key] !== undefined && filters[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');

      const url = `${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}/transactions${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${ledgerType} transactions:`, error);
      throw error;
    }
  },

  /**
   * Add an income transaction and distribute it
   * @param {Object} incomeData - Income transaction data
   * @param {Array} attachments - Array of file attachments
   * @returns {Promise<Object>} - Object containing all created transactions
   */
  async addIncome(incomeData, attachments = []) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user

      // Use FormData if there are attachments
      if (attachments && attachments.length > 0) {
        const formData = new FormData();

        // Add transaction data
        Object.keys(incomeData).forEach(key => {
          if (incomeData[key] !== undefined && incomeData[key] !== null) {
            if (typeof incomeData[key] === 'object' && !(incomeData[key] instanceof File)) {
              formData.append(key, JSON.stringify(incomeData[key]));
            } else {
              formData.append(key, incomeData[key]);
            }
          }
        });

        // Add attachments
        attachments.forEach(file => {
          formData.append('attachments', file);
        });

        const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/income/transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData,
          credentials: 'include'
        });

        return handleResponse(response);
      } else {
        // Regular JSON request if no attachments
        const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/income/transactions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(incomeData),
          credentials: 'include'
        });

        return handleResponse(response);
      }
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },

  /**
   * Add an expense transaction to a specific ledger
   * @param {string} ledgerType - Type of ledger (Needs, Wants, Savings)
   * @param {Object} expenseData - Expense transaction data
   * @param {Array} attachments - Array of file attachments
   * @returns {Promise<Object>} - Created transaction object
   */
  async addExpense(ledgerType, expenseData, attachments = []) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user

      // Use FormData if there are attachments
      if (attachments && attachments.length > 0) {
        const formData = new FormData();

        // Add transaction data
        Object.keys(expenseData).forEach(key => {
          if (expenseData[key] !== undefined && expenseData[key] !== null) {
            if (typeof expenseData[key] === 'object' && !(expenseData[key] instanceof File)) {
              formData.append(key, JSON.stringify(expenseData[key]));
            } else {
              formData.append(key, expenseData[key]);
            }
          }
        });

        // Add attachments
        attachments.forEach(file => {
          formData.append('attachments', file);
        });

        const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}/transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData,
          credentials: 'include'
        });

        return handleResponse(response);
      } else {
        // Regular JSON request if no attachments
        const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}/transactions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(expenseData),
          credentials: 'include'
        });

        return handleResponse(response);
      }
    } catch (error) {
      console.error(`Error adding expense to ${ledgerType}:`, error);
      throw error;
    }
  },

  /**
   * Update a transaction in a specific ledger
   * @param {string} ledgerType - Type of ledger (Income, Needs, Wants, Savings)
   * @param {string} transactionId - ID of the transaction to update
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise<Object>} - Updated transaction object
   */
  async updateTransaction(ledgerType, transactionId, transactionData) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(transactionData),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating transaction in ${ledgerType}:`, error);
      throw error;
    }
  },

  /**
   * Delete a transaction from a specific ledger
   * @param {string} ledgerType - Type of ledger (Income, Needs, Wants, Savings)
   * @param {string} transactionId - ID of the transaction to delete
   * @returns {Promise<Object>} - Success message
   */
  async deleteTransaction(ledgerType, transactionId) {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/${ledgerType}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting transaction from ${ledgerType}:`, error);
      throw error;
    }
  },

  /**
   * Get summary of all ledgers for the current user
   * @returns {Promise<Object>} - Summary object with balances for each ledger
   */
  async getLedgerSummary() {
    try {
      const userId = 'current'; // Use 'current' to refer to the current user
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ledgers/summary`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching ledger summary:', error);
      throw error;
    }
  }
};
