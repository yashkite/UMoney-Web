const mongoose = require('mongoose');

/**
 * @description Schema for FinancialGoal model
 * @param {ObjectId} userId - Reference to the User model
 * @param {string} name - Name of the financial goal
 * @param {number} targetAmount - Target amount for the financial goal
 * @param {Date} targetDate - Target date for achieving the financial goal
 * @param {number} currentProgress - Current progress towards the financial goal
 */
const financialGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  currentProgress: {
    type: Number,
    default: 0
  }
});

const FinancialGoal = mongoose.model('FinancialGoal', financialGoalSchema);

module.exports = FinancialGoal;
