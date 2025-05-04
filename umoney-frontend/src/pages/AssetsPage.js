import React, { useState, useEffect, useRef } from 'react';
import { AssetController } from '../api/controllers/AssetController';
import { Toast } from 'primereact/toast';

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const data = await AssetController.getAssets();
        setAssets(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError('Failed to fetch assets.');
        setAssets([]);

        // Show error toast
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch assets',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleAddAsset = async () => {
    try {
      // In a real implementation, you would open a dialog to collect asset data
      const newAssetData = {
        name: 'New Asset',
        type: 'Cash',
        value: 5000,
        dateAdded: new Date().toISOString()
      };

      const result = await AssetController.createAsset(newAssetData);

      if (result.success) {
        // Refresh assets list
        const updatedAssets = await AssetController.getAssets();
        setAssets(Array.isArray(updatedAssets) ? updatedAssets : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset created successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error adding asset:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add asset',
        life: 3000
      });
    }
  };

  const handleUpdateAsset = async (id) => {
    try {
      // In a real implementation, you would open a dialog with the current asset data
      const assetToUpdate = assets.find(asset => asset._id === id);
      if (!assetToUpdate) return;

      const updatedAssetData = {
        ...assetToUpdate,
        name: `${assetToUpdate.name} (Updated)`,
        value: assetToUpdate.value * 1.1 // Increase value by 10%
      };

      const result = await AssetController.updateAsset(id, updatedAssetData);

      if (result.success) {
        // Refresh assets list
        const updatedAssets = await AssetController.getAssets();
        setAssets(Array.isArray(updatedAssets) ? updatedAssets : []);

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset updated successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error updating asset:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update asset',
        life: 3000
      });
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      // Confirm deletion (in a real implementation, you would show a confirmation dialog)
      const result = await AssetController.deleteAsset(id);

      if (result.success) {
        // Remove the deleted asset from the state
        setAssets(assets.filter(asset => asset._id !== id));

        // Show success toast
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset deleted successfully',
          life: 3000
        });
      }
    } catch (err) {
      console.error("Error deleting asset:", err);

      // Show error toast
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete asset',
        life: 3000
      });
    }
  };

  if (loading) {
    return <div>Loading assets...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <Toast ref={toast} />
      <h2>Assets</h2>
      <button onClick={handleAddAsset}>Add New Asset</button>
      {assets.length === 0 ? (
        <p>No assets recorded yet.</p>
      ) : (
        <ul>
          {assets.map((asset) => (
            <li key={asset._id}>
              <h3>{asset.name} ({asset.type})</h3>
              <p>Value: ${asset.value.toLocaleString()}</p>
              <p>Date Added: {new Date(asset.dateAdded).toLocaleDateString()}</p>
              <button onClick={() => handleUpdateAsset(asset._id)}>Edit</button>
              <button onClick={() => handleDeleteAsset(asset._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssetsPage;
