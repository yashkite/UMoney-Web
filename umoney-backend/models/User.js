const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @description Schema for User model
 * @param {string} googleId - Google ID of the user
 * @param {string} displayName - Display name of the user
 * @param {string} firstName - First name of the user
 * @param {string} lastName - Last name of the user
 * @param {string} email - Email of the user
 * @param {string} profilePicture - URL to the profile picture
 * @param {Date} createdAt - Date when the user was created
 * @param {number} emergencyFundTarget - Target amount for the emergency fund
 * @param {array} loanDetails - Array of loan details
 * @param {number} loanDetails.principal - Principal amount of the loan
 * @param {number} loanDetails.interestRate - Interest rate of the loan
 * @param {number} loanDetails.minimumPayment - Minimum payment for the loan
 * @param {Date} loanDetails.dueDate - Due date of the loan
 * @param {object} insuranceDetails - Object containing insurance details
 * @param {number} insuranceDetails.lifeInsuranceCoverage - Life insurance coverage amount
 * @param {number} insuranceDetails.healthInsuranceCoverage - Health insurance coverage amount
 * @param {number} insuranceDetails.criticalIllnessCover - Critical illness cover amount
 * @param {array} investmentDetails - Array of investment details
 * @param {string} investmentDetails.type - Type of investment
 * @param {number} investmentDetails.amountInvested - Amount invested
 * @param {number} investmentDetails.expectedReturn - Expected return on investment
 * @param {object} taxPlanningDetails - Object containing tax planning details
 * @param {number} taxPlanningDetails.taxSavingsFundBenefits - Tax savings fund benefits amount
 * @param {number} taxPlanningDetails.npsBenefits - NPS benefits amount
 */
const UserSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true // Ensure each Google ID is unique
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: {
    type: String
    // Optional, can be extracted from displayName or Google profile
  },
  lastName: {
    type: String
    // Optional, can be extracted from displayName or Google profile
  },
  preferredCurrency: {
    type: String,
    default: 'INR' // Default currency
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure each email is unique
  },
  phone: {
    type: String // User's phone number
  },
  profilePicture: {
    type: String // URL to the profile picture
  },
  dateOfBirth: {
    type: Date
  },
  employmentType: {
    type: String, // e.g., 'Salaried', 'Self-employed', 'Business', 'Student', 'Unemployed'
    enum: ['Salaried', 'Self-employed', 'Business', 'Student', 'Unemployed', null], // Allow null or specific values
    default: null
  },
  estimatedMonthlyIncome: {
    type: Number,
    default: 0
  },
  estimatedMonthlyExpenses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  emergencyFundTarget: {
    type: Number,
    default: 0
  },
  loanDetails: [{
    principal: {
      type: Number,
      default: 0
    },
    interestRate: {
      type: Number,
      default: 0
    },
    minimumPayment: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date
    }
  }],
  insuranceDetails: {
    lifeInsuranceCoverage: {
      type: Number,
      default: 0
    },
    healthInsuranceCoverage: {
      type: Number,
      default: 0
    },
    criticalIllnessCover: {
      type: Number,
      default: 0
    }
  },
  investmentDetails: [{
    type: {
      type: String
    },
    amountInvested: {
      type: Number,
      default: 0
    },
    expectedReturn: {
      type: Number,
      default: 0
    }
  }],
  taxPlanningDetails: {
    taxSavingsFundBenefits: {
      type: Number,
      default: 0
    },
    npsBenefits: {
      type: Number,
      default: 0
    }
  },
  budgetPreferences: {
    needs: {
      percentage: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      }
    },
    wants: {
      percentage: {
        type: Number,
        default: 30,
        min: 0,
        max: 100
      }
    },
    savings: {
      percentage: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      }
    }
  },
  setupComplete: {
    type: Boolean,
    default: false
  },
  frequentRecipients: [{
    name: String,
    type: {
      type: String,
      enum: ['contact', 'upi', 'bank', 'merchant']
    },
    frequency: {
      type: Number,
      default: 0
    }
  }],
  transactionTags: {
    needs: [String],
    wants: [String],
    savings: [String],
    income: [String]
  }
});

// Add custom validation for budget percentages
UserSchema.pre('validate', function(next) {
  if (this.budgetPreferences) {
    const needs = this.budgetPreferences.needs?.percentage || 0;
    const wants = this.budgetPreferences.wants?.percentage || 0;
    const savings = this.budgetPreferences.savings?.percentage || 0;

    const total = needs + wants + savings;

    if (Math.abs(total - 100) >= 0.01) {
      this.invalidate('budgetPreferences', 'Budget percentages must sum to 100%');
    }
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
