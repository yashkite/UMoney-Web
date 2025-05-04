// umoney-frontend/src/components/forms/FormSelector.js
import React from 'react';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import SavingsForm from './SavingsForm';

/**
 * Form Selector Component
 * Selects the appropriate form based on transaction type
 */
const FormSelector = ({ transactionType, onSuccess, onCancel, initialData = null }) => {
  // Select the appropriate form based on transaction type
  switch (transactionType) {
    case 'Income':
      return (
        <IncomeForm
          onSuccess={onSuccess}
          onCancel={onCancel}
          initialData={initialData}
        />
      );
    case 'Needs':
    case 'Wants':
      return (
        <ExpenseForm
          transactionType={transactionType}
          onSuccess={onSuccess}
          onCancel={onCancel}
          initialData={initialData}
        />
      );
    case 'Savings':
      return (
        <SavingsForm
          onSuccess={onSuccess}
          onCancel={onCancel}
          initialData={initialData}
        />
      );
    default:
      return (
        <div className="p-p-4 p-text-center">
          <h3>Unknown transaction type: {transactionType}</h3>
          <p>Please select a valid transaction type.</p>
          <button className="p-button p-button-secondary" onClick={onCancel}>
            Close
          </button>
        </div>
      );
  }
};

export default FormSelector;
