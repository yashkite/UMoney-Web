const Category = require('../models/Category');

/**
 * Creates default categories for a new user
 * @param {string} userId - The ID of the user
 */
const createDefaultCategories = async (userId) => {
  try {
    // Define default categories by type
    const defaultCategories = {
      Income: [
        { name: 'Salary', icon: 'pi pi-money-bill', color: '#4CAF50' },
        { name: 'Freelance', icon: 'pi pi-briefcase', color: '#2196F3' },
        { name: 'Investments', icon: 'pi pi-chart-line', color: '#9C27B0' },
        { name: 'Gifts', icon: 'pi pi-gift', color: '#E91E63' },
        { name: 'Other', icon: 'pi pi-tag', color: '#607D8B' }
      ],
      Needs: [
        { name: 'Rent/Mortgage', icon: 'pi pi-home', color: '#F44336' },
        { name: 'Groceries', icon: 'pi pi-shopping-cart', color: '#4CAF50' },
        { name: 'Utilities', icon: 'pi pi-bolt', color: '#FFC107' },
        { name: 'Transportation', icon: 'pi pi-car', color: '#2196F3' },
        { name: 'Healthcare', icon: 'pi pi-heart', color: '#E91E63' },
        { name: 'Insurance', icon: 'pi pi-shield', color: '#9C27B0' },
        { name: 'Education', icon: 'pi pi-book', color: '#3F51B5' },
        { name: 'Personal Care', icon: 'pi pi-user', color: '#00BCD4' }
      ],
      Wants: [
        { name: 'Dining Out', icon: 'pi pi-utensils', color: '#FF9800' },
        { name: 'Entertainment', icon: 'pi pi-ticket', color: '#9C27B0' },
        { name: 'Shopping', icon: 'pi pi-shopping-bag', color: '#E91E63' },
        { name: 'Travel', icon: 'pi pi-globe', color: '#2196F3' },
        { name: 'Hobbies', icon: 'pi pi-palette', color: '#4CAF50' },
        { name: 'Subscriptions', icon: 'pi pi-desktop', color: '#607D8B' }
      ],
      Savings: [
        { name: 'Emergency Fund', icon: 'pi pi-shield', color: '#F44336' },
        { name: 'Retirement', icon: 'pi pi-calendar', color: '#4CAF50' },
        { name: 'Investments', icon: 'pi pi-chart-line', color: '#2196F3' },
        { name: 'Debt Repayment', icon: 'pi pi-credit-card', color: '#FF9800' },
        { name: 'Goals', icon: 'pi pi-flag', color: '#9C27B0' }
      ]
    };

    // Create categories for each type
    for (const [type, categories] of Object.entries(defaultCategories)) {
      for (const category of categories) {
        await Category.findOneAndUpdate(
          { 
            user: userId, 
            name: category.name, 
            type 
          },
          { 
            user: userId,
            name: category.name,
            type,
            isCustom: false,
            icon: category.icon,
            color: category.color
          },
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );
      }
    }

    console.log(`Created default categories for user ${userId}`);
  } catch (error) {
    console.error('Error creating default categories:', error);
    throw error;
  }
};

module.exports = {
  createDefaultCategories
};
