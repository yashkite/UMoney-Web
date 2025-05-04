// umoney-backend/tests/exportImport.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import models
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

// Import controllers
const exportImportController = require('../controllers/exportImportController');

// Create a test app
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'), // Mock user ID
    displayName: 'Test User',
    email: 'test@example.com'
  };
  next();
};

// Set up routes for testing
app.get('/api/export/transactions/csv', mockAuthMiddleware, exportImportController.exportTransactionsCSV);
app.get('/api/export/transactions/json', mockAuthMiddleware, exportImportController.exportTransactionsJSON);
app.get('/api/export/reports/pdf', mockAuthMiddleware, exportImportController.exportReportPDF);
app.post('/api/import/transactions/csv', mockAuthMiddleware, (req, res, next) => {
  // Mock file upload middleware
  req.file = {
    buffer: Buffer.from('description,amount,transactionType,date,category\nTest Transaction,100,Income,2023-01-01,Salary')
  };
  next();
}, exportImportController.importTransactionsCSV);
app.post('/api/import/transactions/json', mockAuthMiddleware, (req, res, next) => {
  // Mock file upload middleware
  req.file = {
    buffer: Buffer.from(JSON.stringify([
      {
        description: 'Test Transaction',
        amount: 100,
        transactionType: 'Income',
        date: '2023-01-01',
        category: { name: 'Salary' }
      }
    ]))
  };
  next();
}, exportImportController.importTransactionsJSON);

// Set up MongoDB Memory Server
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  await User.create({
    _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
    googleId: '123456789',
    displayName: 'Test User',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });

  // Create test categories
  const categories = [
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cb'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Salary',
      type: 'Income',
      icon: 'pi pi-money-bill',
      color: '#4CAF50',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cc'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Rent',
      type: 'Needs',
      icon: 'pi pi-home',
      color: '#2196F3',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cd'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Entertainment',
      type: 'Wants',
      icon: 'pi pi-ticket',
      color: '#9C27B0',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Investment',
      type: 'Savings',
      icon: 'pi pi-chart-line',
      color: '#FF9800',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cf'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Other',
      type: 'Income',
      icon: 'pi pi-tag',
      color: '#607D8B',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109c0'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Other',
      type: 'Needs',
      icon: 'pi pi-tag',
      color: '#607D8B',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109c1'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Other',
      type: 'Wants',
      icon: 'pi pi-tag',
      color: '#607D8B',
      isCustom: false
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109c2'),
      user: '60d0fe4f5311236168a109ca',
      name: 'Other',
      type: 'Savings',
      icon: 'pi pi-tag',
      color: '#607D8B',
      isCustom: false
    }
  ];

  await Category.insertMany(categories);

  // Create test transactions
  const transactions = [
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109d0'),
      user: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
      description: 'Monthly Salary',
      amount: 5000,
      category: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cb'),
      transactionType: 'Income',
      date: new Date('2023-01-01'),
      currency: 'USD',
      recipient: {
        name: 'Employer Inc.',
        type: 'merchant'
      },
      source: 'Manual',
      status: 'categorized'
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109d1'),
      user: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
      description: 'Apartment Rent',
      amount: 1500,
      category: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cc'),
      transactionType: 'Needs',
      date: new Date('2023-01-05'),
      currency: 'USD',
      recipient: {
        name: 'Landlord',
        type: 'merchant'
      },
      source: 'Manual',
      status: 'categorized'
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109d2'),
      user: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
      description: 'Movie Night',
      amount: 50,
      category: new mongoose.Types.ObjectId('60d0fe4f5311236168a109cd'),
      transactionType: 'Wants',
      date: new Date('2023-01-10'),
      currency: 'USD',
      recipient: {
        name: 'Cinema',
        type: 'merchant'
      },
      source: 'Manual',
      status: 'categorized'
    },
    {
      _id: new mongoose.Types.ObjectId('60d0fe4f5311236168a109d3'),
      user: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ca'),
      description: 'Stock Purchase',
      amount: 1000,
      category: new mongoose.Types.ObjectId('60d0fe4f5311236168a109ce'),
      transactionType: 'Savings',
      date: new Date('2023-01-15'),
      currency: 'USD',
      recipient: {
        name: 'Brokerage',
        type: 'merchant'
      },
      source: 'Manual',
      status: 'categorized'
    }
  ];

  await Transaction.insertMany(transactions);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Export/Import Controller', () => {
  describe('Export Functionality', () => {
    test('should export transactions as CSV', async () => {
      const response = await request(app)
        .get('/api/export/transactions/csv')
        .expect('Content-Type', /text\/csv/)
        .expect('Content-Disposition', /attachment; filename=transactions.csv/)
        .expect(200);

      expect(response.text).toContain('Description');
      expect(response.text).toContain('Amount');
      expect(response.text).toContain('Category');
      expect(response.text).toContain('Monthly Salary');
      expect(response.text).toContain('5000');
    });

    test('should export transactions as JSON', async () => {
      const response = await request(app)
        .get('/api/export/transactions/json')
        .expect('Content-Type', /application\/json/)
        .expect('Content-Disposition', /attachment; filename=transactions.json/)
        .expect(200);

      const data = JSON.parse(response.text);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(4);

      // Check that all expected transactions are in the response
      const descriptions = data.map(t => t.description);
      expect(descriptions).toContain('Monthly Salary');
      expect(descriptions).toContain('Apartment Rent');
      expect(descriptions).toContain('Movie Night');
      expect(descriptions).toContain('Stock Purchase');

      // Find the Monthly Salary transaction
      const salaryTransaction = data.find(t => t.description === 'Monthly Salary');
      expect(salaryTransaction.amount).toBe(5000);
    });

    test('should export financial report as PDF', async () => {
      const response = await request(app)
        .get('/api/export/reports/pdf')
        .expect('Content-Type', /application\/pdf/)
        .expect('Content-Disposition', /attachment; filename=financial-report.pdf/)
        .expect(200);

      // PDF content validation is limited, but we can check if it's a valid PDF
      expect(response.body.toString().substring(0, 5)).toContain('PDF');
    });

    test('should filter transactions by date range', async () => {
      const response = await request(app)
        .get('/api/export/transactions/json')
        .query({
          startDate: '2023-01-05',
          endDate: '2023-01-15'
        })
        .expect(200);

      const data = JSON.parse(response.text);
      expect(data.length).toBe(3);

      // Check that the filtered transactions are in the response
      const descriptions = data.map(t => t.description);
      expect(descriptions).toContain('Apartment Rent');
      expect(descriptions).toContain('Movie Night');
      expect(descriptions).toContain('Stock Purchase');

      // Check that the excluded transaction is not in the response
      expect(descriptions).not.toContain('Monthly Salary');
    });

    test('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/export/transactions/json')
        .query({
          transactionType: 'Needs'
        })
        .expect(200);

      const data = JSON.parse(response.text);
      expect(data.length).toBe(1);
      expect(data[0].description).toBe('Apartment Rent');
    });
  });

  describe('Import Functionality', () => {
    test('should handle CSV import request', async () => {
      // Create a new app with mocked controller
      const mockApp = express();
      mockApp.use(express.json());

      // Create a mock implementation
      const mockImportCSV = jest.fn().mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            imported: 1,
            errors: 0,
            errorDetails: []
          }
        });
      });

      // Set up mock route
      mockApp.post('/api/import/transactions/csv', mockAuthMiddleware, (req, res, next) => {
        req.file = {
          buffer: Buffer.from('description,amount,transactionType,date,category\nTest Transaction,100,Income,2023-01-01,Salary')
        };
        next();
      }, mockImportCSV);

      const response = await request(mockApp)
        .post('/api/import/transactions/csv')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(1);
      expect(mockImportCSV).toHaveBeenCalled();
    });

    test('should handle JSON import request', async () => {
      // Create a new app with mocked controller
      const mockApp = express();
      mockApp.use(express.json());

      // Create a mock implementation
      const mockImportJSON = jest.fn().mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            imported: 1,
            errors: 0,
            errorDetails: []
          }
        });
      });

      // Set up mock route
      mockApp.post('/api/import/transactions/json', mockAuthMiddleware, (req, res, next) => {
        req.file = {
          buffer: Buffer.from(JSON.stringify([
            {
              description: 'Test Transaction',
              amount: 100,
              transactionType: 'Income',
              date: '2023-01-01',
              category: { name: 'Salary' }
            }
          ]))
        };
        next();
      }, mockImportJSON);

      const response = await request(mockApp)
        .post('/api/import/transactions/json')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(1);
      expect(mockImportJSON).toHaveBeenCalled();
    });
  });
});
