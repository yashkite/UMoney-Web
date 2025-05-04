// umoney-frontend/src/api/controllers/AssetController.js
import { AssetModel } from '../models/AssetModel';

export const AssetController = {
  /**
   * Get all assets for the current user
   * @returns {Promise<Array>} - Array of asset objects
   */
  async getAssets() {
    try {
      return await AssetModel.getAssets();
    } catch (error) {
      console.error('AssetController: Error fetching assets:', error);
      throw error;
    }
  },

  /**
   * Create a new asset
   * @param {Object} assetData - Asset data
   * @returns {Promise<Object>} - Created asset
   */
  async createAsset(assetData) {
    try {
      return await AssetModel.createAsset(assetData);
    } catch (error) {
      console.error('AssetController: Error creating asset:', error);
      throw error;
    }
  },

  /**
   * Update an asset
   * @param {string} id - Asset ID
   * @param {Object} assetData - Updated asset data
   * @returns {Promise<Object>} - Updated asset
   */
  async updateAsset(id, assetData) {
    try {
      return await AssetModel.updateAsset(id, assetData);
    } catch (error) {
      console.error('AssetController: Error updating asset:', error);
      throw error;
    }
  },

  /**
   * Delete an asset
   * @param {string} id - Asset ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteAsset(id) {
    try {
      return await AssetModel.deleteAsset(id);
    } catch (error) {
      console.error('AssetController: Error deleting asset:', error);
      throw error;
    }
  }
};
