import React, { useState, useEffect, useRef } from 'react';
import { LiabilityController } from '../api/controllers/LiabilityController';
import { Toast } from 'primereact/toast';

const LiabilitiesPage = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchLiabilities = async () => {
      try {
        setLoading(true);
        const data = await LiabilityController.getLiabilities();
        setLiabilities(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching liabilities:", err);
        setError('Failed to fetch liabilities.');
        setLiabilities([]);

        // Show error toast
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch liabilities',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiabilities();
  }, []);

  const handleAddLiability = async () => {
    try {
      // In a real implementation, you would open a dialog to collect liability data
      const newLiabilityData = {
        name: 'New Liability',
        type: 'Loan',
        balance: 10000,
        interestRate: 5.5,
        dateAdded: new Date().toISOString()
      };

      const result = await LiabilityController.createLiability(newLiabilityData);

      if (result.success) {
        // Refresh liabilities list
        const updatedLiabilities = await LiabilityController.getLiabilities();
        setLiabilities(Array.isArray(updatedLiabilities) ? updatedLiabilities : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Liability created successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error adding liability:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add liability',
        life: 3000
      });
    }
  };

  const handleUpdateLiability = async (id) => {
    try {
      // In a real implementation, you would open a dialog with the current liability data
      const liabilityToUpdate = liabilities.find(liability => liability._id === id);
      if (!liabilityToUpdate) return;

      const updatedLiabilityData = {
        ...liabilityToUpdate,
        name: `${liabilityToUpdate.name} (Updated)`,
        balance: liabilityToUpdate.balance * 0.9 // Decrease balance by 10%
      };

      const result = await LiabilityController.updateLiability(id, updatedLiabilityData);

      if (result.success) {
        // Refresh liabilities list
        const updatedLiabilities = await LiabilityController.getLiabilities();
        setLiabilities(Array.isArray(updatedLiabilities) ? updatedLiabilities : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Liability updated successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error updating liability:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update liability',
        life: 3000
      });
    }
  };

  const handleDeleteLiability = async (id) => {
    try {
      // Confirm deletion (in a real implementation, you would show a confirmation dialog)
      const result = await LiabilityController.deleteLiability(id);

      if (result.success) {
        // Remove the deleted liability from the state
        setLiabilities(liabilities.filter(liability => liability._id !== id));

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Liability deleted successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error deleting liability:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete liability',
        life: 3000
      });
    }
  };

  if (loading) {
    return <div>Loading liabilities...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <Toast ref={toast} />
      <h2>Liabilities</h2>
      <button onClick={handleAddLiability}>Add New Liability</button>
      {liabilities.length === 0 ? (
        <p>No liabilities recorded yet.</p>
      ) : (
        <ul>
          {liabilities.map((liability) => (
            <li key={liability._id}>
              <h3>{liability.name} ({liability.type})</h3>
              <p>Balance: ${liability.balance.toLocaleString()}</p>
              {liability.interestRate !== undefined && <p>Interest Rate: {liability.interestRate}%</p>}
              <p>Date Added: {new Date(liability.dateAdded).toLocaleDateString()}</p>
              <button onClick={() => handleUpdateLiability(liability._id)}>Edit</button>
              <button onClick={() => handleDeleteLiability(liability._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiabilitiesPage;
