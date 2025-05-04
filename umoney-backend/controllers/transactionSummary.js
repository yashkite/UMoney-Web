// umoney-backend/controllers/transactionSummary.js

const User = require('../models/User');

// Logic for handling transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const summary = await getTransactionSummary(req.user.id);

    // Get user's preferred currency
    const user = await User.findById(req.user.id);
    const preferredCurrency = user.preferredCurrency || 'INR';

    res.json({
      success: true,
      data: {
        ...summary,
        currency: preferredCurrency
      }
    });
  } catch (err) {
    console.error('Error getting transaction summary:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};