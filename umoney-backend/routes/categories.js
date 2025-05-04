const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware'); // Import auth middleware
const categoryController = require('../controllers/categoryController'); // Import the controller

// @route   GET /api/categories
// @desc    Get all categories for the logged-in user
// @access  Private
router.get('/', ensureAuth, categoryController.getCategories);

// @route   GET /api/categories/type/:type
// @desc    Get categories by type for the logged-in user
// @access  Private
router.get('/type/:type', ensureAuth, categoryController.getCategoriesByType);

// @route   GET /api/categories/stats
// @desc    Get category usage statistics
// @access  Private
router.get('/stats', ensureAuth, categoryController.getCategoryStats);

// @route   GET /api/categories/:id
// @desc    Get a specific category by ID
// @access  Private
router.get('/:id', ensureAuth, categoryController.getCategory);

// @route   POST /api/categories
// @desc    Create a new category for the logged-in user
// @access  Private
router.post('/', ensureAuth, categoryController.createCategory);

// @route   POST /api/categories/reset
// @desc    Reset categories to defaults
// @access  Private
router.post('/reset', ensureAuth, categoryController.resetCategories);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', ensureAuth, categoryController.updateCategory);

// @route   PUT /api/categories/:id/budget
// @desc    Update category budget allocation
// @access  Private
router.put('/:id/budget', ensureAuth, categoryController.updateCategoryBudget);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', ensureAuth, categoryController.deleteCategory);

module.exports = router;
