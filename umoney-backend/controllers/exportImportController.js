// umoney-backend/controllers/exportImportController.js

const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * @desc    Export transactions as CSV
 * @route   GET /api/export/transactions/csv
 * @access  Private
 */
exports.exportTransactionsCSV = async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Add transaction type filter if provided
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('category', 'name type')
      .sort({ date: -1 });
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'No transactions found' } 
      });
    }
    
    // Transform transactions for CSV export
    const transformedTransactions = transactions.map(transaction => {
      return {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category ? transaction.category.name : 'Uncategorized',
        categoryType: transaction.category ? transaction.category.type : transaction.transactionType,
        transactionType: transaction.transactionType,
        recipientName: transaction.recipient ? transaction.recipient.name : '',
        recipientType: transaction.recipient ? transaction.recipient.type : '',
        date: transaction.date.toISOString().split('T')[0],
        currency: transaction.currency,
        notes: transaction.notes || '',
        tag: transaction.tag || '',
        source: transaction.source,
        status: transaction.status,
        isDistribution: transaction.isDistribution,
        parentTransactionId: transaction.parentTransactionId || '',
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString()
      };
    });
    
    // Define fields for CSV
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Description', value: 'description' },
      { label: 'Amount', value: 'amount' },
      { label: 'Category', value: 'category' },
      { label: 'Category Type', value: 'categoryType' },
      { label: 'Transaction Type', value: 'transactionType' },
      { label: 'Recipient Name', value: 'recipientName' },
      { label: 'Recipient Type', value: 'recipientType' },
      { label: 'Date', value: 'date' },
      { label: 'Currency', value: 'currency' },
      { label: 'Notes', value: 'notes' },
      { label: 'Tag', value: 'tag' },
      { label: 'Source', value: 'source' },
      { label: 'Status', value: 'status' },
      { label: 'Is Distribution', value: 'isDistribution' },
      { label: 'Parent Transaction ID', value: 'parentTransactionId' },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Updated At', value: 'updatedAt' }
    ];
    
    // Create CSV parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transformedTransactions);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting transactions as CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error', details: error.message } 
    });
  }
};

/**
 * @desc    Export transactions as JSON
 * @route   GET /api/export/transactions/json
 * @access  Private
 */
exports.exportTransactionsJSON = async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Add transaction type filter if provided
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('category', 'name type')
      .sort({ date: -1 });
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'No transactions found' } 
      });
    }
    
    // Transform transactions for JSON export
    const transformedTransactions = transactions.map(transaction => {
      return {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category ? {
          id: transaction.category._id,
          name: transaction.category.name,
          type: transaction.category.type
        } : null,
        transactionType: transaction.transactionType,
        recipient: transaction.recipient,
        date: transaction.date,
        currency: transaction.currency,
        notes: transaction.notes,
        tag: transaction.tag,
        source: transaction.source,
        status: transaction.status,
        isDistribution: transaction.isDistribution,
        parentTransactionId: transaction.parentTransactionId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      };
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.json');
    
    // Send JSON data
    res.status(200).json(transformedTransactions);
  } catch (error) {
    console.error('Error exporting transactions as JSON:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error', details: error.message } 
    });
  }
};

/**
 * @desc    Generate financial report as PDF
 * @route   GET /api/export/reports/pdf
 * @access  Private
 */
exports.exportReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('category', 'name type')
      .sort({ date: -1 });
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'No transactions found for report generation' } 
      });
    }
    
    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    
    // Pipe the PDF document to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(25).text('UMoney Financial Report', {
      align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(12).text(`Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'All'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, {
      align: 'center'
    });
    
    doc.moveDown();
    doc.moveDown();
    
    // Group transactions by type
    const incomeTransactions = transactions.filter(t => t.transactionType === 'Income');
    const needsTransactions = transactions.filter(t => t.transactionType === 'Needs');
    const wantsTransactions = transactions.filter(t => t.transactionType === 'Wants');
    const savingsTransactions = transactions.filter(t => t.transactionType === 'Savings');
    
    // Calculate totals
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalNeeds = needsTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalWants = wantsTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = totalNeeds + totalWants + totalSavings;
    
    // Add summary section
    doc.fontSize(16).text('Summary', {
      underline: true
    });
    doc.moveDown();
    
    doc.fontSize(12).text(`Total Income: ${totalIncome.toFixed(2)}`);
    doc.fontSize(12).text(`Total Expenses: ${totalExpenses.toFixed(2)}`);
    doc.fontSize(12).text(`Net: ${(totalIncome - totalExpenses).toFixed(2)}`);
    doc.moveDown();
    
    doc.fontSize(12).text(`Needs: ${totalNeeds.toFixed(2)} (${totalIncome > 0 ? ((totalNeeds / totalIncome) * 100).toFixed(2) : 0}%)`);
    doc.fontSize(12).text(`Wants: ${totalWants.toFixed(2)} (${totalIncome > 0 ? ((totalWants / totalIncome) * 100).toFixed(2) : 0}%)`);
    doc.fontSize(12).text(`Savings: ${totalSavings.toFixed(2)} (${totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(2) : 0}%)`);
    
    doc.moveDown();
    doc.moveDown();
    
    // Add transaction details if requested
    if (reportType === 'detailed') {
      // Income transactions
      if (incomeTransactions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Income Transactions', {
          underline: true
        });
        doc.moveDown();
        
        incomeTransactions.forEach((transaction, index) => {
          doc.fontSize(12).text(`${index + 1}. ${transaction.description} - ${transaction.amount.toFixed(2)} ${transaction.currency}`);
          doc.fontSize(10).text(`   Date: ${transaction.date.toLocaleDateString()}`);
          doc.fontSize(10).text(`   Category: ${transaction.category ? transaction.category.name : 'Uncategorized'}`);
          if (transaction.notes) {
            doc.fontSize(10).text(`   Notes: ${transaction.notes}`);
          }
          doc.moveDown(0.5);
        });
      }
      
      // Needs transactions
      if (needsTransactions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Needs Transactions', {
          underline: true
        });
        doc.moveDown();
        
        needsTransactions.forEach((transaction, index) => {
          doc.fontSize(12).text(`${index + 1}. ${transaction.description} - ${transaction.amount.toFixed(2)} ${transaction.currency}`);
          doc.fontSize(10).text(`   Date: ${transaction.date.toLocaleDateString()}`);
          doc.fontSize(10).text(`   Category: ${transaction.category ? transaction.category.name : 'Uncategorized'}`);
          if (transaction.notes) {
            doc.fontSize(10).text(`   Notes: ${transaction.notes}`);
          }
          doc.moveDown(0.5);
        });
      }
      
      // Wants transactions
      if (wantsTransactions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Wants Transactions', {
          underline: true
        });
        doc.moveDown();
        
        wantsTransactions.forEach((transaction, index) => {
          doc.fontSize(12).text(`${index + 1}. ${transaction.description} - ${transaction.amount.toFixed(2)} ${transaction.currency}`);
          doc.fontSize(10).text(`   Date: ${transaction.date.toLocaleDateString()}`);
          doc.fontSize(10).text(`   Category: ${transaction.category ? transaction.category.name : 'Uncategorized'}`);
          if (transaction.notes) {
            doc.fontSize(10).text(`   Notes: ${transaction.notes}`);
          }
          doc.moveDown(0.5);
        });
      }
      
      // Savings transactions
      if (savingsTransactions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Savings Transactions', {
          underline: true
        });
        doc.moveDown();
        
        savingsTransactions.forEach((transaction, index) => {
          doc.fontSize(12).text(`${index + 1}. ${transaction.description} - ${transaction.amount.toFixed(2)} ${transaction.currency}`);
          doc.fontSize(10).text(`   Date: ${transaction.date.toLocaleDateString()}`);
          doc.fontSize(10).text(`   Category: ${transaction.category ? transaction.category.name : 'Uncategorized'}`);
          if (transaction.notes) {
            doc.fontSize(10).text(`   Notes: ${transaction.notes}`);
          }
          doc.moveDown(0.5);
        });
      }
    }
    
    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error', details: error.message } 
    });
  }
};

/**
 * @desc    Import transactions from CSV
 * @route   POST /api/import/transactions/csv
 * @access  Private
 */
exports.importTransactionsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please upload a CSV file' } 
      });
    }
    
    const results = [];
    const errors = [];
    const userId = req.user.id;
    
    // Get user's categories
    const categories = await Category.find({ user: userId });
    
    // Create a readable stream from the file buffer
    const stream = Readable.from(req.file.buffer.toString());
    
    // Process the CSV file
    stream
      .pipe(csv())
      .on('data', async (data) => {
        try {
          // Validate required fields
          if (!data.description || !data.amount || !data.transactionType) {
            errors.push({
              row: results.length + errors.length + 1,
              message: 'Missing required fields (description, amount, or transactionType)'
            });
            return;
          }
          
          // Find or create category
          let category;
          if (data.category) {
            category = categories.find(c => 
              c.name.toLowerCase() === data.category.toLowerCase() && 
              c.type === data.transactionType
            );
            
            if (!category) {
              // Create a new category if it doesn't exist
              category = new Category({
                user: userId,
                name: data.category,
                type: data.transactionType,
                icon: 'pi pi-tag',
                color: '#607D8B',
                isCustom: true
              });
              
              await category.save();
              categories.push(category); // Add to local cache
            }
          } else {
            // Use default category for the transaction type
            category = categories.find(c => 
              c.name === 'Other' && 
              c.type === data.transactionType
            );
            
            if (!category) {
              errors.push({
                row: results.length + errors.length + 1,
                message: `No default category found for transaction type: ${data.transactionType}`
              });
              return;
            }
          }
          
          // Check for duplicate transactions
          const existingTransaction = await Transaction.findOne({
            user: userId,
            description: data.description,
            amount: parseFloat(data.amount),
            date: new Date(data.date),
            transactionType: data.transactionType
          });
          
          if (existingTransaction) {
            errors.push({
              row: results.length + errors.length + 1,
              message: 'Duplicate transaction found'
            });
            return;
          }
          
          // Create transaction object
          const transaction = new Transaction({
            user: userId,
            description: data.description,
            amount: parseFloat(data.amount),
            category: category._id,
            transactionType: data.transactionType,
            date: data.date ? new Date(data.date) : new Date(),
            currency: data.currency || 'INR',
            notes: data.notes || '',
            tag: data.tag || '',
            source: 'Import',
            status: 'categorized',
            recipient: {
              name: data.recipientName || data.description,
              type: data.recipientType || 'merchant',
              details: ''
            }
          });
          
          // Save transaction
          await transaction.save();
          results.push(transaction);
        } catch (error) {
          errors.push({
            row: results.length + errors.length + 1,
            message: error.message
          });
        }
      })
      .on('end', () => {
        res.status(200).json({
          success: true,
          data: {
            imported: results.length,
            errors: errors.length,
            errorDetails: errors
          }
        });
      });
  } catch (error) {
    console.error('Error importing transactions from CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error', details: error.message } 
    });
  }
};

/**
 * @desc    Import transactions from JSON
 * @route   POST /api/import/transactions/json
 * @access  Private
 */
exports.importTransactionsJSON = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please upload a JSON file' } 
      });
    }
    
    // Parse JSON data
    let transactions;
    try {
      transactions = JSON.parse(req.file.buffer.toString());
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Invalid JSON format' } 
      });
    }
    
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'JSON data must be an array of transactions' } 
      });
    }
    
    const results = [];
    const errors = [];
    const userId = req.user.id;
    
    // Get user's categories
    const categories = await Category.find({ user: userId });
    
    // Process each transaction
    for (let i = 0; i < transactions.length; i++) {
      const data = transactions[i];
      
      try {
        // Validate required fields
        if (!data.description || !data.amount || !data.transactionType) {
          errors.push({
            index: i,
            message: 'Missing required fields (description, amount, or transactionType)'
          });
          continue;
        }
        
        // Find or create category
        let category;
        if (data.category && data.category.name) {
          category = categories.find(c => 
            c.name.toLowerCase() === data.category.name.toLowerCase() && 
            c.type === data.transactionType
          );
          
          if (!category) {
            // Create a new category if it doesn't exist
            category = new Category({
              user: userId,
              name: data.category.name,
              type: data.transactionType,
              icon: 'pi pi-tag',
              color: '#607D8B',
              isCustom: true
            });
            
            await category.save();
            categories.push(category); // Add to local cache
          }
        } else {
          // Use default category for the transaction type
          category = categories.find(c => 
            c.name === 'Other' && 
            c.type === data.transactionType
          );
          
          if (!category) {
            errors.push({
              index: i,
              message: `No default category found for transaction type: ${data.transactionType}`
            });
            continue;
          }
        }
        
        // Check for duplicate transactions
        const existingTransaction = await Transaction.findOne({
          user: userId,
          description: data.description,
          amount: parseFloat(data.amount),
          date: new Date(data.date),
          transactionType: data.transactionType
        });
        
        if (existingTransaction) {
          errors.push({
            index: i,
            message: 'Duplicate transaction found'
          });
          continue;
        }
        
        // Create transaction object
        const transaction = new Transaction({
          user: userId,
          description: data.description,
          amount: parseFloat(data.amount),
          category: category._id,
          transactionType: data.transactionType,
          date: data.date ? new Date(data.date) : new Date(),
          currency: data.currency || 'INR',
          notes: data.notes || '',
          tag: data.tag || '',
          source: 'Import',
          status: 'categorized',
          recipient: data.recipient || {
            name: data.description,
            type: 'merchant',
            details: ''
          }
        });
        
        // Save transaction
        await transaction.save();
        results.push(transaction);
      } catch (error) {
        errors.push({
          index: i,
          message: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        imported: results.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error importing transactions from JSON:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error', details: error.message } 
    });
  }
};
