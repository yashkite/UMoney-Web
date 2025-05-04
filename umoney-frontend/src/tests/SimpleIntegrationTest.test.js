import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';

// A simple component that mimics the income form
const SimpleIncomeForm = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    category: 'cat-1'
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
      <h1>Income Form</h1>
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
        <button type="submit" data-testid="submit-button">Submit</button>
      </form>
      {formData.amount && (
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

// A simple component that mimics the dashboard
const SimpleDashboard = ({ summary }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <div data-testid="income-card">
        <h2>Income</h2>
        <p data-testid="income-amount">{summary.income}</p>
      </div>
      <div data-testid="needs-card">
        <h2>Needs</h2>
        <p data-testid="needs-amount">{summary.needs}</p>
      </div>
      <div data-testid="wants-card">
        <h2>Wants</h2>
        <p data-testid="wants-amount">{summary.wants}</p>
      </div>
      <div data-testid="savings-card">
        <h2>Savings</h2>
        <p data-testid="savings-amount">{summary.savings}</p>
      </div>
    </div>
  );
};

// A simple app component that combines the form and dashboard
const SimpleApp = () => {
  const [summary, setSummary] = React.useState({
    income: 0,
    needs: 0,
    wants: 0,
    savings: 0
  });

  const handleSubmit = (formData) => {
    const amount = parseFloat(formData.amount);
    setSummary({
      income: summary.income + amount,
      needs: summary.needs + (amount * 0.5),
      wants: summary.wants + (amount * 0.3),
      savings: summary.savings + (amount * 0.2)
    });
  };

  return (
    <div>
      <SimpleIncomeForm onSubmit={handleSubmit} />
      <SimpleDashboard summary={summary} />
    </div>
  );
};

describe('Simple Integration Tests', () => {
  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <CurrencyProvider>
          {ui}
        </CurrencyProvider>
      </BrowserRouter>
    );
  };

  it('updates dashboard after adding income', () => {
    renderWithProviders(<SimpleApp />);
    
    // Check initial summary
    expect(screen.getByTestId('income-amount')).toHaveTextContent('0');
    expect(screen.getByTestId('needs-amount')).toHaveTextContent('0');
    expect(screen.getByTestId('wants-amount')).toHaveTextContent('0');
    expect(screen.getByTestId('savings-amount')).toHaveTextContent('0');
    
    // Fill out income form
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'New Income' }
    });
    
    fireEvent.change(screen.getByTestId('amount-input'), {
      target: { value: '2000' }
    });
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check updated summary
    expect(screen.getByTestId('income-amount')).toHaveTextContent('2000');
    expect(screen.getByTestId('needs-amount')).toHaveTextContent('1000'); // 50% of 2000
    expect(screen.getByTestId('wants-amount')).toHaveTextContent('600'); // 30% of 2000
    expect(screen.getByTestId('savings-amount')).toHaveTextContent('400'); // 20% of 2000
    
    // Add another income
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Another Income' }
    });
    
    fireEvent.change(screen.getByTestId('amount-input'), {
      target: { value: '1000' }
    });
    
    // Submit form again
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check updated summary
    expect(screen.getByTestId('income-amount')).toHaveTextContent('3000'); // 2000 + 1000
    expect(screen.getByTestId('needs-amount')).toHaveTextContent('1500'); // 1000 + 500
    expect(screen.getByTestId('wants-amount')).toHaveTextContent('900'); // 600 + 300
    expect(screen.getByTestId('savings-amount')).toHaveTextContent('600'); // 400 + 200
  });
});
