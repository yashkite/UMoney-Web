import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { Toast } from 'primereact/toast';
import { apiUtils } from '../utils/apiUtils';

const SetupWizard = ({ onComplete }) => {
  const navigate = useNavigate();
  const { supportedCurrencies, setCurrencyCode } = useCurrency();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  // User information state
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    employmentType: null,
    estimatedMonthlyIncome: null,
    estimatedMonthlyExpenses: null,
    preferredCurrency: 'INR',
    budgetPreferences: {
      needs: 50,
      wants: 30,
      savings: 20
    }
  });

  // Employment type options
  const employmentTypes = [
    { label: 'Salaried', value: 'Salaried' },
    { label: 'Self-employed', value: 'Self-employed' },
    { label: 'Business', value: 'Business' },
    { label: 'Student', value: 'Student' },
    { label: 'Unemployed', value: 'Unemployed' }
  ];

  // Currency options
  const currencyOptions = supportedCurrencies.map(currency => ({
    label: `${currency.code} (${currency.symbol})`,
    value: currency.code
  }));

  // Steps for the wizard
  const steps = [
    { label: 'Personal Info' },
    { label: 'Financial Info' },
    { label: 'Budget Allocation' },
    { label: 'Review' }
  ];

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle budget preference changes
  const handleBudgetChange = (category, value) => {
    // Calculate other values to ensure total is 100%
    let newBudget = { ...formData.budgetPreferences, [category]: value };

    // If needs is changed, adjust wants and savings proportionally
    if (category === 'needs') {
      const remainingPercentage = 100 - value;
      const currentWantsToSavingsRatio = formData.budgetPreferences.wants / formData.budgetPreferences.savings;

      if (currentWantsToSavingsRatio > 0) {
        newBudget.wants = Math.round((remainingPercentage * currentWantsToSavingsRatio) / (1 + currentWantsToSavingsRatio));
        newBudget.savings = remainingPercentage - newBudget.wants;
      } else {
        // Default to equal split if ratio is 0
        newBudget.wants = Math.round(remainingPercentage / 2);
        newBudget.savings = remainingPercentage - newBudget.wants;
      }
    }
    // If wants is changed, adjust savings to maintain 100% total
    else if (category === 'wants') {
      newBudget.savings = 100 - newBudget.needs - value;
    }
    // If savings is changed, adjust wants to maintain 100% total
    else if (category === 'savings') {
      newBudget.wants = 100 - newBudget.needs - value;
    }

    // Ensure no negative values
    if (newBudget.wants < 0) newBudget.wants = 0;
    if (newBudget.savings < 0) newBudget.savings = 0;

    setFormData(prev => ({
      ...prev,
      budgetPreferences: newBudget
    }));
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      setActiveIndex(prev => prev + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setActiveIndex(prev => prev - 1);
  };

  // Validate current step
  const validateCurrentStep = () => {
    switch (activeIndex) {
      case 0: // Personal Info
        if (!formData.displayName) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter your name' });
          return false;
        }
        if (!formData.dateOfBirth) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter your date of birth' });
          return false;
        }
        return true;

      case 1: // Financial Info
        if (!formData.employmentType) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select your employment type' });
          return false;
        }
        if (!formData.estimatedMonthlyIncome) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter your estimated monthly income' });
          return false;
        }
        return true;

      case 2: // Budget Allocation
        const { needs, wants, savings } = formData.budgetPreferences;
        const total = needs + wants + savings;

        if (total !== 100) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: `Budget allocation must total 100% (currently ${total}%)` });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Submit the form
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Format data for API
      const setupData = {
        ...formData,
        budgetPreferences: {
          needs: {
            percentage: formData.budgetPreferences.needs
          },
          wants: {
            percentage: formData.budgetPreferences.wants
          },
          savings: {
            percentage: formData.budgetPreferences.savings
          }
        }
      };

      // Save user preferences
      await apiUtils.completeSetup(setupData);

      // Update currency in context
      setCurrencyCode(formData.preferredCurrency);

      // Show success message
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Setup completed successfully!' });

      // Notify parent component
      if (onComplete) {
        onComplete();
      }

      // We'll let the parent component handle navigation
      // This prevents multiple navigation attempts

    } catch (error) {
      console.error('Setup error:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to complete setup. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on active index
  const renderStepContent = () => {
    switch (activeIndex) {
      case 0: // Personal Info
        return (
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="displayName">Full Name*</label>
              <InputText
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
              />
            </div>

            <div className="formgrid grid">
              <div className="field col-12 md:col-6">
                <label htmlFor="firstName">First Name</label>
                <InputText
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="lastName">Last Name</label>
                <InputText
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="dateOfBirth">Date of Birth*</label>
              <Calendar
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.value)}
                showIcon
                maxDate={new Date()}
                yearNavigator
                yearRange="1900:2023"
              />
            </div>
          </div>
        );

      case 1: // Financial Info
        return (
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="employmentType">Employment Type*</label>
              <Dropdown
                id="employmentType"
                value={formData.employmentType}
                options={employmentTypes}
                onChange={(e) => handleChange('employmentType', e.value)}
                placeholder="Select your employment type"
              />
            </div>

            <div className="field">
              <label htmlFor="preferredCurrency">Preferred Currency*</label>
              <Dropdown
                id="preferredCurrency"
                value={formData.preferredCurrency}
                options={currencyOptions}
                onChange={(e) => handleChange('preferredCurrency', e.value)}
                placeholder="Select your preferred currency"
              />
            </div>

            <div className="field">
              <label htmlFor="estimatedMonthlyIncome">Estimated Monthly Income*</label>
              <InputNumber
                id="estimatedMonthlyIncome"
                value={formData.estimatedMonthlyIncome}
                onValueChange={(e) => handleChange('estimatedMonthlyIncome', e.value)}
                mode="currency"
                currency={formData.preferredCurrency}
                locale="en-US"
                min={0}
              />
            </div>

            <div className="field">
              <label htmlFor="estimatedMonthlyExpenses">Estimated Monthly Expenses</label>
              <InputNumber
                id="estimatedMonthlyExpenses"
                value={formData.estimatedMonthlyExpenses}
                onValueChange={(e) => handleChange('estimatedMonthlyExpenses', e.value)}
                mode="currency"
                currency={formData.preferredCurrency}
                locale="en-US"
                min={0}
              />
            </div>
          </div>
        );

      case 2: // Budget Allocation
        return (
          <div className="p-fluid">
            <div className="text-center mb-4">
              <h3>Budget Allocation (50-30-20 Rule)</h3>
              <p>Allocate your income across these three categories. The total must equal 100%.</p>
              <p className="text-lg font-bold">
                Total: {formData.budgetPreferences.needs + formData.budgetPreferences.wants + formData.budgetPreferences.savings}%
              </p>
            </div>

            <div className="field">
              <label htmlFor="needs">Needs: {formData.budgetPreferences.needs}%</label>
              <Slider
                id="needs"
                value={formData.budgetPreferences.needs}
                onChange={(e) => handleBudgetChange('needs', e.value)}
                min={0}
                max={100}
              />
              <small>Essential expenses like rent, groceries, utilities, etc.</small>
            </div>

            <div className="field">
              <label htmlFor="wants">Wants: {formData.budgetPreferences.wants}%</label>
              <Slider
                id="wants"
                value={formData.budgetPreferences.wants}
                onChange={(e) => handleBudgetChange('wants', e.value)}
                min={0}
                max={100}
              />
              <small>Non-essential expenses like dining out, entertainment, etc.</small>
            </div>

            <div className="field">
              <label htmlFor="savings">Savings: {formData.budgetPreferences.savings}%</label>
              <Slider
                id="savings"
                value={formData.budgetPreferences.savings}
                onChange={(e) => handleBudgetChange('savings', e.value)}
                min={0}
                max={100}
              />
              <small>Savings, investments, debt repayment, etc.</small>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="p-fluid">
            <h3>Review Your Information</h3>

            <div className="grid">
              <div className="col-12 md:col-6">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {formData.displayName}</p>
                <p><strong>Date of Birth:</strong> {formData.dateOfBirth?.toLocaleDateString()}</p>
              </div>

              <div className="col-12 md:col-6">
                <h4>Financial Information</h4>
                <p><strong>Employment Type:</strong> {formData.employmentType}</p>
                <p><strong>Preferred Currency:</strong> {formData.preferredCurrency}</p>
                <p><strong>Monthly Income:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.preferredCurrency }).format(formData.estimatedMonthlyIncome || 0)}</p>
              </div>

              <div className="col-12">
                <h4>Budget Allocation</h4>
                <p><strong>Needs:</strong> {formData.budgetPreferences.needs}%</p>
                <p><strong>Wants:</strong> {formData.budgetPreferences.wants}%</p>
                <p><strong>Savings:</strong> {formData.budgetPreferences.savings}%</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="setup-wizard">
      <Toast ref={toast} />

      <Card className="mb-4">
        <Steps model={steps} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={false} />
      </Card>

      <Card>
        {renderStepContent()}

        <div className="flex justify-content-between mt-4">
          {activeIndex > 0 && (
            <Button label="Previous" icon="pi pi-arrow-left" onClick={prevStep} className="p-button-secondary" />
          )}

          {activeIndex < steps.length - 1 ? (
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={nextStep} className="ml-auto" />
          ) : (
            <Button label="Complete Setup" icon="pi pi-check" onClick={handleSubmit} loading={loading} className="ml-auto" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default SetupWizard;
