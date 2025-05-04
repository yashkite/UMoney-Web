// umoney-frontend/src/models/TagModel.js

import { getTransactionTags, addTransactionTag } from '../api/transactionApi';

export const TagModel = {
  async getTransactionTags(type) {
    try {
      console.log('TagModel: Fetching transaction tags for type:', type);
      
      const response = await getTransactionTags(type);
      console.log('TagModel: Tags response:', response);
      
      return response;
    } catch (error) {
      console.error('TagModel: Error fetching transaction tags:', error);
      return { success: false, data: [] };
    }
  },

  async addTransactionTag(tagData) {
    try {
      console.log('TagModel: Adding transaction tag:', tagData);
      
      const response = await addTransactionTag(tagData);
      console.log('TagModel: Add tag response:', response);
      
      return response;
    } catch (error) {
      console.error('TagModel: Error adding transaction tag:', error);
      throw error;
    }
  }
};
