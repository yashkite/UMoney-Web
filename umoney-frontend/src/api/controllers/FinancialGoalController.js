// umoney-frontend/src/api/controllers/FinancialGoalController.js
import { FinancialGoalModel } from '../models/FinancialGoalModel';

export const FinancialGoalController = {
  /**
   * Get all financial goals for the current user
   * @returns {Promise<Array>} - Array of financial goal objects
   */
  async getFinancialGoals() {
    try {
      return await FinancialGoalModel.getFinancialGoals();
    } catch (error) {
      console.error('FinancialGoalController: Error fetching financial goals:', error);
      throw error;
    }
  },

  /**
   * Create a new financial goal
   * @param {Object} goalData - Financial goal data
   * @returns {Promise<Object>} - Created financial goal
   */
  async createFinancialGoal(goalData) {
    try {
      return await FinancialGoalModel.createFinancialGoal(goalData);
    } catch (error) {
      console.error('FinancialGoalController: Error creating financial goal:', error);
      throw error;
    }
  },

  /**
   * Update a financial goal
   * @param {string} id - Financial goal ID
   * @param {Object} goalData - Updated financial goal data
   * @returns {Promise<Object>} - Updated financial goal
   */
  async updateFinancialGoal(id, goalData) {
    try {
      return await FinancialGoalModel.updateFinancialGoal(id, goalData);
    } catch (error) {
      console.error('FinancialGoalController: Error updating financial goal:', error);
      throw error;
    }
  },

  /**
   * Delete a financial goal
   * @param {string} id - Financial goal ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteFinancialGoal(id) {
    try {
      return await FinancialGoalModel.deleteFinancialGoal(id);
    } catch (error) {
      console.error('FinancialGoalController: Error deleting financial goal:', error);
      throw error;
    }
  },

  /**
   * Add a contribution to a financial goal
   * @param {string} id - Financial goal ID
   * @param {Object} contributionData - Contribution data
   * @returns {Promise<Object>} - Updated financial goal
   */
  async addContribution(id, contributionData) {
    try {
      return await FinancialGoalModel.addContribution(id, contributionData);
    } catch (error) {
      console.error('FinancialGoalController: Error adding contribution to financial goal:', error);
      throw error;
    }
  }
};
