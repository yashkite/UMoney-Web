import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';
import { ColorPicker } from 'primereact/colorpicker';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategoryController } from '../controllers/CategoryController';

function CategoriesPage() {
  const { currencyCode } = useCurrency();
  const toast = useRef(null);

  // State variables
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('Needs');
  const [categoryIcon, setCategoryIcon] = useState('pi pi-tag');
  const [categoryColor, setCategoryColor] = useState('#607D8B');
  const [budgetPercentage, setBudgetPercentage] = useState(0);
  const [budgetAmount, setBudgetAmount] = useState(0);

  // Filter states
  const [typeFilter, setTypeFilter] = useState(null);

  // Load categories and stats on component mount
  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryController.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load categories',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch category statistics from API
  const fetchCategoryStats = async () => {
    setStatsLoading(true);
    try {
      const data = await CategoryController.getCategoryStats(30); // Last 30 days
      setCategoryStats(data);
    } catch (error) {
      console.error('Error fetching category statistics:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load category statistics',
        life: 3000
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Open create category dialog
  const openCreateDialog = () => {
    setCategoryName('');
    setCategoryType('Needs');
    setCategoryIcon('pi pi-tag');
    setCategoryColor('#607D8B');
    setCreateDialog(true);
  };

  // Open edit category dialog
  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setCategoryIcon(category.icon || 'pi pi-tag');
    setCategoryColor(category.color || '#607D8B');
    setEditDialog(true);
  };

  // Open budget dialog
  const openBudgetDialog = (category) => {
    setSelectedCategory(category);
    setBudgetPercentage(category.budgetAllocation?.percentage || 0);
    setBudgetAmount(category.budgetAllocation?.amount || 0);
    setBudgetDialog(true);
  };

  // Create a new category
  const createCategory = async () => {
    if (!categoryName) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Category name is required',
        life: 3000
      });
      return;
    }

    try {
      const newCategory = {
        name: categoryName,
        type: categoryType,
        icon: categoryIcon,
        color: categoryColor
      };

      const result = await CategoryController.createCategory(newCategory);
      setCategories([...categories, result]);
      setCreateDialog(false);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Category created successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to create category',
        life: 3000
      });
    }
  };

  // Update an existing category
  const updateCategory = async () => {
    if (!categoryName) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Category name is required',
        life: 3000
      });
      return;
    }

    try {
      const updatedCategory = {
        name: categoryName,
        icon: categoryIcon,
        color: categoryColor
      };

      const result = await CategoryController.updateCategory(selectedCategory._id, updatedCategory);

      // Update categories list
      setCategories(categories.map(cat =>
        cat._id === selectedCategory._id ? result : cat
      ));

      setEditDialog(false);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Category updated successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update category',
        life: 3000
      });
    }
  };

  // Update category budget
  const updateCategoryBudget = async () => {
    try {
      const budgetData = {
        percentage: budgetPercentage,
        amount: budgetAmount
      };

      const result = await CategoryController.updateCategoryBudget(selectedCategory._id, budgetData);

      // Update categories list
      setCategories(categories.map(cat =>
        cat._id === selectedCategory._id ? result : cat
      ));

      setBudgetDialog(false);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Budget updated successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update budget',
        life: 3000
      });
    }
  };

  // Delete a category
  const confirmDeleteCategory = (category) => {
    confirmDialog({
      message: `Are you sure you want to delete the category "${category.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteCategory(category)
    });
  };

  const deleteCategory = async (category) => {
    try {
      await CategoryController.deleteCategory(category._id);

      // Update categories list
      setCategories(categories.filter(cat => cat._id !== category._id));

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Category deleted successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to delete category',
        life: 3000
      });
    }
  };

  // Reset categories to defaults
  const confirmResetCategories = () => {
    confirmDialog({
      message: 'Are you sure you want to reset all categories to defaults? This will delete all custom categories.',
      header: 'Reset Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => resetCategories()
    });
  };

  const resetCategories = async () => {
    try {
      const result = await CategoryController.resetCategories();

      // Update categories list
      setCategories(result.categories);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Categories reset successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error resetting categories:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to reset categories',
        life: 3000
      });
    }
  };

  // Filter categories by type
  const filterCategoriesByType = (type) => {
    setTypeFilter(type);
  };

  // Render category icon
  const categoryIconTemplate = (rowData) => {
    return (
      <i className={rowData.icon || 'pi pi-tag'} style={{ color: rowData.color || '#607D8B', fontSize: '1.5rem' }}></i>
    );
  };

  // Render budget allocation
  const budgetTemplate = (rowData) => {
    const percentage = rowData.budgetAllocation?.percentage || 0;
    const amount = rowData.budgetAllocation?.amount || 0;

    return (
      <div>
        {percentage > 0 && <div>{percentage}%</div>}
        {amount > 0 && <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount)}</div>}
        {percentage === 0 && amount === 0 && <span>-</span>}
      </div>
    );
  };

  // Render actions column
  const actionsTemplate = (rowData) => {
    return (
      <div className="p-d-flex p-jc-end">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-mr-2"
          onClick={() => openEditDialog(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-dollar"
          className="p-button-rounded p-button-text p-button-success p-mr-2"
          onClick={() => openBudgetDialog(rowData)}
          tooltip="Set Budget"
        />
        {rowData.isCustom && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => confirmDeleteCategory(rowData)}
            tooltip="Delete"
          />
        )}
      </div>
    );
  };

  // Prepare chart data for category statistics
  const prepareChartData = () => {
    if (!categoryStats || categoryStats.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group by category type
    const statsByType = categoryStats.reduce((acc, stat) => {
      if (!acc[stat.categoryType]) {
        acc[stat.categoryType] = 0;
      }
      acc[stat.categoryType] += stat.totalAmount;
      return acc;
    }, {});

    // Prepare chart data
    return {
      labels: Object.keys(statsByType),
      datasets: [
        {
          data: Object.values(statsByType),
          backgroundColor: [
            '#42A5F5', // Needs (blue)
            '#FFA726', // Wants (orange)
            '#66BB6A', // Savings (green)
            '#EC407A'  // Income (pink)
          ]
        }
      ]
    };
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    if (!typeFilter) {
      return categories;
    }
    return categories.filter(cat => cat.type === typeFilter);
  };

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-col-12">
        <div className="p-d-flex p-jc-between p-ai-center">
          <h1>Categories & Budgets</h1>
          <div>
            <Button
              label="Add Category"
              icon="pi pi-plus"
              onClick={openCreateDialog}
              className="p-mr-2"
            />
            <Button
              label="Reset to Defaults"
              icon="pi pi-refresh"
              className="p-button-secondary"
              onClick={confirmResetCategories}
            />
          </div>
        </div>

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Categories">
            <div className="p-mb-3">
              <Button
                label="All"
                className={!typeFilter ? 'p-button-primary' : 'p-button-outlined'}
                onClick={() => filterCategoriesByType(null)}
                style={{ marginRight: '0.5rem' }}
              />
              <Button
                label="Needs"
                className={typeFilter === 'Needs' ? 'p-button-primary' : 'p-button-outlined'}
                onClick={() => filterCategoriesByType('Needs')}
                style={{ marginRight: '0.5rem' }}
              />
              <Button
                label="Wants"
                className={typeFilter === 'Wants' ? 'p-button-primary' : 'p-button-outlined'}
                onClick={() => filterCategoriesByType('Wants')}
                style={{ marginRight: '0.5rem' }}
              />
              <Button
                label="Savings"
                className={typeFilter === 'Savings' ? 'p-button-primary' : 'p-button-outlined'}
                onClick={() => filterCategoriesByType('Savings')}
                style={{ marginRight: '0.5rem' }}
              />
              <Button
                label="Income"
                className={typeFilter === 'Income' ? 'p-button-primary' : 'p-button-outlined'}
                onClick={() => filterCategoriesByType('Income')}
              />
            </div>

            <DataTable
              value={getFilteredCategories()}
              paginator
              rows={10}
              loading={loading}
              emptyMessage="No categories found"
              rowHover
            >
              <Column field="icon" header="Icon" body={categoryIconTemplate} style={{ width: '80px' }}></Column>
              <Column field="name" header="Name" sortable></Column>
              <Column field="type" header="Type" sortable></Column>
              <Column field="budgetAllocation" header="Budget" body={budgetTemplate} sortable></Column>
              <Column field="isCustom" header="Custom" body={(rowData) => rowData.isCustom ? 'Yes' : 'No'} sortable></Column>
              <Column body={actionsTemplate} style={{ width: '150px' }}></Column>
            </DataTable>
          </TabPanel>

          <TabPanel header="Statistics">
            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <Card title="Category Usage (Last 30 Days)" className="p-shadow-4">
                  {statsLoading ? (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '300px' }}>
                      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <Chart type="pie" data={prepareChartData()} options={{ responsive: true }} style={{ height: '300px' }} />
                  ) : (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '300px' }}>
                      <p>No transaction data available</p>
                    </div>
                  )}
                </Card>
              </div>

              <div className="p-col-12 p-md-6">
                <Card title="Top Categories by Spending" className="p-shadow-4">
                  {statsLoading ? (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '300px' }}>
                      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <DataTable value={categoryStats.slice(0, 5)} className="p-datatable-sm">
                      <Column field="categoryName" header="Category"></Column>
                      <Column field="categoryType" header="Type"></Column>
                      <Column field="totalAmount" header="Amount" body={(rowData) =>
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(rowData.totalAmount)
                      }></Column>
                      <Column field="count" header="Transactions"></Column>
                    </DataTable>
                  ) : (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '300px' }}>
                      <p>No transaction data available</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>

      {/* Create Category Dialog */}
      <Dialog
        header="Create Category"
        visible={createDialog}
        onHide={() => setCreateDialog(false)}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
      >
        <div className="p-field">
          <label htmlFor="categoryName">Name</label>
          <InputText
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="categoryType">Type</label>
          <Dropdown
            id="categoryType"
            value={categoryType}
            options={[
              {label: 'Needs', value: 'Needs'},
              {label: 'Wants', value: 'Wants'},
              {label: 'Savings', value: 'Savings'},
              {label: 'Income', value: 'Income'}
            ]}
            onChange={(e) => setCategoryType(e.value)}
          />
        </div>

        <div className="p-field">
          <label htmlFor="categoryIcon">Icon</label>
          <InputText
            id="categoryIcon"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="e.g., pi pi-home"
          />
          <small className="p-d-block">Use PrimeIcons (pi pi-*)</small>
        </div>

        <div className="p-field">
          <label htmlFor="categoryColor">Color</label>
          <ColorPicker
            id="categoryColor"
            value={categoryColor}
            onChange={(e) => setCategoryColor('#' + e.value)}
          />
        </div>

        <div className="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setCreateDialog(false)} />
          <Button label="Create" icon="pi pi-check" onClick={createCategory} />
        </div>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        header="Edit Category"
        visible={editDialog}
        onHide={() => setEditDialog(false)}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
      >
        <div className="p-field">
          <label htmlFor="editCategoryName">Name</label>
          <InputText
            id="editCategoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="editCategoryIcon">Icon</label>
          <InputText
            id="editCategoryIcon"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="e.g., pi pi-home"
          />
          <small className="p-d-block">Use PrimeIcons (pi pi-*)</small>
        </div>

        <div className="p-field">
          <label htmlFor="editCategoryColor">Color</label>
          <ColorPicker
            id="editCategoryColor"
            value={categoryColor}
            onChange={(e) => setCategoryColor('#' + e.value)}
          />
        </div>

        <div className="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setEditDialog(false)} />
          <Button label="Update" icon="pi pi-check" onClick={updateCategory} />
        </div>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog
        header="Set Budget"
        visible={budgetDialog}
        onHide={() => setBudgetDialog(false)}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
      >
        <div className="p-field">
          <label htmlFor="budgetPercentage">Budget Percentage (%)</label>
          <InputNumber
            id="budgetPercentage"
            value={budgetPercentage}
            onValueChange={(e) => setBudgetPercentage(e.value)}
            min={0}
            max={100}
            showButtons
          />
        </div>

        <div className="p-field">
          <label htmlFor="budgetAmount">Budget Amount</label>
          <InputNumber
            id="budgetAmount"
            value={budgetAmount}
            onValueChange={(e) => setBudgetAmount(e.value)}
            mode="currency"
            currency={currencyCode}
            locale="en-US"
            min={0}
          />
        </div>

        <div className="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setBudgetDialog(false)} />
          <Button label="Save" icon="pi pi-check" onClick={updateCategoryBudget} />
        </div>
      </Dialog>
    </div>
  );
}

export default CategoriesPage;
