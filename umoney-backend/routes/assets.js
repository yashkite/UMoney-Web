const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const assetController = require('../controllers/assetController'); // Import the controller

// Middleware to protect all routes in this file
router.use(authMiddleware.ensureAuth);

// @route   GET api/assets
// @desc    Get all assets for the logged-in user
// @access  Private
router.get('/', assetController.getAssets);

// @route   POST api/assets
// @desc    Create a new asset
// @access  Private
router.post('/', assetController.createAsset);

// @route   PUT api/assets/:id
// @desc    Update an asset
// @access  Private
router.put('/:id', assetController.updateAsset);

// @route   DELETE api/assets/:id
// @desc    Delete an asset
// @access  Private
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
