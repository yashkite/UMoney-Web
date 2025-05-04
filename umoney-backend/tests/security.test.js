const request = require('supertest');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import middleware
const csrfErrorHandler = require('../middleware/csrfErrorHandler');
const csrfMiddleware = require('../middleware/csrfMiddleware');

let mongoServer;
let app;
let agent;

beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Create a test Express app
  app = express();
  
  // Body parser
  app.use(express.json());
  
  // Session middleware
  app.use(session({
    secret: 'test-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: mongoUri,
      ttl: 24 * 60 * 60,
      autoRemove: 'native'
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for testing
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
  
  // CSRF Protection
  app.use(csrf({ cookie: true }));
  
  // Add CSRF token to responses
  app.use(csrfMiddleware);
  
  // CSRF error handler
  app.use(csrfErrorHandler);
  
  // Test routes
  app.get('/api/test/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  
  app.post('/api/test/protected', (req, res) => {
    res.json({ success: true, message: 'CSRF protection passed' });
  });
  
  app.get('/api/test/session', (req, res) => {
    // Set a value in the session
    req.session.testValue = 'test-session-value';
    res.json({ success: true, message: 'Session value set' });
  });
  
  app.get('/api/test/session-check', (req, res) => {
    // Check if the session value exists
    const testValue = req.session.testValue;
    res.json({ 
      success: true, 
      hasSessionValue: !!testValue,
      sessionValue: testValue
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    });
  });
  
  // Create a supertest agent to maintain cookies between requests
  agent = request.agent(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Security', () => {
  describe('Session Management', () => {
    test('should maintain session state between requests', async () => {
      // Set a session value
      const setResponse = await agent
        .get('/api/test/session')
        .expect(200);
      
      expect(setResponse.body.success).toBe(true);
      
      // Check if the session value persists
      const checkResponse = await agent
        .get('/api/test/session-check')
        .expect(200);
      
      expect(checkResponse.body.success).toBe(true);
      expect(checkResponse.body.hasSessionValue).toBe(true);
      expect(checkResponse.body.sessionValue).toBe('test-session-value');
    });
  });
  
  describe('CSRF Protection', () => {
    test('should return CSRF token in response', async () => {
      const response = await agent
        .get('/api/test/csrf-token')
        .expect(200);
      
      expect(response.body.csrfToken).toBeDefined();
      expect(typeof response.body.csrfToken).toBe('string');
    });
    
    test('should reject requests without CSRF token', async () => {
      const response = await agent
        .post('/api/test/protected')
        .send({ data: 'test' })
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CSRF_TOKEN');
    });
    
    test('should accept requests with valid CSRF token', async () => {
      // First get a CSRF token
      const tokenResponse = await agent
        .get('/api/test/csrf-token')
        .expect(200);
      
      const csrfToken = tokenResponse.body.csrfToken;
      
      // Then make a request with the token
      const response = await agent
        .post('/api/test/protected')
        .set('X-CSRF-Token', csrfToken)
        .send({ data: 'test' })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('CSRF protection passed');
    });
  });
});