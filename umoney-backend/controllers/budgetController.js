// umoney-backend/controllers/budgetController.js

const User = require('../models/User');

// Logic for handling budget-related requests
exports.getBudgets = (req, res) => {
  res.status(200).json({ message: "Get budgets" });
};

exports.createBudget = (req, res) => {
  res.status(201).json({ message: "Create budget" });
};

exports.getBudget = (req, res) => {
  res.status(200).json({ message: `Get budget with ID: ${req.params.id}` });
};

exports.updateBudget = (req, res) => {
  res.status(200).json({ message: `Update budget with ID: ${req.params.id}` });
};

exports.deleteBudget = (req, res) => {
  res.status(204).json({ message: `Delete budget with ID: ${req.params.id}` });
};

exports.getBudgetOverview = (req, res) => {
  res.status(200).json({ message: "Get budget overview" });
};

/**
 * @desc    Update user's budget preferences
 * @route   PUT /api/auth/budget-preferences
 * @access  Private
 */
exports.updateBudgetPreferences = async (req, res) => {
  try {
    const { budgetPreferences } = req.body;

    if (!budgetPreferences) {
      return res.status(400).json({
        success: false,
        message: 'Budget preferences are required'
      });
    }

    const { needs, wants, savings } = budgetPreferences;

    // Validate that all required fields are present
    if (!needs || !wants || !savings) {
      return res.status(400).json({
        success: false,
        message: 'Needs, wants, and savings percentages are required'
      });
    }

    // Validate that percentages are numbers
    if (typeof needs.percentage !== 'number' ||
        typeof wants.percentage !== 'number' ||
        typeof savings.percentage !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Percentages must be numbers'
      });
    }

    // Validate that percentages are between 0 and 100
    if (needs.percentage < 0 || needs.percentage > 100 ||
        wants.percentage < 0 || wants.percentage > 100 ||
        savings.percentage < 0 || savings.percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentages must be between 0 and 100'
      });
    }

    // Validate that percentages sum to 100
    const total = needs.percentage + wants.percentage + savings.percentage;
    if (Math.abs(total - 100) >= 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Budget percentages must sum to 100%'
      });
    }

    // Find the user and update budget preferences
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update budget preferences
    user.budgetPreferences = {
      needs: { percentage: needs.percentage },
      wants: { percentage: wants.percentage },
      savings: { percentage: savings.percentage }
    };

    // Save the updated user
    await user.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Budget preferences updated successfully',
      budgetPreferences: user.budgetPreferences
    });
  } catch (error) {
    console.error('Error updating budget preferences:', error);

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating budget preferences'
    });
  }
};

/**
 * @desc    Get user's budget preferences
 * @route   GET /api/auth/budget-preferences
 * @access  Private
 */
exports.getBudgetPreferences = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return budget preferences
    res.status(200).json({
      success: true,
      budgetPreferences: user.budgetPreferences
    });
  } catch (error) {
    console.error('Error getting budget preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting budget preferences'
    });
  }
};
