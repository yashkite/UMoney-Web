require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

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

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5000'], credentials: true }));
app.use(express.json()); // for parsing application/json

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Use a strong secret from .env
  resave: false,
  saveUninitialized: false, // Don't create session until something stored
  // Consider using connect-mongo for session store in production
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); // Allow persistent login sessions

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
