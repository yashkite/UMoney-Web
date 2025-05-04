// umoney-backend/controllers/transactionController.js

const Transaction = require('../models/Transaction');

const { getTransactions, createTransaction, getTransaction, updateTransaction, deleteTransaction } = require('./transactionManagement');
const { getTransactionSummary } = require('./transactionSummary');
const { getTransactionTags, addTransactionTag } = require('./transactionTags');
const { addIncomeTransaction } = require('./incomeTransactions');
const { updateIncomeTransaction } = require('./incomeTransactionUpdate');
const { deleteIncomeTransaction } = require('./incomeTransactionDelete');
const { addSavingsTransaction, updateSavingsTransaction } = require('./savingsTransactions');

// Logic for handling transaction-related requests
exports.getTransactions = getTransactions;
exports.createTransaction = createTransaction;
exports.getTransaction = getTransaction;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;

// @desc    Get transaction summary for the logged-in user
exports.getTransactionSummary = getTransactionSummary;

// @desc    Get transaction tags for the logged-in user
exports.getTransactionTags = getTransactionTags;

// @desc    Add a new transaction tag for the logged-in user
exports.addTransactionTag = addTransactionTag;

// @desc    Add income transaction with distribution
exports.addIncomeTransaction = addIncomeTransaction;

// @desc    Add savings transaction (deposit or withdrawal)
exports.addSavingsTransaction = addSavingsTransaction;

// @desc    Update savings transaction
exports.updateSavingsTransaction = updateSavingsTransaction;

// @desc    Update a transaction
exports.updateTransaction = async (req, res) => {
  const { description, amount, category, subcategory, transactionType, date, currency, notes } = req.body;

  try {
    // First, check if this is a distribution transaction (which shouldn't be directly editable)
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if this is a distribution transaction (not directly editable)
    if (transaction.isDistribution === true || transaction.isEditable === false) {
      return res.status(403).json({
        msg: 'This transaction cannot be directly edited because it is a system-generated distribution. Please edit the parent income transaction instead.'
      });
    }

    // Check if this is an income transaction with distributions
    if (transaction.transactionType === 'Income') {
      // Use the special income update function that also updates distributions
      const updateData = {};
      if (description) updateData.description = description;
      if (amount !== undefined) {
        if (typeof parseFloat(amount) !== 'number' || isNaN(parseFloat(amount))) {
          return res.status(400).json({ msg: 'Amount must be a number' });
        }
        if (parseFloat(amount) <= 0) {
          return res.status(400).json({ msg: 'Amount must be greater than zero' });
        }
        updateData.amount = parseFloat(amount);
      }

      // Handle category
      if (category) {
        // Validate category exists and belongs to user
        const categoryExists = await Category.findOne({ _id: category, user: req.user.id });
        if (!categoryExists) {
          return res.status(400).json({ msg: 'Invalid category selected or category does not belong to user' });
        }
        updateData.category = category;
      }
      // If no category but subcategory is provided, try to find a matching category
      else if (subcategory) {
        // Try to find a category with matching name and type Income
        let matchingCategory = await Category.findOne({
          user: req.user.id,
          name: subcategory,
          type: 'Income'
        });

        // If no exact match, use any Income category
        if (!matchingCategory) {
          matchingCategory = await Category.findOne({
            user: req.user.id,
            type: 'Income'
          });
        }

        if (matchingCategory) {
          updateData.category = matchingCategory._id;
        }
      }

      if (date) updateData.date = new Date(date);
      if (currency) updateData.currency = currency;
      if (notes !== undefined) updateData.notes = notes;

      // Update the income transaction and its distributions using the dedicated controller
      return updateIncomeTransaction(req, res);
    }

    // For non-income transactions, proceed with regular update
    // Build transaction object
    const transactionFields = {};
    if (description) transactionFields.description = description;
    if (amount !== undefined) {
      if (typeof parseFloat(amount) !== 'number' || isNaN(parseFloat(amount))) {
        return res.status(400).json({ msg: 'Amount must be a number' });
      }
      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ msg: 'Amount must be greater than zero' });
      }
      transactionFields.amount = parseFloat(amount);
    }

    // Handle category
    if (category) {
      // Validate category exists and belongs to user
      const categoryExists = await Category.findOne({ _id: category, user: req.user.id });
      if (!categoryExists) {
        return res.status(400).json({ msg: 'Invalid category selected or category does not belong to user' });
      }
      transactionFields.category = category;
    }

    if (date) transactionFields.date = new Date(date);
    if (currency) transactionFields.currency = currency;
    if (notes !== undefined) transactionFields.notes = notes;

    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: transactionFields },
      { new: true } // Return the updated document
    ).populate('category', ['name', 'type']);

    return res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (err) {
    console.error('Error updating transaction:', err);

    // Check for validation errors from Mongoose schema
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }

    // Generic server error for other issues
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if this is a distribution transaction (not directly deletable)
    if (transaction.isDistribution === true || transaction.isEditable === false) {
      return res.status(403).json({
        msg: 'This transaction cannot be directly deleted because it is a system-generated distribution. Please delete the parent income transaction instead.'
      });
    }

    // Check if this is an income transaction with distributions
    if (transaction.transactionType === 'Income') {
      // Use the special income delete function that also deletes distributions
      return deleteIncomeTransaction(req, res);
    }

    // For regular transactions, just delete the transaction
    await Transaction.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get subcategories for a given transaction type
exports.getSubcategories = async (req, res) => {
  try {
    res.status(200).json({ message: "Get subcategories" });
  } catch (err) {
    console.error('Error getting subcategories:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Add expense transaction
exports.addExpenseTransaction = async (req, res) => {
  try {
    res.status(200).json({ message: "Add expense transaction" });
  } catch (err) {
    console.error('Error adding expense transaction:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
