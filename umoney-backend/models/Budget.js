const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // Store month as a string in 'YYYY-MM' format for easier querying
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/ // Validate YYYY-MM format
  },
  budgetedAmount: {
    type: Number,
    required: true
  },
  // Actual amount spent can be calculated dynamically from transactions
  // or stored here if updated periodically. Let's keep it simple for now.
  // actualAmount: {
  //   type: Number,
  //   default: 0
  // }
}, { timestamps: true }); // Add timestamps for creation/update tracking

// Ensure a user can only have one budget entry per category per month
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
