require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Import custom middleware
const csrfErrorHandler = require('./middleware/csrfErrorHandler');
const csrfMiddleware = require('./middleware/csrfMiddleware');

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET', 'MONGO_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

// Load Passport config (executes the strategy setup)
require('./config/passport-setup');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers with Helmet
app.use(helmet());

// Configure Content-Security-Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
      connectSrc: ["'self'", 'https://accounts.google.com'],
      frameSrc: ["'self'", 'https://accounts.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
);

// Configure additional security headers
app.use(helmet.xssFilter()); // Adds X-XSS-Protection header
app.use(helmet.noSniff()); // Adds X-Content-Type-Options header
app.use(helmet.frameguard({ action: 'deny' })); // Adds X-Frame-Options header
app.use(helmet.referrerPolicy({ policy: 'same-origin' })); // Adds Referrer-Policy header
// Add HSTS header in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }));
}

// Global rate limiter - applies to all requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  exposedHeaders: ['XSRF-TOKEN'] // Expose CSRF token header
}));
app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // for parsing cookies

// Session Middleware with enhanced security
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60, // Session TTL (1 day)
    autoRemove: 'native' // Use MongoDB's TTL index
  }),
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
    sameSite: 'strict', // Prevents the cookie from being sent in cross-site requests
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); // Allow persistent login sessions

// CSRF Protection (after session middleware)
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}));

// Add CSRF token to responses
app.use(csrfMiddleware);

// CSRF error handler
app.use(csrfErrorHandler);

// Apply global rate limiter to all requests
app.use(globalLimiter);

// More strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    error: {
      message: 'Too many login attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('UMoney Backend is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Server will be started after all routes are defined
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const recipientRoutes = require('./routes/recipients');
const financialGoalRoutes = require('./routes/financialGoals');
const assetRoutes = require('./routes/assets');
const liabilityRoutes = require('./routes/liabilities');
const budgetRoutes = require('./routes/budgets');
const financialPlanningRoutes = require('./routes/financialPlanning');
const utilsRoutes = require('./routes/utils');
const ledgerRoutes = require('./routes/ledgers');
const exportImportRoutes = require('./routes/exportImport');

// Define specific rate limiters for different types of endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    error: {
      message: 'Too many API requests, please try again later.',
      code: 'API_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Use Routes with appropriate rate limiters
app.use('/api/auth/login', authLimiter); // Apply stricter limits to login
app.use('/api/auth/register', authLimiter); // Apply stricter limits to registration
app.use('/api/auth', authRoutes);
app.use('/api/transactions', apiLimiter, transactionRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/recipients', apiLimiter, recipientRoutes);
app.use('/api/financial-goals', apiLimiter, financialGoalRoutes);
app.use('/api/assets', apiLimiter, assetRoutes);
app.use('/api/liabilities', apiLimiter, liabilityRoutes);
app.use('/api/budgets', apiLimiter, budgetRoutes);
app.use('/api/financial-planning', apiLimiter, financialPlanningRoutes);
app.use('/api/utils', apiLimiter, utilsRoutes);
app.use('/api/users', apiLimiter, ledgerRoutes);
app.use('/api/export', apiLimiter, exportImportRoutes);
app.use('/api/import', apiLimiter, exportImportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});