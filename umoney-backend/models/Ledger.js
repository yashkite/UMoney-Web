const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @description Schema for Ledger model
 * @param {ObjectId} userId - Reference to the User model
 * @param {string} type - Type of ledger (Income, Needs, Wants, Savings)
 * @param {number} balance - Current balance of the ledger
 * @param {Date} createdAt - Date when the ledger was created
 * @param {Date} updatedAt - Date when the ledger was last updated
 */
const LedgerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Income', 'Needs', 'Wants', 'Savings'],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create a compound index on userId and type to ensure uniqueness
LedgerSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Ledger', LedgerSchema);
