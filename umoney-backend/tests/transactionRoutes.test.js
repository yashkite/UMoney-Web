const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

// Import test setup
require('./setup');

describe('Transaction API Routes', () => {
  let testUser;
  let testCategory;
  let authToken;
  
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
    
    testCategory = incomeCategory;
    
    // Create auth token
    authToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });
  
  describe('POST /api/transactions/income', () => {
    it('should create an income transaction with distributions', async () => {
      const response = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id,
          date: new Date(),
          currency: 'USD'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.incomeTransaction).toBeTruthy();
      expect(response.body.data.distributedTransactions).toBeTruthy();
      
      // Verify income transaction
      expect(response.body.data.incomeTransaction.description).toBe('Test Income');
      expect(response.body.data.incomeTransaction.amount).toBe(1000);
      
      // Verify distribution transactions
      expect(response.body.data.distributedTransactions.needs.amount).toBe(500);
      expect(response.body.data.distributedTransactions.wants.amount).toBe(300);
      expect(response.body.data.distributedTransactions.savings.amount).toBe(200);
    });
    
    it('should return 400 for invalid income data', async () => {
      const response = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing description
          amount: 1000,
          category: testCategory._id
        });
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 for unauthorized request', async () => {
      const response = await request(app)
        .post('/api/transactions/income')
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/transactions/:id', () => {
    it('should update an income transaction and its distributions', async () => {
      // First create an income transaction
      const createResponse = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      const incomeId = createResponse.body.data.incomeTransaction._id;
      
      // Now update it
      const updateResponse = await request(app)
        .put(`/api/transactions/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Income',
          amount: 2000
        });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.incomeTransaction.description).toBe('Updated Income');
      expect(updateResponse.body.data.incomeTransaction.amount).toBe(2000);
      
      // Verify distribution updates
      const distributionTransactions = updateResponse.body.data.distributionTransactions;
      expect(distributionTransactions.length).toBe(3);
      
      // Find the updated distribution transactions
      const updatedNeeds = distributionTransactions.find(t => t.transactionType === 'Needs');
      const updatedWants = distributionTransactions.find(t => t.transactionType === 'Wants');
      const updatedSavings = distributionTransactions.find(t => t.transactionType === 'Savings');
      
      expect(updatedNeeds.amount).toBe(1000); // 50% of 2000
      expect(updatedWants.amount).toBe(600); // 30% of 2000
      expect(updatedSavings.amount).toBe(400); // 20% of 2000
    });
    
    it('should prevent editing distribution transactions', async () => {
      // First create an income transaction
      const createResponse = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      const needsId = createResponse.body.data.distributedTransactions.needs._id;
      
      // Try to update a distribution transaction
      const updateResponse = await request(app)
        .put(`/api/transactions/${needsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Distribution',
          amount: 600
        });
      
      expect(updateResponse.status).toBe(403);
      expect(updateResponse.body.msg).toContain('cannot be directly edited');
    });
  });
  
  describe('DELETE /api/transactions/:id', () => {
    it('should delete an income transaction and its distributions', async () => {
      // First create an income transaction
      const createResponse = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      const incomeId = createResponse.body.data.incomeTransaction._id;
      const needsId = createResponse.body.data.distributedTransactions.needs._id;
      
      // Now delete it
      const deleteResponse = await request(app)
        .delete(`/api/transactions/${incomeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted successfully');
      
      // Verify income transaction is deleted
      const incomeCheck = await Transaction.findById(incomeId);
      expect(incomeCheck).toBeNull();
      
      // Verify distribution transaction is deleted
      const needsCheck = await Transaction.findById(needsId);
      expect(needsCheck).toBeNull();
    });
    
    it('should prevent deleting distribution transactions', async () => {
      // First create an income transaction
      const createResponse = await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      const needsId = createResponse.body.data.distributedTransactions.needs._id;
      
      // Try to delete a distribution transaction
      const deleteResponse = await request(app)
        .delete(`/api/transactions/${needsId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteResponse.status).toBe(403);
      expect(deleteResponse.body.msg).toContain('cannot be directly deleted');
    });
  });
  
  describe('GET /api/transactions', () => {
    it('should get all transactions for a user', async () => {
      // First create an income transaction
      await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      // Now get all transactions
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4); // 1 income + 3 distributions
      
      // Verify income transaction
      const incomeTransaction = response.body.find(t => t.transactionType === 'Income');
      expect(incomeTransaction).toBeTruthy();
      expect(incomeTransaction.description).toBe('Test Income');
      expect(incomeTransaction.amount).toBe(1000);
      
      // Verify distribution transactions
      const needsTransaction = response.body.find(t => t.transactionType === 'Needs');
      const wantsTransaction = response.body.find(t => t.transactionType === 'Wants');
      const savingsTransaction = response.body.find(t => t.transactionType === 'Savings');
      
      expect(needsTransaction).toBeTruthy();
      expect(wantsTransaction).toBeTruthy();
      expect(savingsTransaction).toBeTruthy();
      
      expect(needsTransaction.amount).toBe(500);
      expect(wantsTransaction.amount).toBe(300);
      expect(savingsTransaction.amount).toBe(200);
    });
    
    it('should filter transactions by type', async () => {
      // First create an income transaction
      await request(app)
        .post('/api/transactions/income')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Income',
          amount: 1000,
          category: testCategory._id
        });
      
      // Now get only income transactions
      const response = await request(app)
        .get('/api/transactions?type=Income')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].transactionType).toBe('Income');
    });
  });
});
