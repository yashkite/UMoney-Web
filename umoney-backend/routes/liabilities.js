const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const liabilityController = require('../controllers/liabilityController'); // Import the controller

// Middleware to protect all routes in this file
router.use(authMiddleware.ensureAuth);

// @route   GET api/liabilities
// @desc    Get all liabilities for the logged-in user
// @access  Private
router.get('/', liabilityController.getLiabilities);

// @route   POST api/liabilities
// @desc    Create a new liability
// @access  Private
router.post('/', liabilityController.createLiability);

// @route   PUT api/liabilities/:id
// @desc    Update a liability
// @access  Private
router.put('/:id', liabilityController.updateLiability);

// @route   DELETE api/liabilities/:id
// @desc    Delete a liability
// @access  Private
router.delete('/:id', liabilityController.deleteLiability);

module.exports = router;
