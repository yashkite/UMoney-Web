import { CategoryModel } from '../models/CategoryModel';

export const CategoryController = {
  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getCategories() {
    try {
      console.log('CategoryController: Fetching categories...');
      const categories = await CategoryModel.getCategories();
      console.log('CategoryController: Categories fetched successfully:', categories);
      return categories;
    } catch (error) {
      console.error('CategoryController: Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get categories by type
   * @param {string} type - Category type (Income, Needs, Wants, Savings)
   * @returns {Promise<Array>} - Array of categories of the specified type
   */
  async getCategoriesByType(type) {
    try {
      console.log(`CategoryController: Fetching categories of type ${type}...`);
      const categories = await CategoryModel.getCategoriesByType(type);
      console.log(`CategoryController: Categories of type ${type} fetched successfully:`, categories);
      return categories;
    } catch (error) {
      console.error(`CategoryController: Error fetching categories of type ${type}:`, error);
      throw error;
    }
  },

  /**
   * Get category statistics
   * @param {number} days - Number of days to include in statistics (default: 30)
   * @returns {Promise<Array>} - Array of category statistics
   */
  async getCategoryStats(days = 30) {
    try {
      console.log(`CategoryController: Fetching category statistics for the last ${days} days...`);
      const stats = await CategoryModel.getCategoryStats(days);
      console.log('CategoryController: Category statistics fetched successfully:', stats);
      return stats;
    } catch (error) {
      console.error('CategoryController: Error fetching category statistics:', error);
      return [];
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    try {
      console.log('CategoryController: Creating new category:', categoryData);
      const category = await CategoryModel.createCategory(categoryData);
      console.log('CategoryController: Category created successfully:', category);
      return category;
    } catch (error) {
      console.error('CategoryController: Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(id, categoryData) {
    try {
      console.log(`CategoryController: Updating category ${id}:`, categoryData);
      const category = await CategoryModel.updateCategory(id, categoryData);
      console.log('CategoryController: Category updated successfully:', category);
      return category;
    } catch (error) {
      console.error(`CategoryController: Error updating category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update category budget allocation
   * @param {string} id - Category ID
   * @param {Object} budgetData - Budget data (percentage and/or amount)
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategoryBudget(id, budgetData) {
    try {
      console.log(`CategoryController: Updating category ${id} budget:`, budgetData);
      const category = await CategoryModel.updateCategoryBudget(id, budgetData);
      console.log('CategoryController: Category budget updated successfully:', category);
      return category;
    } catch (error) {
      console.error(`CategoryController: Error updating category ${id} budget:`, error);
      throw error;
    }
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} - Response data
   */
  async deleteCategory(id) {
    try {
      console.log(`CategoryController: Deleting category ${id}`);
      const result = await CategoryModel.deleteCategory(id);
      console.log('CategoryController: Category deleted successfully:', result);
      return result;
    } catch (error) {
      console.error(`CategoryController: Error deleting category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reset categories to defaults
   * @returns {Promise<Object>} - Response data
   */
  async resetCategories() {
    try {
      console.log('CategoryController: Resetting categories to defaults');
      const result = await CategoryModel.resetCategories();
      console.log('CategoryController: Categories reset successfully:', result);
      return result;
    } catch (error) {
      console.error('CategoryController: Error resetting categories:', error);
      throw error;
    }
  }
};