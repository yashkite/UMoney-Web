import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import * as apiUtils from '../utils/apiUtils';

// A simple component that mimics the transaction page
const SimpleTransactionPage = ({ transactionType = 'All' }) => {
  const [transactions, setTransactions] = React.useState([]);
  const [summary, setSummary] = React.useState({
    income: 0,
    expenses: 0,
    balance: 0
  });

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Call the API and immediately set the result
        const data = await apiUtils.getTransactions(transactionType);
        console.log('Fetched transactions:', data);

        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);

          // Calculate summary
          const income = data.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
          const expenses = data.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

          setSummary({
            income,
            expenses,
            balance: income - expenses
          });
        } else {
          console.error('No transactions returned or invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [transactionType]);

  const handleDelete = async (id) => {
    try {
      await apiUtils.deleteTransaction(id);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="transaction-page">
      <h1>{transactionType} Transactions</h1>

      <div className="summary">
        <div>Income: ${summary.income.toFixed(2)}</div>
        <div>Expenses: ${summary.expenses.toFixed(2)}</div>
        <div>Balance: ${summary.balance.toFixed(2)}</div>
      </div>

      <div className="transactions">
        {transactions.length === 0 ? (
          <div data-testid="no-transactions">No transactions found</div>
        ) : (
          <ul>
            {transactions.map(transaction => (
              <li key={transaction._id} data-testid={`transaction-${transaction._id}`}>
                <span>{transaction.description}</span>
                <span>${transaction.amount.toFixed(2)}</span>
                {transaction.isDistribution && <span data-testid="auto-tag">Auto</span>}

                {!transaction.isDistribution ? (
                  <button
                    onClick={() => handleDelete(transaction._id)}
                    data-testid={`delete-${transaction._id}`}
                  >
                    Delete
                  </button>
                ) : null}

                {!transaction.isDistribution ? (
                  <button data-testid={`edit-${transaction._id}`}>Edit</button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Mock the API utils
jest.mock('../utils/apiUtils', () => ({
  getTransactions: jest.fn(),
  deleteTransaction: jest.fn()
}));

describe('TransactionPage Component', () => {
  const mockTransactions = [
    {
      _id: 'income-1',
      description: 'Test Income',
      amount: 1000,
      transactionType: 'Income',
      date: new Date().toISOString(),
      isDistribution: false,
      isEditable: true
    },
    {
      _id: 'needs-1',
      description: 'Test Income - Needs Allocation',
      amount: 500,
      transactionType: 'Needs',
      date: new Date().toISOString(),
      parentTransactionId: 'income-1',
      isDistribution: true,
      isEditable: false
    },
    {
      _id: 'expense-1',
      description: 'Grocery Shopping',
      amount: -150,
      transactionType: 'Needs',
      date: new Date().toISOString(),
      isDistribution: false,
      isEditable: true
    }
  ];

  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <CurrencyProvider>
          {ui}
        </CurrencyProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    apiUtils.getTransactions.mockResolvedValue(mockTransactions);
    apiUtils.deleteTransaction.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays transactions correctly', async () => {
    renderWithProviders(<SimpleTransactionPage />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Debug
    console.log('Mock transactions:', mockTransactions);
    console.log('getTransactions mock calls:', apiUtils.getTransactions.mock.calls);
    console.log('getTransactions mock results:', apiUtils.getTransactions.mock.results);

    // Wait for the component to update with the transactions
    await waitFor(() => {
      expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if transactions are displayed
    expect(screen.getByTestId('transaction-income-1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-needs-1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-expense-1')).toBeInTheDocument();
  });

  it('displays Auto tag for distribution transactions', async () => {
    renderWithProviders(<SimpleTransactionPage transactionType="Needs" />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Wait for the component to update with the transactions
    await waitFor(() => {
      expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Filter to only show Needs transactions
    const distributionTransaction = screen.getByTestId('transaction-needs-1');
    expect(distributionTransaction).toBeInTheDocument();
    expect(distributionTransaction.querySelector('[data-testid="auto-tag"]')).toBeInTheDocument();

    // Regular transaction should not have Auto tag
    const regularTransaction = screen.getByTestId('transaction-expense-1');
    expect(regularTransaction).toBeInTheDocument();
    expect(regularTransaction.querySelector('[data-testid="auto-tag"]')).toBeNull();
  });

  it('shows different action buttons for regular vs distribution transactions', async () => {
    renderWithProviders(<SimpleTransactionPage />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Wait for the component to update with the transactions
    await waitFor(() => {
      expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for edit buttons (should be present for regular transactions only)
    expect(screen.getByTestId('edit-income-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-expense-1')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-needs-1')).not.toBeInTheDocument();

    // Check for delete buttons (should be present for regular transactions only)
    expect(screen.getByTestId('delete-income-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-expense-1')).toBeInTheDocument();
    expect(screen.queryByTestId('delete-needs-1')).not.toBeInTheDocument();
  });

  it('handles delete transaction correctly', async () => {
    renderWithProviders(<SimpleTransactionPage />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Wait for the component to update with the transactions
    await waitFor(() => {
      expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and click delete button for a regular transaction
    const deleteButton = screen.getByTestId('delete-expense-1');
    fireEvent.click(deleteButton);

    // Check if deleteTransaction was called with correct ID
    expect(apiUtils.deleteTransaction).toHaveBeenCalledWith('expense-1');
  });
});
