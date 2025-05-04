import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../__mocks__/apiMocks';
import TransactionPage from './TransactionPage';
import * as apiUtils from '../utils/apiUtils';
import { CurrencyProvider } from '../contexts/CurrencyContext';

// Mock the API utils
jest.mock('../utils/apiUtils', () => ({
  getTransactions: jest.fn().mockResolvedValue([
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
      isDistribution: false,
      isEditable: true
    }
  ]),
  deleteTransaction: jest.fn().mockResolvedValue({ success: true })
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn().mockReturnValue('USD'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Intl.DateTimeFormat
const mockDateTimeFormat = {
  resolvedOptions: jest.fn().mockReturnValue({ timeZone: 'America/New_York' })
};
global.Intl.DateTimeFormat = jest.fn(() => mockDateTimeFormat);

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      <CurrencyProvider>
        {ui}
      </CurrencyProvider>
    </BrowserRouter>
  );
};

describe('TransactionPage Component', () => {
  const mockTransactions = [
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

  beforeEach(() => {
    apiUtils.getTransactions.mockResolvedValue(mockTransactions);
    apiUtils.deleteTransaction.mockResolvedValue({ success: true });
  });

  it('renders transaction list correctly', async () => {
    renderWithRouter(<TransactionPage transactionType="All" />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Check if transactions are displayed
    expect(screen.getAllByTestId('table-row')).toHaveLength(3);
    expect(screen.getByText('Test Income')).toBeInTheDocument();
    expect(screen.getByText('Test Income - Needs Allocation')).toBeInTheDocument();
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
  });

  it('displays Auto tag for distribution transactions', async () => {
    renderWithRouter(<TransactionPage transactionType="Needs" />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Filter to only show Needs transactions
    const needsTransactions = mockTransactions.filter(t => t.transactionType === 'Needs');
    expect(screen.getAllByTestId('table-row')).toHaveLength(needsTransactions.length);

    // Check for Auto tag on distribution transaction
    const autoTags = screen.getAllByText('Auto');
    expect(autoTags.length).toBeGreaterThan(0);
  });

  it('shows different action buttons for regular vs distribution transactions', async () => {
    renderWithRouter(<TransactionPage transactionType="Needs" />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Check for edit buttons (should be present for regular transactions only)
    const editButtons = screen.getAllByTestId('edit-button');
    expect(editButtons.length).toBe(1); // Only for the regular expense

    // Check for info buttons (should be present for distribution transactions only)
    const infoButtons = screen.getAllByTestId('info-button');
    expect(infoButtons.length).toBe(1); // Only for the distribution transaction
  });

  it('handles delete transaction correctly', async () => {
    renderWithRouter(<TransactionPage transactionType="All" />);

    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });

    // Find and click delete button for a regular transaction
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByText('Yes');
    fireEvent.click(confirmButton);

    // Check if delete API was called
    await waitFor(() => {
      expect(apiUtils.deleteTransaction).toHaveBeenCalled();
    });

    // Check if transactions are reloaded
    expect(apiUtils.getTransactions).toHaveBeenCalledTimes(2);
  });
});
