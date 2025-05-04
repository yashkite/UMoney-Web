import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { BudgetController } from '../controllers/BudgetController';
import { Card } from 'primereact/card';
import ImportExportPanel from '../components/ImportExportPanel';

const SettingsPage = () => {
  const { currencyCode, setCurrencyCode, supportedCurrencies } = useCurrency();
  const { user } = useAuth();
  const toast = useRef(null);

  // Budget preferences state
  const [needsPercentage, setNeedsPercentage] = useState(50);
  const [wantsPercentage, setWantsPercentage] = useState(30);
  const [savingsPercentage, setSavingsPercentage] = useState(20);
  const [loading, setLoading] = useState(false);

  // Currency options for dropdown
  const currencyOptions = supportedCurrencies.map(currency => ({
    label: `${currency.name} (${currency.symbol})`,
    value: currency.code
  }));

  // Load user's budget preferences
  useEffect(() => {
    const fetchBudgetPreferences = async () => {
      try {
        // First try to get preferences from user object if available
        if (user && user.budgetPreferences) {
          setNeedsPercentage(user.budgetPreferences.needs?.percentage || 50);
          setWantsPercentage(user.budgetPreferences.wants?.percentage || 30);
          setSavingsPercentage(user.budgetPreferences.savings?.percentage || 20);
          return;
        }

        // If not available in user object, fetch from API
        if (user) {
          const result = await BudgetController.getBudgetPreferences();
          if (result && result.budgetPreferences) {
            setNeedsPercentage(result.budgetPreferences.needs?.percentage || 50);
            setWantsPercentage(result.budgetPreferences.wants?.percentage || 30);
            setSavingsPercentage(result.budgetPreferences.savings?.percentage || 20);
          }
        }
      } catch (error) {
        console.error('Error fetching budget preferences:', error);
        // Use default values if there's an error
        setNeedsPercentage(50);
        setWantsPercentage(30);
        setSavingsPercentage(20);
      }
    };

    fetchBudgetPreferences();
  }, [user]);

  // Calculate total percentage
  const totalPercentage = needsPercentage + wantsPercentage + savingsPercentage;
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  // Handle budget preferences update
  const handleUpdateBudgetPreferences = async () => {
    if (!isValidTotal) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Budget percentages must sum to 100%',
        life: 3000
      });
      return;
    }

    setLoading(true);
    try {
      console.log('SettingsPage: Updating budget preferences...');
      const result = await BudgetController.updateBudgetPreferences(
        needsPercentage,
        wantsPercentage,
        savingsPercentage
      );

      // Update local state with the returned values if available
      if (result.budgetPreferences) {
        setNeedsPercentage(result.budgetPreferences.needs.percentage);
        setWantsPercentage(result.budgetPreferences.wants.percentage);
        setSavingsPercentage(result.budgetPreferences.savings.percentage);
      }

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: result.message || `Budget preferences updated to Needs: ${needsPercentage}%, Wants: ${wantsPercentage}%, Savings: ${savingsPercentage}%`,
        life: 3000
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update budget preferences',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold m-0 mb-2 text-gradient">Settings</h1>
        <p className="text-500 m-0">Customize your UMoney experience</p>
      </div>

      {/* Currency Settings Card */}
      <Card title="Currency Settings" subTitle="Choose your preferred currency" className="dashboard-card shadow-3 mb-4">
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="currencySelect" className="font-bold mb-2 block">Default Currency</label>
            <Dropdown
              id="currencySelect"
              value={currencyCode}
              options={currencyOptions}
              onChange={(e) => setCurrencyCode(e.value)}
              placeholder="Select Default Currency"
              className="w-full"
              filter
            />
            <small className="block mt-2 text-500">
              <i className="pi pi-info-circle mr-2"></i>
              This currency will be used for displaying amounts throughout the application.
            </small>
          </div>
        </div>
      </Card>

      {/* Budget Preferences Card */}
      <Card
        title="Budget Preferences"
        subTitle="Customize your 50/30/20 rule"
        className="dashboard-card shadow-3 mb-4"
      >
        <div className="p-fluid">
          <div className="p-3 border-1 border-dashed border-300 bg-gray-50 border-round mb-4">
            <div className="flex align-items-center">
              <i className="pi pi-info-circle text-primary mr-2 text-xl"></i>
              <p className="m-0 line-height-3">
                Set your budget allocation percentages according to the 50-30-20 rule or your own preferences.
                The percentages must sum to 100%.
              </p>
            </div>
          </div>

          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="field p-3 border-round bg-blue-50">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-shopping-bag text-blue-500 mr-2"></i>
                  <label htmlFor="needsPercentage" className="font-bold">Needs Percentage</label>
                </div>
                <InputNumber
                  id="needsPercentage"
                  value={needsPercentage}
                  onValueChange={(e) => setNeedsPercentage(e.value)}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  min={0}
                  max={100}
                  suffix="%"
                  className="w-full"
                />
                <small className="text-600 mt-2 block">Recommended: 50%</small>
                <small className="text-500 block">Essential expenses like rent, utilities, groceries, and minimum debt payments.</small>
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field p-3 border-round bg-purple-50">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-heart text-purple-500 mr-2"></i>
                  <label htmlFor="wantsPercentage" className="font-bold">Wants Percentage</label>
                </div>
                <InputNumber
                  id="wantsPercentage"
                  value={wantsPercentage}
                  onValueChange={(e) => setWantsPercentage(e.value)}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  min={0}
                  max={100}
                  suffix="%"
                  className="w-full"
                />
                <small className="text-600 mt-2 block">Recommended: 30%</small>
                <small className="text-500 block">Non-essential expenses like dining out, entertainment, shopping, and hobbies.</small>
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field p-3 border-round bg-orange-50">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-piggy-bank text-orange-500 mr-2"></i>
                  <label htmlFor="savingsPercentage" className="font-bold">Savings Percentage</label>
                </div>
                <InputNumber
                  id="savingsPercentage"
                  value={savingsPercentage}
                  onValueChange={(e) => setSavingsPercentage(e.value)}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  min={0}
                  max={100}
                  suffix="%"
                  className="w-full"
                />
                <small className="text-600 mt-2 block">Recommended: 20%</small>
                <small className="text-500 block">Savings, investments, emergency fund, and additional debt payments.</small>
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex flex-column md:flex-row align-items-center justify-content-between mt-3">
            <div className={`text-${isValidTotal ? 'success' : 'danger'} font-bold text-xl mb-3 md:mb-0`}>
              Total: {totalPercentage.toFixed(2)}%
              {!isValidTotal && <span className="ml-2">(Must be 100%)</span>}
            </div>

            <Button
              label="Update Budget Preferences"
              icon="pi pi-save"
              onClick={handleUpdateBudgetPreferences}
              disabled={!isValidTotal || loading}
              loading={loading}
              className="p-button-rounded"
              severity="primary"
              raised
            />
          </div>
        </div>
      </Card>

      {/* Account Settings Card */}
      <Card
        title="Account Settings"
        subTitle="Manage your account preferences"
        className="dashboard-card shadow-3 mb-4"
      >
        <div className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-bold mb-2 block">Email Notifications</label>
                <div className="flex align-items-center">
                  <Button
                    label="Manage Notifications"
                    icon="pi pi-envelope"
                    className="p-button-outlined"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Coming Soon', detail: 'This feature will be available in a future update.' })}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-bold mb-2 block">Account Security</label>
                <div className="flex align-items-center">
                  <Button
                    label="Security Settings"
                    icon="pi pi-shield"
                    className="p-button-outlined"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Coming Soon', detail: 'This feature will be available in a future update.' })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Import/Export Panel */}
      <ImportExportPanel />
    </div>
  );
}

export default SettingsPage;
