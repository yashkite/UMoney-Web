import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext'; // Import the currency hook
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

// Import PrimeReact styles if not already imported in Layout
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

function TransactionsPage() {
  const { currencyCode, getCurrencyDetails } = useCurrency(); // Get currency context
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to format currency
  const formatCurrency = (value) => {
    const details = getCurrencyDetails(currencyCode);
    return new Intl.NumberFormat('en-US', { // TODO: Use dynamic locale
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol'
    }).format(value || 0); // Handle null/undefined values
  };

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        // Use the full backend URL - adjust this to match your backend server
        const backendUrl = 'http://localhost:5000'; // Update this to match your backend URL
        const response = await fetch(`${backendUrl}/api/categories`, {
          method: 'GET',
          credentials: 'include', // Important for sending cookies/session
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
        
        // If no categories were returned, create mock categories for testing
        if (data.length === 0) {
          console.log('No categories found, using mock data for development');
          const mockCategories = [
            { _id: 'needs1', name: 'Needs', type: 'Needs', isCustom: false },
            { _id: 'wants1', name: 'Wants', type: 'Wants', isCustom: false },
            { _id: 'savings1', name: 'Savings', type: 'Savings', isCustom: false },
            { _id: 'income1', name: 'Salary', type: 'Income', isCustom: false },
            { _id: 'income2', name: 'Other Income', type: 'Income', isCustom: false }
          ];
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // If there's an error, use mock categories for development
        console.log('Using mock categories due to API error');
        const mockCategories = [
          { _id: 'needs1', name: 'Needs', type: 'Needs', isCustom: false },
          { _id: 'wants1', name: 'Wants', type: 'Wants', isCustom: false },
          { _id: 'savings1', name: 'Savings', type: 'Savings', isCustom: false },
          { _id: 'income1', name: 'Salary', type: 'Income', isCustom: false },
          { _id: 'income2', name: 'Other Income', type: 'Income', isCustom: false }
        ];
        setCategories(mockCategories);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch transactions from API
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
        if (category) params.append('category', category);
        if (type) params.append('transactionType', type);
        
        // Use the full backend URL - adjust this to match your backend server
        const backendUrl = 'http://localhost:5000'; // Update this to match your backend URL
        const response = await fetch(`${backendUrl}/api/transactions?${params.toString()}`, {
          method: 'GET',
          credentials: 'include', // Important for sending cookies/session
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
        
        // If no transactions were returned, create mock transactions for testing
        if (!data.transactions || data.transactions.length === 0) {
          console.log('No transactions found, using mock data for development');
          const mockTransactions = [
            {
              _id: 'trans1',
              description: 'Grocery shopping',
              amount: 85.75,
              date: new Date().toISOString(),
              category: { _id: 'needs1', name: 'Needs', type: 'Needs' },
              transactionType: 'Expense',
              subcategory: 'Groceries',
              notes: 'Weekly groceries'
            },
            {
              _id: 'trans2',
              description: 'Monthly salary',
              amount: 3000,
              date: new Date().toISOString(),
              category: { _id: 'income1', name: 'Salary', type: 'Income' },
              transactionType: 'Income',
              subcategory: 'Salary',
              notes: ''
            },
            {
              _id: 'trans3',
              description: 'Movie tickets',
              amount: 25.50,
              date: new Date().toISOString(),
              category: { _id: 'wants1', name: 'Wants', type: 'Wants' },
              transactionType: 'Expense',
              subcategory: 'Entertainment',
              notes: 'Weekend movie'
            }
          ];
          setTransactions(mockTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        
        // If there's an error, use mock transactions for development
        console.log('Using mock transactions due to API error');
        const mockTransactions = [
          {
            _id: 'trans1',
            description: 'Grocery shopping',
            amount: 85.75,
            date: new Date().toISOString(),
            category: { _id: 'needs1', name: 'Needs', type: 'Needs' },
            transactionType: 'Expense',
            subcategory: 'Groceries',
            notes: 'Weekly groceries'
          },
          {
            _id: 'trans2',
            description: 'Monthly salary',
            amount: 3000,
            date: new Date().toISOString(),
            category: { _id: 'income1', name: 'Salary', type: 'Income' },
            transactionType: 'Income',
            subcategory: 'Salary',
            notes: ''
          },
          {
            _id: 'trans3',
            description: 'Movie tickets',
            amount: 25.50,
            date: new Date().toISOString(),
            category: { _id: 'wants1', name: 'Wants', type: 'Wants' },
            transactionType: 'Expense',
            subcategory: 'Entertainment',
            notes: 'Weekend movie'
          }
        ];
        setTransactions(mockTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, category, type]);

  // Format category options for dropdown
  const categoryOptions = [
    { label: 'All', value: '' },
    ...categories.map(cat => ({
      label: cat.name,
      value: cat._id
    }))
  ];

  const mainCategoryOptions = [
    { label: 'All', value: '' },
    { label: 'Needs', value: 'Needs' },
    { label: 'Wants', value: 'Wants' },
    { label: 'Savings', value: 'Savings' }
  ];
  
  const subcategoryMap = {
    Needs: [
      { label: 'Rent', value: 'Rent' },
      { label: 'Groceries', value: 'Groceries' },
      { label: 'Utilities', value: 'Utilities' },
      { label: 'Transport', value: 'Transport' },
      { label: 'Insurance', value: 'Insurance' },
      { label: 'Minimum Debt Payments', value: 'Minimum Debt Payments' }
    ],
    Wants: [
      { label: 'Dining Out', value: 'Dining Out' },
      { label: 'Subscriptions', value: 'Subscriptions' },
      { label: 'Shopping', value: 'Shopping' },
      { label: 'Entertainment', value: 'Entertainment' },
      { label: 'Travel', value: 'Travel' }
    ],
    Savings: [
      { label: 'Transfer to Savings Account', value: 'Transfer to Savings Account' },
      { label: 'SIP/Investment', value: 'SIP/Investment' },
      { label: 'Retirement Fund', value: 'Retirement Fund' }
    ]
  };
  
  const incomeSubcategories = [
    { label: 'Salary', value: 'Salary' },
    { label: 'Freelance Income', value: 'Freelance Income' },
    { label: 'Interest Earned', value: 'Interest Earned' },
    { label: 'Refunds', value: 'Refunds' }
  ];
  
  const [mainCategory, setMainCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  const getSubcategoryOptions = () => {
    if (type === 'Income') return incomeSubcategories;
    if (mainCategory && subcategoryMap[mainCategory]) return subcategoryMap[mainCategory];
    return [];
  };
  // Transaction type options
  const typeOptions = [
    { label: 'All', value: '' },
    { label: 'Income', value: 'Income' },
    { label: 'Expense', value: 'Expense' }
  ];

  // Format amount with currency and color using context
  const amountTemplate = (rowData) => {
    const formattedAmount = formatCurrency(rowData.amount);
    const isExpense = rowData.transactionType === 'Expense';
    return (
      <span className={isExpense ? 'text-red-500' : 'text-green-500'}>
        {isExpense ? '-' : '+'}{formattedAmount}
      </span>
    );
  };

  // Old template (commented out or removed)
  /*
    const isExpense = rowData.transactionType === 'Expense';
    return (
      <span className={isExpense ? 'text-red-500' : 'text-green-500'}>
        {isExpense ? '-' : '+'}${Math.abs(rowData.amount).toFixed(2)}
      </span>
    );
  */

  // Format date
  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString();
  };

  // Format category
  const categoryTemplate = (rowData) => {
    return rowData.category ? rowData.category.name : 'N/A';
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Transactions</h1>

      <Card className="mb-4">
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
                options={categoryOptions}
                onChange={(e) => setCategory(e.value)}
                className="w-full"
              />
              <label htmlFor="category">Category</label>
            </span>
          </div>
          <div className="col-12 md:col-3">
            <span className="p-float-label mb-4">
              <Dropdown
                id="type"
                value={type}
                options={typeOptions}
                onChange={(e) => setType(e.value)}
                className="w-full"
              />
              <label htmlFor="type">Type</label>
            </span>
          </div>
        </div>
      </Card>

      <DataTable 
        value={transactions} 
        paginator 
        rows={10} 
        rowsPerPageOptions={[5, 10, 25]} 
        loading={loading}
        emptyMessage="No transactions found"
        className="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <Column field="description" header="Description" sortable />
        <Column field="amount" header="Amount" body={amountTemplate} sortable />
        <Column field="date" header="Date" body={dateTemplate} sortable />
        <Column field="category" header="Category" body={categoryTemplate} sortable />
        <Column field="transactionType" header="Type" sortable />
      </DataTable>
    </div>
  );
}

export default TransactionsPage;
