import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
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
import { apiUtils } from '../api/utils/api.js';
import { CategoryController } from '../controllers/CategoryController';
import { TagController } from '../controllers/TagController';

const TransactionForm = ({
  transactionType,
  onSuccess,
  onCancel
}) => {
  const { currencyCode } = useCurrency();
  const { user } = useAuth();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  // Basic transaction fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(null);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(null);
  const [tag, setTag] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // For expense transactions
  const [recipient, setRecipient] = useState(null);
  const [recipientType, setRecipientType] = useState('merchant');
  const [recipientSuggestions, setRecipientSuggestions] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  // For income distribution preview
  const [showDistributionPreview, setShowDistributionPreview] = useState(false);

  // Categories and tags
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Recipient types
  const recipientTypes = [
    { label: 'Contact', value: 'contact' },
    { label: 'UPI ID', value: 'upi' },
    { label: 'Bank', value: 'bank' },
    { label: 'Merchant', value: 'merchant' }
  ];

  // Load categories and tags on component mount
  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (transactionType !== 'Income') {
      fetchRecipients();
    }
  }, [transactionType]);

  // Show distribution preview when amount changes for Income
  useEffect(() => {
    if (transactionType === 'Income' && amount > 0) {
      setShowDistributionPreview(true);
    } else {
      setShowDistributionPreview(false);
    }
  }, [amount, transactionType]);

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await CategoryController.getCategories();
      let filteredCategories = [];
      if (Array.isArray(data)) {
        // Filter categories by transaction type
        filteredCategories = data.filter(cat =>
          cat.type === transactionType
        ).map(cat => ({
        label: cat.name,
        value: cat._id,
        icon: cat.icon,
        color: cat.color
        }));
      }
      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load categories',
        life: 3000
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch tags from API
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const type = transactionType.toLowerCase();
      const response = await TagController.getTransactionTags(type);
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setTagsLoading(false);
    }
  };

  // Fetch recipients from API
  const fetchRecipients = async () => {
    setRecipientsLoading(true);
    try {
      const recipients = await apiUtils.getRecipients();
      setRecipientSuggestions(recipients);
    } catch (err) {
      console.error('Error fetching recipients:', err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  // Filter recipients as user types
  const searchRecipient = (event) => {
    const query = event.query.toLowerCase();
    let filtered = [];

    if (recipientSuggestions && recipientSuggestions.length) {
      filtered = recipientSuggestions.filter(r =>
        r.name.toLowerCase().includes(query)
      );
    }

    setFilteredRecipients(filtered);
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
        type: transactionType.toLowerCase(),
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
    if (!description) errors.description = 'Description is required';
    if (!amount || amount <= 0) errors.amount = 'Amount must be greater than zero';

    // Category is optional - backend will create a default one if not provided

    // For expense transactions, validate recipient
    if (transactionType !== 'Income') {
      if (!recipient) errors.recipient = 'Recipient is required';
    }

    setFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Prepare transaction data
      const transactionData = {
        description,
        amount,
        date: date.toISOString(),
        category: category ? category.value : null,
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

      let result;

      if (transactionType === 'Income') {
        // Add income transaction
        result = await apiUtils.addIncome(transactionData, attachments);
      } else {
        // Add expense transaction
        const recipientData = {
          name: recipient && typeof recipient === 'object' ? recipient.name : recipient,
          type: recipientType,
          details: ''
        };

        result = await apiUtils.addExpense({
          ...transactionData,
          transactionType,
          recipient: recipientData
        }, attachments);
      }

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: transactionType === 'Income'
          ? 'Income added and distributed successfully'
          : `${transactionType} expense added successfully`,
        life: 3000
      });

      // Reset form
      resetForm();

      // Notify parent component
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);

      // Extract detailed error message if available
      let errorMessage = 'Failed to add transaction';

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
    setDescription('');
    setAmount(null);
    setDate(new Date());
    setCategory(null);
    setTag('');
    setNotes('');
    setAttachments([]);
    setRecipient(null);
    setRecipientType('merchant');
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

  // Render distribution preview for income
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
    <div className="transaction-form">
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid">
        {/* Description */}
        <div className="p-field p-mb-3">
          <label htmlFor="description" className="p-d-block">Description</label>
          <InputText
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={formErrors.description ? 'p-invalid' : ''}
          />
          {formErrors.description && <small className="p-error">{formErrors.description}</small>}
        </div>

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

        {/* Category */}
        <div className="p-field p-mb-3">
          <label htmlFor="category" className="p-d-block">Category</label>
          <Dropdown
            id="category"
            value={category}
            options={categories}
            onChange={(e) => setCategory(e.value)}
            optionLabel="label"
            filter
            showClear
            filterBy="label"
            placeholder="Select a category"
            className={formErrors.category ? 'p-invalid' : ''}
            loading={categoriesLoading}
          />
          {formErrors.category && <small className="p-error">{formErrors.category}</small>}
        </div>

        {/* Recipient (for expense transactions) */}
        {transactionType !== 'Income' && (
          <>
            <div className="p-field p-mb-3">
              <label htmlFor="recipient" className="p-d-block">Given To</label>
              <div className="p-inputgroup">
                <AutoComplete
                  id="recipient"
                  value={recipient}
                  suggestions={filteredRecipients}
                  completeMethod={searchRecipient}
                  field="name"
                  dropdown
                  forceSelection={false}
                  onChange={(e) => setRecipient(e.value)}
                  className={formErrors.recipient ? 'p-invalid' : ''}
                  loading={recipientsLoading}
                />
                <Dropdown
                  value={recipientType}
                  options={recipientTypes}
                  onChange={(e) => setRecipientType(e.value)}
                  optionLabel="label"
                  placeholder="Type"
                  style={{ width: '120px' }}
                />
              </div>
              {formErrors.recipient && <small className="p-error">{formErrors.recipient}</small>}
            </div>
          </>
        )}

        {/* Tag */}
        <div className="p-field p-mb-3">
          <label htmlFor="tag" className="p-d-block">Tag</label>
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

        {/* Distribution Preview (for income) */}
        {transactionType === 'Income' && renderDistributionPreview()}

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
            className="p-button-primary"
            type="submit"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
