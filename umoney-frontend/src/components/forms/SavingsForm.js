// umoney-frontend/src/components/forms/SavingsForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { AutoComplete } from 'primereact/autocomplete';
import { RadioButton } from 'primereact/radiobutton';
import { apiUtils } from '../../api/utils/api.js';
import { CategoryController } from '../../controllers/CategoryController';
import { TagController } from '../../controllers/TagController';

/**
 * Savings Form Component
 * A specialized form for savings transactions with deposit/withdrawal options
 */
const SavingsForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { currencyCode } = useCurrency();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  // Form fields
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || null);
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date) : new Date());
  const [category, setCategory] = useState(initialData?.category ? {
    label: initialData.category.name,
    value: initialData.category._id,
    icon: initialData.category.icon,
    color: initialData.category.color
  } : null);
  const [savingsType, setSavingsType] = useState(initialData?.savingsType || 'deposit');
  const [destination, setDestination] = useState(initialData?.recipient?.name || '');
  const [destinationType, setDestinationType] = useState(initialData?.recipient?.type || 'bank');
  const [tag, setTag] = useState(initialData?.tag || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Categories and tags
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Destinations
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Destination types
  const destinationTypes = [
    { label: 'Bank', value: 'bank' },
    { label: 'Investment', value: 'investment' },
    { label: 'Retirement', value: 'retirement' },
    { label: 'Emergency Fund', value: 'emergency' },
    { label: 'Other', value: 'other' }
  ];

  // Savings types
  const savingsTypes = [
    { label: 'Deposit', value: 'deposit' },
    { label: 'Withdrawal', value: 'withdrawal' }
  ];

  // Load categories, tags, and destinations on component mount
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchDestinations();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Use the new getCategoriesByType method to get Savings categories directly
      const data = await CategoryController.getCategoriesByType('Savings');
      let formattedCategories = [];
      if (Array.isArray(data)) {
        formattedCategories = data.map(cat => ({
          label: cat.name,
          value: cat._id,
          icon: cat.icon,
          color: cat.color
        }));
      }
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Error fetching Savings categories:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load Savings categories',
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
      const response = await TagController.getTransactionTags('savings');
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setTagsLoading(false);
    }
  };

  // Fetch destinations from API
  const fetchDestinations = async () => {
    setDestinationsLoading(true);
    try {
      // This could be a new API endpoint to get common savings destinations
      // For now, we'll use some mock data
      setDestinationSuggestions([
        'HDFC Bank',
        'SBI Bank',
        'ICICI Bank',
        'Axis Bank',
        'Mutual Fund',
        'Fixed Deposit',
        'PPF Account',
        'Emergency Fund',
        'Retirement Fund',
        'Stock Investment'
      ]);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setDestinationsLoading(false);
    }
  };

  // Filter destinations as user types
  const searchDestination = (event) => {
    const query = event.query.toLowerCase();
    let filtered = [];

    if (destinationSuggestions && destinationSuggestions.length) {
      filtered = destinationSuggestions.filter(d =>
        d.toLowerCase().includes(query)
      );
    }

    setFilteredDestinations(filtered);
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
        type: 'savings',
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
    if (!destination) errors.destination = 'Destination is required';

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
        transactionType: 'Savings',
        savingsType, // Add savings type (deposit/withdrawal)
        recipient: {
          name: destination,
          type: destinationType,
          details: ''
        }
      };

      let result;

      // If we have initialData, this is an update
      if (initialData?._id) {
        result = await apiUtils.updateTransaction(initialData._id, transactionData, attachments);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `Savings ${savingsType} updated successfully`,
          life: 3000
        });
      } else {
        // Add new savings transaction
        result = await apiUtils.addExpense(transactionData, attachments);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `Savings ${savingsType} added successfully`,
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
      console.error('Error submitting savings transaction:', error);

      // Extract detailed error message if available
      let errorMessage = 'Failed to add savings transaction';

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
    setSavingsType('deposit');
    setDestination('');
    setDestinationType('bank');
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

  return (
    <div className="savings-form">
      <Toast ref={toast} />

      <form onSubmit={handleSubmit} className="p-fluid">
        {/* Savings Type */}
        <div className="p-field p-mb-3">
          <label className="p-d-block">Transaction Type</label>
          <div className="p-formgroup-inline">
            {savingsTypes.map((type) => (
              <div className="p-field-checkbox p-mr-3" key={type.value}>
                <RadioButton
                  inputId={type.value}
                  name="savingsType"
                  value={type.value}
                  onChange={(e) => setSavingsType(e.value)}
                  checked={savingsType === type.value}
                />
                <label htmlFor={type.value} className="p-ml-2">{type.label}</label>
              </div>
            ))}
          </div>
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

        {/* Destination */}
        <div className="p-field p-mb-3">
          <label htmlFor="destination" className="p-d-block">
            {savingsType === 'deposit' ? 'Destination' : 'Source'}
          </label>
          <div className="p-inputgroup">
            <AutoComplete
              id="destination"
              value={destination}
              suggestions={filteredDestinations}
              completeMethod={searchDestination}
              onChange={(e) => setDestination(e.value)}
              dropdown
              className={formErrors.destination ? 'p-invalid' : ''}
              loading={destinationsLoading}
            />
            <Dropdown
              value={destinationType}
              options={destinationTypes}
              onChange={(e) => setDestinationType(e.value)}
              optionLabel="label"
              placeholder="Type"
              style={{ width: '150px' }}
            />
          </div>
          {formErrors.destination && <small className="p-error">{formErrors.destination}</small>}
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

export default SavingsForm;
