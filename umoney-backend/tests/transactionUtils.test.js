const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { 
  distributeIncome, 
  updateIncomeTransaction, 
  deleteIncomeTransaction 
} = require('../utils/transactionUtils');

// Import test setup
require('./setup');

describe('Transaction Utility Functions', () => {
  let testUser;
  let testCategory;
  
  // Setup test data before each test
  beforeEach(async () => {
    // Create test user
    testUser = new User({
      googleId: 'test-google-id',
      displayName: 'Test User',
      email: 'test@example.com',
      budgetPreferences: {
        needs: { percentage: 50 },
        wants: { percentage: 30 },
        savings: { percentage: 20 }
      }
    });
    await testUser.save();
    
    // Create test categories
    const incomeCategory = new Category({
      user: testUser._id,
      name: 'Salary',
      type: 'Income'
    });
    await incomeCategory.save();
    
    const needsCategory = new Category({
      user: testUser._id,
      name: 'Groceries',
      type: 'Needs'
    });
    await needsCategory.save();
    
    const wantsCategory = new Category({
      user: testUser._id,
      name: 'Entertainment',
      type: 'Wants'
    });
    await wantsCategory.save();
    
    const savingsCategory = new Category({
      user: testUser._id,
      name: 'Emergency Fund',
      type: 'Savings'
    });
    await savingsCategory.save();
    
    testCategory = incomeCategory;
  });
  
  describe('distributeIncome', () => {
    it('should create an income transaction with distributions', async () => {
      const incomeData = {
        description: 'Test Income',
        amount: 1000,
        date: new Date(),
        category: testCategory._id,
        currency: 'USD',
        tag: 'Salary'
      };
      
      const result = await distributeIncome(testUser, incomeData);
      
      // Verify income transaction
      expect(result.incomeTransaction).toBeTruthy();
      expect(result.incomeTransaction.description).toBe('Test Income');
      expect(result.incomeTransaction.amount).toBe(1000);
      expect(result.incomeTransaction.transactionType).toBe('Income');
      
      // Verify distribution transactions
      expect(result.distributedTransactions.needs).toBeTruthy();
      expect(result.distributedTransactions.wants).toBeTruthy();
      expect(result.distributedTransactions.savings).toBeTruthy();
      
      // Verify distribution amounts
      expect(result.distributedTransactions.needs.amount).toBe(500); // 50% of 1000
      expect(result.distributedTransactions.wants.amount).toBe(300); // 30% of 1000
      expect(result.distributedTransactions.savings.amount).toBe(200); // 20% of 1000
      
      // Verify parent-child relationships
      expect(result.distributedTransactions.needs.parentTransactionId.toString()).toBe(result.incomeTransaction._id.toString());
      expect(result.distributedTransactions.wants.parentTransactionId.toString()).toBe(result.incomeTransaction._id.toString());
      expect(result.distributedTransactions.savings.parentTransactionId.toString()).toBe(result.incomeTransaction._id.toString());
      
      // Verify distribution flags
      expect(result.distributedTransactions.needs.isDistribution).toBe(true);
      expect(result.distributedTransactions.needs.isEditable).toBe(false);
      expect(result.distributedTransactions.wants.isDistribution).toBe(true);
      expect(result.distributedTransactions.wants.isEditable).toBe(false);
      expect(result.distributedTransactions.savings.isDistribution).toBe(true);
      expect(result.distributedTransactions.savings.isEditable).toBe(false);
    });
    
    it('should handle zero amount income', async () => {
      const incomeData = {
        description: 'Zero Income',
        amount: 0,
        date: new Date(),
        category: testCategory._id
      };
      
      await expect(distributeIncome(testUser, incomeData)).rejects.toThrow();
    });
    
    it('should handle negative amount income', async () => {
      const incomeData = {
        description: 'Negative Income',
        amount: -100,
        date: new Date(),
        category: testCategory._id
      };
      
      await expect(distributeIncome(testUser, incomeData)).rejects.toThrow();
    });
    
    it('should handle custom budget preferences', async () => {
      // Create user with custom budget preferences
      const customUser = new User({
        googleId: 'custom-google-id',
        displayName: 'Custom User',
        email: 'custom@example.com',
        budgetPreferences: {
          needs: { percentage: 60 },
          wants: { percentage: 20 },
          savings: { percentage: 20 }
        }
      });
      await customUser.save();
      
      const incomeData = {
        description: 'Custom Income',
        amount: 1000,
        date: new Date(),
        category: testCategory._id
      };
      
      const result = await distributeIncome(customUser, incomeData);
      
      // Verify custom distribution amounts
      expect(result.distributedTransactions.needs.amount).toBe(600); // 60% of 1000
      expect(result.distributedTransactions.wants.amount).toBe(200); // 20% of 1000
      expect(result.distributedTransactions.savings.amount).toBe(200); // 20% of 1000
    });
  });
  
  describe('updateIncomeTransaction', () => {
    it('should update an income transaction and its distributions', async () => {
      // First create an income transaction
      const incomeData = {
        description: 'Test Income',
        amount: 1000,
        date: new Date(),
        category: testCategory._id,
        currency: 'USD'
      };
      
      const createResult = await distributeIncome(testUser, incomeData);
      const incomeId = createResult.incomeTransaction._id;
      
      // Now update it
      const updateData = {
        description: 'Updated Income',
        amount: 2000 // Double the amount
      };
      
      const result = await updateIncomeTransaction(incomeId, updateData);
      
      // Verify income transaction updates
      expect(result.incomeTransaction.description).toBe('Updated Income');
      expect(result.incomeTransaction.amount).toBe(2000);
      
      // Verify distribution updates
      expect(result.distributionTransactions.length).toBe(3);
      
      // Find the updated distribution transactions
      const updatedNeeds = result.distributionTransactions.find(t => t.transactionType === 'Needs');
      const updatedWants = result.distributionTransactions.find(t => t.transactionType === 'Wants');
      const updatedSavings = result.distributionTransactions.find(t => t.transactionType === 'Savings');
      
      // Verify updated distribution amounts
      expect(updatedNeeds.amount).toBe(1000); // 50% of 2000
      expect(updatedWants.amount).toBe(600); // 30% of 2000
      expect(updatedSavings.amount).toBe(400); // 20% of 2000
      
      // Verify description updates
      expect(updatedNeeds.description).toBe('Updated Income - Needs Allocation');
      expect(updatedWants.description).toBe('Updated Income - Wants Allocation');
      expect(updatedSavings.description).toBe('Updated Income - Savings Allocation');
    });
    
    it('should handle non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(updateIncomeTransaction(fakeId, { amount: 1000 })).rejects.toThrow('Transaction not found');
    });
    
    it('should handle non-income transaction', async () => {
      // Create a non-income transaction
      const expenseTransaction = new Transaction({
        user: testUser._id,
        description: 'Test Expense',
        amount: 100,
        transactionType: 'Needs',
        category: testCategory._id,
        recipient: {
          name: 'Test Recipient',
          type: 'merchant'
        }
      });
      await expenseTransaction.save();
      
      await expect(updateIncomeTransaction(expenseTransaction._id, { amount: 200 }))
        .rejects.toThrow('Transaction is not an income transaction');
    });
  });
  
  describe('deleteIncomeTransaction', () => {
    it('should delete an income transaction and its distributions', async () => {
      // First create an income transaction
      const incomeData = {
        description: 'Test Income',
        amount: 1000,
        date: new Date(),
        category: testCategory._id
      };
      
      const createResult = await distributeIncome(testUser, incomeData);
      const incomeId = createResult.incomeTransaction._id;
      const needsId = createResult.distributedTransactions.needs._id;
      const wantsId = createResult.distributedTransactions.wants._id;
      const savingsId = createResult.distributedTransactions.savings._id;
      
      // Now delete it
      const result = await deleteIncomeTransaction(incomeId);
      expect(result).toBe(true);
      
      // Verify income transaction is deleted
      const deletedIncome = await Transaction.findById(incomeId);
      expect(deletedIncome).toBeNull();
      
      // Verify distribution transactions are deleted
      const deletedNeeds = await Transaction.findById(needsId);
      const deletedWants = await Transaction.findById(wantsId);
      const deletedSavings = await Transaction.findById(savingsId);
      
      expect(deletedNeeds).toBeNull();
      expect(deletedWants).toBeNull();
      expect(deletedSavings).toBeNull();
    });
    
    it('should handle non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(deleteIncomeTransaction(fakeId)).rejects.toThrow('Transaction not found');
    });
  });
});
