// umoney-frontend/src/api/controllers/BudgetController.js
import { BudgetModel } from '../models/BudgetModel';

export const BudgetController = {
  /**
   * Get budget preferences for the current user
   * @returns {Promise<Object>} - Budget preferences object
   */
  async getBudgetPreferences() {
    try {
      return await BudgetModel.getBudgetPreferences();
    } catch (error) {
      console.error('BudgetController: Error fetching budget preferences:', error);
      throw error;
    }
  },

  /**
   * Update budget preferences for the current user
   * @param {Object} preferences - Budget preferences object
   * @returns {Promise<Object>} - Updated budget preferences
   */
  async updateBudgetPreferences(preferences) {
    try {
      return await BudgetModel.updateBudgetPreferences(preferences);
    } catch (error) {
      console.error('BudgetController: Error updating budget preferences:', error);
      throw error;
    }
  },

  /**
   * Get budgets for a specific month
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Array>} - Array of budget objects
   */
  async getBudgets(month) {
    try {
      return await BudgetModel.getBudgets(month);
    } catch (error) {
      console.error('BudgetController: Error fetching budgets:', error);
      throw error;
    }
  },

  /**
   * Get budget overview (summary)
   * @returns {Promise<Object>} - Budget overview object
   */
  async getBudgetOverview() {
    try {
      return await BudgetModel.getBudgetOverview();
    } catch (error) {
      console.error('BudgetController: Error fetching budget overview:', error);
      throw error;
    }
  },

  /**
   * Create or update a budget entry
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} - Created or updated budget
   */
  async createBudget(budgetData) {
    try {
      return await BudgetModel.createBudget(budgetData);
    } catch (error) {
      console.error('BudgetController: Error creating budget:', error);
      throw error;
    }
  },

  /**
   * Delete a budget entry
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} - Response object
   */
  async deleteBudget(id) {
    try {
      return await BudgetModel.deleteBudget(id);
    } catch (error) {
      console.error('BudgetController: Error deleting budget:', error);
      throw error;
    }
  }
};
