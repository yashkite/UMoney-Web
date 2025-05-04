// umoney-frontend/src/components/TransactionList.js
import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiUtils } from '../api/utils/api';
import TransactionEditDialog from './TransactionEditDialog';

const TransactionList = ({ transactions, onTransactionUpdated, onTransactionDeleted }) => {
  const { currencyCode } = useCurrency();
  const toast = useRef(null);
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  };
  
  // Format date
  const formatDate = (value) => {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Amount template
  const amountTemplate = (rowData) => {
    return (
      <span className={rowData.transactionType === 'Income' ? 'text-green-500' : 'text-red-500'}>
        {formatCurrency(rowData.amount)}
      </span>
    );
  };
  
  // Date template
  const dateTemplate = (rowData) => {
    return formatDate(rowData.date);
  };
  
  // Type template
  const typeTemplate = (rowData) => {
    let severity;
    
    switch (rowData.transactionType) {
      case 'Income':
        severity = 'success';
        break;
      case 'Needs':
        severity = 'info';
        break;
      case 'Wants':
        severity = 'warning';
        break;
      case 'Savings':
        severity = 'primary';
        break;
      default:
        severity = 'secondary';
    }
    
    return <Tag value={rowData.transactionType} severity={severity} />;
  };
  
  // Category template
  const categoryTemplate = (rowData) => {
    if (!rowData.category) return <span>Uncategorized</span>;
    
    return (
      <span>
        {rowData.category.icon && <i className={rowData.category.icon} style={{ marginRight: '0.5rem' }}></i>}
        {rowData.category.name}
      </span>
    );
  };
  
  // Actions template
  const actionsTemplate = (rowData) => {
    // Don't show edit/delete buttons for distribution transactions
    if (rowData.isDistribution) {
      return (
        <div className="p-d-flex p-jc-end">
          <Tag value="Auto-distributed" severity="secondary" />
        </div>
      );
    }
    
    return (
      <div className="p-d-flex p-jc-end">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-mr-2"
          onClick={() => handleEdit(rowData)}
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };
  
  // Handle edit button click
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogVisible(true);
  };
  
  // Handle transaction update
  const handleTransactionUpdate = (updatedTransaction) => {
    setEditDialogVisible(false);
    
    if (onTransactionUpdated) {
      onTransactionUpdated(updatedTransaction);
    }
  };
  
  // Confirm delete dialog
  const confirmDelete = (transaction) => {
    const isIncome = transaction.transactionType === 'Income';
    
    confirmDialog({
      message: isIncome
        ? 'Are you sure you want to delete this income transaction? This will also delete all distributed transactions.'
        : 'Are you sure you want to delete this transaction?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(transaction)
    });
  };
  
  // Handle delete button click
  const handleDelete = async (transaction) => {
    try {
      await apiUtils.deleteTransaction(transaction._id, transaction.transactionType);
      
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: `${transaction.transactionType} transaction deleted successfully`,
        life: 3000
      });
      
      if (onTransactionDeleted) {
        onTransactionDeleted(transaction);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete transaction',
        life: 3000
      });
    }
  };
  
  // Row expansion template
  const rowExpansionTemplate = (data) => {
    // For income transactions, show distributed transactions
    if (data.transactionType === 'Income' && data.distributedTransactions) {
      const { needs, wants, savings } = data.distributedTransactions;
      
      return (
        <div className="p-p-3">
          <h5>Distributed Transactions</h5>
          <div className="p-grid">
            {needs && (
              <div className="p-col-12 p-md-4">
                <div className="p-card p-p-3">
                  <h6>Needs</h6>
                  <p>Amount: {formatCurrency(needs.amount)}</p>
                  <p>Date: {formatDate(needs.date || data.date)}</p>
                  <Tag value="Auto-distributed" severity="info" />
                </div>
              </div>
            )}
            
            {wants && (
              <div className="p-col-12 p-md-4">
                <div className="p-card p-p-3">
                  <h6>Wants</h6>
                  <p>Amount: {formatCurrency(wants.amount)}</p>
                  <p>Date: {formatDate(wants.date || data.date)}</p>
                  <Tag value="Auto-distributed" severity="warning" />
                </div>
              </div>
            )}
            
            {savings && (
              <div className="p-col-12 p-md-4">
                <div className="p-card p-p-3">
                  <h6>Savings</h6>
                  <p>Amount: {formatCurrency(savings.amount)}</p>
                  <p>Date: {formatDate(savings.date || data.date)}</p>
                  <Tag value="Auto-distributed" severity="primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // For distributed transactions, show parent transaction
    if (data.isDistribution && data.parentTransactionId) {
      const parentTransaction = transactions.find(t => t._id === data.parentTransactionId);
      
      if (parentTransaction) {
        return (
          <div className="p-p-3">
            <h5>Parent Transaction</h5>
            <div className="p-card p-p-3">
              <h6>{parentTransaction.description}</h6>
              <p>Amount: {formatCurrency(parentTransaction.amount)}</p>
              <p>Date: {formatDate(parentTransaction.date)}</p>
              <Tag value={parentTransaction.transactionType} severity="success" />
            </div>
          </div>
        );
      }
    }
    
    // For other transactions, show details
    return (
      <div className="p-p-3">
        <h5>Transaction Details</h5>
        <div className="p-grid">
          <div className="p-col-12 p-md-6">
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Amount:</strong> {formatCurrency(data.amount)}</p>
            <p><strong>Date:</strong> {formatDate(data.date)}</p>
            <p><strong>Type:</strong> {data.transactionType}</p>
          </div>
          <div className="p-col-12 p-md-6">
            <p><strong>Category:</strong> {data.category ? data.category.name : 'Uncategorized'}</p>
            <p><strong>Tag:</strong> {data.tag || 'None'}</p>
            <p><strong>Notes:</strong> {data.notes || 'None'}</p>
            {data.recipient && (
              <p><strong>Recipient:</strong> {data.recipient.name} ({data.recipient.type})</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Row class function
  const rowClassName = (data) => {
    return {
      'transaction-row': true,
      'transaction-income': data.transactionType === 'Income',
      'transaction-needs': data.transactionType === 'Needs',
      'transaction-wants': data.transactionType === 'Wants',
      'transaction-savings': data.transactionType === 'Savings',
      'transaction-distribution': data.isDistribution
    };
  };
  
  return (
    <div className="transaction-list">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <DataTable
        value={transactions}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="_id"
        rowClassName={rowClassName}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
        sortField="date"
        sortOrder={-1}
        emptyMessage="No transactions found"
        className="p-datatable-sm"
      >
        <Column expander style={{ width: '3em' }} />
        <Column field="description" header="Description" sortable />
        <Column field="amount" header="Amount" body={amountTemplate} sortable />
        <Column field="date" header="Date" body={dateTemplate} sortable />
        <Column field="transactionType" header="Type" body={typeTemplate} sortable />
        <Column field="category.name" header="Category" body={categoryTemplate} sortable />
        <Column body={actionsTemplate} style={{ width: '8em' }} />
      </DataTable>
      
      {/* Edit Dialog */}
      {selectedTransaction && (
        <TransactionEditDialog
          visible={editDialogVisible}
          onHide={() => setEditDialogVisible(false)}
          transaction={selectedTransaction}
          onSuccess={handleTransactionUpdate}
        />
      )}
    </div>
  );
};

export default TransactionList;
