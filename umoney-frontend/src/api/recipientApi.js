// umoney-frontend/src/api/recipientApi.js

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete
} from './utils/apiUtils';

/**
 * Get all recipients
 * @returns {Promise<Array>} - Array of recipients
 */
export const getRecipients = async () => {
  try {
    return await apiGet('/recipients');
  } catch (error) {
    console.error('getRecipients: Error fetching recipients:', error);
    return [];
  }
};

/**
 * Create a new recipient
 * @param {Object} recipientData - Recipient data
 * @returns {Promise<Object>} - Created recipient
 */
export const createRecipient = async (recipientData) => {
  try {
    return await apiPost('/recipients', recipientData);
  } catch (error) {
    console.error('createRecipient: Error creating recipient:', error);
    throw error;
  }
};

/**
 * Update a recipient
 * @param {string} id - Recipient ID
 * @param {Object} recipientData - Recipient data
 * @returns {Promise<Object>} - Updated recipient
 */
export const updateRecipient = async (id, recipientData) => {
  try {
    return await apiPut(`/recipients/${id}`, recipientData);
  } catch (error) {
    console.error('updateRecipient: Error updating recipient:', error);
    throw error;
  }
};

/**
 * Delete a recipient
 * @param {string} id - Recipient ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteRecipient = async (id) => {
  try {
    return await apiDelete(`/recipients/${id}`);
  } catch (error) {
    console.error('deleteRecipient: Error deleting recipient:', error);
    throw error;
  }
};

// Export all recipient API functions
export default {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient
};
