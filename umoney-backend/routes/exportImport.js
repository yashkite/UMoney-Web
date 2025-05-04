// umoney-backend/routes/exportImport.js

const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const exportImportController = require('../controllers/exportImportController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Check file types
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/json' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload CSV or JSON files only.'), false);
    }
  }
});

// Export Routes
// @route   GET /api/export/transactions/csv
// @desc    Export transactions as CSV
// @access  Private
router.get('/transactions/csv', ensureAuth, exportImportController.exportTransactionsCSV);

// @route   GET /api/export/transactions/json
// @desc    Export transactions as JSON
// @access  Private
router.get('/transactions/json', ensureAuth, exportImportController.exportTransactionsJSON);

// @route   GET /api/export/reports/pdf
// @desc    Generate financial report as PDF
// @access  Private
router.get('/reports/pdf', ensureAuth, exportImportController.exportReportPDF);

// Import Routes
// @route   POST /api/import/transactions/csv
// @desc    Import transactions from CSV
// @access  Private
router.post('/transactions/csv', 
  ensureAuth, 
  upload.single('file'), 
  exportImportController.importTransactionsCSV
);

// @route   POST /api/import/transactions/json
// @desc    Import transactions from JSON
// @access  Private
router.post('/transactions/json', 
  ensureAuth, 
  upload.single('file'), 
  exportImportController.importTransactionsJSON
);

// Error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      success: false,
      error: {
        message: 'File upload error',
        details: err.message
      }
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during file upload',
        details: err.message
      }
    });
  }
  
  // If no error, continue
  next();
});

module.exports = router;
