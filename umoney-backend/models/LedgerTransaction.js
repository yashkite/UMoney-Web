const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @description Schema for LedgerTransaction model
 * @param {ObjectId} ledgerId - Reference to the Ledger model
 * @param {string} description - Description of the transaction
 * @param {number} amount - Amount of the transaction (always positive)
 * @param {ObjectId} category - Reference to the Category model
 * @param {Object} recipient - Recipient details for expense transactions
 * @param {Date} date - Date of the transaction
 * @param {string} currency - Currency of the transaction
 * @param {Array} attachments - Array of attachments (receipts, etc.)
 * @param {string} source - Source of the transaction (Manual, SMS, Email, Import)
 * @param {string} status - Status of the transaction (pending, categorized, verified)
 * @param {string} notes - Additional notes for the transaction
 * @param {string} tag - Tag for the transaction
 * @param {string} transactionType - Type of transaction (Income, Expense, Transfer)
 * @param {ObjectId} relatedTransactionId - Reference to a related transaction (for transfers or distributions)
 * @param {Date} createdAt - Date when the transaction was created
 * @param {Date} updatedAt - Date when the transaction was last updated
 */
const LedgerTransactionSchema = new Schema({
  ledgerId: {
    type: Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: props => `Amount must be a positive number`
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  recipient: {
    name: {
      type: String,
      required: function() {
        return this.transactionType === 'Expense';
      }
    },
    type: {
      type: String,
      enum: ['contact', 'upi', 'bank', 'merchant'],
      required: function() {
        return this.transactionType === 'Expense' && this.recipient && this.recipient.name;
      }
    },
    details: {
      type: String // Additional details like account number, UPI ID, etc.
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  attachments: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String
    },
    type: {
      type: String,
      enum: ['receipt', 'invoice', 'image', 'document', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  source: {
    type: String,
    enum: ['Manual', 'SMS', 'Email', 'Import', 'Distribution'],
    default: 'Manual'
  },
  status: {
    type: String,
    enum: ['pending', 'categorized', 'verified'],
    default: function() {
      return this.source === 'Manual' ? 'categorized' : 'pending';
    }
  },
  notes: String,
  tag: {
    type: String,
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['Income', 'Expense', 'Transfer'],
    required: true
  },
  relatedTransactionId: {
    type: Schema.Types.ObjectId,
    ref: 'LedgerTransaction'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Indexing for faster queries by ledger and date
LedgerTransactionSchema.index({ ledgerId: 1, date: -1 });
// Index for finding transactions by category
LedgerTransactionSchema.index({ ledgerId: 1, category: 1 });
// Index for finding transactions by recipient name (for auto-suggestions)
LedgerTransactionSchema.index({ ledgerId: 1, 'recipient.name': 1 });
// Index for finding related transactions
LedgerTransactionSchema.index({ relatedTransactionId: 1 });

module.exports = mongoose.model('LedgerTransaction', LedgerTransactionSchema);
