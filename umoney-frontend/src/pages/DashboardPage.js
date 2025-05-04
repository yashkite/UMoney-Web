import { Card } from 'primereact/card';
import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from 'primereact/button';


import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { TabMenu } from 'primereact/tabmenu';
import { useNavigate } from 'react-router-dom';

// Import utilities
import { AuthController } from '../controllers/AuthController';
import { apiUtils } from '../api/utils/api.js';
import FinancialSummary from '../components/FinancialSummary';

function DashboardPage() {
  console.log('DashboardPage: Initializing...');
  const navigate = useNavigate();
  const { currencyCode } = useCurrency();
  const toast = useRef(null);

  // State for user and loading
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // State for dashboard data
  const [summary, setSummary] = useState({
    income: 0,
    needs: 0,
    wants: 0,
    savings: 0,
    totalSpent: 0,
    balance: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Function to fetch dashboard data (summary and recent transactions)
  const fetchDashboardData = async () => {
    if (!user) return; // Don't fetch if no user is logged in

    setDashboardLoading(true);
    try {
      // Get the current month's start and end dates
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Fetch dashboard data using apiUtils
      const params = {
        startDate,
        endDate,
        limit: 10
      };

      const dashboardData = await apiUtils.getTransactions(params);

      // Update summary data
      setSummary({
        income: dashboardData.income || 0,
        needs: dashboardData.expenses?.needs || 0,
        wants: dashboardData.expenses?.wants || 0,
        savings: dashboardData.expenses?.savings || 0,
        totalSpent: dashboardData.totalExpenses || 0,
        balance: (dashboardData.income || 0) - (dashboardData.totalExpenses || 0)
      });

      // Update recent transactions
      setRecentTransactions(dashboardData.transactions || []);

      // Get uncategorized transactions
      const uncategorizedParams = {
        status: 'pending',
        limit: 5
      };

      const uncategorizedData = await apiUtils.getTransactions(uncategorizedParams);
      setUncategorizedTransactions(uncategorizedData.transactions || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load dashboard data',
        life: 3000
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    // Fetch current user data when component mounts
    const fetchUserData = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
              const userData = await AuthController.getCurrentUser();
              setUser(userData);
              console.log('DashboardPage: fetchUserData - User data retrieved:', userData);
      } catch (error) {
        console.error('DashboardPage: fetchUserData - Error fetching user:', error);
        setUser(null);

        // Show error toast
        toast.current.show({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'Please log in to view your dashboard',
          life: 3000
        });

        // Redirect to login page
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch dashboard data when user is loaded
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);


  // Show toast notification when notification state changes
  useEffect(() => {
    if (notification.open && toast.current) {
      toast.current.show({
        severity: notification.severity,
        summary: notification.severity === 'error' ? 'Error' : 'Success',
        detail: notification.message,
        life: 3000
      });
      // Auto-reset notification state after showing toast
      setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 3000);
    }
  }, [notification]);

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { // TODO: Use dynamic locale based on user settings or browser
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol'
    }).format(value || 0); // Handle null/undefined values
  };

  // Calculate percentages for 50/30/20 rule
  const totalExpenses = summary.needs + summary.wants + summary.savings;
  const needsPercent = totalExpenses > 0 ? (summary.needs / totalExpenses) * 100 : 0;
  const wantsPercent = totalExpenses > 0 ? (summary.wants / totalExpenses) * 100 : 0;
  const savingsPercent = totalExpenses > 0 ? (summary.savings / totalExpenses) * 100 : 0;

  // Get user's budget preferences
  const budgetPreferences = user?.budgetPreferences || {
    needs: { percentage: 50 },
    wants: { percentage: 30 },
    savings: { percentage: 20 }
  };

  // Get user's first name for greeting
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  // Chart options for spending distribution
  const chartOptions = {
      plugins: {
          legend: {
              labels: {
                  usePointStyle: true
              }
          },
          tooltip: {
              callbacks: {
                  label: (context) => {
                      let label = context.label || '';

                      if (label) {
                          label += `: `;
                      }
                      if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                      }
                      return label;
                  }
              }
          }
      }
  };

  // Navigation items for quick access to transaction pages
  const navItems = [
    { label: 'Income', icon: 'pi pi-plus', command: () => navigate('/app/income') },
    { label: 'Needs', icon: 'pi pi-home', command: () => navigate('/app/needs') },
    { label: 'Wants', icon: 'pi pi-shopping-cart', command: () => navigate('/app/wants') },
    { label: 'Savings', icon: 'pi pi-wallet', command: () => navigate('/app/savings') }
  ];

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <h5 className="text-xl">Please log in to view the dashboard.</h5>
      </div>
    );
  }

  // --- Main Dashboard Content ---
  return (
    <div className="p-3">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      {/* Header with welcome message and action button */}
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4">
        <div className="mb-3 md:mb-0">
          <h1 className="text-4xl font-bold m-0 mb-2 text-gradient">Welcome, {firstName}</h1>
          <p className="text-500 m-0">Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex align-items-center gap-2">
          {dashboardLoading && <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mb-4">
        <TabMenu model={navItems} className="quick-nav-menu" />
      </div>

      <div className="grid">
        {/* Financial Summary */}
        <FinancialSummary summary={summary} />

        {/* Spending Chart */}
        <div className="col-12 md:col-6">
          <Card title="Spending Distribution" subTitle="Current month breakdown" className="dashboard-card shadow-3">
            <div className="flex justify-content-center">
              <Chart type="pie" data={{
                labels: ['Needs', 'Wants', 'Savings'],
                datasets: [
                  {
                    data: [summary.needs, summary.wants, summary.savings],
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                  }
                ]
              }} options={chartOptions} style={{ width: '100%', maxWidth: '400px' }} />
            </div>
            <div className="flex flex-column sm:flex-row justify-content-center align-items-center mt-3">
              <div className="flex align-items-center mb-2 sm:mb-0 sm:mr-3">
                <span className="inline-block mr-2" style={{ width: '12px', height: '12px', backgroundColor: '#42A5F5', borderRadius: '50%' }}></span>
                <span className="text-sm">Needs: {formatCurrency(summary.needs)}</span>
              </div>
              <div className="flex align-items-center mb-2 sm:mb-0 sm:mr-3">
                <span className="inline-block mr-2" style={{ width: '12px', height: '12px', backgroundColor: '#66BB6A', borderRadius: '50%' }}></span>
                <span className="text-sm">Wants: {formatCurrency(summary.wants)}</span>
              </div>
              <div className="flex align-items-center">
                <span className="inline-block mr-2" style={{ width: '12px', height: '12px', backgroundColor: '#FFA726', borderRadius: '50%' }}></span>
                <span className="text-sm">Savings: {formatCurrency(summary.savings)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="col-12 md:col-6">
          <Card title="Recent Transactions" subTitle="Last 5 transactions" className="dashboard-card shadow-3">
            <DataTable
              value={recentTransactions.slice(0, 5)}
              className="p-datatable-sm"
              emptyMessage="No recent transactions"
              stripedRows
              scrollable
            >
              <Column field="description" header="Description" style={{ width: '40%' }}></Column>
              <Column field="transactionType" header="Type" style={{ width: '20%' }} body={(rowData) => (
                <span className={`transaction-badge ${rowData.transactionType.toLowerCase()}`}>
                  {rowData.transactionType}
                </span>
              )}></Column>
              <Column field="amount" header="Amount" style={{ width: '20%' }} body={(rowData) => {
                const formattedAmount = formatCurrency(rowData.amount);
                const isExpense = rowData.transactionType !== 'Income';
                return (
                  <span className={isExpense ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                    {isExpense ? '-' : '+'}{formattedAmount}
                  </span>
                );
              }}></Column>
              <Column field="date" header="Date" style={{ width: '20%' }} body={(rowData) => {
                return new Date(rowData.date).toLocaleDateString();
              }}></Column>
            </DataTable>
            <div className="flex justify-content-end mt-3">
              <Button label="View All" icon="pi pi-arrow-right" className="p-button-text p-button-sm" onClick={() => navigate('/app/transactions')} />
            </div>
          </Card>
        </div>

        {/* Uncategorized Transactions */}
        <div className="col-12 md:col-6">
          <Card title="Uncategorized Transactions" subTitle="Transactions that need categorization" className="dashboard-card shadow-3">
            <DataTable
              value={uncategorizedTransactions}
              className="p-datatable-sm"
              emptyMessage="No uncategorized transactions"
              stripedRows
              scrollable
            >
              <Column field="description" header="Description" style={{ width: '40%' }}></Column>
              <Column field="amount" header="Amount" style={{ width: '25%' }} body={(rowData) => {
                return <span className="font-medium">{formatCurrency(rowData.amount)}</span>;
              }}></Column>
              <Column field="date" header="Date" style={{ width: '20%' }} body={(rowData) => {
                return new Date(rowData.date).toLocaleDateString();
              }}></Column>
              <Column style={{ width: '15%' }} body={(rowData) => (
                <Button
                  icon="pi pi-tag"
                  className="p-button-rounded p-button-outlined p-button-sm"
                  tooltip="Categorize"
                  onClick={() => {
                    // TODO: Implement categorization
                    console.log('Categorize transaction:', rowData);
                  }}
                />
              )}></Column>
            </DataTable>
            {uncategorizedTransactions.length === 0 && (
              <div className="flex flex-column align-items-center justify-content-center p-4 text-center">
                <i className="pi pi-check-circle text-green-500 text-4xl mb-3"></i>
                <span className="text-700">All transactions are categorized!</span>
              </div>
            )}
          </Card>
        </div>
      </div>


    </div>
  );
}

export default DashboardPage;
