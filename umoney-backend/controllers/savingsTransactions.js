// umoney-backend/controllers/savingsTransactions.js

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

/**
 * Add a savings transaction (deposit or withdrawal)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created transaction
 */
exports.addSavingsTransaction = async (req, res) => {
  try {
    console.log('addSavingsTransaction: Request body:', req.body);

    // Extract data from request body
    const {
      amount,
      description,
      date,
      category,
      currency,
      notes,
      tag,
      recipient,
      savingsType // 'deposit' or 'withdrawal'
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!amount || !description || !date || !savingsType) {
      console.log('addSavingsTransaction: Missing required fields');
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Validate savingsType
    if (!['deposit', 'withdrawal'].includes(savingsType)) {
      console.log('addSavingsTransaction: Invalid savingsType:', savingsType);
      return res.status(400).json({ msg: 'savingsType must be either "deposit" or "withdrawal"' });
    }

    // Get user for currency preference
    const user = await User.findById(userId);
    if (!user) {
      console.log('addSavingsTransaction: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find or create a category for this transaction
    let categoryId = category;
    if (!categoryId) {
      // Find a default category for Savings
      const defaultCategory = await Category.findOne({
        user: userId,
        type: 'Savings',
        isDefault: true
      });

      if (defaultCategory) {
        categoryId = defaultCategory._id;
      } else {
        // Create a default category if none exists
        const newCategory = new Category({
          user: userId,
          name: savingsType === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal',
          type: 'Savings',
          icon: 'pi pi-wallet',
          color: '#4caf50',
          isDefault: true
        });

        const savedCategory = await newCategory.save();
        categoryId = savedCategory._id;
      }
    }

    // Create the savings transaction
    const savingsTransaction = new Transaction({
      user: userId,
      description,
      amount: parseFloat(amount),
      category: categoryId,
      transactionType: 'Savings',
      date: new Date(date),
      currency: currency || user.preferredCurrency || 'INR',
      attachments: req.files ? req.files.map(file => ({
        url: file.path,
        filename: file.filename,
        type: 'receipt'
      })) : [],
      notes: notes || '',
      tag: tag || '',
      source: 'Manual',
      savingsType, // Add the savings type (deposit or withdrawal)
      recipient: recipient || {
        name: savingsType === 'deposit' ? 'Savings Account' : 'Withdrawal Source',
        type: 'bank',
        details: ''
      }
    });

    console.log('addSavingsTransaction: Created transaction with type:', savingsTransaction.transactionType);

    // Save the savings transaction
    const savedTransaction = await savingsTransaction.save();
    console.log('addSavingsTransaction: Savings transaction saved:', savedTransaction._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: `Savings ${savingsType} added successfully`,
      data: savedTransaction
    });
  } catch (err) {
    console.error('Error adding savings transaction:', err);
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);

    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Validation error details:', err.errors);
      return res.status(400).json({
        msg: 'Validation Error',
        details: err.message,
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }

    if (err.name === 'CastError') {
      console.error('Cast error details:', err);
      return res.status(400).json({
        msg: 'Invalid data format',
        details: err.message
      });
    }

    res.status(500).json({
      msg: 'Server Error',
      details: err.message
    });
  }
};

/**
 * Update a savings transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated transaction
 */
exports.updateSavingsTransaction = async (req, res) => {
  try {
    console.log('updateSavingsTransaction: Request body:', req.body);

    const { id } = req.params;
    const {
      amount,
      description,
      date,
      category,
      currency,
      notes,
      tag,
      recipient,
      savingsType
    } = req.body;

    const userId = req.user.id;

    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: id,
      user: userId,
      transactionType: 'Savings'
    });

    if (!transaction) {
      console.log('updateSavingsTransaction: Transaction not found');
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Update transaction fields
    if (amount) transaction.amount = parseFloat(amount);
    if (description) transaction.description = description;
    if (date) transaction.date = new Date(date);
    if (category) transaction.category = category;
    if (currency) transaction.currency = currency;
    if (notes !== undefined) transaction.notes = notes;
    if (tag !== undefined) transaction.tag = tag;
    if (savingsType && ['deposit', 'withdrawal'].includes(savingsType)) {
      transaction.savingsType = savingsType;
    }

    // Update recipient if provided
    if (recipient) {
      transaction.recipient = {
        name: recipient.name || (savingsType === 'deposit' ? 'Savings Account' : 'Withdrawal Source'),
        type: recipient.type || 'bank',
        details: recipient.details || ''
      };
    }

    // Update attachments if provided
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        url: file.path,
        filename: file.filename,
        type: 'receipt',
        uploadedAt: new Date()
      }));

      // Append new attachments to existing ones
      transaction.attachments = [...transaction.attachments, ...newAttachments];
    }

    // Save the updated transaction
    const updatedTransaction = await transaction.save();
    console.log('updateSavingsTransaction: Transaction updated:', updatedTransaction._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: `Savings ${transaction.savingsType} updated successfully`,
      data: updatedTransaction
    });
  } catch (err) {
    console.error('Error updating savings transaction:', err);
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);

    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Validation error details:', err.errors);
      return res.status(400).json({
        msg: 'Validation Error',
        details: err.message,
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }

    if (err.name === 'CastError') {
      console.error('Cast error details:', err);
      return res.status(400).json({
        msg: 'Invalid data format',
        details: err.message
      });
    }

    res.status(500).json({
      msg: 'Server Error',
      details: err.message
    });
  }
};
