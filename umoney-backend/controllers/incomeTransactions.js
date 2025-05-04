// umoney-backend/controllers/incomeTransactions.js

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

// Logic for handling income transactions
exports.addIncomeTransaction = async (req, res) => {
  try {
    console.log('addIncomeTransaction: Request body:', req.body);

    // Extract data from request body
    const {
      amount,
      description,
      date,
      category,
      distribution,
      currency,
      notes,
      tag,
      recipient
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!amount || !description || !date || !distribution) {
      console.log('addIncomeTransaction: Missing required fields');
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Validate distribution percentages
    const { needs, wants, savings } = distribution;
    if (!needs || !wants || !savings) {
      console.log('addIncomeTransaction: Missing distribution percentages');
      return res.status(400).json({ msg: 'Please provide all distribution percentages' });
    }

    // Validate that percentages sum to 100
    const total = parseFloat(needs) + parseFloat(wants) + parseFloat(savings);
    if (Math.abs(total - 100) > 0.01) {
      console.log('addIncomeTransaction: Distribution percentages do not sum to 100:', total);
      return res.status(400).json({ msg: 'Distribution percentages must sum to 100%' });
    }

    // Get user for budget preferences
    const user = await User.findById(userId);
    if (!user) {
      console.log('addIncomeTransaction: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find or create income category if not provided
    let categoryId = category;
    console.log('addIncomeTransaction: Category ID from request:', categoryId);

    try {
      if (!categoryId) {
        console.log('addIncomeTransaction: No category provided, looking for default category');

        const defaultCategory = await Category.findOne({
          user: userId,
          type: 'Income',
          name: 'Salary'
        });

        if (defaultCategory) {
          console.log('addIncomeTransaction: Found default category:', defaultCategory._id);
          categoryId = defaultCategory._id;
        } else {
          console.log('addIncomeTransaction: No default category found, creating one');

          // Create a default income category
          const newCategory = new Category({
            user: userId,
            name: 'Salary',
            type: 'Income',
            icon: 'pi pi-money-bill',
            color: '#4CAF50',
            isCustom: false
          });

          const savedCategory = await newCategory.save();
          console.log('addIncomeTransaction: Created new category:', savedCategory._id);
          categoryId = savedCategory._id;
        }
      } else {
        // Verify that the category exists and belongs to the user
        console.log('addIncomeTransaction: Verifying category exists:', categoryId);

        const existingCategory = await Category.findOne({
          _id: categoryId,
          user: userId
        });

        if (!existingCategory) {
          console.log('addIncomeTransaction: Category not found or does not belong to user');

          // If category doesn't exist or doesn't belong to user, use default
          const defaultCategory = await Category.findOne({
            user: userId,
            type: 'Income',
            name: 'Salary'
          });

          if (defaultCategory) {
            console.log('addIncomeTransaction: Using default category instead:', defaultCategory._id);
            categoryId = defaultCategory._id;
          } else {
            console.log('addIncomeTransaction: Creating default category');

            // Create a default income category
            const newCategory = new Category({
              user: userId,
              name: 'Salary',
              type: 'Income',
              icon: 'pi pi-money-bill',
              color: '#4CAF50',
              isCustom: false
            });

            const savedCategory = await newCategory.save();
            console.log('addIncomeTransaction: Created new category:', savedCategory._id);
            categoryId = savedCategory._id;
          }
        } else {
          console.log('addIncomeTransaction: Category verified:', existingCategory._id);
        }
      }
    } catch (err) {
      console.error('Error handling category:', err);

      // If there's an error with the category, create a new one
      console.log('addIncomeTransaction: Error with category, creating a new one');

      const newCategory = new Category({
        user: userId,
        name: 'Salary',
        type: 'Income',
        icon: 'pi pi-money-bill',
        color: '#4CAF50',
        isCustom: false
      });

      const savedCategory = await newCategory.save();
      console.log('addIncomeTransaction: Created new category after error:', savedCategory._id);
      categoryId = savedCategory._id;
    }

    // Create the main income transaction
    const incomeTransaction = new Transaction({
      user: userId,
      description,
      amount: parseFloat(amount),
      category: categoryId,
      transactionType: 'Income', // Explicitly set to 'Income'
      date: new Date(date),
      currency: currency || user.preferredCurrency || 'INR',
      attachments: req.files ? req.files.map(file => ({
        url: file.path,
        filename: file.filename,
        type: 'receipt'
      })) : [],
      notes: notes || '',
      tag: tag || '',
      source: 'Manual'
      // The recipient field will be set by the pre-validate hook
    });

    console.log('addIncomeTransaction: Created transaction with type:', incomeTransaction.transactionType);

    // Save the income transaction
    const savedIncomeTransaction = await incomeTransaction.save();
    console.log('addIncomeTransaction: Income transaction saved:', savedIncomeTransaction._id);

    // Calculate distribution amounts
    const needsAmount = (parseFloat(amount) * parseFloat(needs)) / 100;
    const wantsAmount = (parseFloat(amount) * parseFloat(wants)) / 100;
    const savingsAmount = (parseFloat(amount) * parseFloat(savings)) / 100;

    // Create needs distribution transaction
    const needsTransaction = new Transaction({
      user: userId,
      description: `${description} - Needs Allocation`,
      amount: needsAmount,
      category: categoryId, // Use same category or find a needs category
      transactionType: 'Needs',
      date: new Date(date),
      currency: currency || user.preferredCurrency || 'INR',
      source: 'Distribution',
      isDistribution: true,
      parentTransactionId: savedIncomeTransaction._id,
      isEditable: false // Distribution transactions should not be directly editable
    });

    // Create wants distribution transaction
    const wantsTransaction = new Transaction({
      user: userId,
      description: `${description} - Wants Allocation`,
      amount: wantsAmount,
      category: categoryId, // Use same category or find a wants category
      transactionType: 'Wants',
      date: new Date(date),
      currency: currency || user.preferredCurrency || 'INR',
      source: 'Distribution',
      isDistribution: true,
      parentTransactionId: savedIncomeTransaction._id,
      isEditable: false // Distribution transactions should not be directly editable
    });

    // Create savings distribution transaction
    const savingsTransaction = new Transaction({
      user: userId,
      description: `${description} - Savings Allocation`,
      amount: savingsAmount,
      category: categoryId, // Use same category or find a savings category
      transactionType: 'Savings',
      date: new Date(date),
      currency: currency || user.preferredCurrency || 'INR',
      source: 'Distribution',
      isDistribution: true,
      parentTransactionId: savedIncomeTransaction._id,
      isEditable: false // Distribution transactions should not be directly editable
    });

    // Save all distribution transactions
    const savedNeedsTransaction = await needsTransaction.save();
    const savedWantsTransaction = await wantsTransaction.save();
    const savedSavingsTransaction = await savingsTransaction.save();

    console.log('addIncomeTransaction: Distribution transactions saved');

    // Update the income transaction with references to the distributed transactions
    savedIncomeTransaction.distributedTransactions = {
      needs: savedNeedsTransaction._id,
      wants: savedWantsTransaction._id,
      savings: savedSavingsTransaction._id
    };

    // Save the updated income transaction
    await savedIncomeTransaction.save();

    console.log('addIncomeTransaction: Income transaction updated with distribution references');

    // Update user's budget preferences if they've changed
    if (user.budgetPreferences.needs.percentage !== parseFloat(needs) ||
        user.budgetPreferences.wants.percentage !== parseFloat(wants) ||
        user.budgetPreferences.savings.percentage !== parseFloat(savings)) {

      user.budgetPreferences = {
        needs: { percentage: parseFloat(needs) },
        wants: { percentage: parseFloat(wants) },
        savings: { percentage: parseFloat(savings) }
      };

      await user.save();
      console.log('addIncomeTransaction: User budget preferences updated');
    }

    // Return success response with all created transactions
    res.status(201).json({
      success: true,
      message: 'Income transaction added and distributed successfully',
      data: {
        incomeTransaction: savedIncomeTransaction,
        distributedTransactions: {
          needs: savedNeedsTransaction,
          wants: savedWantsTransaction,
          savings: savedSavingsTransaction
        }
      }
    });
  } catch (err) {
    console.error('Error adding income transaction:', err);
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);

    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Validation error details:', err.errors);
      return res.status(400).json({
        msg: 'Validation Error',
        details: err.message,
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }

    if (err.name === 'CastError') {
      console.error('Cast error details:', err);
      return res.status(400).json({
        msg: 'Invalid data format',
        details: err.message
      });
    }

    res.status(500).json({
      msg: 'Server Error',
      details: err.message
    });
  }
};