import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { server } from '../__mocks__/apiMocks';
import App from '../App';
import Dashboard from '../components/Dashboard';
import TransactionPage from '../components/TransactionPage';
import TransactionForm from '../components/TransactionForm';
import * as apiUtils from '../utils/apiUtils';

// Mock the API utils
jest.mock('../utils/apiUtils', () => ({
  getTransactionSummary: jest.fn(),
  getRecentTransactions: jest.fn(),
  getTransactions: jest.fn(),
  getCategories: jest.fn(),
  addIncome: jest.fn(),
  addExpense: jest.fn(),
  deleteTransaction: jest.fn()
}));

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock components to simplify testing
jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

const renderApp = () => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/income" element={<TransactionPage transactionType="Income" />} />
          <Route path="/app/income/add" element={<TransactionForm transactionType="Income" />} />
          <Route path="/app/needs" element={<TransactionPage transactionType="Needs" />} />
          <Route path="/app/wants" element={<TransactionPage transactionType="Wants" />} />
          <Route path="/app/savings" element={<TransactionPage transactionType="Savings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

describe('Integration Tests', () => {
  const mockCategories = [
    { _id: 'cat-1', name: 'Salary', type: 'Income' },
    { _id: 'cat-2', name: 'Groceries', type: 'Needs' },
    { _id: 'cat-3', name: 'Entertainment', type: 'Wants' },
    { _id: 'cat-4', name: 'Emergency Fund', type: 'Savings' }
  ];
  
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
      }
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
    }
  ];
  
  const mockSummary = {
    income: 1000,
    needs: 500,
    wants: 300,
    savings: 200
  };
  
  beforeEach(() => {
    // Setup mock responses
    apiUtils.getCategories.mockResolvedValue(mockCategories);
    apiUtils.getTransactions.mockResolvedValue(mockTransactions);
    apiUtils.getTransactionSummary.mockResolvedValue(mockSummary);
    apiUtils.getRecentTransactions.mockResolvedValue(mockTransactions);
    
    apiUtils.addIncome.mockResolvedValue({
      success: true,
      data: {
        incomeTransaction: {
          _id: 'new-income-1',
          description: 'New Income',
          amount: 2000,
          transactionType: 'Income'
        },
        distributedTransactions: {
          needs: { amount: 1000 },
          wants: { amount: 600 },
          savings: { amount: 400 }
        }
      }
    });
    
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/app/dashboard'
      },
      writable: true
    });
  });
  
  it('shows updated dashboard after adding income', async () => {
    renderApp();
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(apiUtils.getTransactionSummary).toHaveBeenCalled();
    });
    
    // Check initial summary
    expect(screen.getByText(/₹1,000/i)).toBeInTheDocument(); // Initial income
    
    // Navigate to add income page
    window.location.pathname = '/app/income/add';
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Fill out income form
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'New Income' }
    });
    
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: '2000' }
    });
    
    // Select category
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'cat-1' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Check if addIncome was called
    await waitFor(() => {
      expect(apiUtils.addIncome).toHaveBeenCalled();
    });
    
    // Update mock summary to reflect new income
    const updatedSummary = {
      income: 3000, // 1000 + 2000
      needs: 1500, // 500 + 1000
      wants: 900, // 300 + 600
      savings: 600 // 200 + 400
    };
    apiUtils.getTransactionSummary.mockResolvedValue(updatedSummary);
    
    // Navigate back to dashboard
    window.location.pathname = '/app/dashboard';
    
    // Wait for updated summary to load
    await waitFor(() => {
      expect(apiUtils.getTransactionSummary).toHaveBeenCalledTimes(2);
    });
    
    // Check updated summary
    expect(screen.getByText(/₹3,000/i)).toBeInTheDocument(); // Updated income
    expect(screen.getByText(/₹1,500/i)).toBeInTheDocument(); // Updated needs
    expect(screen.getByText(/₹900/i)).toBeInTheDocument(); // Updated wants
    expect(screen.getByText(/₹600/i)).toBeInTheDocument(); // Updated savings
  });
  
  it('shows distribution transactions in needs page', async () => {
    // Navigate to needs page
    window.location.pathname = '/app/needs';
    
    renderApp();
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });
    
    // Check if distribution transaction is displayed
    expect(screen.getByText('Test Income - Needs Allocation')).toBeInTheDocument();
    
    // Check if Auto tag is displayed
    expect(screen.getByText('Auto')).toBeInTheDocument();
    
    // Check if info button is displayed instead of edit button
    expect(screen.getByTestId('info-button')).toBeInTheDocument();
  });
  
  it('prevents editing distribution transactions', async () => {
    // Navigate to needs page
    window.location.pathname = '/app/needs';
    
    renderApp();
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(apiUtils.getTransactions).toHaveBeenCalled();
    });
    
    // Try to edit distribution transaction
    const infoButton = screen.getByTestId('info-button');
    fireEvent.click(infoButton);
    
    // Check if tooltip is displayed
    expect(screen.getByText(/Auto-generated distribution/i)).toBeInTheDocument();
  });
});
