/**
 * Utility functions for transaction operations
 */

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

/**
 * Distribute income according to budget preferences
 * @param {Object} user - User object with budget preferences
 * @param {Object} incomeData - The income transaction data
 * @returns {Promise<Object>} - Object containing the created transactions
 */
const distributeIncome = async (user, incomeData) => {
  try {
    const { amount, description, date, currency, category, tag, notes, attachments = [] } = incomeData;

    // Get budget preferences
    const budgetPreferences = user.budgetPreferences || {
      needs: { percentage: 50 },
      wants: { percentage: 30 },
      savings: { percentage: 20 }
    };

    // Create the main income transaction
    const incomeTransaction = new Transaction({
      user: user._id,
      description,
      amount,
      category,
      transactionType: 'Income',
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      attachments,
      notes,
      tag,
      source: 'Manual',
      recipient: {
        name: description || 'Income Source',
        type: 'merchant',
        details: ''
      }
    });

    // Save the income transaction
    await incomeTransaction.save();

    // Calculate amounts based on percentages
    const needsAmount = (amount * budgetPreferences.needs.percentage) / 100;
    const wantsAmount = (amount * budgetPreferences.wants.percentage) / 100;
    const savingsAmount = (amount * budgetPreferences.savings.percentage) / 100;

    // Find default categories for each type
    const findOrCreateCategory = async (type) => {
      let category = await Category.findOne({ user: user._id, type });

      if (!category) {
        // Create a default category if none exists
        category = new Category({
          user: user._id,
          name: `Default ${type}`,
          type,
          icon: 'pi pi-wallet',
          color: type === 'Needs' ? '#42A5F5' : type === 'Wants' ? '#66BB6A' : '#FFA726'
        });
        await category.save();
      }

      return category._id;
    };

    // Get or create categories
    const needsCategory = await findOrCreateCategory('Needs');
    const wantsCategory = await findOrCreateCategory('Wants');
    const savingsCategory = await findOrCreateCategory('Savings');

    // Create transactions for each category
    const needsTransaction = new Transaction({
      user: user._id,
      description: `${description} - Needs Allocation`,
      amount: needsAmount,
      category: needsCategory,
      transactionType: 'Needs',
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution', // Changed from 'Manual' to 'Distribution'
      recipient: {
        name: 'Income Distribution',
        type: 'merchant',
        details: 'Auto-allocated from Income'
      },
      parentTransactionId: incomeTransaction._id, // Link to parent transaction
      isDistribution: true, // Mark as a distribution transaction
      isEditable: false // Mark as not directly editable
    });

    const wantsTransaction = new Transaction({
      user: user._id,
      description: `${description} - Wants Allocation`,
      amount: wantsAmount,
      category: wantsCategory,
      transactionType: 'Wants',
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution', // Changed from 'Manual' to 'Distribution'
      recipient: {
        name: 'Income Distribution',
        type: 'merchant',
        details: 'Auto-allocated from Income'
      },
      parentTransactionId: incomeTransaction._id, // Link to parent transaction
      isDistribution: true, // Mark as a distribution transaction
      isEditable: false // Mark as not directly editable
    });

    const savingsTransaction = new Transaction({
      user: user._id,
      description: `${description} - Savings Allocation`,
      amount: savingsAmount,
      category: savingsCategory,
      transactionType: 'Savings',
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution', // Changed from 'Manual' to 'Distribution'
      recipient: {
        name: 'Income Distribution',
        type: 'merchant',
        details: 'Auto-allocated from Income'
      },
      parentTransactionId: incomeTransaction._id, // Link to parent transaction
      isDistribution: true, // Mark as a distribution transaction
      isEditable: false // Mark as not directly editable
    });

    // Save all transactions
    await Promise.all([
      needsTransaction.save(),
      wantsTransaction.save(),
      savingsTransaction.save()
    ]);

    // Return all created transactions
    return {
      incomeTransaction,
      distributedTransactions: {
        needs: needsTransaction,
        wants: wantsTransaction,
        savings: savingsTransaction
      }
    };
  } catch (error) {
    console.error('Error distributing income:', error);
    throw error;
  }
};

/**
 * Add an expense transaction
 * @param {Object} user - User object
 * @param {Object} expenseData - The expense transaction data
 * @returns {Promise<Object>} - The created transaction
 */
const addExpense = async (user, expenseData) => {
  try {
    const { amount, description, date, currency, category, tag, notes, attachments = [], recipient, transactionType } = expenseData;

    // Validate transaction type
    if (!['Needs', 'Wants', 'Savings'].includes(transactionType)) {
      throw new Error('Invalid transaction type. Must be one of: Needs, Wants, Savings');
    }

    // Create the expense transaction
    const expenseTransaction = new Transaction({
      user: user._id,
      description,
      amount,
      category,
      transactionType,
      recipient,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      attachments,
      notes,
      tag,
      source: 'Manual'
    });

    // Save the transaction
    await expenseTransaction.save();

    // Update user's frequent recipients if provided
    if (recipient && recipient.name) {
      try {
        // Check if recipient already exists
        const existingIndex = user.frequentRecipients.findIndex(
          r => r.name === recipient.name && r.type === recipient.type
        );

        if (existingIndex !== -1) {
          // Update existing recipient
          user.frequentRecipients[existingIndex].frequency += 1;
        } else {
          // Add new recipient
          user.frequentRecipients.push({
            name: recipient.name,
            type: recipient.type,
            details: recipient.details || '',
            frequency: 1
          });
        }

        await user.save();
      } catch (err) {
        console.error('Error updating frequent recipients:', err);
        // Don't fail the transaction if this fails
      }
    }

    return expenseTransaction;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Get transaction summary for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} - Summary object with balances for each ledger
 */
const getTransactionSummary = async (userId) => {
  try {
    // Get all transactions for the user
    const transactions = await Transaction.find({ user: userId });

    // Initialize summary object
    const summary = {
      income: { in: 0, out: 0, hold: 0 },
      needs: { in: 0, out: 0, hold: 0 },
      wants: { in: 0, out: 0, hold: 0 },
      savings: { in: 0, out: 0, hold: 0 }
    };

    // Process each transaction
    transactions.forEach(transaction => {
      const type = transaction.transactionType.toLowerCase();

      if (type === 'income') {
        // Income transactions are inflows to the income ledger
        summary.income.in += transaction.amount;
      } else {
        // For distributed income, it's an outflow from income and inflow to the respective ledger
        if (transaction.tag === 'Income Distribution') {
          summary[type].in += transaction.amount;
        } else {
          // Regular expense is an outflow from the respective ledger
          summary[type].out += transaction.amount;
        }
      }
    });

    // Calculate hold values (remaining balance)
    summary.income.hold = summary.income.in - summary.income.out;
    summary.needs.hold = summary.needs.in - summary.needs.out;
    summary.wants.hold = summary.wants.in - summary.wants.out;
    summary.savings.hold = summary.savings.in - summary.savings.out;

    return summary;
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    throw error;
  }
};

/**
 * Update an income transaction and its distributions
 * @param {ObjectId} transactionId - ID of the income transaction to update
 * @param {Object} updateData - New data for the income transaction
 * @returns {Promise<Object>} - Updated transactions
 */
const updateIncomeTransaction = async (transactionId, updateData) => {
  try {
    // Find the income transaction
    const incomeTransaction = await Transaction.findById(transactionId);

    if (!incomeTransaction) {
      throw new Error('Transaction not found');
    }

    if (incomeTransaction.transactionType !== 'Income') {
      throw new Error('Transaction is not an income transaction');
    }

    // Get the user for budget preferences
    const user = await User.findById(incomeTransaction.user);

    // Get budget preferences
    const budgetPreferences = user.budgetPreferences || {
      needs: { percentage: 50 },
      wants: { percentage: 30 },
      savings: { percentage: 20 }
    };

    // Update the income transaction
    const oldAmount = incomeTransaction.amount;
    const newAmount = updateData.amount !== undefined ? parseFloat(updateData.amount) : oldAmount;

    // Apply updates to income transaction
    Object.keys(updateData).forEach(key => {
      incomeTransaction[key] = updateData[key];
    });

    // Save the updated income transaction
    await incomeTransaction.save();

    // Find all distribution transactions linked to this income transaction
    const distributionTransactions = await Transaction.find({
      parentTransactionId: transactionId,
      isDistribution: true
    });

    if (distributionTransactions.length === 0) {
      // No distribution transactions found, possibly an old transaction
      // Consider creating new distributions here
      return { incomeTransaction, distributionTransactions: [] };
    }

    // Calculate new distribution amounts
    const needsAmount = (newAmount * budgetPreferences.needs.percentage) / 100;
    const wantsAmount = (newAmount * budgetPreferences.wants.percentage) / 100;
    const savingsAmount = (newAmount * budgetPreferences.savings.percentage) / 100;

    // Update each distribution transaction
    const updatedDistributions = [];

    for (const transaction of distributionTransactions) {
      // Determine the new amount based on transaction type
      let newDistributionAmount;

      if (transaction.transactionType === 'Needs') {
        newDistributionAmount = needsAmount;
      } else if (transaction.transactionType === 'Wants') {
        newDistributionAmount = wantsAmount;
      } else if (transaction.transactionType === 'Savings') {
        newDistributionAmount = savingsAmount;
      }

      // Update description if it changed
      if (updateData.description) {
        transaction.description = `${updateData.description} - ${transaction.transactionType} Allocation`;
      }

      // Update amount
      transaction.amount = newDistributionAmount;

      // Update date if it changed
      if (updateData.date) {
        transaction.date = updateData.date;
      }

      // Update currency if it changed
      if (updateData.currency) {
        transaction.currency = updateData.currency;
      }

      // Save the updated transaction
      await transaction.save();
      updatedDistributions.push(transaction);
    }

    return {
      incomeTransaction,
      distributionTransactions: updatedDistributions
    };
  } catch (error) {
    console.error('Error updating income transaction:', error);
    throw error;
  }
};

/**
 * Delete an income transaction and its distributions
 * @param {ObjectId} transactionId - ID of the income transaction to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteIncomeTransaction = async (transactionId) => {
  try {
    // Find the income transaction
    const incomeTransaction = await Transaction.findById(transactionId);

    if (!incomeTransaction) {
      throw new Error('Transaction not found');
    }

    if (incomeTransaction.transactionType !== 'Income') {
      throw new Error('Transaction is not an income transaction');
    }

    // Find all distribution transactions linked to this income transaction
    const distributionTransactions = await Transaction.find({
      parentTransactionId: transactionId,
      isDistribution: true
    });

    // Delete all distribution transactions
    for (const transaction of distributionTransactions) {
      await Transaction.deleteOne({ _id: transaction._id });
    }

    // Delete the income transaction
    await Transaction.deleteOne({ _id: incomeTransaction._id });

    return true;
  } catch (error) {
    console.error('Error deleting income transaction:', error);
    throw error;
  }
};

module.exports = {
  distributeIncome,
  addExpense,
  getTransactionSummary,
  updateIncomeTransaction,
  deleteIncomeTransaction
};
