const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const User = require('../models/User');
const { convertCurrency } = require('../utils/currencyUtils');

// Helper function to convert amount to user's preferred currency
const convertToPreferredCurrency = (amount, fromCurrency, toCurrency) => {
  return convertCurrency(amount, fromCurrency, toCurrency);
};

// @desc    Calculate the net worth for the logged-in user
// @access  Private
exports.getNetWorth = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's preferred currency
    const user = await User.findById(userId);
    const preferredCurrency = user.preferredCurrency || 'INR';

    // Fetch all assets
    const assets = await Asset.find({ userId });

    // Sum asset values, converting each to the preferred currency
    const totalAssets = assets.reduce((sum, asset) => {
      const assetCurrency = asset.currency || 'INR';
      const convertedValue = convertToPreferredCurrency(asset.value, assetCurrency, preferredCurrency);
      return sum + convertedValue;
    }, 0);

    // Fetch all liabilities
    const liabilities = await Liability.find({ userId });

    // Sum liability balances, converting each to the preferred currency
    const totalLiabilities = liabilities.reduce((sum, liability) => {
      const liabilityCurrency = liability.currency || 'INR';
      const convertedBalance = convertToPreferredCurrency(liability.balance, liabilityCurrency, preferredCurrency);
      return sum + convertedBalance;
    }, 0);

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;

    res.json({
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      currency: preferredCurrency
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};