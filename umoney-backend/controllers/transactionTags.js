// umoney-backend/controllers/transactionTags.js

const User = require('../models/User');

// Logic for handling transaction tags
exports.getTransactionTags = async (req, res) => {
  try {
    const { type } = req.query;

    // Validate transaction type
    if (type && !['needs', 'wants', 'savings', 'income'].includes(type.toLowerCase())) {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    // Get user data
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized: User ID not found' });
    }
    const user = await User.findById(req.user.id);

    // Return tags based on type or all tags
    if (type) {
      const tags = user.transactionTags?.[type.toLowerCase()] || [];
      res.json({ success: true, data: tags });
    } else {
      res.json({ success: true, data: user.transactionTags || {} });
    }
  } catch (err) {
    console.error('Error getting transaction tags:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.addTransactionTag = async (req, res) => {
  try {
    const { type, tag } = req.body;

    // Validate input
    if (!type || !tag) {
      return res.status(400).json({ msg: 'Please provide transaction type and tag' });
    }

    // Validate transaction type
    const validType = type.toLowerCase();
    if (!['needs', 'wants', 'savings', 'income'].includes(validType)) {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    // Get user data
    const user = await User.findById(req.user.id);

    // Initialize transaction tags if not exists
    if (!user.transactionTags) {
      user.transactionTags = {
        needs: [],
        wants: [],
        savings: [],
        income: []
      };
    }

    // Add tag if it doesn't exist already
    if (!user.transactionTags[validType].includes(tag)) {
      user.transactionTags[validType].push(tag);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Tag added successfully',
      data: user.transactionTags[validType]
    });
  } catch (err) {
    console.error('Error adding transaction tag:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};