const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const financialGoalController = require('../controllers/financialGoalController'); // Import the controller

// Middleware to protect all routes in this file
router.use(authMiddleware.ensureAuth);

// @route   GET api/financial-goals
// @desc    Get all financial goals for the logged-in user
// @access  Private
router.get('/', financialGoalController.getFinancialGoals);

// @route   POST api/financial-goals
// @desc    Create a new financial goal
// @access  Private
router.post('/', financialGoalController.createFinancialGoal);

// @route   PUT api/financial-goals/:id
// @desc    Update a financial goal
// @access  Private
router.put('/:id', financialGoalController.updateFinancialGoal);

// @route   DELETE api/financial-goals/:id
// @desc    Delete a financial goal
// @access  Private
router.delete('/:id', financialGoalController.deleteFinancialGoal);

// @route   POST api/financial-goals/:id/contribute
// @desc    Add contribution to a financial goal
// @access  Private
router.post('/:id/contribute', financialGoalController.addContribution); // Added route for contribution

module.exports = router;
