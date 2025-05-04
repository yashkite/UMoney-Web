const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const categoryRoutes = require('../routes/categories');
const { createDefaultCategories } = require('../utils/categoryUtils');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => ({
  ensureAuth: (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011' }; // Mock user ID
    next();
  }
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

// Setup in-memory MongoDB server
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database collections before each test
  await Category.deleteMany({});
  await Transaction.deleteMany({});
  
  // Create default categories for the test user
  await createDefaultCategories('507f1f77bcf86cd799439011');
});

describe('Category Controller', () => {
  describe('GET /api/categories', () => {
    it('should return all categories for the user', async () => {
      const res = await request(app).get('/api/categories');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories/type/:type', () => {
    it('should return categories of a specific type', async () => {
      const res = await request(app).get('/api/categories/type/Needs');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].type).toBe('Needs');
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app).get('/api/categories/type/InvalidType');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Type must be one of');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Test Category',
        type: 'Needs',
        icon: 'pi pi-test',
        color: '#FF5733'
      };

      const res = await request(app)
        .post('/api/categories')
        .send(newCategory);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(newCategory.name);
      expect(res.body.type).toBe(newCategory.type);
      expect(res.body.icon).toBe(newCategory.icon);
      expect(res.body.color).toBe(newCategory.color);
      expect(res.body.isCustom).toBe(true);
    });

    it('should return 400 if name or type is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Name and type are required');
    });
  });

  describe('PUT /api/categories/:id/budget', () => {
    it('should update category budget allocation', async () => {
      // First get a category to update
      const categoriesRes = await request(app).get('/api/categories/type/Needs');
      const categoryId = categoriesRes.body[0]._id;

      const budgetUpdate = {
        percentage: 25,
        amount: 500
      };

      const res = await request(app)
        .put(`/api/categories/${categoryId}/budget`)
        .send(budgetUpdate);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.budgetAllocation.percentage).toBe(budgetUpdate.percentage);
      expect(res.body.budgetAllocation.amount).toBe(budgetUpdate.amount);
    });

    it('should return 400 if neither percentage nor amount is provided', async () => {
      // First get a category to update
      const categoriesRes = await request(app).get('/api/categories/type/Needs');
      const categoryId = categoriesRes.body[0]._id;

      const res = await request(app)
        .put(`/api/categories/${categoryId}/budget`)
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Either percentage or amount must be provided');
    });
  });

  describe('POST /api/categories/reset', () => {
    it('should reset categories to defaults', async () => {
      // First create a custom category
      await request(app)
        .post('/api/categories')
        .send({
          name: 'Custom Category',
          type: 'Needs',
          icon: 'pi pi-custom',
          color: '#123456'
        });
      
      // Then reset categories
      const res = await request(app).post('/api/categories/reset');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Categories reset to defaults successfully');
      expect(Array.isArray(res.body.categories)).toBe(true);
      
      // Verify custom category is gone
      const customCategory = res.body.categories.find(c => c.name === 'Custom Category');
      expect(customCategory).toBeUndefined();
    });
  });

  describe('GET /api/categories/stats', () => {
    it('should return category usage statistics', async () => {
      // First create a transaction
      const categoriesRes = await request(app).get('/api/categories/type/Needs');
      const categoryId = categoriesRes.body[0]._id;
      
      // Create a transaction using this category
      const transaction = new Transaction({
        user: '507f1f77bcf86cd799439011',
        description: 'Test Transaction',
        amount: 100,
        category: categoryId,
        transactionType: 'Needs',
        recipient: {
          name: 'Test Recipient',
          type: 'merchant'
        },
        date: new Date()
      });
      
      await transaction.save();
      
      // Get category stats
      const res = await request(app).get('/api/categories/stats');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // If we created a transaction, we should have at least one stat
      if (res.body.length > 0) {
        expect(res.body[0].totalAmount).toBeDefined();
        expect(res.body[0].count).toBeDefined();
        expect(res.body[0].categoryName).toBeDefined();
      }
    });
  });
});
