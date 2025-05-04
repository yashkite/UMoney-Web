const mongoose = require('mongoose');

/**
 * @description Schema for Liability model
 * @param {ObjectId} userId - Reference to the User model
 * @param {string} name - Name of the liability
 * @param {string} type - Type of the liability (Loan, Credit Card, Mortgage, Other)
 * @param {number} balance - Current balance of the liability
 * @param {number} interestRate - Interest rate of the liability (percentage)
 * @param {Date} dateAdded - Date when the liability was added
 */
const liabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Loan', 'Credit Card', 'Mortgage', 'Other'] // Example types
  },
  balance: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR' // Default currency
  },
  interestRate: {
    type: Number, // Store as a percentage, e.g., 5 for 5%
    required: false // Optional, but recommended for debt management features
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const Liability = mongoose.model('Liability', liabilitySchema);

module.exports = Liability;
