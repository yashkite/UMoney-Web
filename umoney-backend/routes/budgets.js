const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController'); // Import the controller

// Middleware to protect all routes in this file
router.use(authMiddleware.ensureAuth);

// Note: Helper function isValidMonthFormat is now likely within the controller or a utils file,
// but keeping it here doesn't break functionality if controller doesn't re-implement.
// Ideally, validation logic should also be centralized.
const isValidMonthFormat = (month) => /^\d{4}-\d{2}$/.test(month); // Keep for now, controller handles it

// @route   GET api/budgets/overview
// @desc    Get budget overview (summary)
// @access  Private
// Note: This route should come BEFORE '/:month' to avoid 'overview' being treated as a month parameter.
router.get('/overview', budgetController.getBudgetOverview);

// @route   GET api/budgets/:month
// @desc    Get all budget entries for a specific month (YYYY-MM) for the logged-in user
// @access  Private
router.get('/:month', budgetController.getBudgets);

// @route   POST api/budgets
// @desc    Create or update a budget entry for a specific category and month
// @access  Private
router.post('/', budgetController.createBudget);


// @route   PUT api/budgets/:id
// @desc    Update a budget (Placeholder - currently handled by POST upsert)
// @access  Private
router.put('/:id', budgetController.updateBudget); // Pointing to the placeholder in controller

// @route   DELETE api/budgets/:id
// @desc    Delete a specific budget entry by its ID
// @access  Private
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
