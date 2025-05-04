// umoney-backend/controllers/profileController.js

const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  console.log('profileController: updateUserProfile called');
  console.log('profileController: Request body:', req.body);
  console.log('profileController: User from request:', req.user);

  try {
    const { name, phone } = req.body;
    console.log('profileController: Extracted name:', name, 'phone:', phone);

    // Find the user
    const user = await User.findById(req.user.id);
    console.log('profileController: Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('profileController: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields if provided
    if (name) user.displayName = name;
    if (phone) user.phone = phone;

    console.log('profileController: Updated user object:', {
      displayName: user.displayName,
      phone: user.phone
    });

    // Save the updated user
    await user.save();
    console.log('profileController: User saved successfully');

    // Return success response with updated user data
    const responseData = {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.displayName,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        setupComplete: user.setupComplete
      }
    };

    console.log('profileController: Sending response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error stack:', error.stack);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.log('profileController: Validation error detected');
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.log('profileController: Sending 500 error response');
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};
