const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the category types
const categoryTypes = ['Needs', 'Wants', 'Savings', 'Income'];

/**
 * @description Schema for Category model
 * @param {ObjectId} user - Reference to the User model
 * @param {string} name - Name of the category
 * @param {string} type - Type of the category (Needs, Wants, Savings)
 * @param {boolean} isCustom - Indicates if the category is custom or predefined
 * @param {number} budget - Budget allocated to the category
 * @param {Date} createdAt - Date when the category was created
 */
const CategorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Link to the User model
    required: true // Each category belongs to a user
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Income', 'Needs', 'Wants', 'Savings'],
    required: true
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  budgetAllocation: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  icon: {
    type: String,
    default: 'default-icon'
  },
  color: {
    type: String,
    default: '#000000'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique category names per user per type
CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
