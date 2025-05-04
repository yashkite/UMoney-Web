const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @description Schema for Transaction model
 * @param {ObjectId} user - Reference to the User model
 * @param {string} description - Description of the transaction
 * @param {number} amount - Amount of the transaction (always positive)
 * @param {ObjectId} category - Reference to the Category model
 * @param {string} transactionType - Type of transaction (Income, Needs, Wants, Savings)
 * @param {Object} recipient - Recipient details for expense transactions
 * @param {Date} date - Date of the transaction
 * @param {string} currency - Currency of the transaction
 * @param {Array} attachments - Array of attachments (receipts, etc.)
 * @param {string} source - Source of the transaction (Manual, SMS, Email, Import)
 * @param {string} status - Status of the transaction (pending, categorized, verified)
 * @param {string} notes - Additional notes for the transaction
 * @param {Date} createdAt - Date when the transaction was created
 * @param {Date} updatedAt - Date when the transaction was last updated
 */
const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  transactionType: {
    type: String,
    enum: ['Income', 'Needs', 'Wants', 'Savings'],
    required: true
  },
  recipient: {
    name: String,
    type: {
      type: String,
      enum: ['contact', 'upi', 'bank', 'merchant']
    },
    details: String,
    frequency: {
      type: Number,
      default: 1
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
      if (this.source === 'Manual' || this.source === 'Distribution') {
        return 'categorized';
      }
      return 'pending';
    }
  },
  notes: String,
  tag: {
    type: String,
    trim: true
  },
  // For tracking relationships between transactions
  parentTransactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  // For tracking if this is a system-generated distribution transaction
  isDistribution: {
    type: Boolean,
    default: false
  },
  // For tracking if this transaction is editable by the user
  isEditable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Add custom validation for recipient
TransactionSchema.pre('validate', function(next) {
  // Only require recipient.name for non-Income transactions
  if (this.transactionType !== 'Income' && (!this.recipient || !this.recipient.name)) {
    this.invalidate('recipient.name', 'Recipient name is required for non-income transactions');
  }
  
  // Set default recipient for Income transactions if not provided
  if (this.transactionType === 'Income' && (!this.recipient || !this.recipient.name)) {
    if (!this.recipient) {
      this.recipient = {};
    }
    this.recipient.name = this.description || 'Income Source';
    this.recipient.type = 'merchant';
  }
  
  next();
});

// Indexing for faster queries by user and date
TransactionSchema.index({ user: 1, date: -1 });
// Index for finding transactions by type
TransactionSchema.index({ user: 1, transactionType: 1 });
// Index for finding transactions by category
TransactionSchema.index({ user: 1, category: 1 });
// Index for finding transactions by recipient name (for auto-suggestions)
TransactionSchema.index({ user: 1, 'recipient.name': 1 });

module.exports = TransactionSchema;
