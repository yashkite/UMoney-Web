import React from 'react';
import TransactionPage from '../components/TransactionPage';

const IncomePage = () => {
  return (
    <div className="income-page">
      <h2 className="page-title">Income</h2>
      <p className="page-description">Manage your income sources like salary, freelance work, investments, etc.</p>
      <TransactionPage transactionType="Income" />
    </div>
  );
};

export default IncomePage;
