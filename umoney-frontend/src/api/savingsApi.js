// umoney-frontend/src/api/savingsApi.js

import {
  apiPost,
  apiPut
} from './utils/apiUtils';

/**
 * Add a savings transaction (deposit or withdrawal)
 * @param {Object} savingsData - Savings transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const addSavings = async (savingsData, attachments = []) => {
  try {
    console.log('addSavings: Adding savings transaction with data:', savingsData);

    // Validate required fields
    if (!savingsData.description || !savingsData.amount || !savingsData.date || !savingsData.savingsType) {
      console.error('addSavings: Missing required fields');
      throw new Error('Please provide all required fields: description, amount, date, and savingsType');
    }

    // Ensure transactionType is set to 'Savings'
    const savingsDataWithType = {
      ...savingsData,
      transactionType: 'Savings'
    };

    return await apiPost('/transactions/savings', savingsDataWithType, attachments);
  } catch (error) {
    console.error('addSavings: Error adding savings transaction:', error);
    throw error;
  }
};

/**
 * Update a savings transaction
 * @param {string} id - Transaction ID
 * @param {Object} savingsData - Savings transaction data
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Response data
 */
export const updateSavingsTransaction = async (id, savingsData, attachments = []) => {
  try {
    console.log('updateSavingsTransaction: Updating savings transaction with data:', savingsData);

    // Ensure transactionType is set to 'Savings'
    const savingsDataWithType = {
      ...savingsData,
      transactionType: 'Savings'
    };

    return await apiPut(`/transactions/savings/${id}`, savingsDataWithType, attachments);
  } catch (error) {
    console.error('updateSavingsTransaction: Error updating savings transaction:', error);
    throw error;
  }
};

// Export all savings API functions
export default {
  addSavings,
  updateSavingsTransaction
};
