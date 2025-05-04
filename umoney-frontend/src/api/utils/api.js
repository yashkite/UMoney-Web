// umoney-frontend/src/api/utils/api.js
// DEPRECATED: This file is maintained for backward compatibility.
// Please use the new API modules from src/api/index.js instead.

import {
  API_BASE_URL,
  handleResponse,
  getAuthToken,
  setAuthToken,
  getHeaders
} from './apiUtils';

// Import all API functions from the index file
import * as api from '../index';

// Re-export the utility functions for backward compatibility
export { API_BASE_URL, handleResponse, getAuthToken, setAuthToken, getHeaders };

// Group API utility functions into a single object for backward compatibility
export const apiUtils = {
  // Core API utilities
  API_BASE_URL,
  handleResponse,
  getAuthToken,
  setAuthToken,
  getHeaders,

  // Transaction API functions
  getTransactions: async (params) => {
    console.log('apiUtils.getTransactions: Using modular API');
    return api.transactionApi.getTransactions(params);
  },

  getTransactionSummary: async () => {
    console.log('apiUtils.getTransactionSummary: Using modular API');
    return api.transactionApi.getTransactionSummary();
  },

  getTransactionTags: async (type) => {
    console.log('apiUtils.getTransactionTags: Using modular API');
    return api.transactionApi.getTransactionTags(type);
  },

  addTransactionTag: async (tagData) => {
    console.log('apiUtils.addTransactionTag: Using modular API');
    return api.transactionApi.addTransactionTag(tagData);
  },

  updateTransaction: async (id, transactionData, attachments = []) => {
    console.log('apiUtils.updateTransaction: Using modular API');
    return api.transactionApi.updateTransaction(id, transactionData, attachments);
  },

  deleteTransaction: async (id, transactionType) => {
    console.log('apiUtils.deleteTransaction: Using modular API');
    return api.transactionApi.deleteTransaction(id, transactionType);
  },

  // Income API functions
  addIncome: async (incomeData, attachments = []) => {
    console.log('apiUtils.addIncome: Using modular API');
    return api.transactionApi.addIncome(incomeData, attachments);
  },

  updateIncomeTransaction: async (id, incomeData, attachments = []) => {
    console.log('apiUtils.updateIncomeTransaction: Using modular API');
    return api.transactionApi.updateIncomeTransaction(id, incomeData, attachments);
  },

  // Expense API functions
  addExpense: async (expenseData, attachments = []) => {
    console.log('apiUtils.addExpense: Using modular API');
    return api.transactionApi.addExpense(expenseData, attachments);
  },

  // Savings API functions
  addSavings: async (savingsData, attachments = []) => {
    console.log('apiUtils.addSavings: Using modular API');
    return api.savingsApi.addSavings(savingsData, attachments);
  },

  updateSavings: async (id, savingsData, attachments = []) => {
    console.log('apiUtils.updateSavings: Using modular API');
    return api.savingsApi.updateSavingsTransaction(id, savingsData, attachments);
  },

  // Category API functions
  getCategories: async () => {
    console.log('apiUtils.getCategories: Using modular API');
    return api.categoryApi.getCategories();
  },

  // Recipient API functions
  getRecipients: async () => {
    console.log('apiUtils.getRecipients: Using modular API');
    return api.recipientApi.getRecipients();
  }
};

// Create a named default export
const apiDefault = apiUtils;
export default apiDefault;