import { TagModel } from '../models/TagModel';

export const TagController = {
  async getTransactionTags(type) {
    try {
      console.log('TagController: Fetching transaction tags...');
      const tags = await TagModel.getTransactionTags(type);
      console.log('TagController: Tags fetched successfully:', tags);
      return tags;
    } catch (error) {
      console.error('TagController: Error fetching transaction tags:', error);
      throw error;
    }
  },

  async addTransactionTag(tagData) {
    try {
      console.log('TagController: Adding transaction tag:', tagData);
      const result = await TagModel.addTransactionTag(tagData);
      console.log('TagController: Tag added successfully:', result);
      return result;
    } catch (error) {
      console.error('TagController: Error adding transaction tag:', error);
      throw error;
    }
  }
};