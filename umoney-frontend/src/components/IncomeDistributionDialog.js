// umoney-frontend/src/components/IncomeDistributionDialog.js
import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressBar } from 'primereact/progressbar';
import { Slider } from 'primereact/slider';
import { Toast } from 'primereact/toast';
import { useCurrency } from '../contexts/CurrencyContext';

const IncomeDistributionDialog = ({
  visible,
  onHide,
  incomeAmount,
  distribution,
  onConfirm
}) => {
  const { currencyCode } = useCurrency();
  const toast = useRef(null);

  // Distribution percentages
  const [needsPercentage, setNeedsPercentage] = useState(distribution?.needs || 50);
  const [wantsPercentage, setWantsPercentage] = useState(distribution?.wants || 30);
  const [savingsPercentage, setSavingsPercentage] = useState(distribution?.savings || 20);

  // Distribution amounts
  const [needsAmount, setNeedsAmount] = useState(0);
  const [wantsAmount, setWantsAmount] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);

  // Total percentage
  const [totalPercentage, setTotalPercentage] = useState(100);

  // Calculate distribution amounts when percentages or income amount changes
  useEffect(() => {
    if (incomeAmount) {
      setNeedsAmount((incomeAmount * needsPercentage) / 100);
      setWantsAmount((incomeAmount * wantsPercentage) / 100);
      setSavingsAmount((incomeAmount * savingsPercentage) / 100);
    }
  }, [incomeAmount, needsPercentage, wantsPercentage, savingsPercentage]);

  // Update total percentage when individual percentages change
  useEffect(() => {
    setTotalPercentage(needsPercentage + wantsPercentage + savingsPercentage);
  }, [needsPercentage, wantsPercentage, savingsPercentage]);

  // Handle needs percentage change
  const handleNeedsPercentageChange = (value) => {
    const newNeedsPercentage = parseFloat(value);
    setNeedsPercentage(newNeedsPercentage);
    
    // Adjust savings to maintain total of 100%
    const newSavingsPercentage = Math.max(0, 100 - newNeedsPercentage - wantsPercentage);
    setSavingsPercentage(newSavingsPercentage);
  };

  // Handle wants percentage change
  const handleWantsPercentageChange = (value) => {
    const newWantsPercentage = parseFloat(value);
    setWantsPercentage(newWantsPercentage);
    
    // Adjust savings to maintain total of 100%
    const newSavingsPercentage = Math.max(0, 100 - needsPercentage - newWantsPercentage);
    setSavingsPercentage(newSavingsPercentage);
  };

  // Handle savings percentage change
  const handleSavingsPercentageChange = (value) => {
    const newSavingsPercentage = parseFloat(value);
    setSavingsPercentage(newSavingsPercentage);
    
    // Adjust wants to maintain total of 100%
    const newWantsPercentage = Math.max(0, 100 - needsPercentage - newSavingsPercentage);
    setWantsPercentage(newWantsPercentage);
  };

  // Handle needs amount change
  const handleNeedsAmountChange = (value) => {
    const newNeedsAmount = parseFloat(value);
    setNeedsAmount(newNeedsAmount);
    
    // Calculate new percentage
    const newNeedsPercentage = (newNeedsAmount / incomeAmount) * 100;
    setNeedsPercentage(newNeedsPercentage);
    
    // Adjust savings to maintain total of 100%
    const newSavingsPercentage = Math.max(0, 100 - newNeedsPercentage - wantsPercentage);
    setSavingsPercentage(newSavingsPercentage);
  };

  // Handle wants amount change
  const handleWantsAmountChange = (value) => {
    const newWantsAmount = parseFloat(value);
    setWantsAmount(newWantsAmount);
    
    // Calculate new percentage
    const newWantsPercentage = (newWantsAmount / incomeAmount) * 100;
    setWantsPercentage(newWantsPercentage);
    
    // Adjust savings to maintain total of 100%
    const newSavingsPercentage = Math.max(0, 100 - needsPercentage - newWantsPercentage);
    setSavingsPercentage(newSavingsPercentage);
  };

  // Handle savings amount change
  const handleSavingsAmountChange = (value) => {
    const newSavingsAmount = parseFloat(value);
    setSavingsAmount(newSavingsAmount);
    
    // Calculate new percentage
    const newSavingsPercentage = (newSavingsAmount / incomeAmount) * 100;
    setSavingsPercentage(newSavingsPercentage);
    
    // Adjust wants to maintain total of 100%
    const newWantsPercentage = Math.max(0, 100 - needsPercentage - newSavingsPercentage);
    setWantsPercentage(newWantsPercentage);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    // Check if total percentage is 100%
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Total percentage must be 100%',
        life: 3000
      });
      return;
    }

    // Check if any percentage is negative
    if (needsPercentage < 0 || wantsPercentage < 0 || savingsPercentage < 0) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Percentages cannot be negative',
        life: 3000
      });
      return;
    }

    // Call onConfirm with the new distribution
    onConfirm({
      needs: parseFloat(needsPercentage.toFixed(2)),
      wants: parseFloat(wantsPercentage.toFixed(2)),
      savings: parseFloat(savingsPercentage.toFixed(2))
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  };

  // Dialog footer
  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Confirm" icon="pi pi-check" onClick={handleConfirm} />
    </div>
  );

  return (
    <Dialog
      header="Income Distribution"
      visible={visible}
      style={{ width: '50vw' }}
      footer={footer}
      onHide={onHide}
      dismissableMask
    >
      <Toast ref={toast} />

      <div className="p-fluid">
        <div className="p-field p-mb-4">
          <label className="p-d-block">Total Income: {formatCurrency(incomeAmount)}</label>
          <div className={totalPercentage !== 100 ? 'p-error' : ''}>
            Total Percentage: {totalPercentage.toFixed(2)}% {totalPercentage !== 100 && '(Must be 100%)'}
          </div>
        </div>

        <div className="p-grid p-mb-4">
          <div className="p-col-12 p-mb-3">
            <label className="p-d-block">Needs ({needsPercentage.toFixed(2)}%)</label>
            <div className="p-d-flex p-ai-center">
              <Slider
                value={needsPercentage}
                onChange={(e) => handleNeedsPercentageChange(e.value)}
                min={0}
                max={100}
                className="p-mr-2 p-flex-1"
              />
              <InputNumber
                value={needsPercentage}
                onValueChange={(e) => handleNeedsPercentageChange(e.value)}
                min={0}
                max={100}
                suffix="%"
                style={{ width: '100px' }}
              />
            </div>
            <div className="p-d-flex p-ai-center p-mt-2">
              <ProgressBar value={needsPercentage} showValue={false} className="p-mr-2 p-flex-1" />
              <InputNumber
                value={needsAmount}
                onValueChange={(e) => handleNeedsAmountChange(e.value)}
                mode="currency"
                currency={currencyCode}
                locale="en-US"
                min={0}
                max={incomeAmount}
                style={{ width: '150px' }}
              />
            </div>
          </div>

          <div className="p-col-12 p-mb-3">
            <label className="p-d-block">Wants ({wantsPercentage.toFixed(2)}%)</label>
            <div className="p-d-flex p-ai-center">
              <Slider
                value={wantsPercentage}
                onChange={(e) => handleWantsPercentageChange(e.value)}
                min={0}
                max={100}
                className="p-mr-2 p-flex-1"
              />
              <InputNumber
                value={wantsPercentage}
                onValueChange={(e) => handleWantsPercentageChange(e.value)}
                min={0}
                max={100}
                suffix="%"
                style={{ width: '100px' }}
              />
            </div>
            <div className="p-d-flex p-ai-center p-mt-2">
              <ProgressBar value={wantsPercentage} showValue={false} className="p-mr-2 p-flex-1" />
              <InputNumber
                value={wantsAmount}
                onValueChange={(e) => handleWantsAmountChange(e.value)}
                mode="currency"
                currency={currencyCode}
                locale="en-US"
                min={0}
                max={incomeAmount}
                style={{ width: '150px' }}
              />
            </div>
          </div>

          <div className="p-col-12 p-mb-3">
            <label className="p-d-block">Savings ({savingsPercentage.toFixed(2)}%)</label>
            <div className="p-d-flex p-ai-center">
              <Slider
                value={savingsPercentage}
                onChange={(e) => handleSavingsPercentageChange(e.value)}
                min={0}
                max={100}
                className="p-mr-2 p-flex-1"
              />
              <InputNumber
                value={savingsPercentage}
                onValueChange={(e) => handleSavingsPercentageChange(e.value)}
                min={0}
                max={100}
                suffix="%"
                style={{ width: '100px' }}
              />
            </div>
            <div className="p-d-flex p-ai-center p-mt-2">
              <ProgressBar value={savingsPercentage} showValue={false} className="p-mr-2 p-flex-1" />
              <InputNumber
                value={savingsAmount}
                onValueChange={(e) => handleSavingsAmountChange(e.value)}
                mode="currency"
                currency={currencyCode}
                locale="en-US"
                min={0}
                max={incomeAmount}
                style={{ width: '150px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default IncomeDistributionDialog;
