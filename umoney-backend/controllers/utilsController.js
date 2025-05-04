const Category = require('../models/Category');
const User = require('../models/User');
const { exchangeRates, convertCurrency, getSupportedCurrencies } = require('../utils/currencyUtils');

// @desc    Ensure the user has Income categories
exports.ensureIncomeCategories = async (req, res) => {
  try {
    // Check if user already has Income categories
    const existingIncomeCategories = await Category.find({
      user: req.user.id,
      type: 'Income'
    });

    if (existingIncomeCategories.length > 0) {
      return res.json({
        message: 'Income categories already exist',
        categories: existingIncomeCategories
      });
    }

    // Create default Income categories for the user
    const defaultIncomeCategories = [
      { name: 'Salary', type: 'Income', user: req.user.id, isCustom: false },
      { name: 'Other Income', type: 'Income', user: req.user.id, isCustom: false }
    ];

    const createdCategories = await Category.insertMany(defaultIncomeCategories);

    res.json({
      message: 'Default Income categories created successfully',
      categories: createdCategories
    });
  } catch (err) {
    console.error('Error ensuring Income categories:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Ensure the user has Needs, Wants, and Savings categories
exports.ensureExpenseCategories = async (req, res) => {
  try {
    // Check if user already has Needs, Wants, and Savings categories
    const existingExpenseCategories = await Category.find({
      user: req.user.id,
      type: { $in: ['Needs', 'Wants', 'Savings'] }
    });

    // Group existing categories by type
    const existingCategoriesByType = {};
    existingExpenseCategories.forEach(category => {
      if (!existingCategoriesByType[category.type]) {
        existingCategoriesByType[category.type] = [];
      }
      existingCategoriesByType[category.type].push(category);
    });

    // Define default categories for each type
    const defaultCategories = {
      Needs: [
        { name: 'Housing', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Utilities', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Groceries', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Transportation', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Healthcare', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Insurance', type: 'Needs', user: req.user.id, isCustom: false },
        { name: 'Debt Payments', type: 'Needs', user: req.user.id, isCustom: false }
      ],
      Wants: [
        { name: 'Dining Out', type: 'Wants', user: req.user.id, isCustom: false },
        { name: 'Entertainment', type: 'Wants', user: req.user.id, isCustom: false },
        { name: 'Shopping', type: 'Wants', user: req.user.id, isCustom: false },
        { name: 'Travel', type: 'Wants', user: req.user.id, isCustom: false },
        { name: 'Subscriptions', type: 'Wants', user: req.user.id, isCustom: false },
        { name: 'Hobbies', type: 'Wants', user: req.user.id, isCustom: false }
      ],
      Savings: [
        { name: 'Emergency Fund', type: 'Savings', user: req.user.id, isCustom: false },
        { name: 'Investments', type: 'Savings', user: req.user.id, isCustom: false },
        { name: 'Retirement', type: 'Savings', user: req.user.id, isCustom: false },
        { name: 'Goals', type: 'Savings', user: req.user.id, isCustom: false }
      ]
    };

    // Categories to create
    const categoriesToCreate = [];
    let createdCategories = [];

    // For each type, check if we need to create default categories
    for (const type of ['Needs', 'Wants', 'Savings']) {
      if (!existingCategoriesByType[type] || existingCategoriesByType[type].length === 0) {
        categoriesToCreate.push(...defaultCategories[type]);
      }
    }

    // Create categories if needed
    if (categoriesToCreate.length > 0) {
      createdCategories = await Category.insertMany(categoriesToCreate);
    }

    res.json({
      message: categoriesToCreate.length > 0 ? 'Default expense categories created successfully' : 'Expense categories already exist',
      existingCategories: existingExpenseCategories,
      createdCategories
    });
  } catch (err) {
    console.error('Error ensuring expense categories:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get list of supported currencies
exports.getCurrencies = async (req, res) => {
  try {
    res.json({
      currencies: getSupportedCurrencies(),
      defaultCurrency: req.user.preferredCurrency || 'INR'
    });
  } catch (err) {
    console.error('Error fetching currencies:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Convert amount from one currency to another
exports.convertCurrency = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ msg: 'Please provide amount, fromCurrency, and toCurrency' });
    }

    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return res.status(400).json({ msg: 'Invalid currency' });
    }

    // Use the centralized currency conversion function
    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);

    res.json({
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount: parseFloat(convertedAmount.toFixed(2))
    });
  } catch (err) {
    console.error('Error converting currency:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Set user's preferred currency
exports.setPreferredCurrency = async (req, res) => {
  try {
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({ msg: 'Please provide a currency' });
    }

    if (!exchangeRates[currency]) {
      return res.status(400).json({ msg: 'Invalid currency' });
    }

    // Update user's preferred currency
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredCurrency: currency },
      { new: true }
    );

    res.json({
      message: 'Preferred currency updated successfully',
      preferredCurrency: user.preferredCurrency
    });
  } catch (err) {
    console.error('Error setting preferred currency:', err.message);
    res.status(500).send('Server Error');
  }
};