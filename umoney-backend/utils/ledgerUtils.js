const Ledger = require('../models/Ledger');
const LedgerTransaction = require('../models/LedgerTransaction');
const Category = require('../models/Category');
const User = require('../models/User');

/**
 * Get or create a ledger for a user
 * @param {ObjectId} userId - User ID
 * @param {string} ledgerType - Type of ledger (Income, Needs, Wants, Savings)
 * @param {string} currency - Currency of the ledger
 * @returns {Promise<Object>} - The ledger object
 */
const getOrCreateLedger = async (userId, ledgerType, currency = 'INR') => {
  try {
    // Check if ledger exists
    let ledger = await Ledger.findOne({ userId, type: ledgerType });

    // If ledger doesn't exist, create it
    if (!ledger) {
      ledger = new Ledger({
        userId,
        type: ledgerType,
        balance: 0,
        currency
      });
      await ledger.save();
    }

    return ledger;
  } catch (error) {
    console.error(`Error getting or creating ${ledgerType} ledger:`, error);
    throw error;
  }
};

/**
 * Get all ledgers for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} - Array of ledger objects
 */
const getUserLedgers = async (userId) => {
  try {
    const ledgers = await Ledger.find({ userId });
    return ledgers;
  } catch (error) {
    console.error('Error getting user ledgers:', error);
    throw error;
  }
};

/**
 * Add a transaction to a ledger
 * @param {ObjectId} ledgerId - Ledger ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} - The created transaction
 */
const addLedgerTransaction = async (ledgerId, transactionData) => {
  try {
    // Create the transaction
    const transaction = new LedgerTransaction({
      ledgerId,
      ...transactionData
    });

    // Save the transaction
    await transaction.save();

    // Update ledger balance
    const ledger = await Ledger.findById(ledgerId);
    if (transactionData.transactionType === 'Income') {
      ledger.balance += transactionData.amount;
    } else if (transactionData.transactionType === 'Expense') {
      ledger.balance -= transactionData.amount;
    }
    await ledger.save();

    return transaction;
  } catch (error) {
    console.error('Error adding ledger transaction:', error);
    throw error;
  }
};

/**
 * Distribute income across ledgers
 * @param {ObjectId} userId - User ID
 * @param {Object} incomeData - Income transaction data
 * @returns {Promise<Object>} - Object containing all created transactions
 */
const distributeIncome = async (userId, incomeData) => {
  try {
    const { amount, description, date, currency, category, tag, notes, attachments = [] } = incomeData;

    // Get user for budget preferences
    const user = await User.findById(userId);
    const budgetPreferences = user.budgetPreferences || {
      needs: { percentage: 50 },
      wants: { percentage: 30 },
      savings: { percentage: 20 }
    };

    // Get or create ledgers
    const incomeLedger = await getOrCreateLedger(userId, 'Income', currency);
    const needsLedger = await getOrCreateLedger(userId, 'Needs', currency);
    const wantsLedger = await getOrCreateLedger(userId, 'Wants', currency);
    const savingsLedger = await getOrCreateLedger(userId, 'Savings', currency);

    // Find or create a default income category if not provided
    let categoryId = category;
    if (!categoryId) {
      let incomeCategory = await Category.findOne({ user: userId, type: 'Income' });
      if (!incomeCategory) {
        // Create a default income category
        incomeCategory = new Category({
          user: userId,
          name: 'Income',
          type: 'Income',
          icon: 'pi pi-dollar',
          color: '#4CAF50'
        });
        await incomeCategory.save();
      }
      categoryId = incomeCategory._id;
    }

    // Create income transaction
    const incomeTransaction = await addLedgerTransaction(incomeLedger._id, {
      description,
      amount,
      category: categoryId,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      attachments,
      notes,
      tag,
      source: 'Manual',
      transactionType: 'Income'
    });

    // Calculate distribution amounts
    const needsAmount = (amount * budgetPreferences.needs.percentage) / 100;
    const wantsAmount = (amount * budgetPreferences.wants.percentage) / 100;
    const savingsAmount = (amount * budgetPreferences.savings.percentage) / 100;

    // Get or create categories for each ledger type
    const findOrCreateCategory = async (type) => {
      let category = await Category.findOne({ user: userId, type });
      if (!category) {
        category = new Category({
          user: userId,
          name: type,
          type,
          icon: type === 'Needs' ? 'pi pi-home' : type === 'Wants' ? 'pi pi-shopping-cart' : 'pi pi-piggy-bank',
          color: type === 'Needs' ? '#2196F3' : type === 'Wants' ? '#FF9800' : '#4CAF50'
        });
        await category.save();
      }
      return category._id;
    };

    const needsCategory = await findOrCreateCategory('Needs');
    const wantsCategory = await findOrCreateCategory('Wants');
    const savingsCategory = await findOrCreateCategory('Savings');

    // Create distribution transactions
    const needsTransaction = await addLedgerTransaction(needsLedger._id, {
      description: `${description} - Needs Allocation`,
      amount: needsAmount,
      category: needsCategory,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution',
      transactionType: 'Income',
      relatedTransactionId: incomeTransaction._id
    });

    const wantsTransaction = await addLedgerTransaction(wantsLedger._id, {
      description: `${description} - Wants Allocation`,
      amount: wantsAmount,
      category: wantsCategory,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution',
      transactionType: 'Income',
      relatedTransactionId: incomeTransaction._id
    });

    const savingsTransaction = await addLedgerTransaction(savingsLedger._id, {
      description: `${description} - Savings Allocation`,
      amount: savingsAmount,
      category: savingsCategory,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Auto-allocated from Income',
      tag: 'Income Distribution',
      source: 'Distribution',
      transactionType: 'Income',
      relatedTransactionId: incomeTransaction._id
    });

    // Create expense transaction in income ledger to balance the books
    const distributionExpense = await addLedgerTransaction(incomeLedger._id, {
      description: `${description} - Distribution`,
      amount: amount,
      category: categoryId,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      notes: 'Distribution to Needs, Wants, and Savings',
      tag: 'Income Distribution',
      source: 'Distribution',
      transactionType: 'Expense',
      relatedTransactionId: incomeTransaction._id
    });

    // Return all created transactions
    return {
      incomeTransaction,
      distributionExpense,
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
 * Add an expense transaction to a ledger
 * @param {ObjectId} userId - User ID
 * @param {Object} expenseData - Expense transaction data
 * @returns {Promise<Object>} - The created transaction
 */
const addExpense = async (userId, expenseData) => {
  try {
    const { amount, description, date, currency, category, tag, notes, attachments = [], recipient, transactionType } = expenseData;

    // Validate transaction type
    if (!['Needs', 'Wants', 'Savings'].includes(transactionType)) {
      throw new Error('Invalid transaction type. Must be one of: Needs, Wants, Savings');
    }

    // Get user for currency preference
    const user = await User.findById(userId);

    // Get or create the appropriate ledger
    const ledger = await getOrCreateLedger(userId, transactionType, currency || user.preferredCurrency || 'INR');

    // Create the expense transaction
    const transaction = await addLedgerTransaction(ledger._id, {
      description,
      amount,
      category,
      recipient,
      date: date || new Date(),
      currency: currency || user.preferredCurrency || 'INR',
      attachments,
      notes,
      tag,
      source: 'Manual',
      transactionType: 'Expense'
    });

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

    return transaction;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Get transactions for a ledger
 * @param {ObjectId} ledgerId - Ledger ID
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} - Array of transactions
 */
const getLedgerTransactions = async (ledgerId, filters = {}) => {
  try {
    let query = { ledgerId };

    // Apply date filters if provided
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    // Apply category filter if provided
    if (filters.category) {
      query.category = filters.category;
    }

    // Apply search filter if provided
    if (filters.search) {
      query.description = { $regex: filters.search, $options: 'i' };
    }

    // Get transactions
    let transactionsQuery = LedgerTransaction.find(query)
      .populate('category', ['name', 'type'])
      .sort({ date: -1 });

    // Apply limit if provided
    if (filters.limit) {
      transactionsQuery = transactionsQuery.limit(parseInt(filters.limit));
    }

    const transactions = await transactionsQuery.exec();
    return transactions;
  } catch (error) {
    console.error('Error getting ledger transactions:', error);
    throw error;
  }
};

/**
 * Get transaction summary for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} - Summary object with balances for each ledger
 */
const getLedgerSummary = async (userId) => {
  try {
    // Get all ledgers for the user
    const ledgers = await Ledger.find({ userId });

    // Initialize summary object
    const summary = {
      income: { in: 0, out: 0, hold: 0 },
      needs: { in: 0, out: 0, hold: 0 },
      wants: { in: 0, out: 0, hold: 0 },
      savings: { in: 0, out: 0, hold: 0 }
    };

    // Process each ledger
    for (const ledger of ledgers) {
      const type = ledger.type.toLowerCase();
      
      // Get all transactions for this ledger
      const transactions = await LedgerTransaction.find({ ledgerId: ledger._id });
      
      // Calculate in and out
      let inAmount = 0;
      let outAmount = 0;
      
      transactions.forEach(transaction => {
        if (transaction.transactionType === 'Income') {
          inAmount += transaction.amount;
        } else if (transaction.transactionType === 'Expense') {
          outAmount += transaction.amount;
        }
      });
      
      // Update summary
      summary[type].in = inAmount;
      summary[type].out = outAmount;
      summary[type].hold = inAmount - outAmount;
    }

    return summary;
  } catch (error) {
    console.error('Error getting ledger summary:', error);
    throw error;
  }
};

module.exports = {
  getOrCreateLedger,
  getUserLedgers,
  addLedgerTransaction,
  distributeIncome,
  addExpense,
  getLedgerTransactions,
  getLedgerSummary
};
