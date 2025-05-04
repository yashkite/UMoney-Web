import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// Helper to get current month in YYYY-MM format
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  return `${year}-${month}`;
};

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false); // Initially false, load on month change
  const [error, setError] = useState(null);

  // TODO: Replace with actual API endpoint and authentication
  const API_URL_BASE = '/api/budgets'; // Example base endpoint

  useEffect(() => {
    const fetchBudgets = async (month) => {
      if (!month) return; // Don't fetch if month is invalid

      try {
        setLoading(true);
        setError(null);
        const API_URL = `${API_URL_BASE}/${month}`;
        // const token = localStorage.getItem('token');
        // const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        // setBudgets(response.data);

        // --- Placeholder Data ---
        console.log("Fetching budgets for month:", month, "from:", API_URL);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        if (month === '2025-04') { // Example data for current month
            setBudgets([
              { _id: 'b1', categoryId: { _id: 'c1', name: 'Groceries' }, month: '2025-04', budgetedAmount: 500 },
              { _id: 'b2', categoryId: { _id: 'c2', name: 'Utilities' }, month: '2025-04', budgetedAmount: 150 },
              { _id: 'b3', categoryId: { _id: 'c3', name: 'Entertainment' }, month: '2025-04', budgetedAmount: 100 },
            ]);
        } else {
            setBudgets([]); // No data for other months in placeholder
        }
        // --- End Placeholder Data ---

      } catch (err) {
        console.error(`Error fetching budgets for ${month}:`, err);
        setError(`Failed to fetch budgets for ${month}.`);
        // setError(err.response?.data?.msg || `Failed to fetch budgets for ${month}.`);
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets(selectedMonth);
  }, [selectedMonth]); // Re-run effect when selectedMonth changes

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // TODO: Implement functions for adding/updating/deleting budget entries
  const handleSetBudget = (categoryId) => console.log("Set Budget clicked for category:", categoryId);
  const handleDeleteBudget = (id) => console.log("Delete Budget clicked:", id);

  return (
    <div>
      <h2>Budgets</h2>
      <div>
        <label htmlFor="month-select">Select Month: </label>
        <input
          type="month"
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
        />
      </div>

      {loading && <div>Loading budgets for {selectedMonth}...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* TODO: Need a way to get all categories to display budgets for */}
          <h3>Budget for {selectedMonth}</h3>
          {budgets.length === 0 ? (
            <p>No budget set for this month.</p>
          ) : (
            <ul>
              {budgets.map((budget) => (
                <li key={budget._id}>
                  <span>{budget.categoryId?.name || 'Unknown Category'}: </span>
                  <span>${budget.budgetedAmount.toLocaleString()}</span>
                  {/* TODO: Add edit/delete functionality */}
                  <button onClick={() => handleSetBudget(budget.categoryId?._id)}>Edit</button>
                  <button onClick={() => handleDeleteBudget(budget._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
          {/* TODO: Add form/modal for setting/updating budget amounts */}
          <button>Set/Update Budget for Month</button>
        </>
      )}
    </div>
  );
};

export default BudgetsPage;
