const mongoose = require('mongoose');

/**
 * @description Schema for Asset model
 * @param {ObjectId} userId - Reference to the User model
 * @param {string} name - Name of the asset
 * @param {string} type - Type of the asset (Cash, Investment, Real Estate, Other)
 * @param {number} value - Value of the asset
 * @param {Date} dateAdded - Date when the asset was added
 */
const assetSchema = new mongoose.Schema({
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
    enum: ['Cash', 'Investment', 'Real Estate', 'Other'] // Example types
  },
  value: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR' // Default currency
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
