import { BudgetModel } from '../models/BudgetModel';

/**
 * Controller for budget-related operations
 */
export const BudgetController = {
  /**
   * Update user's budget preferences
   * @param {number} needsPercentage - Percentage for needs category (0-100)
   * @param {number} wantsPercentage - Percentage for wants category (0-100)
   * @param {number} savingsPercentage - Percentage for savings category (0-100)
   * @returns {Promise<Object>} - Response with updated budget preferences
   */
  async updateBudgetPreferences(needsPercentage, wantsPercentage, savingsPercentage) {
    try {
      console.log('BudgetController: Updating budget preferences...');
      console.log('BudgetController: Needs:', needsPercentage, 'Wants:', wantsPercentage, 'Savings:', savingsPercentage);

      // Validate input
      if (needsPercentage < 0 || wantsPercentage < 0 || savingsPercentage < 0) {
        throw new Error('Budget percentages cannot be negative');
      }

      // Validate total
      const total = needsPercentage + wantsPercentage + savingsPercentage;
      if (Math.abs(total - 100) >= 0.01) {
        throw new Error('Budget percentages must sum to 100%');
      }

      const result = await BudgetModel.updateBudgetPreferences(
        needsPercentage,
        wantsPercentage,
        savingsPercentage
      );

      console.log('BudgetController: Budget preferences updated successfully:', result);
      return result;
    } catch (error) {
      console.error('BudgetController: Error updating budget preferences:', error);
      throw error;
    }
  },

  /**
   * Get user's current budget preferences
   * @returns {Promise<Object>} - User's budget preferences
   */
  async getBudgetPreferences() {
    try {
      console.log('BudgetController: Getting budget preferences...');

      const result = await BudgetModel.getBudgetPreferences();

      console.log('BudgetController: Budget preferences retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('BudgetController: Error getting budget preferences:', error);
      throw error;
    }
  }
};