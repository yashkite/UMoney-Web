import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Sample data
const sampleTransactions = [
  {
    _id: 'income-1',
    description: 'Test Income',
    amount: 1000,
    transactionType: 'Income',
    date: new Date().toISOString(),
    category: {
      _id: 'cat-1',
      name: 'Salary',
      type: 'Income'
    },
    isDistribution: false,
    isEditable: true
  },
  {
    _id: 'needs-1',
    description: 'Test Income - Needs Allocation',
    amount: 500,
    transactionType: 'Needs',
    date: new Date().toISOString(),
    category: {
      _id: 'cat-2',
      name: 'Groceries',
      type: 'Needs'
    },
    parentTransactionId: 'income-1',
    isDistribution: true,
    isEditable: false
  },
  {
    _id: 'wants-1',
    description: 'Test Income - Wants Allocation',
    amount: 300,
    transactionType: 'Wants',
    date: new Date().toISOString(),
    category: {
      _id: 'cat-3',
      name: 'Entertainment',
      type: 'Wants'
    },
    parentTransactionId: 'income-1',
    isDistribution: true,
    isEditable: false
  },
  {
    _id: 'savings-1',
    description: 'Test Income - Savings Allocation',
    amount: 200,
    transactionType: 'Savings',
    date: new Date().toISOString(),
    category: {
      _id: 'cat-4',
      name: 'Emergency Fund',
      type: 'Savings'
    },
    parentTransactionId: 'income-1',
    isDistribution: true,
    isEditable: false
  },
  {
    _id: 'expense-1',
    description: 'Grocery Shopping',
    amount: 150,
    transactionType: 'Needs',
    date: new Date().toISOString(),
    category: {
      _id: 'cat-2',
      name: 'Groceries',
      type: 'Needs'
    },
    recipient: {
      name: 'Supermarket',
      type: 'merchant'
    },
    isDistribution: false,
    isEditable: true
  }
];

// Define handlers
const handlers = [
  // Get all transactions
  rest.get('http://localhost:5000/api/transactions', (req, res, ctx) => {
    const type = req.url.searchParams.get('type');
    let transactions = [...sampleTransactions];
    
    if (type) {
      transactions = transactions.filter(t => t.transactionType === type);
    }
    
    return res(ctx.status(200), ctx.json(transactions));
  }),
  
  // Get transaction by ID
  rest.get('http://localhost:5000/api/transactions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const transaction = sampleTransactions.find(t => t._id === id);
    
    if (!transaction) {
      return res(ctx.status(404), ctx.json({ msg: 'Transaction not found' }));
    }
    
    return res(ctx.status(200), ctx.json(transaction));
  }),
  
  // Add income transaction
  rest.post('http://localhost:5000/api/transactions/income', (req, res, ctx) => {
    const { description, amount } = req.body;
    
    if (!description || !amount) {
      return res(ctx.status(400), ctx.json({ msg: 'Please include description and amount' }));
    }
    
    const newIncome = {
      _id: 'new-income-1',
      description,
      amount: parseFloat(amount),
      transactionType: 'Income',
      date: new Date().toISOString(),
      category: {
        _id: 'cat-1',
        name: 'Salary',
        type: 'Income'
      },
      isDistribution: false,
      isEditable: true
    };
    
    const needsAmount = parseFloat(amount) * 0.5;
    const wantsAmount = parseFloat(amount) * 0.3;
    const savingsAmount = parseFloat(amount) * 0.2;
    
    const needsTransaction = {
      _id: 'new-needs-1',
      description: `${description} - Needs Allocation`,
      amount: needsAmount,
      transactionType: 'Needs',
      date: new Date().toISOString(),
      category: {
        _id: 'cat-2',
        name: 'Groceries',
        type: 'Needs'
      },
      parentTransactionId: 'new-income-1',
      isDistribution: true,
      isEditable: false
    };
    
    const wantsTransaction = {
      _id: 'new-wants-1',
      description: `${description} - Wants Allocation`,
      amount: wantsAmount,
      transactionType: 'Wants',
      date: new Date().toISOString(),
      category: {
        _id: 'cat-3',
        name: 'Entertainment',
        type: 'Wants'
      },
      parentTransactionId: 'new-income-1',
      isDistribution: true,
      isEditable: false
    };
    
    const savingsTransaction = {
      _id: 'new-savings-1',
      description: `${description} - Savings Allocation`,
      amount: savingsAmount,
      transactionType: 'Savings',
      date: new Date().toISOString(),
      category: {
        _id: 'cat-4',
        name: 'Emergency Fund',
        type: 'Savings'
      },
      parentTransactionId: 'new-income-1',
      isDistribution: true,
      isEditable: false
    };
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Income transaction created successfully',
        data: {
          incomeTransaction: newIncome,
          distributedTransactions: {
            needs: needsTransaction,
            wants: wantsTransaction,
            savings: savingsTransaction
          }
        }
      })
    );
  }),
  
  // Update transaction
  rest.put('http://localhost:5000/api/transactions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { description, amount } = req.body;
    
    const transaction = sampleTransactions.find(t => t._id === id);
    
    if (!transaction) {
      return res(ctx.status(404), ctx.json({ msg: 'Transaction not found' }));
    }
    
    // Check if it's a distribution transaction
    if (transaction.isDistribution) {
      return res(
        ctx.status(403),
        ctx.json({
          msg: 'This transaction cannot be directly edited because it is a system-generated distribution.'
        })
      );
    }
    
    // If it's an income transaction, update distributions too
    if (transaction.transactionType === 'Income') {
      const updatedIncome = {
        ...transaction,
        description: description || transaction.description,
        amount: amount ? parseFloat(amount) : transaction.amount
      };
      
      const needsAmount = updatedIncome.amount * 0.5;
      const wantsAmount = updatedIncome.amount * 0.3;
      const savingsAmount = updatedIncome.amount * 0.2;
      
      const distributionTransactions = sampleTransactions
        .filter(t => t.parentTransactionId === id)
        .map(t => {
          if (t.transactionType === 'Needs') {
            return { ...t, amount: needsAmount, description: `${updatedIncome.description} - Needs Allocation` };
          } else if (t.transactionType === 'Wants') {
            return { ...t, amount: wantsAmount, description: `${updatedIncome.description} - Wants Allocation` };
          } else if (t.transactionType === 'Savings') {
            return { ...t, amount: savingsAmount, description: `${updatedIncome.description} - Savings Allocation` };
          }
          return t;
        });
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Income transaction and distributions updated successfully',
          data: {
            incomeTransaction: updatedIncome,
            distributionTransactions
          }
        })
      );
    }
    
    // For regular transactions
    const updatedTransaction = {
      ...transaction,
      description: description || transaction.description,
      amount: amount ? parseFloat(amount) : transaction.amount
    };
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Transaction updated successfully',
        data: updatedTransaction
      })
    );
  }),
  
  // Delete transaction
  rest.delete('http://localhost:5000/api/transactions/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    const transaction = sampleTransactions.find(t => t._id === id);
    
    if (!transaction) {
      return res(ctx.status(404), ctx.json({ msg: 'Transaction not found' }));
    }
    
    // Check if it's a distribution transaction
    if (transaction.isDistribution) {
      return res(
        ctx.status(403),
        ctx.json({
          msg: 'This transaction cannot be directly deleted because it is a system-generated distribution.'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: transaction.transactionType === 'Income'
          ? 'Income transaction and all related distributions deleted successfully'
          : 'Transaction deleted successfully'
      })
    );
  }),
  
  // Get transaction summary
  rest.get('http://localhost:5000/api/transactions/summary', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        income: 1000,
        needs: 350, // 500 - 150 (expense)
        wants: 300,
        savings: 200
      })
    );
  })
];

// Setup MSW server
const server = setupServer(...handlers);

export { server, rest };
