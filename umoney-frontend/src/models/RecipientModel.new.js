// umoney-frontend/src/models/RecipientModel.js

import {
  getRecipients,
  createRecipient
} from '../api/recipientApi';

export const RecipientModel = {
  async getRecipients() {
    try {
      console.log('RecipientModel: Fetching recipients');
      return await getRecipients();
    } catch (error) {
      console.error('RecipientModel: Error fetching recipients:', error);
      return [];
    }
  },

  async addRecipient(recipientData) {
    try {
      console.log('RecipientModel: Adding recipient with data:', recipientData);
      return await createRecipient(recipientData);
    } catch (error) {
      console.error('RecipientModel: Error adding recipient:', error);
      throw error;
    }
  }
};
