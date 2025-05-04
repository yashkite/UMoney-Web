require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const LedgerTransaction = require('../models/LedgerTransaction');
const Category = require('../models/Category');
const ledgerUtils = require('../utils/ledgerUtils');

/**
 * Script to migrate data from the old transaction structure to the new ledger structure
 */
async function migrateToLedgers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Process each user
    for (const user of users) {
      console.log(`\nMigrating data for user: ${user.email || user.displayName || user._id}`);

      // Create ledgers for the user
      const incomeLedger = await ledgerUtils.getOrCreateLedger(user._id, 'Income', user.preferredCurrency || 'INR');
      const needsLedger = await ledgerUtils.getOrCreateLedger(user._id, 'Needs', user.preferredCurrency || 'INR');
      const wantsLedger = await ledgerUtils.getOrCreateLedger(user._id, 'Wants', user.preferredCurrency || 'INR');
      const savingsLedger = await ledgerUtils.getOrCreateLedger(user._id, 'Savings', user.preferredCurrency || 'INR');

      console.log('Created ledgers for user');

      // Get all transactions for the user
      const transactions = await Transaction.find({ user: user._id }).populate('category');
      console.log(`Found ${transactions.length} transactions to migrate`);

      // Group transactions by type
      const incomeTransactions = transactions.filter(t => t.transactionType === 'Income');
      const needsTransactions = transactions.filter(t => t.category && t.category.type === 'Needs');
      const wantsTransactions = transactions.filter(t => t.category && t.category.type === 'Wants');
      const savingsTransactions = transactions.filter(t => t.category && t.category.type === 'Savings');

      console.log(`Income: ${incomeTransactions.length}, Needs: ${needsTransactions.length}, Wants: ${wantsTransactions.length}, Savings: ${savingsTransactions.length}`);

      // Migrate income transactions
      for (const transaction of incomeTransactions) {
        try {
          // Create income transaction in income ledger
          const ledgerTransaction = new LedgerTransaction({
            ledgerId: incomeLedger._id,
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            currency: transaction.currency || user.preferredCurrency || 'INR',
            attachments: transaction.attachments || [],
            notes: transaction.notes || '',
            tag: transaction.tag || '',
            source: transaction.source || 'Manual',
            transactionType: 'Income'
          });

          await ledgerTransaction.save();

          // Update income ledger balance
          incomeLedger.balance += transaction.amount;
          await incomeLedger.save();

          // Check if this income was distributed
          const distributedTransactions = transactions.filter(t => 
            t.tag === 'Income Distribution' && 
            t.relatedTransactionId && 
            t.relatedTransactionId.toString() === transaction._id.toString()
          );

          if (distributedTransactions.length > 0) {
            // Create distribution expense in income ledger
            const distributionExpense = new LedgerTransaction({
              ledgerId: incomeLedger._id,
              description: `${transaction.description} - Distribution`,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
              currency: transaction.currency || user.preferredCurrency || 'INR',
              notes: 'Distribution to Needs, Wants, and Savings',
              tag: 'Income Distribution',
              source: 'Distribution',
              transactionType: 'Expense',
              relatedTransactionId: ledgerTransaction._id
            });

            await distributionExpense.save();

            // Update income ledger balance
            incomeLedger.balance -= transaction.amount;
            await incomeLedger.save();

            // Find the distributed transactions for each category
            const needsDistribution = distributedTransactions.find(t => t.category && t.category.type === 'Needs');
            const wantsDistribution = distributedTransactions.find(t => t.category && t.category.type === 'Wants');
            const savingsDistribution = distributedTransactions.find(t => t.category && t.category.type === 'Savings');

            // Create distributed transactions in respective ledgers
            if (needsDistribution) {
              const needsTransaction = new LedgerTransaction({
                ledgerId: needsLedger._id,
                description: `${transaction.description} - Needs Allocation`,
                amount: needsDistribution.amount,
                category: needsDistribution.category,
                date: transaction.date,
                currency: transaction.currency || user.preferredCurrency || 'INR',
                notes: 'Auto-allocated from Income',
                tag: 'Income Distribution',
                source: 'Distribution',
                transactionType: 'Income',
                relatedTransactionId: ledgerTransaction._id
              });

              await needsTransaction.save();

              // Update needs ledger balance
              needsLedger.balance += needsDistribution.amount;
              await needsLedger.save();
            }

            if (wantsDistribution) {
              const wantsTransaction = new LedgerTransaction({
                ledgerId: wantsLedger._id,
                description: `${transaction.description} - Wants Allocation`,
                amount: wantsDistribution.amount,
                category: wantsDistribution.category,
                date: transaction.date,
                currency: transaction.currency || user.preferredCurrency || 'INR',
                notes: 'Auto-allocated from Income',
                tag: 'Income Distribution',
                source: 'Distribution',
                transactionType: 'Income',
                relatedTransactionId: ledgerTransaction._id
              });

              await wantsTransaction.save();

              // Update wants ledger balance
              wantsLedger.balance += wantsDistribution.amount;
              await wantsLedger.save();
            }

            if (savingsDistribution) {
              const savingsTransaction = new LedgerTransaction({
                ledgerId: savingsLedger._id,
                description: `${transaction.description} - Savings Allocation`,
                amount: savingsDistribution.amount,
                category: savingsDistribution.category,
                date: transaction.date,
                currency: transaction.currency || user.preferredCurrency || 'INR',
                notes: 'Auto-allocated from Income',
                tag: 'Income Distribution',
                source: 'Distribution',
                transactionType: 'Income',
                relatedTransactionId: ledgerTransaction._id
              });

              await savingsTransaction.save();

              // Update savings ledger balance
              savingsLedger.balance += savingsDistribution.amount;
              await savingsLedger.save();
            }
          }
        } catch (error) {
          console.error(`Error migrating income transaction ${transaction._id}:`, error);
        }
      }

      // Migrate needs transactions
      for (const transaction of needsTransactions) {
        if (transaction.tag === 'Income Distribution') {
          // Skip distribution transactions as they were handled above
          continue;
        }

        try {
          const ledgerTransaction = new LedgerTransaction({
            ledgerId: needsLedger._id,
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            recipient: transaction.recipient,
            date: transaction.date,
            currency: transaction.currency || user.preferredCurrency || 'INR',
            attachments: transaction.attachments || [],
            notes: transaction.notes || '',
            tag: transaction.tag || '',
            source: transaction.source || 'Manual',
            transactionType: 'Expense'
          });

          await ledgerTransaction.save();

          // Update needs ledger balance
          needsLedger.balance -= transaction.amount;
          await needsLedger.save();
        } catch (error) {
          console.error(`Error migrating needs transaction ${transaction._id}:`, error);
        }
      }

      // Migrate wants transactions
      for (const transaction of wantsTransactions) {
        if (transaction.tag === 'Income Distribution') {
          // Skip distribution transactions as they were handled above
          continue;
        }

        try {
          const ledgerTransaction = new LedgerTransaction({
            ledgerId: wantsLedger._id,
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            recipient: transaction.recipient,
            date: transaction.date,
            currency: transaction.currency || user.preferredCurrency || 'INR',
            attachments: transaction.attachments || [],
            notes: transaction.notes || '',
            tag: transaction.tag || '',
            source: transaction.source || 'Manual',
            transactionType: 'Expense'
          });

          await ledgerTransaction.save();

          // Update wants ledger balance
          wantsLedger.balance -= transaction.amount;
          await wantsLedger.save();
        } catch (error) {
          console.error(`Error migrating wants transaction ${transaction._id}:`, error);
        }
      }

      // Migrate savings transactions
      for (const transaction of savingsTransactions) {
        if (transaction.tag === 'Income Distribution') {
          // Skip distribution transactions as they were handled above
          continue;
        }

        try {
          const ledgerTransaction = new LedgerTransaction({
            ledgerId: savingsLedger._id,
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            recipient: transaction.recipient,
            date: transaction.date,
            currency: transaction.currency || user.preferredCurrency || 'INR',
            attachments: transaction.attachments || [],
            notes: transaction.notes || '',
            tag: transaction.tag || '',
            source: transaction.source || 'Manual',
            transactionType: 'Expense'
          });

          await ledgerTransaction.save();

          // Update savings ledger balance
          savingsLedger.balance -= transaction.amount;
          await savingsLedger.save();
        } catch (error) {
          console.error(`Error migrating savings transaction ${transaction._id}:`, error);
        }
      }

      console.log(`Completed migration for user: ${user.email || user.displayName || user._id}`);
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateToLedgers();
