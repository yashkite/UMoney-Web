// umoney-frontend/src/api/index.js

// Import all API modules
import * as apiUtils from './utils/apiUtils';
import * as authApi from './authApi';
import * as transactionApi from './transactionApi';
import * as savingsApi from './savingsApi';
import * as categoryApi from './categoryApi';
import * as recipientApi from './recipientApi';
import * as userApi from './userApi';
import * as exportImportApi from './exportImportApi';

// Re-export everything
export {
  apiUtils,
  authApi,
  transactionApi,
  savingsApi,
  categoryApi,
  recipientApi,
  userApi,
  exportImportApi
};

// Export individual functions for convenience
// Auth API
export const { getCurrentUser, login, logout, completeSetup } = authApi;

// Transaction API
export const {
  getTransactions,
  getTransactionSummary,
  getTransactionTags,
  addTransactionTag,
  updateTransaction,
  deleteTransaction,
  addIncome,
  updateIncomeTransaction,
  addExpense
} = transactionApi;

// Savings API
export const { addSavings, updateSavingsTransaction } = savingsApi;

// Category API
export const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  ensureDefaultCategories
} = categoryApi;

// Recipient API
export const {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient
} = recipientApi;

// User API
export const {
  getUserProfile,
  updateUserProfile,
  updateBudgetPreferences,
  getBudgetPreferences
} = userApi;

// Export/Import API
export const {
  exportTransactionsCSV,
  exportTransactionsJSON,
  exportReportPDF,
  importTransactionsCSV,
  importTransactionsJSON
} = exportImportApi;

// Create a named object for default export
const apiExports = {
  ...apiUtils,
  ...authApi,
  ...transactionApi,
  ...savingsApi,
  ...categoryApi,
  ...recipientApi,
  ...userApi,
  ...exportImportApi
};

// Export a default object with all API functions
export default apiExports;
