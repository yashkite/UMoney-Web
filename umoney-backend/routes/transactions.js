const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureAuth } = require('../middleware/authMiddleware'); // Import auth middleware
const transactionController = require('../controllers/transactionController'); // Import the controller

// Import utility functions
const { convertCurrency, isSupportedCurrency } = require('../utils/currencyUtils'); // Import currency utility functions

// Import models
const Transaction = require('../models/Transaction'); // Import Transaction model
const Category = require('../models/Category'); // Import Category model for validation
const User = require('../models/User'); // Import User model for currency preferences

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and common document formats
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Helper function to convert amount to user's preferred currency
const convertToPreferredCurrency = (amount, fromCurrency, toCurrency) => {
  return convertCurrency(amount, fromCurrency, toCurrency);
};

// Helper function to process file attachments
const processAttachments = (files) => {
  const attachments = [];
  if (files && files.length > 0) {
    for (const file of files) {
      attachments.push({
        url: `/uploads/${file.filename}`,
        filename: file.originalname,
        type: file.mimetype.startsWith('image/') ? 'image' :
              file.mimetype === 'application/pdf' ? 'receipt' : 'document',
        uploadedAt: new Date()
      });
    }
  }
  return attachments;
};

// @route   GET /api/transactions
// @desc    Get all transactions for the logged-in user
// @access  Private
router.get('/', ensureAuth, transactionController.getTransactions);

// @route   POST /api/transactions/income
// @desc    Add income transaction with distribution
// @access  Private
router.post('/income', ensureAuth, upload.array('attachments', 5), transactionController.addIncomeTransaction);

// @route   POST /api/transactions/expense
// @desc    Add expense transaction
// @access  Private
router.post('/expense', ensureAuth, upload.array('attachments', 5), transactionController.addExpenseTransaction);

// @route   POST /api/transactions/savings
// @desc    Add savings transaction (deposit or withdrawal)
// @access  Private
router.post('/savings', ensureAuth, upload.array('attachments', 5), transactionController.addSavingsTransaction);

// @route   PUT /api/transactions/savings/:id
// @desc    Update savings transaction
// @access  Private
router.put('/savings/:id', ensureAuth, upload.array('attachments', 5), transactionController.updateSavingsTransaction);

// @route   GET /api/transactions/summary
// @desc    Get transaction summary for the logged-in user
// @access  Private
router.get('/summary', ensureAuth, transactionController.getTransactionSummary);

// @route   GET /api/transactions/tags
// @desc    Get transaction tags for the logged-in user
// @access  Private
router.get('/tags', ensureAuth, transactionController.getTransactionTags);

// @route   POST /api/transactions/tags
// @desc    Add a new transaction tag for the logged-in user
// @access  Private
router.post('/tags', ensureAuth, transactionController.addTransactionTag);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', ensureAuth, transactionController.updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', ensureAuth, transactionController.deleteTransaction);


// Helper route to get subcategories for a given category type
// @route   GET /api/transactions/subcategories/:type
// @desc    Get subcategories for a given transaction type
// @access  Private
router.get('/subcategories/:type', ensureAuth, async (req, res) => {
  const { type } = req.params;

  if (!['Income', 'Needs', 'Wants', 'Savings'].includes(type)) {
    return res.status(400).json({ msg: 'Invalid transaction type' });
  }

  try {
    // Get all categories of the specified type for this user
    const categories = await Category.find({
      user: req.user.id,
      type: type === 'Income' ? 'Income' : { $in: ['Needs', 'Wants', 'Savings'] }
    }).sort({ name: 1 });

    // Return the categories with their names as subcategories
    res.json(categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      type: cat.type
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// TODO: Add route for smart categorization (likely a separate endpoint or integrated into POST)

module.exports = router;
