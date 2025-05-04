import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../__mocks__/apiMocks';
import TransactionForm from './TransactionForm';
import * as apiUtils from '../utils/apiUtils';

// Mock the API utils
jest.mock('../utils/apiUtils', () => ({
  addIncome: jest.fn(),
  addExpense: jest.fn(),
  getCategories: jest.fn()
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

describe('TransactionForm Component', () => {
  const mockCategories = [
    { _id: 'cat-1', name: 'Salary', type: 'Income' },
    { _id: 'cat-2', name: 'Groceries', type: 'Needs' },
    { _id: 'cat-3', name: 'Entertainment', type: 'Wants' },
    { _id: 'cat-4', name: 'Emergency Fund', type: 'Savings' }
  ];
  
  beforeEach(() => {
    apiUtils.getCategories.mockResolvedValue(mockCategories);
    apiUtils.addIncome.mockResolvedValue({
      success: true,
      data: {
        incomeTransaction: {
          _id: 'new-income-1',
          description: 'Test Income',
          amount: 1000
        },
        distributedTransactions: {
          needs: { amount: 500 },
          wants: { amount: 300 },
          savings: { amount: 200 }
        }
      }
    });
    apiUtils.addExpense.mockResolvedValue({
      _id: 'new-expense-1',
      description: 'Test Expense',
      amount: 150
    });
  });
  
  it('renders income form correctly', async () => {
    renderWithRouter(<TransactionForm transactionType="Income" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Check if form fields are displayed
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    
    // Check if submit button is displayed
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });
  
  it('submits income form correctly', async () => {
    renderWithRouter(<TransactionForm transactionType="Income" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test Income' }
    });
    
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: '1000' }
    });
    
    // Select category
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'cat-1' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Check if addIncome was called with correct data
    await waitFor(() => {
      expect(apiUtils.addIncome).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test Income',
          amount: '1000',
          category: 'cat-1'
        }),
        []
      );
    });
  });
  
  it('renders expense form correctly', async () => {
    renderWithRouter(<TransactionForm transactionType="Needs" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Check if form fields are displayed
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recipient/i)).toBeInTheDocument(); // Expense-specific field
    
    // Check if submit button is displayed
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });
  
  it('submits expense form correctly', async () => {
    renderWithRouter(<TransactionForm transactionType="Needs" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test Expense' }
    });
    
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: '150' }
    });
    
    // Select category
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'cat-2' }
    });
    
    // Fill recipient
    fireEvent.change(screen.getByLabelText(/Recipient/i), {
      target: { value: 'Supermarket' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Check if addExpense was called with correct data
    await waitFor(() => {
      expect(apiUtils.addExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test Expense',
          amount: '150',
          category: 'cat-2',
          recipient: {
            name: 'Supermarket',
            type: 'merchant'
          }
        }),
        []
      );
    });
  });
  
  it('shows validation errors for required fields', async () => {
    renderWithRouter(<TransactionForm transactionType="Income" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Submit form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
    });
    
    // addIncome should not be called
    expect(apiUtils.addIncome).not.toHaveBeenCalled();
  });
  
  it('shows distribution preview for income transactions', async () => {
    renderWithRouter(<TransactionForm transactionType="Income" />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(apiUtils.getCategories).toHaveBeenCalled();
    });
    
    // Fill out amount
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: '1000' }
    });
    
    // Check if distribution preview is displayed
    await waitFor(() => {
      expect(screen.getByText(/Needs: ₹500/i)).toBeInTheDocument();
      expect(screen.getByText(/Wants: ₹300/i)).toBeInTheDocument();
      expect(screen.getByText(/Savings: ₹200/i)).toBeInTheDocument();
    });
  });
});
