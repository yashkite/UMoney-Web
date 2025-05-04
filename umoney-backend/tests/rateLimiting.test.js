/**
 * Rate Limiting and Security Headers Tests
 * 
 * Tests for rate limiting and security headers implementation.
 */

const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Create a test app with rate limiting
const createTestApp = () => {
  const app = express();

  // Add security headers
  app.use(helmet());

  // Add rate limiting
  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Low limit for testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      success: false,
      error: {
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  });

  app.use('/limited', testLimiter, (req, res) => {
    res.json({ success: true });
  });

  app.use('/unlimited', (req, res) => {
    res.json({ success: true });
  });

  return app;
};

describe('Rate Limiting and Security Headers', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Rate Limiting', () => {
    test('should allow requests under the rate limit', async () => {
      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/limited')
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('should block requests over the rate limit', async () => {
      // Make 3 requests to reach the limit
      for (let i = 0; i < 3; i++) {
        await request(app).get('/limited');
      }

      // This request should be rate limited
      const response = await request(app)
        .get('/limited')
        .expect(429);
      
      expect(response.body).toHaveProperty('status', 429);
      expect(response.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
    });

    test('should include rate limit headers in the response', async () => {
      const response = await request(app)
        .get('/unlimited')
        .expect(200);
      
      // Check for security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers in the response', async () => {
      const response = await request(app)
        .get('/unlimited')
        .expect(200);
      
      // Check for security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});
