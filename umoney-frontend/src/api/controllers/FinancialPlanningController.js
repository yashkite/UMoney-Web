// umoney-frontend/src/api/controllers/FinancialPlanningController.js
import { FinancialPlanningModel } from '../models/FinancialPlanningModel';

export const FinancialPlanningController = {
  /**
   * Get net worth for the current user
   * @returns {Promise<Object>} - Net worth object
   */
  async getNetWorth() {
    try {
      return await FinancialPlanningModel.getNetWorth();
    } catch (error) {
      console.error('FinancialPlanningController: Error fetching net worth:', error);
      throw error;
    }
  }
};
