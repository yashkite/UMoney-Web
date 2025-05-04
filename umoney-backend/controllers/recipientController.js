const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get frequent recipients for the logged-in user
// @route   GET /api/recipients
// @access  Private
exports.getRecipients = async (req, res, next) => {
  try {
    // Get user's frequent recipients from their profile
    const user = await User.findById(req.user.id);
    
    if (!user.frequentRecipients || user.frequentRecipients.length === 0) {
      // If no frequent recipients in user profile, get from transactions
      const transactions = await Transaction.find({ 
        user: req.user.id,
        'recipient.name': { $exists: true, $ne: '' }
      })
      .sort({ date: -1 })
      .limit(20);
      
      // Extract unique recipients
      const recipientMap = new Map();
      
      transactions.forEach(transaction => {
        if (transaction.recipient && transaction.recipient.name) {
          const key = `${transaction.recipient.name}-${transaction.recipient.type || 'unknown'}`;
          
          if (recipientMap.has(key)) {
            // Increment frequency
            recipientMap.set(key, {
              ...recipientMap.get(key),
              frequency: recipientMap.get(key).frequency + 1
            });
          } else {
            // Add new recipient
            recipientMap.set(key, {
              name: transaction.recipient.name,
              type: transaction.recipient.type || 'unknown',
              details: transaction.recipient.details || '',
              frequency: 1
            });
          }
        }
      });
      
      // Convert map to array and sort by frequency
      const recipients = Array.from(recipientMap.values())
        .sort((a, b) => b.frequency - a.frequency);
      
      return res.json(recipients);
    }
    
    // Return user's frequent recipients
    res.json(user.frequentRecipients.sort((a, b) => b.frequency - a.frequency));
  } catch (err) {
    console.error('Error fetching recipients:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Add or update a recipient in user's frequent recipients
// @route   POST /api/recipients
// @access  Private
exports.addRecipient = async (req, res, next) => {
  try {
    const { name, type, details } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ msg: 'Please provide recipient name and type' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if recipient already exists
    const existingIndex = user.frequentRecipients.findIndex(
      r => r.name === name && r.type === type
    );
    
    if (existingIndex !== -1) {
      // Update existing recipient
      user.frequentRecipients[existingIndex].frequency += 1;
      if (details) {
        user.frequentRecipients[existingIndex].details = details;
      }
    } else {
      // Add new recipient
      user.frequentRecipients.push({
        name,
        type,
        details: details || '',
        frequency: 1
      });
    }
    
    await user.save();
    
    res.json(user.frequentRecipients.sort((a, b) => b.frequency - a.frequency));
  } catch (err) {
    console.error('Error adding recipient:', err);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a recipient
// @route   PUT /api/recipients/:id
// @access  Private
exports.updateRecipient = async (req, res, next) => {
  // Logic will be moved here
};

// @desc    Delete a recipient
// @route   DELETE /api/recipients/:id
// @access  Private
exports.deleteRecipient = async (req, res, next) => {
  // Logic will be moved here
};
