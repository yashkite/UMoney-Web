const express = require('express');
const router = express.Router();
const { ensureAuth, ensureAdmin } = require('../middleware/authMiddleware');
const utilsController = require('../controllers/utilsController');

// @route   GET /api/utils/ensure-income-categories
// @desc    Ensure the user has Income categories
// @access  Private
router.get('/ensure-income-categories', ensureAuth, utilsController.ensureIncomeCategories);

// @route   GET /api/utils/ensure-expense-categories
// @desc    Ensure the user has Needs, Wants, and Savings categories
// @access  Private
router.get('/ensure-expense-categories', ensureAuth, utilsController.ensureExpenseCategories);

// @route   GET /api/utils/currencies
// @desc    Get list of supported currencies
// @access  Private
router.get('/currencies', ensureAuth, utilsController.getCurrencies);

// @route   POST /api/utils/convert-currency
// @desc    Convert amount from one currency to another
// @access  Private
router.post('/convert-currency', ensureAuth, utilsController.convertCurrency);

// @route   PUT /api/utils/set-preferred-currency
// @desc    Set user's preferred currency
// @access  Private
router.put('/set-preferred-currency', ensureAuth, utilsController.setPreferredCurrency);

module.exports = router;