// umoney-frontend/src/components/forms/IncomeForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressBar } from 'primereact/progressbar';
import { apiUtils } from '../../api/utils/api.js';
import { CategoryController } from '../../controllers/CategoryController';
import { TagController } from '../../controllers/TagController';

/**
 * Income Form Component
 * A simplified form specifically for adding income transactions
 */
const IncomeForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { currencyCode } = useCurrency();
  const { user } = useAuth();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  // Form fields
  const [amount, setAmount] = useState(initialData?.amount || null);
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date) : new Date());
  const [source, setSource] = useState(initialData?.description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState(initialData?.tag || '');
  
  // Source suggestions
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  
  // Tags
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  
  // Distribution preview
  const [showDistributionPreview, setShowDistributionPreview] = useState(false);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Load tags and show distribution preview when amount changes
  useEffect(() => {
    fetchTags();
    fetchSources();
    
    if (amount > 0) {
      setShowDistributionPreview(true);
    } else {
      setShowDistributionPreview(false);
    }
  }, [amount]);

  // Fetch tags from API
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const response = await TagController.getTransactionTags('income');
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setTagsLoading(false);
    }
  };
  
  // Fetch income sources from API (could be from previous transactions)
  const fetchSources = async () => {
    try {
      // This could be a new API endpoint to get common income sources
      // For now, we'll use some mock data
      setSourceSuggestions([
        'Salary',
        'Freelance',
        'Consulting',
        'Investments',
        'Dividends',
        'Rental Income',
        'Side Business',
        'Gift',
        'Tax Refund',
        'Other'
      ]);
    } catch (err) {
      console.error('Error fetching income sources:', err);
    }
  };

  // Filter sources as user types
  const searchSource = (event) => {
    const query = event.query.toLowerCase();
    let filtered = [];

    if (sourceSuggestions && sourceSuggestions.length) {
      filtered = sourceSuggestions.filter(s =>
        s.toLowerCase().includes(query)
      );
    }

    setFilteredSources(filtered);
  };
  
  // Filter tags as user types
  const searchTag = (event) => {
    const query = event.query.toLowerCase();
    let filtered = [];

    if (tags && tags.length) {
      filtered = tags.filter(tag =>
        tag.toLowerCase().includes(query)
      );
    }

    setFilteredTags(filtered);
  };

  // Add a new tag if it doesn't exist
  const addNewTag = async (tagName) => {
    if (!tagName || tags.includes(tagName)) return;

    try {
      await TagController.addTransactionTag({
        type: 'income',
        tag: tagName
      });

      // Refresh tags
      fetchTags();
    } catch (err) {
      console.error('Error adding new tag:', err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!source) errors.source = 'Source is required';
    if (!amount || amount <= 0) errors.amount = 'Amount must be greater than zero';

    setFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Prepare transaction data
      const transactionData = {
        description: source, // Use source as description
        amount,
        date: date.toISOString(),
        tag,
        notes,
        currency: currencyCode,
        // Add distribution field which is required by the backend
        distribution: {
          needs: user?.budgetPreferences?.needs?.percentage || 50,
          wants: user?.budgetPreferences?.wants?.percentage || 30,
          savings: user?.budgetPreferences?.savings?.percentage || 20
        }
      };

      // If we have initialData, this is an update
      let result;
      if (initialData?._id) {
        result = await apiUtils.updateTransaction(initialData._id, {
          ...transactionData,
          transactionType: 'Income'
        }, attachments);
        
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Income updated and redistributed successfully',
          life: 3000
        });
      } else {
        // Add new income transaction
        result = await apiUtils.addIncome(transactionData, attachments);
        
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Income added and distributed successfully',
          life: 3000
        });
      }

      // Reset form
      resetForm();

      // Notify parent component
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting income:', error);

      // Extract detailed error message if available
      let errorMessage = 'Failed to add income';

      if (error.response && error.response.data) {
        if (error.response.data.details) {
          errorMessage = error.response.data.details;
        } else if (error.response.data.msg) {
          errorMessage = error.response.data.msg;
        }

        // Log detailed error information
        console.error('Error details:', error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setAmount(null);
    setDate(new Date());
    setSource('');
    setTag('');
    setNotes('');
    setAttachments([]);
    setFormErrors({});

    // Reset file upload
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  // Handle file upload
  const onFileUpload = (e) => {
    const files = e.files;
    setAttachments(files);

    toast.current.show({
      severity: 'info',
      summary: 'File Selected',
      detail: `${files.length} file(s) selected`,
      life: 3000
    });
  };

  // Calculate distribution amounts for income
  const calculateDistribution = () => {
    if (!amount || amount <= 0 || !user?.budgetPreferences) return null;

    const { needs, wants, savings } = user.budgetPreferences;

    return {
      needs: (amount * needs.percentage) / 100,
      wants: (amount * wants.percentage) / 100,
      savings: (amount * savings.percentage) / 100
    };
  };

  // Render distribution preview
  const renderDistributionPreview = () => {
    if (!showDistributionPreview) return null;

    const distribution = calculateDistribution();
    if (!distribution) return null;

    return (
      <div className="p-field distribution-preview p-mt-3">
        <label className="p-mb-2">Income Distribution Preview</label>
        <div className="p-grid">
          <div className="p-col-12 p-md-4">
            <div className="p-mb-2">
              <span className="font-bold">Needs ({user.budgetPreferences.needs.percentage}%)</span>
              <ProgressBar value={user.budgetPreferences.needs.percentage} showValue={false} />
              <span className="text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(distribution.needs)}</span>
            </div>
          </div>
          <div className="p-col-12 p-md-4">
            <div className="p-mb-2">
              <span className="font-bold">Wants ({user.budgetPreferences.wants.percentage}%)</span>
              <ProgressBar value={user.budgetPreferences.wants.percentage} showValue={false} />
              <span className="text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(distribution.wants)}</span>
            </div>
          </div>
          <div className="p-col-12 p-md-4">
            <div className="p-mb-2">
              <span className="font-bold">Savings ({user.budgetPreferences.savings.percentage}%)</span>
              <ProgressBar value={user.budgetPreferences.savings.percentage} showValue={false} />
              <span className="text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(distribution.savings)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="income-form">
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid">
        {/* Amount */}
        <div className="p-field p-mb-3">
          <label htmlFor="amount" className="p-d-block">Amount</label>
          <InputNumber
            id="amount"
            value={amount}
            onValueChange={(e) => setAmount(e.value)}
            mode="currency"
            currency={currencyCode}
            locale="en-US"
            className={formErrors.amount ? 'p-invalid' : ''}
          />
          {formErrors.amount && <small className="p-error">{formErrors.amount}</small>}
        </div>

        {/* Date */}
        <div className="p-field p-mb-3">
          <label htmlFor="date" className="p-d-block">Date</label>
          <Calendar
            id="date"
            value={date}
            onChange={(e) => setDate(e.value)}
            showTime
            showIcon
            dateFormat="mm/dd/yy"
          />
        </div>

        {/* Source */}
        <div className="p-field p-mb-3">
          <label htmlFor="source" className="p-d-block">Source</label>
          <AutoComplete
            id="source"
            value={source}
            suggestions={filteredSources}
            completeMethod={searchSource}
            onChange={(e) => setSource(e.value)}
            dropdown
            className={formErrors.source ? 'p-invalid' : ''}
          />
          {formErrors.source && <small className="p-error">{formErrors.source}</small>}
        </div>

        {/* Tag */}
        <div className="p-field p-mb-3">
          <label htmlFor="tag" className="p-d-block">Tag (Optional)</label>
          <AutoComplete
            id="tag"
            value={tag}
            suggestions={filteredTags}
            completeMethod={searchTag}
            onChange={(e) => setTag(e.value)}
            onSelect={(e) => setTag(e.value)}
            onBlur={() => tag && addNewTag(tag)}
            dropdown
            forceSelection={false}
            loading={tagsLoading}
          />
        </div>

        {/* Notes */}
        <div className="p-field p-mb-3">
          <label htmlFor="notes" className="p-d-block">Notes (Optional)</label>
          <InputTextarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Attachments */}
        <div className="p-field p-mb-3">
          <label className="p-d-block">Attachments (Optional)</label>
          <FileUpload
            ref={fileUploadRef}
            mode="advanced"
            multiple
            accept="image/*,application/pdf"
            maxFileSize={5000000}
            customUpload
            uploadHandler={onFileUpload}
            emptyTemplate={<p className="p-m-0">Drag and drop files here to upload.</p>}
          />
        </div>

        {/* Distribution Preview */}
        {renderDistributionPreview()}

        {/* Form Actions */}
        <div className="p-d-flex p-jc-end p-mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onCancel}
            type="button"
            disabled={loading ? true : false}
          />
          <Button
            label={loading ? 'Saving...' : 'Save'}
            icon="pi pi-check"
            className="p-button-success"
            type="submit"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
