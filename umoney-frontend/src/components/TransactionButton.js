import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import FormSelector from './forms/FormSelector';

const TransactionButton = ({
  transactionType,
  onSuccess,
  position = 'bottom-right',
  useSidebar = false,
  buttonLabel,
  buttonIcon,
  buttonClass,
  id
}) => {
  const [visible, setVisible] = useState(false);

  // Make handleOpen accessible via ref
  useEffect(() => {
    if (id === 'hidden-income-button') {
      // Expose the handleOpen method on the button element
      const buttonElement = document.getElementById(id);
      if (buttonElement) {
        buttonElement.handleOpen = () => setVisible(true);
      }
    }
  }, [id]);

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleSuccess = (result) => {
    setVisible(false);
    if (onSuccess) {
      onSuccess(result);
    }
  };

  // Default button props based on transaction type
  const getDefaultButtonProps = () => {
    if (transactionType === 'Income') {
      return {
        label: 'Add Income',
        icon: 'pi pi-plus',
        className: 'p-button-success'
      };
    } else {
      return {
        label: `Add ${transactionType}`,
        icon: 'pi pi-minus',
        className: 'p-button-danger'
      };
    }
  };

  const defaultProps = getDefaultButtonProps();

  // Use provided props or defaults
  const finalButtonLabel = buttonLabel || defaultProps.label;
  const finalButtonIcon = buttonIcon || defaultProps.icon;
  const finalButtonClass = buttonClass || defaultProps.className;

  // Position styles for fixed position button
  const positionStyles = {
    position: 'fixed',
    zIndex: 1000
  };

  if (position === 'bottom-right') {
    positionStyles.bottom = '20px';
    positionStyles.right = '20px';
  } else if (position === 'bottom-left') {
    positionStyles.bottom = '20px';
    positionStyles.left = '20px';
  } else if (position === 'top-right') {
    positionStyles.top = '20px';
    positionStyles.right = '20px';
  } else if (position === 'top-left') {
    positionStyles.top = '20px';
    positionStyles.left = '20px';
  }

  return (
    <>
      <Button
        id={id}
        label={position ? '' : finalButtonLabel}
        icon={finalButtonIcon}
        onClick={handleOpen}
        className={`${finalButtonClass} ${position ? 'p-button-rounded p-button-lg' : ''} ${transactionType === 'Income' ? 'income-form-trigger' : ''}`}
        style={position ? positionStyles : {}}
        aria-label={finalButtonLabel}
        tooltip={position ? finalButtonLabel : null}
        tooltipOptions={position ? { position: 'left' } : null}
      />

      {useSidebar ? (
        <Sidebar
          visible={visible}
          position="right"
          onHide={handleClose}
          className="p-sidebar-md"
          header={finalButtonLabel}
        >
          <FormSelector
            transactionType={transactionType}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </Sidebar>
      ) : (
        <Dialog
          header={finalButtonLabel}
          visible={visible}
          onHide={handleClose}
          style={{ width: '450px' }}
          modal
          className="transaction-dialog"
          closeOnEscape
          dismissableMask
        >
          <FormSelector
            transactionType={transactionType}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </Dialog>
      )}
    </>
  );
};

export default TransactionButton;
