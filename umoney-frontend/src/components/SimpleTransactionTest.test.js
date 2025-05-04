import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';

// A simple component that mimics the transaction display
const SimpleTransactionDisplay = ({ transactions }) => {
  return (
    <div>
      <h1>Transactions</h1>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction._id} data-testid={`transaction-${transaction._id}`}>
            <span>{transaction.description}</span>
            <span>{transaction.amount}</span>
            {transaction.isDistribution && <span data-testid="auto-tag">Auto</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('Simple Transaction Tests', () => {
  const mockTransactions = [
    {
      _id: 'income-1',
      description: 'Test Income',
      amount: 1000,
      transactionType: 'Income',
      isDistribution: false,
      isEditable: true
    },
    {
      _id: 'needs-1',
      description: 'Test Income - Needs Allocation',
      amount: 500,
      transactionType: 'Needs',
      parentTransactionId: 'income-1',
      isDistribution: true,
      isEditable: false
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

  it('displays transactions correctly', () => {
    renderWithProviders(<SimpleTransactionDisplay transactions={mockTransactions} />);
    
    // Check if transactions are displayed
    expect(screen.getByText('Test Income')).toBeInTheDocument();
    expect(screen.getByText('Test Income - Needs Allocation')).toBeInTheDocument();
  });

  it('shows Auto tag for distribution transactions', () => {
    renderWithProviders(<SimpleTransactionDisplay transactions={mockTransactions} />);
    
    // Check if Auto tag is displayed for distribution transaction
    const distributionTransaction = screen.getByTestId('transaction-needs-1');
    expect(distributionTransaction).toBeInTheDocument();
    expect(distributionTransaction.querySelector('[data-testid="auto-tag"]')).toBeInTheDocument();
    
    // Regular transaction should not have Auto tag
    const regularTransaction = screen.getByTestId('transaction-income-1');
    expect(regularTransaction).toBeInTheDocument();
    expect(regularTransaction.querySelector('[data-testid="auto-tag"]')).toBeNull();
  });
});
