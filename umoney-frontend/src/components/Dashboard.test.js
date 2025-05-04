import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../__mocks__/apiMocks';
import Dashboard from './Dashboard';
import * as apiUtils from '../utils/apiUtils';

// Mock the API utils
jest.mock('../utils/apiUtils', () => ({
  getTransactionSummary: jest.fn(),
  getRecentTransactions: jest.fn()
}));

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  const mockSummary = {
    income: 1000,
    needs: 350,
    wants: 300,
    savings: 200
  };
  
  const mockRecentTransactions = [
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
      _id: 'expense-1',
      description: 'Grocery Shopping',
      amount: 150,
      transactionType: 'Needs',
      date: new Date().toISOString(),
      category: {
        _id: 'cat-2',
        name: 'Groceries',
        type: 'Needs'
      }
    }
  ];
  
  beforeEach(() => {
    apiUtils.getTransactionSummary.mockResolvedValue(mockSummary);
    apiUtils.getRecentTransactions.mockResolvedValue(mockRecentTransactions);
  });
  
  it('renders summary cards with correct amounts', async () => {
    renderWithRouter(<Dashboard />);
    
    // Wait for summary data to load
    await waitFor(() => {
      expect(apiUtils.getTransactionSummary).toHaveBeenCalled();
    });
    
    // Check if summary cards are displayed with correct amounts
    expect(screen.getByText(/Total Income/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,000/i)).toBeInTheDocument(); // Income amount
    
    expect(screen.getByText(/Needs/i)).toBeInTheDocument();
    expect(screen.getByText(/₹350/i)).toBeInTheDocument(); // Needs amount
    
    expect(screen.getByText(/Wants/i)).toBeInTheDocument();
    expect(screen.getByText(/₹300/i)).toBeInTheDocument(); // Wants amount
    
    expect(screen.getByText(/Savings/i)).toBeInTheDocument();
    expect(screen.getByText(/₹200/i)).toBeInTheDocument(); // Savings amount
  });
  
  it('displays budget allocation percentages', async () => {
    renderWithRouter(<Dashboard />);
    
    // Wait for summary data to load
    await waitFor(() => {
      expect(apiUtils.getTransactionSummary).toHaveBeenCalled();
    });
    
    // Check if budget allocation percentages are displayed
    expect(screen.getByText(/50%/i)).toBeInTheDocument(); // Needs percentage
    expect(screen.getByText(/30%/i)).toBeInTheDocument(); // Wants percentage
    expect(screen.getByText(/20%/i)).toBeInTheDocument(); // Savings percentage
  });
  
  it('renders recent transactions', async () => {
    renderWithRouter(<Dashboard />);
    
    // Wait for recent transactions to load
    await waitFor(() => {
      expect(apiUtils.getRecentTransactions).toHaveBeenCalled();
    });
    
    // Check if recent transactions are displayed
    expect(screen.getByText('Test Income')).toBeInTheDocument();
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
  });
  
  it('displays correct progress bars for budget categories', async () => {
    renderWithRouter(<Dashboard />);
    
    // Wait for summary data to load
    await waitFor(() => {
      expect(apiUtils.getTransactionSummary).toHaveBeenCalled();
    });
    
    // Check if progress bars are displayed
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(3); // One for each category (needs, wants, savings)
    
    // Check progress values
    // Needs: 350 / 500 (50% of 1000) = 70%
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '70');
    
    // Wants: 300 / 300 (30% of 1000) = 100%
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '100');
    
    // Savings: 200 / 200 (20% of 1000) = 100%
    expect(progressBars[2]).toHaveAttribute('aria-valuenow', '100');
  });
});
