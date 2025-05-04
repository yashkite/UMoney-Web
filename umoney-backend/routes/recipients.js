const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const recipientController = require('../controllers/recipientController');

// @route   GET /api/recipients
// @desc    Get frequent recipients for the logged-in user
// @access  Private
router.get('/', ensureAuth, recipientController.getRecipients);

// @route   POST /api/recipients
// @desc    Add or update a recipient in user's frequent recipients
// @access  Private
router.post('/', ensureAuth, recipientController.addRecipient);

// @route   PUT /api/recipients/:id
// @desc    Update a recipient in user's frequent recipients
// @access  Private
// router.put('/:id', ensureAuth, recipientController.updateRecipient);

// @route   DELETE /api/recipients/:id
// @desc    Delete a recipient in user's frequent recipients
// @access  Private
// router.delete('/:id', ensureAuth, recipientController.deleteRecipient);

module.exports = router;
