// umoney-frontend/src/components/TransactionEditDialog.js
import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import FormSelector from './forms/FormSelector';

const TransactionEditDialog = ({
  visible,
  onHide,
  transaction,
  onSuccess
}) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  // Handle transaction update
  const handleTransactionUpdate = (updatedTransaction) => {
    // Notify parent component
    if (onSuccess) {
      onSuccess(updatedTransaction);
    }

    // Close dialog
    onHide();
  };

  return (
    <Dialog
      header={`Edit ${transaction?.transactionType || ''} Transaction`}
      visible={visible}
      style={{ width: '50vw' }}
      onHide={onHide}
      dismissableMask
      closeOnEscape
    >
      <Toast ref={toast} />

      {transaction && (
        <FormSelector
          transactionType={transaction.transactionType}
          onSuccess={handleTransactionUpdate}
          onCancel={onHide}
          initialData={transaction}
        />
      )}
    </Dialog>
  );
};

export default TransactionEditDialog;
