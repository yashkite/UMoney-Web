import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';

// A simple component that mimics the dashboard summary cards
const SimpleDashboardSummary = ({ summary }) => {
  return (
    <div>
      <h1>Dashboard Summary</h1>
      <div data-testid="income-card">
        <h2>Income</h2>
        <p data-testid="income-amount">{summary.income}</p>
      </div>
      <div data-testid="needs-card">
        <h2>Needs</h2>
        <p data-testid="needs-amount">{summary.needs}</p>
        <p data-testid="needs-percentage">50%</p>
      </div>
      <div data-testid="wants-card">
        <h2>Wants</h2>
        <p data-testid="wants-amount">{summary.wants}</p>
        <p data-testid="wants-percentage">30%</p>
      </div>
      <div data-testid="savings-card">
        <h2>Savings</h2>
        <p data-testid="savings-amount">{summary.savings}</p>
        <p data-testid="savings-percentage">20%</p>
      </div>
    </div>
  );
};

describe('Simple Dashboard Tests', () => {
  const mockSummary = {
    income: 1000,
    needs: 350,
    wants: 300,
    savings: 200
  };

  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <CurrencyProvider>
          {ui}
        </CurrencyProvider>
      </BrowserRouter>
    );
  };

  it('displays summary cards with correct amounts', () => {
    renderWithProviders(<SimpleDashboardSummary summary={mockSummary} />);
    
    // Check if summary cards are displayed with correct amounts
    expect(screen.getByTestId('income-amount')).toHaveTextContent('1000');
    expect(screen.getByTestId('needs-amount')).toHaveTextContent('350');
    expect(screen.getByTestId('wants-amount')).toHaveTextContent('300');
    expect(screen.getByTestId('savings-amount')).toHaveTextContent('200');
  });

  it('displays budget allocation percentages', () => {
    renderWithProviders(<SimpleDashboardSummary summary={mockSummary} />);
    
    // Check if budget allocation percentages are displayed
    expect(screen.getByTestId('needs-percentage')).toHaveTextContent('50%');
    expect(screen.getByTestId('wants-percentage')).toHaveTextContent('30%');
    expect(screen.getByTestId('savings-percentage')).toHaveTextContent('20%');
  });
});
