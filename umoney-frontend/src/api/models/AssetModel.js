// umoney-frontend/src/api/models/AssetModel.js
import { API_BASE_URL, getHeaders, handleResponse } from '../utils/api';

export const AssetModel = {
  /**
   * Get all assets for the current user
   * @returns {Promise<Array>} - Array of asset objects
   */
  async getAssets() {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Assets API not found, returning mock data');
        return [
          { _id: 'a1', name: 'Savings Account', type: 'Cash', value: 15000, dateAdded: '2024-01-10T00:00:00.000Z' },
          { _id: 'a2', name: 'Stock Portfolio', type: 'Investment', value: 45000, dateAdded: '2023-05-20T00:00:00.000Z' },
          { _id: 'a3', name: 'Primary Residence', type: 'Real Estate', value: 350000, dateAdded: '2022-03-15T00:00:00.000Z' },
        ];
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  },

  /**
   * Create a new asset
   * @param {Object} assetData - Asset data
   * @returns {Promise<Object>} - Created asset
   */
  async createAsset(assetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(assetData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Assets API not found, returning mock success response');
        return {
          success: true,
          message: 'Asset created successfully (mock)',
          data: {
            _id: `mock-asset-${Date.now()}`,
            ...assetData,
            dateAdded: new Date().toISOString()
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating asset:', error);
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
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(assetData),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Assets API not found, returning mock success response');
        return {
          success: true,
          message: 'Asset updated successfully (mock)',
          data: {
            _id: id,
            ...assetData
          }
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error updating asset:', error);
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
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('Assets API not found, returning mock success response');
        return {
          success: true,
          message: 'Asset deleted successfully (mock)'
        };
      }

      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }
};
