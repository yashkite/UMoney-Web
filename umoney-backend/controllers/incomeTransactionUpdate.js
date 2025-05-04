// umoney-backend/controllers/incomeTransactionUpdate.js

const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * Update an income transaction and its distributions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated transactions
 */
exports.updateIncomeTransaction = async (req, res) => {
  try {
    console.log('updateIncomeTransaction: Request body:', req.body);
    console.log('updateIncomeTransaction: Transaction ID:', req.params.id);

    const transactionId = req.params.id;
    const userId = req.user.id;

    // Extract data from request body
    const {
      amount,
      description,
      date,
      category,
      distribution,
      currency,
      notes,
      tag
    } = req.body;

    // Validate required fields
    if (!amount || !description || !date) {
      console.log('updateIncomeTransaction: Missing required fields');
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Find the income transaction
    const incomeTransaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
      transactionType: 'Income'
    });

    if (!incomeTransaction) {
      console.log('updateIncomeTransaction: Transaction not found or not an income transaction');
      return res.status(404).json({ msg: 'Income transaction not found' });
    }

    // Get user for budget preferences
    const user = await User.findById(userId);
    if (!user) {
      console.log('updateIncomeTransaction: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get distribution percentages
    let needsPercentage, wantsPercentage, savingsPercentage;

    if (distribution) {
      // Use provided distribution
      needsPercentage = parseFloat(distribution.needs);
      wantsPercentage = parseFloat(distribution.wants);
      savingsPercentage = parseFloat(distribution.savings);

      // Validate that percentages sum to 100
      const total = needsPercentage + wantsPercentage + savingsPercentage;
      if (Math.abs(total - 100) > 0.01) {
        console.log('updateIncomeTransaction: Distribution percentages do not sum to 100:', total);
        return res.status(400).json({ msg: 'Distribution percentages must sum to 100%' });
      }
    } else {
      // Use user's budget preferences
      needsPercentage = user.budgetPreferences.needs.percentage;
      wantsPercentage = user.budgetPreferences.wants.percentage;
      savingsPercentage = user.budgetPreferences.savings.percentage;
    }

    // Update the income transaction
    incomeTransaction.description = description;
    incomeTransaction.amount = parseFloat(amount);
    if (category) incomeTransaction.category = category;
    if (date) incomeTransaction.date = new Date(date);
    if (currency) incomeTransaction.currency = currency;
    if (notes !== undefined) incomeTransaction.notes = notes;
    if (tag !== undefined) incomeTransaction.tag = tag;

    // Save the updated income transaction
    const updatedIncomeTransaction = await incomeTransaction.save();
    console.log('updateIncomeTransaction: Income transaction updated:', updatedIncomeTransaction._id);

    // Calculate new distribution amounts
    const newNeedsAmount = (parseFloat(amount) * needsPercentage) / 100;
    const newWantsAmount = (parseFloat(amount) * wantsPercentage) / 100;
    const newSavingsAmount = (parseFloat(amount) * savingsPercentage) / 100;

    // Update distribution transactions
    const updatedDistributions = {
      needs: null,
      wants: null,
      savings: null
    };

    // Update needs transaction
    if (incomeTransaction.distributedTransactions && incomeTransaction.distributedTransactions.needs) {
      const needsTransaction = await Transaction.findById(incomeTransaction.distributedTransactions.needs);
      if (needsTransaction) {
        needsTransaction.description = `${description} - Needs Allocation`;
        needsTransaction.amount = newNeedsAmount;
        if (date) needsTransaction.date = new Date(date);
        if (currency) needsTransaction.currency = currency;
        
        const updatedNeedsTransaction = await needsTransaction.save();
        updatedDistributions.needs = updatedNeedsTransaction;
      }
    }

    // Update wants transaction
    if (incomeTransaction.distributedTransactions && incomeTransaction.distributedTransactions.wants) {
      const wantsTransaction = await Transaction.findById(incomeTransaction.distributedTransactions.wants);
      if (wantsTransaction) {
        wantsTransaction.description = `${description} - Wants Allocation`;
        wantsTransaction.amount = newWantsAmount;
        if (date) wantsTransaction.date = new Date(date);
        if (currency) wantsTransaction.currency = currency;
        
        const updatedWantsTransaction = await wantsTransaction.save();
        updatedDistributions.wants = updatedWantsTransaction;
      }
    }

    // Update savings transaction
    if (incomeTransaction.distributedTransactions && incomeTransaction.distributedTransactions.savings) {
      const savingsTransaction = await Transaction.findById(incomeTransaction.distributedTransactions.savings);
      if (savingsTransaction) {
        savingsTransaction.description = `${description} - Savings Allocation`;
        savingsTransaction.amount = newSavingsAmount;
        if (date) savingsTransaction.date = new Date(date);
        if (currency) savingsTransaction.currency = currency;
        
        const updatedSavingsTransaction = await savingsTransaction.save();
        updatedDistributions.savings = updatedSavingsTransaction;
      }
    }

    // If any distribution transactions are missing, create them
    if (!updatedDistributions.needs) {
      const needsTransaction = new Transaction({
        user: userId,
        description: `${description} - Needs Allocation`,
        amount: newNeedsAmount,
        category: incomeTransaction.category,
        transactionType: 'Needs',
        date: incomeTransaction.date,
        currency: incomeTransaction.currency,
        source: 'Distribution',
        isDistribution: true,
        parentTransactionId: incomeTransaction._id,
        isEditable: false
      });
      
      const savedNeedsTransaction = await needsTransaction.save();
      updatedDistributions.needs = savedNeedsTransaction;
      
      // Update the income transaction with the new reference
      incomeTransaction.distributedTransactions.needs = savedNeedsTransaction._id;
      await incomeTransaction.save();
    }

    if (!updatedDistributions.wants) {
      const wantsTransaction = new Transaction({
        user: userId,
        description: `${description} - Wants Allocation`,
        amount: newWantsAmount,
        category: incomeTransaction.category,
        transactionType: 'Wants',
        date: incomeTransaction.date,
        currency: incomeTransaction.currency,
        source: 'Distribution',
        isDistribution: true,
        parentTransactionId: incomeTransaction._id,
        isEditable: false
      });
      
      const savedWantsTransaction = await wantsTransaction.save();
      updatedDistributions.wants = savedWantsTransaction;
      
      // Update the income transaction with the new reference
      incomeTransaction.distributedTransactions.wants = savedWantsTransaction._id;
      await incomeTransaction.save();
    }

    if (!updatedDistributions.savings) {
      const savingsTransaction = new Transaction({
        user: userId,
        description: `${description} - Savings Allocation`,
        amount: newSavingsAmount,
        category: incomeTransaction.category,
        transactionType: 'Savings',
        date: incomeTransaction.date,
        currency: incomeTransaction.currency,
        source: 'Distribution',
        isDistribution: true,
        parentTransactionId: incomeTransaction._id,
        isEditable: false
      });
      
      const savedSavingsTransaction = await savingsTransaction.save();
      updatedDistributions.savings = savedSavingsTransaction;
      
      // Update the income transaction with the new reference
      incomeTransaction.distributedTransactions.savings = savedSavingsTransaction._id;
      await incomeTransaction.save();
    }

    // Update user's budget preferences if they've changed and distribution was provided
    if (distribution && (
      user.budgetPreferences.needs.percentage !== needsPercentage ||
      user.budgetPreferences.wants.percentage !== wantsPercentage ||
      user.budgetPreferences.savings.percentage !== savingsPercentage
    )) {
      user.budgetPreferences = {
        needs: { percentage: needsPercentage },
        wants: { percentage: wantsPercentage },
        savings: { percentage: savingsPercentage }
      };

      await user.save();
      console.log('updateIncomeTransaction: User budget preferences updated');
    }

    // Return success response with all updated transactions
    res.status(200).json({
      success: true,
      message: 'Income transaction and distributions updated successfully',
      data: {
        incomeTransaction: updatedIncomeTransaction,
        distributedTransactions: updatedDistributions
      }
    });
  } catch (err) {
    console.error('Error updating income transaction:', err);
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
