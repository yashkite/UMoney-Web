import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { apiUtils } from '../api/utils/api.js';
import { TransactionController } from '../controllers/TransactionController';
import { CategoryController } from '../controllers/CategoryController';
import TransactionButton from './TransactionButton';
import TransactionList from './TransactionList';

const TransactionPage = ({ transactionType }) => {
  const { currencyCode, getCurrencyDetails } = useCurrency();
  const toast = useRef(null);

  // State for transactions and loading
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    in: 0,
    out: 0,
    hold: 0,
    total: 0,
    thisMonth: 0,
    average: 0,
    budget: 0,
    percentage: 0,
    currency: currencyCode
  });

  // State for filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Format currency using the currency context
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        transactionType,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        category: category ? category.value : undefined,
        search: searchTerm || undefined
      };

      // Call API
      let data = { transactions: [] };
      try {
        data = await TransactionController.getTransactions(params);
      } catch (error) {
        console.error(`Error fetching ${transactionType} transactions:`, error);
      }

     // Update transactions and summary
     setTransactions(data?.transactions || []);

      // Calculate summary data
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Filter transactions for current month
      const thisMonthTransactions = (data.transactions || []).filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getYear() === currentYear - 1900;
      });

      // Calculate this month's total
      const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Calculate average per month (if we have data for multiple months)
      const transactions = data.transactions || [];
      const oldestTransaction = transactions.length > 0 ?
        new Date(Math.min(...transactions.map(t => new Date(t.date).getTime()))) :
        new Date();

      const monthsDiff = (currentDate.getFullYear() - oldestTransaction.getFullYear()) * 12 +
        currentDate.getMonth() - oldestTransaction.getMonth() + 1;

      const averagePerMonth = monthsDiff > 0 ?
        transactions.reduce((sum, t) => sum + t.amount, 0) / monthsDiff :
        thisMonthTotal;

      // Update summary based on transaction type
      if (transactionType === 'Income') {
        const totalIncome = data.income || 0;
        const thisMonthIncome = thisMonthTotal || 0;

        setSummary({
          in: totalIncome,
          out: 0,
          hold: totalIncome,
          total: totalIncome,
          thisMonth: thisMonthIncome,
          average: averagePerMonth,
          budget: 0,
          percentage: 0,
          currency: data.currency || currencyCode
        });
      } else {
        // For Needs, Wants, Savings
        const expenses = data.expenses ? data.expenses[transactionType.toLowerCase()] || 0 : 0;
        const allocated = data.income ? (data.income * data.percentages[transactionType.toLowerCase()] / 100) : 0;
        const percentage = allocated > 0 ? (expenses / allocated) * 100 : 0;

        setSummary({
          in: allocated,
          out: expenses,
          hold: allocated - expenses,
          total: expenses,
          thisMonth: thisMonthTotal,
          average: averagePerMonth,
          budget: allocated,
          percentage: percentage,
          currency: data.currency || currencyCode
        });
      }
    } catch (error) {
      console.error(`Error fetching ${transactionType} transactions:`, error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to load ${transactionType} transactions`,
        life: 3000
      });

      // Set empty data on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('TransactionPage: Fetching categories...');
      let data = [];
      try {
        data = await CategoryController.getCategories();
        console.log('TransactionPage: Categories data received:', data);
      } catch (error) {
        console.error('TransactionPage: Error fetching categories:', error);
      }

     // Ensure data is an array and map each object to include a name property
     if (!data || !Array.isArray(data)) {
        console.warn('TransactionPage: Categories data is null, undefined, or not an array. Setting to empty array.');
        data = [];
      }

      const formattedCategories = data.map(cat => ({
        ...cat,
        name: cat.name || 'Unknown Category' // Ensure each category has a name
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load categories',
        life: 3000
      });
      setCategories([]);
    }
  };

  // Load transactions when component mounts or filters change
  useEffect(() => {
    fetchTransactions();
  }, [transactionType, startDate, endDate, category, searchTerm]);

  // Load categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle transaction success (refresh data)
  const handleTransactionSuccess = () => {
    fetchTransactions();
  };

  // Template for amount column
  const amountTemplate = (rowData) => {
    return (
      <span className={rowData.transactionType === 'Income' ? 'text-green-500' : 'text-red-500'}>
        {rowData.transactionType === 'Income' ? '+' : '-'}{formatCurrency(rowData.amount)}
      </span>
    );
  };

  // Template for date column
  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString();
  };

  // Template for category column
  const categoryTemplate = (rowData) => {
    return rowData.category ? `${rowData.category.name} (${rowData.subcategory || ''})` : '';
  };

  // Template for recipient column
  const recipientTemplate = (rowData) => {
    if (!rowData.recipient || !rowData.recipient.name) return '';
    return `${rowData.recipient.name} (${rowData.recipient.type || 'unknown'})`;
  };

  // Template for actions column
  const actionsTemplate = (rowData) => {
    // Check if this is a distribution transaction (not editable)
    const isDistribution = rowData.isDistribution === true || rowData.isEditable === false;
    const isParentTransaction = rowData.transactionType === 'Income';

    // If it's a distribution transaction, show a view-only interface
    if (isDistribution) {
      return (
        <div className="flex gap-2">
          <Button
            icon="pi pi-eye"
            className="p-button-rounded p-button-text p-button-sm"
            tooltip="View Details"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleViewTransaction(rowData)}
          />
          <Button
            icon="pi pi-info-circle"
            className="p-button-rounded p-button-text p-button-sm p-button-help"
            tooltip="Auto-generated distribution (not directly editable)"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      );
    }

    // For regular transactions or parent income transactions
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="View Details"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleViewTransaction(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip={isParentTransaction ? "Edit (will update distributions)" : "Edit"}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleEditTransaction(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-sm p-button-danger"
          tooltip={isParentTransaction ? "Delete (will delete distributions)" : "Delete"}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleDeleteTransaction(rowData)}
        />
      </div>
    );
  };

  // Handle view transaction
  const handleViewTransaction = (transaction) => {
    // TODO: Implement view transaction details
    console.log('View transaction:', transaction);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    // TODO: Implement edit transaction
    console.log('Edit transaction:', transaction);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transaction) => {
    try {
      await TransactionController.deleteTransaction(transaction._id);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction deleted successfully',
        life: 3000
      });

      // Refresh transactions
      fetchTransactions();
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

  // Get button label and icon based on transaction type
  const getButtonConfig = () => {
    if (transactionType === 'Income') {
      return {
        label: 'Add Income',
        icon: 'pi pi-plus',
        className: 'p-button-success'
      };
    } else {
      return {
        label: `Add ${transactionType} Expense`,
        icon: 'pi pi-minus',
        className: 'p-button-danger'
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="transaction-page p-3">
      <Toast ref={toast} position="top-right" />

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold m-0 mb-2 text-gradient">{transactionType}</h1>
          <p className="text-500 m-0">Manage your {transactionType.toLowerCase()} transactions</p>
        </div>
        <div className="flex align-items-center gap-2 mt-3 md:mt-0">
          {loading && <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>}
          {/* Only show the button for non-Income transaction types or when on mobile */}
          {(transactionType !== 'Income' || window.innerWidth < 768) && (
            <TransactionButton
              transactionType={transactionType}
              onSuccess={handleTransactionSuccess}
              buttonIcon={transactionType === 'Income' ? 'pi pi-plus' : 'pi pi-minus'}
              buttonLabel={transactionType === 'Income' ? 'Add Income' : `Add ${transactionType} Expense`}
              buttonClass={transactionType === 'Income' ? 'p-button-success' : 'p-button-danger'}
            />
          )}
        </div>
      </div>

      {/* Summary Card - Only shown for non-Income transaction types */}
      {transactionType !== 'Income' && (
        <Card className="mb-4 dashboard-card shadow-3">
          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="flex flex-column">
                <span className="summary-label">Income</span>
                <span className="summary-value text-green-500">{formatCurrency(summary.in)}</span>
                <div className="mt-2 flex align-items-center">
                  <i className="pi pi-arrow-up mr-2 text-green-500"></i>
                  <span className="text-sm text-green-500">Money coming in</span>
                </div>
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="flex flex-column">
                <span className="summary-label">Expenses</span>
                <span className="summary-value text-red-500">{formatCurrency(summary.out)}</span>
                <div className="mt-2 flex align-items-center">
                  <i className="pi pi-arrow-down mr-2 text-red-500"></i>
                  <span className="text-sm text-red-500">Money going out</span>
                </div>
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="flex flex-column">
                <span className="summary-label">Balance</span>
                <span className="summary-value">{formatCurrency(summary.hold)}</span>
                <div className="mt-2 flex align-items-center">
                  <i className="pi pi-wallet mr-2 text-primary"></i>
                  <span className="text-sm">Current balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress towards budget */}
          <div className="mt-4">
            <div className="progress-label">
              <span className="label flex align-items-center">
                <i className={`pi pi-wallet mr-2 ${summary.out > summary.in ? 'text-red-500' : 'text-primary'}`}></i>
                Budget Usage
              </span>
              <span className="value flex align-items-center">
                <span className={`mr-2 ${summary.out > summary.in ? 'text-red-500 font-bold' : ''}`}>
                  {(summary.in > 0 ? (summary.out / summary.in) * 100 : 0).toFixed(0)}%
                </span>
              </span>
            </div>
            <ProgressBar
              value={summary.in > 0 ? (summary.out / summary.in) * 100 : 0}
              showValue={false}
              className={summary.out > summary.in ? 'bg-red-500' : ''}
              style={{ height: '10px', borderRadius: '5px' }}
            />
            {summary.out > summary.in && (
              <small className="text-red-500 mt-1 block">
                <i className="pi pi-exclamation-triangle mr-1"></i>
                You've exceeded your budget for this category
              </small>
            )}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-4 dashboard-card shadow-3">
        <h3 className="text-xl font-semibold mb-3">Filters</h3>
        <div className="grid">
          <div className="col-12 md:col-3">
            <span className="p-float-label mb-4">
              <Calendar
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                showIcon
                dateFormat="mm/dd/yy"
                className="w-full"
              />
              <label htmlFor="startDate">Start Date</label>
            </span>
          </div>

          <div className="col-12 md:col-3">
            <span className="p-float-label mb-4">
              <Calendar
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                showIcon
                dateFormat="mm/dd/yy"
                className="w-full"
              />
              <label htmlFor="endDate">End Date</label>
            </span>
          </div>

          <div className="col-12 md:col-3">
            <span className="p-float-label mb-4">
              <Dropdown
                id="category"
                value={category}
                options={categories}
                onChange={(e) => setCategory(e.value)}
                optionLabel="name"
                className="w-full"
                filter
              />
              <label htmlFor="category">Category</label>
            </span>
          </div>

          <div className="col-12 md:col-3">
            <span className="p-float-label mb-4">
              <InputText
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <label htmlFor="search">Search</label>
            </span>
          </div>
        </div>

        <div className="flex justify-content-end">
          <Button
            label="Clear Filters"
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-sm"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setCategory(null);
              setSearchTerm('');
            }}
          />
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="dashboard-card shadow-3">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">{transactionType} Transactions</h3>
          {transactionType !== 'Income' ? (
            <TransactionButton
              transactionType={transactionType}
              onSuccess={handleTransactionSuccess}
              buttonIcon="pi pi-minus"
              buttonLabel={`Add ${transactionType} Expense`}
              buttonClass="p-button-danger p-button-sm"
            />
          ) : (
            <Button
              icon="pi pi-plus"
              label="Add Income"
              className="p-button-success p-button-sm"
              onClick={() => {
                // Find the hidden income button and call its handleOpen method
                const hiddenIncomeButton = document.getElementById('hidden-income-button');
                if (hiddenIncomeButton && hiddenIncomeButton.handleOpen) {
                  hiddenIncomeButton.handleOpen();
                } else {
                  // Fallback - click the button which will trigger its onClick handler
                  hiddenIncomeButton?.click();
                }
              }}
            />
          )}
        </div>

        {loading ? (
          <div className="flex justify-content-center align-items-center p-5">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onTransactionUpdated={handleTransactionSuccess}
            onTransactionDeleted={handleTransactionSuccess}
          />
        )}
      </Card>

      {/* Fixed position quick add button for mobile */}
      <div className="block md:hidden">
        <TransactionButton
          transactionType={transactionType}
          onSuccess={handleTransactionSuccess}
          position="bottom-right"
          useSidebar={true}
        />
      </div>

      {/* Hidden Income button for desktop view */}
      {transactionType === 'Income' && (
        <div style={{ display: 'none' }}>
          <TransactionButton
            id="hidden-income-button"
            transactionType="Income"
            onSuccess={handleTransactionSuccess}
            buttonIcon="pi pi-plus"
            buttonLabel="Add Income"
            buttonClass="p-button-success"
          />
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
