import React, { useState, useEffect } from 'react';
import { FinancialGoalController } from '../api/controllers/FinancialGoalController';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const FinancialGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await FinancialGoalController.getFinancialGoals();
        setGoals(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching financial goals:", err);
        setError('Failed to fetch financial goals.');
        setGoals([]); // Clear goals on error

        // Show error toast
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch financial goals',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []); // Empty dependency array means this runs once on mount

  const handleAddGoal = async () => {
    try {
      // In a real implementation, you would open a dialog to collect goal data
      const newGoalData = {
        name: 'New Goal',
        targetAmount: 10000,
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        currentProgress: 0
      };

      const result = await FinancialGoalController.createFinancialGoal(newGoalData);

      if (result.success) {
        // Refresh goals list
        const updatedGoals = await FinancialGoalController.getFinancialGoals();
        setGoals(Array.isArray(updatedGoals) ? updatedGoals : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Financial goal created successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error adding financial goal:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add financial goal',
        life: 3000
      });
    }
  };

  const handleUpdateGoal = async (id) => {
    try {
      // In a real implementation, you would open a dialog with the current goal data
      const goalToUpdate = goals.find(goal => goal._id === id);
      if (!goalToUpdate) return;

      const updatedGoalData = {
        ...goalToUpdate,
        name: `${goalToUpdate.name} (Updated)`,
      };

      const result = await FinancialGoalController.updateFinancialGoal(id, updatedGoalData);

      if (result.success) {
        // Refresh goals list
        const updatedGoals = await FinancialGoalController.getFinancialGoals();
        setGoals(Array.isArray(updatedGoals) ? updatedGoals : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Financial goal updated successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error updating financial goal:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update financial goal',
        life: 3000
      });
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      // Confirm deletion (in a real implementation, you would show a confirmation dialog)
      const result = await FinancialGoalController.deleteFinancialGoal(id);

      if (result.success) {
        // Remove the deleted goal from the state
        setGoals(goals.filter(goal => goal._id !== id));

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Financial goal deleted successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error deleting financial goal:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete financial goal',
        life: 3000
      });
    }
  };

  if (loading) {
    return <div>Loading financial goals...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <Toast ref={toast} />
      <h2>Financial Goals</h2>
      <button onClick={handleAddGoal}>Add New Goal</button>
      {goals.length === 0 ? (
        <p>No financial goals set yet.</p>
      ) : (
        <ul>
          {goals.map((goal) => (
            <li key={goal._id}>
              <h3>{goal.name}</h3>
              <p>Target Amount: ${goal.targetAmount.toLocaleString()}</p>
              <p>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
              <p>Current Progress: ${goal.currentProgress.toLocaleString()}</p>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{
                    width: `${Math.min(100, (goal.currentProgress / goal.targetAmount) * 100)}%`
                  }}
                ></div>
              </div>
              <button onClick={() => handleUpdateGoal(goal._id)}>Edit</button>
              <button onClick={() => handleDeleteGoal(goal._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinancialGoalsPage;
