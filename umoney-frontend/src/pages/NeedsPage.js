import React from 'react';
import TransactionPage from '../components/TransactionPage';

const NeedsPage = () => {
  return (
    <div className="needs-page">
      <h2 className="page-title">Needs</h2>
      <p className="page-description">Manage your essential expenses like rent, groceries, utilities, etc.</p>
      <TransactionPage transactionType="Needs" />
    </div>
  );
};

export default NeedsPage;
