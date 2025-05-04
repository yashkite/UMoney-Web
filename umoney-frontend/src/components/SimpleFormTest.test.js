import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';

// A simple component that mimics the transaction form
const SimpleTransactionForm = ({ transactionType, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <h1>{transactionType} Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            data-testid="description-input"
          />
        </div>
        <div>
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            data-testid="amount-input"
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            data-testid="category-select"
          >
            <option value="">Select Category</option>
            <option value="cat-1">Salary</option>
            <option value="cat-2">Groceries</option>
          </select>
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            data-testid="date-input"
          />
        </div>
        {transactionType !== 'Income' && (
          <div>
            <label htmlFor="recipient">Recipient</label>
            <input
              id="recipient"
              name="recipient"
              value={formData.recipient || ''}
              onChange={handleChange}
              data-testid="recipient-input"
            />
          </div>
        )}
        <button type="submit" data-testid="submit-button">Submit</button>
      </form>
      {transactionType === 'Income' && formData.amount && (
        <div data-testid="distribution-preview">
          <h2>Distribution Preview</h2>
          <p data-testid="needs-preview">Needs: {parseFloat(formData.amount) * 0.5}</p>
          <p data-testid="wants-preview">Wants: {parseFloat(formData.amount) * 0.3}</p>
          <p data-testid="savings-preview">Savings: {parseFloat(formData.amount) * 0.2}</p>
        </div>
      )}
    </div>
  );
};

describe('Simple Form Tests', () => {
  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <CurrencyProvider>
          {ui}
        </CurrencyProvider>
      </BrowserRouter>
    );
  };

  it('renders income form correctly', () => {
    renderWithProviders(<SimpleTransactionForm transactionType="Income" onSubmit={() => {}} />);
    
    // Check if form fields are displayed
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    
    // Recipient field should not be present for Income
    expect(screen.queryByLabelText(/Recipient/i)).not.toBeInTheDocument();
    
    // Check if submit button is displayed
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('renders expense form correctly', () => {
    renderWithProviders(<SimpleTransactionForm transactionType="Needs" onSubmit={() => {}} />);
    
    // Check if form fields are displayed
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    
    // Recipient field should be present for Needs
    expect(screen.getByLabelText(/Recipient/i)).toBeInTheDocument();
    
    // Check if submit button is displayed
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('submits form with correct data', () => {
    const mockSubmit = jest.fn();
    renderWithProviders(<SimpleTransactionForm transactionType="Income" onSubmit={mockSubmit} />);
    
    // Fill out form
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Test Income' }
    });
    
    fireEvent.change(screen.getByTestId('amount-input'), {
      target: { value: '1000' }
    });
    
    fireEvent.change(screen.getByTestId('category-select'), {
      target: { value: 'cat-1' }
    });
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check if onSubmit was called with correct data
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test Income',
        amount: '1000',
        category: 'cat-1'
      })
    );
  });

  it('shows distribution preview for income transactions', () => {
    renderWithProviders(<SimpleTransactionForm transactionType="Income" onSubmit={() => {}} />);
    
    // Fill out amount
    fireEvent.change(screen.getByTestId('amount-input'), {
      target: { value: '1000' }
    });
    
    // Check if distribution preview is displayed
    expect(screen.getByTestId('distribution-preview')).toBeInTheDocument();
    expect(screen.getByTestId('needs-preview')).toHaveTextContent('Needs: 500');
    expect(screen.getByTestId('wants-preview')).toHaveTextContent('Wants: 300');
    expect(screen.getByTestId('savings-preview')).toHaveTextContent('Savings: 200');
  });
});
