import React from 'react';
import TransactionPage from '../components/TransactionPage';

const SavingsPage = () => {
  return (
    <div className="savings-page">
      <h2 className="page-title">Savings</h2>
      <p className="page-description">Manage your savings, investments, emergency funds, etc.</p>
      <TransactionPage transactionType="Savings" />
    </div>
  );
};

export default SavingsPage;
