// umoney-frontend/src/api/controllers/LiabilityController.js
import { LiabilityModel } from '../models/LiabilityModel';

export const LiabilityController = {
  /**
   * Get all liabilities for the current user
   * @returns {Promise<Array>} - Array of liability objects
   */
  async getLiabilities() {
    try {
      return await LiabilityModel.getLiabilities();
    } catch (error) {
      console.error('LiabilityController: Error fetching liabilities:', error);
      throw error;
    }
  },

  /**
   * Create a new liability
   * @param {Object} liabilityData - Liability data
   * @returns {Promise<Object>} - Created liability
   */
  async createLiability(liabilityData) {
    try {
      return await LiabilityModel.createLiability(liabilityData);
    } catch (error) {
      console.error('LiabilityController: Error creating liability:', error);
      throw error;
    }
  },

  /**
   * Update a liability
   * @param {string} id - Liability ID
   * @param {Object} liabilityData - Updated liability data
   * @returns {Promise<Object>} - Updated liability
   */
  async updateLiability(id, liabilityData) {
    try {
      return await LiabilityModel.updateLiability(id, liabilityData);
    } catch (error) {
      console.error('LiabilityController: Error updating liability:', error);
      throw error;
    }
  },

  /**
   * Delete a liability
   * @param {string} id - Liability ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteLiability(id) {
    try {
      return await LiabilityModel.deleteLiability(id);
    } catch (error) {
      console.error('LiabilityController: Error deleting liability:', error);
      throw error;
    }
  }
};
