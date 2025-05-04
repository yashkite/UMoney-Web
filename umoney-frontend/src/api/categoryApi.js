// umoney-frontend/src/api/categoryApi.js

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete
} from './utils/apiUtils';

/**
 * Get all categories
 * @returns {Promise<Array>} - Array of categories
 */
export const getCategories = async () => {
  try {
    return await apiGet('/categories');
  } catch (error) {
    console.error('getCategories: Error fetching categories:', error);
    return [];
  }
};

/**
 * Get categories by type
 * @param {string} type - Category type (Income, Needs, Wants, Savings)
 * @returns {Promise<Array>} - Array of categories of the specified type
 */
export const getCategoriesByType = async (type) => {
  try {
    return await apiGet(`/categories/type/${type}`);
  } catch (error) {
    console.error(`getCategoriesByType: Error fetching categories of type ${type}:`, error);
    return [];
  }
};

/**
 * Get category statistics
 * @param {number} days - Number of days to include in statistics (default: 30)
 * @returns {Promise<Array>} - Array of category statistics
 */
export const getCategoryStats = async (days = 30) => {
  try {
    return await apiGet(`/categories/stats?days=${days}`);
  } catch (error) {
    console.error('getCategoryStats: Error fetching category statistics:', error);
    return [];
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} - Created category
 */
export const createCategory = async (categoryData) => {
  try {
    return await apiPost('/categories', categoryData);
  } catch (error) {
    console.error('createCategory: Error creating category:', error);
    throw error;
  }
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} - Updated category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    return await apiPut(`/categories/${id}`, categoryData);
  } catch (error) {
    console.error('updateCategory: Error updating category:', error);
    throw error;
  }
};

/**
 * Update category budget allocation
 * @param {string} id - Category ID
 * @param {Object} budgetData - Budget data (percentage and/or amount)
 * @returns {Promise<Object>} - Updated category
 */
export const updateCategoryBudget = async (id, budgetData) => {
  try {
    return await apiPut(`/categories/${id}/budget`, budgetData);
  } catch (error) {
    console.error(`updateCategoryBudget: Error updating category ${id} budget:`, error);
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteCategory = async (id) => {
  try {
    return await apiDelete(`/categories/${id}`);
  } catch (error) {
    console.error('deleteCategory: Error deleting category:', error);
    throw error;
  }
};

/**
 * Reset categories to defaults
 * @returns {Promise<Object>} - Response data
 */
export const resetCategories = async () => {
  try {
    return await apiPost('/categories/reset');
  } catch (error) {
    console.error('resetCategories: Error resetting categories:', error);
    throw error;
  }
};

// Export all category API functions
export default {
  getCategories,
  getCategoriesByType,
  getCategoryStats,
  createCategory,
  updateCategory,
  updateCategoryBudget,
  deleteCategory,
  resetCategories
};
