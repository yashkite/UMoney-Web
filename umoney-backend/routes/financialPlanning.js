const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const financialPlanningController = require('../controllers/financialPlanningController'); // Import the controller

// Middleware to protect all routes in this file
router.use(authMiddleware.ensureAuth);

// @route   GET api/financial-planning/net-worth
// @desc    Calculate the net worth for the logged-in user
// @access  Private
router.get('/net-worth', financialPlanningController.getNetWorth);

// Add other financial planning endpoints here later (e.g., cash flow analysis)

module.exports = router;
