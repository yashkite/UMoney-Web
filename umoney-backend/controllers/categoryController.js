// umoney-backend/controllers/categoryController.js

// Logic for handling category-related requests
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const { createDefaultCategories } = require('../utils/categoryUtils');

exports.getCategories = async (req, res) => {
  try {
    console.log('getCategories: Request received from user:', req.user.id);

    // Find categories for the current user
    let categories = await Category.find({ user: req.user.id });
    console.log('getCategories: Found', categories.length, 'categories for user');

    // If no categories exist, create default ones
    if (!categories || categories.length === 0) {
      console.log('getCategories: No categories found for user, creating defaults');
      await createDefaultCategories(req.user.id);

      // Fetch the newly created categories
      categories = await Category.find({ user: req.user.id });
      console.log('getCategories: Created', categories.length, 'default categories');
    }

    // Return the categories
    console.log('getCategories: Returning categories to client');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    // Validate type
    const validTypes = ['Income', 'Needs', 'Wants', 'Savings'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Create new category
    const newCategory = new Category({
      user: req.user.id,
      name,
      type,
      icon: icon || 'pi pi-tag', // Default icon
      color: color || '#607D8B', // Default color
      isCustom: true
    });

    // Save to database
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A category with this name already exists for this type'
      });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    // Find category and ensure it belongs to the user
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow changing the type of a category
    // Update fields if provided
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    // Save changes
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A category with this name already exists for this type'
      });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Find category and ensure it belongs to the user
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow deleting default categories
    if (!category.isCustom) {
      return res.status(400).json({
        message: 'Default categories cannot be deleted'
      });
    }

    // Check if there are any transactions using this category
    const transactionCount = await Transaction.countDocuments({
      user: req.user.id,
      category: req.params.id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category that is used in ${transactionCount} transactions`
      });
    }

    // Delete the category
    await category.deleteOne();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Get categories by type
 * @route GET /api/categories/type/:type
 */
exports.getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;

    // Validate type
    const validTypes = ['Income', 'Needs', 'Wants', 'Savings'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Find categories for the current user and specified type
    const categories = await Category.find({
      user: req.user.id,
      type
    }).sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getCategoriesByType:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Get category usage statistics
 * @route GET /api/categories/stats
 */
exports.getCategoryStats = async (req, res) => {
  try {
    // Get date range from query params or use default (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (req.query.days ? parseInt(req.query.days) : 30));

    // Aggregate transactions by category
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId.createFromHexString(req.user.id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $project: {
          _id: 1,
          categoryId: '$_id',
          categoryName: '$categoryDetails.name',
          categoryType: '$categoryDetails.type',
          categoryIcon: '$categoryDetails.icon',
          categoryColor: '$categoryDetails.color',
          totalAmount: 1,
          count: 1
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.status(200).json(categoryStats);
  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Reset categories to defaults
 * @route POST /api/categories/reset
 */
exports.resetCategories = async (req, res) => {
  try {
    // Delete all custom categories for the user
    await Category.deleteMany({
      user: req.user.id,
      isCustom: true
    });

    // Delete all default categories for the user
    await Category.deleteMany({
      user: req.user.id,
      isCustom: false
    });

    // Create default categories
    await createDefaultCategories(req.user.id);

    // Fetch the newly created categories
    const categories = await Category.find({ user: req.user.id });

    res.status(200).json({
      message: 'Categories reset to defaults successfully',
      categories
    });
  } catch (error) {
    console.error('Error in resetCategories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Update category budget allocation
 * @route PUT /api/categories/:id/budget
 */
exports.updateCategoryBudget = async (req, res) => {
  try {
    const { percentage, amount } = req.body;

    // Validate input
    if (percentage === undefined && amount === undefined) {
      return res.status(400).json({
        message: 'Either percentage or amount must be provided'
      });
    }

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({
        message: 'Percentage must be between 0 and 100'
      });
    }

    if (amount !== undefined && amount < 0) {
      return res.status(400).json({
        message: 'Amount must be a positive number'
      });
    }

    // Find category and ensure it belongs to the user
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update budget allocation
    if (percentage !== undefined) {
      category.budgetAllocation.percentage = percentage;
    }

    if (amount !== undefined) {
      category.budgetAllocation.amount = amount;
    }

    // Save changes
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category budget:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
