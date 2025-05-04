const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ledgerController = require('../controllers/ledgerController'); // Import the controller
const transactionController = require('../controllers/transactionController');
const multer = require('multer'); // Multer is still needed here for handling file uploads
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator'); // express-validator is still needed

// Configure multer for file uploads (Keep this in the route file)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and PDF files are allowed'));
  }
});

// @route   GET api/users/:userId/ledgers
// @desc    Get all ledgers for a user
// @access  Private
router.get('/:userId/ledgers', authMiddleware.ensureAuth, ledgerController.getLedgers);

// @route   GET api/users/:userId/ledgers/:ledgerType
// @desc    Get a specific ledger for a user
// @access  Private
router.get('/:userId/ledgers/:ledgerType', authMiddleware.ensureAuth, ledgerController.getLedgerByType);

// @route   GET api/users/:userId/ledgers/:ledgerType/transactions
// @desc    Get transactions for a specific ledger
// @access  Private
router.get('/:userId/ledgers/:ledgerType/transactions', authMiddleware.ensureAuth, ledgerController.getLedgerTransactions);

// @route   POST api/users/:userId/ledgers/income/transactions
// @desc    Add an income transaction and distribute it
// @access  Private
router.post(
    '/:userId/ledgers/income/transactions',
    authMiddleware.ensureAuth,
    transactionController.addIncomeTransaction
); // Use controller function

// @route   POST api/users/:userId/ledgers/:ledgerType/transactions
// @desc    Add a transaction to a specific ledger (Needs, Wants, Savings)
// @access  Private
router.post(
    '/:userId/ledgers/:ledgerType/transactions',
    authMiddleware.ensureAuth,
    ledgerController.addExpenseTransaction
); // Use controller function

// @route   GET api/users/:userId/ledgers/summary
// @desc    Get summary of all ledgers for a user
// @access  Private
router.get('/:userId/ledgers/summary', authMiddleware.ensureAuth, ledgerController.getLedgerSummary);

// @route   PUT api/users/:userId/ledgers/:ledgerType/transactions/:transactionId
// @desc    Update a transaction
// @access  Private
router.put(
    '/:userId/ledgers/:ledgerType/transactions/:transactionId',
    [
        authMiddleware.ensureAuth,
        [
            check('description', 'Description is required').optional().not().isEmpty(),
            check('amount', 'Amount must be a positive number').optional().isFloat({ min: 0.01 }),
            check('date', 'Date must be valid').optional().isISO8601()
        ]
    ],
    ledgerController.updateTransaction // Use controller function
);

// @route   DELETE api/users/:userId/ledgers/:ledgerType/transactions/:transactionId
// @desc    Delete a transaction
// @access  Private
router.delete('/:userId/ledgers/:ledgerType/transactions/:transactionId', authMiddleware.ensureAuth, ledgerController.deleteTransaction);

module.exports = router;
