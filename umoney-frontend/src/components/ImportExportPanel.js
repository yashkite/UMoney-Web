// umoney-frontend/src/components/ImportExportPanel.js

import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { ExportImportController } from '../controllers/ExportImportController';

const ImportExportPanel = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  // Transaction type options
  const transactionTypeOptions = [
    { label: 'All Types', value: null },
    { label: 'Income', value: 'Income' },
    { label: 'Needs', value: 'Needs' },
    { label: 'Wants', value: 'Wants' },
    { label: 'Savings', value: 'Savings' }
  ];

  // Report type options
  const reportTypeOptions = [
    { label: 'Summary Report', value: 'summary' },
    { label: 'Detailed Report', value: 'detailed' }
  ];

  // Handle export as CSV
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        transactionType
      };
      
      await ExportImportController.exportTransactionsCSV(params);
      
      toast.current.show({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Transactions exported as CSV',
        life: 3000
      });
    } catch (error) {
      console.error('Error exporting as CSV:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Export Failed',
        detail: error.message || 'Failed to export transactions as CSV',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle export as JSON
  const handleExportJSON = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        transactionType
      };
      
      await ExportImportController.exportTransactionsJSON(params);
      
      toast.current.show({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Transactions exported as JSON',
        life: 3000
      });
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Export Failed',
        detail: error.message || 'Failed to export transactions as JSON',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle export as PDF
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        reportType
      };
      
      await ExportImportController.exportReportPDF(params);
      
      toast.current.show({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Financial report exported as PDF',
        life: 3000
      });
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Export Failed',
        detail: error.message || 'Failed to export financial report as PDF',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV file upload
  const handleImportCSV = async (event) => {
    try {
      setLoading(true);
      setImportResult(null);
      
      const file = event.files[0];
      
      const result = await ExportImportController.importTransactionsCSV(file);
      
      setImportResult(result.data);
      
      toast.current.show({
        severity: 'success',
        summary: 'Import Successful',
        detail: `Imported ${result.data.imported} transactions`,
        life: 3000
      });
      
      // Clear the file upload
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Import Failed',
        detail: error.message || 'Failed to import transactions from CSV',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle JSON file upload
  const handleImportJSON = async (event) => {
    try {
      setLoading(true);
      setImportResult(null);
      
      const file = event.files[0];
      
      const result = await ExportImportController.importTransactionsJSON(file);
      
      setImportResult(result.data);
      
      toast.current.show({
        severity: 'success',
        summary: 'Import Successful',
        detail: `Imported ${result.data.imported} transactions`,
        life: 3000
      });
      
      // Clear the file upload
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Import Failed',
        detail: error.message || 'Failed to import transactions from JSON',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Render import result
  const renderImportResult = () => {
    if (!importResult) return null;
    
    return (
      <div className="mt-4 p-3 border-1 border-round border-dashed">
        <h3>Import Results</h3>
        <div className="flex flex-column gap-2">
          <div className="flex align-items-center">
            <i className="pi pi-check-circle text-success mr-2"></i>
            <span>Successfully imported: {importResult.imported} transactions</span>
          </div>
          
          {importResult.errors > 0 && (
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle text-warning mr-2"></i>
              <span>Errors: {importResult.errors}</span>
            </div>
          )}
          
          {importResult.errorDetails && importResult.errorDetails.length > 0 && (
            <div className="mt-3">
              <h4>Error Details</h4>
              <ul className="m-0 pl-3">
                {importResult.errorDetails.map((error, index) => (
                  <li key={index} className="mb-2">
                    {error.row || error.index ? 
                      `Row ${error.row || error.index + 1}: ${error.message}` : 
                      error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card 
      title="Data Import & Export" 
      subTitle="Export your financial data or import from other sources"
      className="dashboard-card shadow-3 mb-4"
    >
      <Toast ref={toast} />
      
      {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mb-3" />}
      
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="Export Data">
          <div className="p-fluid">
            <div className="p-3 border-1 border-dashed border-300 bg-gray-50 border-round mb-4">
              <div className="flex align-items-center">
                <i className="pi pi-info-circle text-primary mr-2 text-xl"></i>
                <p className="m-0 line-height-3">
                  Export your transaction data for backup or analysis in external tools.
                  You can filter by date range and transaction type.
                </p>
              </div>
            </div>
            
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field">
                  <label htmlFor="startDate" className="font-bold mb-2 block">Start Date</label>
                  <Calendar 
                    id="startDate" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.value)} 
                    showIcon 
                    dateFormat="yy-mm-dd"
                    maxDate={endDate || undefined}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="field">
                  <label htmlFor="endDate" className="font-bold mb-2 block">End Date</label>
                  <Calendar 
                    id="endDate" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.value)} 
                    showIcon 
                    dateFormat="yy-mm-dd"
                    minDate={startDate || undefined}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="field mb-4">
              <label htmlFor="transactionType" className="font-bold mb-2 block">Transaction Type</label>
              <Dropdown
                id="transactionType"
                value={transactionType}
                options={transactionTypeOptions}
                onChange={(e) => setTransactionType(e.value)}
                placeholder="Select Transaction Type"
                className="w-full"
              />
            </div>
            
            <Divider align="center">
              <span className="p-tag">Export Format</span>
            </Divider>
            
            <div className="grid mt-4">
              <div className="col-12 md:col-4">
                <div className="field">
                  <Button
                    label="Export as CSV"
                    icon="pi pi-file-excel"
                    className="p-button-outlined p-button-success w-full"
                    onClick={handleExportCSV}
                    disabled={loading}
                  />
                  <small className="block mt-2 text-500">
                    Comma-separated values format, compatible with Excel and other spreadsheet applications.
                  </small>
                </div>
              </div>
              
              <div className="col-12 md:col-4">
                <div className="field">
                  <Button
                    label="Export as JSON"
                    icon="pi pi-file-code"
                    className="p-button-outlined p-button-info w-full"
                    onClick={handleExportJSON}
                    disabled={loading}
                  />
                  <small className="block mt-2 text-500">
                    JavaScript Object Notation format, ideal for data processing and programmatic access.
                  </small>
                </div>
              </div>
              
              <div className="col-12 md:col-4">
                <div className="field">
                  <Button
                    label="Generate PDF Report"
                    icon="pi pi-file-pdf"
                    className="p-button-outlined p-button-danger w-full"
                    onClick={handleExportPDF}
                    disabled={loading}
                  />
                  <small className="block mt-2 text-500">
                    Generates a formatted financial report in PDF format.
                  </small>
                </div>
              </div>
            </div>
            
            <div className="field mt-3">
              <label htmlFor="reportType" className="font-bold mb-2 block">PDF Report Type</label>
              <Dropdown
                id="reportType"
                value={reportType}
                options={reportTypeOptions}
                onChange={(e) => setReportType(e.value)}
                className="w-full"
              />
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Import Data">
          <div className="p-fluid">
            <div className="p-3 border-1 border-dashed border-300 bg-gray-50 border-round mb-4">
              <div className="flex align-items-center">
                <i className="pi pi-info-circle text-primary mr-2 text-xl"></i>
                <p className="m-0 line-height-3">
                  Import transaction data from CSV or JSON files. Make sure your file follows the required format.
                  For CSV imports, the file should include columns for description, amount, transactionType, and date at minimum.
                </p>
              </div>
            </div>
            
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field">
                  <label className="font-bold mb-2 block">Import from CSV</label>
                  <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    name="file"
                    url="/api/import/transactions/csv"
                    accept=".csv"
                    maxFileSize={5000000}
                    customUpload
                    uploadHandler={handleImportCSV}
                    auto
                    chooseLabel="Select CSV File"
                    className="w-full"
                    disabled={loading}
                  />
                  <small className="block mt-2 text-500">
                    Upload a CSV file with columns: description, amount, transactionType, date, category (optional)
                  </small>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="field">
                  <label className="font-bold mb-2 block">Import from JSON</label>
                  <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    name="file"
                    url="/api/import/transactions/json"
                    accept=".json"
                    maxFileSize={5000000}
                    customUpload
                    uploadHandler={handleImportJSON}
                    auto
                    chooseLabel="Select JSON File"
                    className="w-full"
                    disabled={loading}
                  />
                  <small className="block mt-2 text-500">
                    Upload a JSON file with an array of transaction objects
                  </small>
                </div>
              </div>
            </div>
            
            {renderImportResult()}
          </div>
        </TabPanel>
      </TabView>
    </Card>
  );
};

export default ImportExportPanel;
