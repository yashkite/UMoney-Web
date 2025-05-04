import React from 'react';
import TransactionPage from '../components/TransactionPage';

const WantsPage = () => {
  return (
    <div className="wants-page">
      <h2 className="page-title">Wants</h2>
      <p className="page-description">Manage your non-essential expenses like entertainment, dining out, etc.</p>
      <TransactionPage transactionType="Wants" />
    </div>
  );
};

export default WantsPage;
