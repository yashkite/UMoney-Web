require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const helmet = require('helmet');

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

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5000'], 
  credentials: true,
  exposedHeaders: ['XSRF-TOKEN'] // Expose CSRF token header
}));
app.use(express.json()); // for parsing application/json

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

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/financial-goals', financialGoalRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/financial-planning', financialPlanningRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/users', ledgerRoutes);

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