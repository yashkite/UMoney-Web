// umoney-frontend/src/api/transactionApi.js

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  isDevelopment
} from './utils/apiUtils';

// Import the updateSavingsTransaction function from savingsApi
import { updateSavingsTransaction } from './savingsApi';

// Cache constants
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const TRANSACTIONS_CACHE_PREFIX = 'api:transactions';

/**
 * Get transactions with optional filters
 * @param {Object} params - Query parameters
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} - Transactions data
 */
export const getTransactions = async (params = {}, useCache = true) => {
  try {
    if (isDevelopment) {
      console.log('getTransactions: Fetching transactions with params:', params);
    }

    return await apiGet('/transactions', params, {
      useCache,
      cacheExpiration: CACHE_EXPIRATION
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('getTransactions: Error fetching transactions:', error);
    }
    return { transactions: [] };
  }
};

/**
 * Get transaction summary
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} - Transaction summary data
 */
export const getTransactionSummary = async (useCache = true) => {
  try {
    if (isDevelopment) {
      console.log('getTransactionSummary: Fetching transaction summary');
    }

    const data = await apiGet('/transactions/summary', {}, {
      useCache,
      cacheExpiration: CACHE_EXPIRATION
    });

    return data.data || data;
  } catch (error) {
    if (isDevelopment) {
      console.error('getTransactionSummary: Error fetching transaction summary:', error);
    }

    return {
      income: { in: 0, out: 0, hold: 0 },
      needs: { in: 0, out: 0, hold: 0 },
      wants: { in: 0, out: 0, hold: 0 },
      savings: { in: 0, out: 0, hold: 0 },
      currency: 'USD'
    };
  }
};

/**
 * Get transaction tags
 * @param {string} type - Transaction type (income, needs, wants, savings)
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} - Transaction tags data
 */
export const getTransactionTags = async (type, useCache = true) => {
  try {
    if (isDevelopment) {
      console.log(`getTransactionTags: Fetching transaction tags for type: ${type || 'all'}`);
    }

    const endpoint = type ? `/transactions/tags?type=${type}` : '/transactions/tags';

    return await apiGet(endpoint, {}, {
      useCache,
      cacheExpiration: CACHE_EXPIRATION
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('getTransactionTags: Error fetching transaction tags:', error);
    }

    return { success: false, data: [] };
  }
};

/**
 * Add a transaction tag
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} - Response data
 */
export const addTransactionTag = async (tagData) => {
  try {
    if (isDevelopment) {
      console.log('addTransactionTag: Adding transaction tag:', tagData);
    }

    // Clear the tags cache when adding a new tag
    return await apiPost('/transactions/tags', tagData, [], {
      cachePrefixToClear: `${TRANSACTIONS_CACHE_PREFIX}:tags`
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('addTransactionTag: Error adding transaction tag:', error);
    }
    throw error;
  }
};

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - Transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const updateTransaction = async (id, transactionData, attachments = []) => {
  try {
    if (isDevelopment) {
      console.log('updateTransaction: Updating transaction with data:', transactionData);
    }

    // Handle special case for income transactions
    if (transactionData.transactionType === 'Income') {
      return await updateIncomeTransaction(id, transactionData, attachments);
    }

    // Handle special case for savings transactions
    if (transactionData.transactionType === 'Savings') {
      return await updateSavingsTransaction(id, transactionData, attachments);
    }

    // Clear all transaction-related caches when updating a transaction
    return await apiPut(`/transactions/${id}`, transactionData, attachments, {
      cachePrefixToClear: TRANSACTIONS_CACHE_PREFIX
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('updateTransaction: Error updating transaction:', error);
    }
    throw error;
  }
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @param {string} transactionType - Transaction type
 * @returns {Promise<Object>} - Response data
 */
export const deleteTransaction = async (id, transactionType) => {
  try {
    if (isDevelopment) {
      console.log(`deleteTransaction: Deleting transaction with ID: ${id}, type: ${transactionType}`);
    }

    // Clear all transaction-related caches when deleting a transaction
    return await apiDelete(`/transactions/${id}`, {
      cachePrefixToClear: TRANSACTIONS_CACHE_PREFIX
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('deleteTransaction: Error deleting transaction:', error);
    }
    throw error;
  }
};

/**
 * Add an income transaction
 * @param {Object} incomeData - Income transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const addIncome = async (incomeData, attachments = []) => {
  try {
    if (isDevelopment) {
      console.log('addIncome: Adding income with data:', incomeData);
    }

    // Validate required fields
    if (!incomeData.description || !incomeData.amount || !incomeData.date || !incomeData.distribution) {
      const errorMsg = 'Please provide all required fields: description, amount, date, and distribution';
      if (isDevelopment) {
        console.error('addIncome: Missing required fields');
      }
      throw new Error(errorMsg);
    }

    // Add a proper recipient object to satisfy backend validation
    const incomeDataWithRecipient = {
      ...incomeData,
      recipient: {
        name: incomeData.description || "Income Source",
        type: "merchant",
        details: ""
      },
      transactionType: 'Income' // Explicitly set to 'Income'
    };

    // Clear all transaction-related caches when adding income
    return await apiPost('/transactions/income', incomeDataWithRecipient, attachments, {
      cachePrefixToClear: TRANSACTIONS_CACHE_PREFIX
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('addIncome: Error adding income:', error);
    }
    throw error;
  }
};

/**
 * Update an income transaction
 * @param {string} id - Transaction ID
 * @param {Object} incomeData - Income transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const updateIncomeTransaction = async (id, incomeData, attachments = []) => {
  try {
    if (isDevelopment) {
      console.log('updateIncomeTransaction: Updating income with data:', incomeData);
    }

    // Clear all transaction-related caches when updating income
    return await apiPut(`/transactions/income/${id}`, incomeData, attachments, {
      cachePrefixToClear: TRANSACTIONS_CACHE_PREFIX
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('updateIncomeTransaction: Error updating income transaction:', error);
    }
    throw error;
  }
};

/**
 * Add an expense transaction
 * @param {Object} expenseData - Expense transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const addExpense = async (expenseData, attachments = []) => {
  try {
    if (isDevelopment) {
      console.log('addExpense: Adding expense with data:', expenseData);
    }

    // Clear all transaction-related caches when adding expense
    return await apiPost('/transactions/expense', expenseData, attachments, {
      cachePrefixToClear: TRANSACTIONS_CACHE_PREFIX
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('addExpense: Error adding expense:', error);
    }
    throw error;
  }
};

// Create a named object for default export
const transactionApiExports = {
  getTransactions,
  getTransactionSummary,
  getTransactionTags,
  addTransactionTag,
  updateTransaction,
  deleteTransaction,
  addIncome,
  updateIncomeTransaction,
  addExpense
};

// Export all transaction API functions
export default transactionApiExports;
