// umoney-frontend/src/api/exportImportApi.js

import { apiGet, apiPost } from './utils/apiUtils';

/**
 * Export transactions as CSV
 * @param {Object} params - Query parameters (startDate, endDate, transactionType)
 * @returns {Promise<Blob>} - CSV file as blob
 */
export const exportTransactionsCSV = async (params = {}) => {
  try {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `/export/transactions/csv${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet(url, {}, {
      responseType: 'blob',
      useCache: false
    });
    
    return response;
  } catch (error) {
    console.error('exportTransactionsCSV: Error exporting transactions as CSV:', error);
    throw error;
  }
};

/**
 * Export transactions as JSON
 * @param {Object} params - Query parameters (startDate, endDate, transactionType)
 * @returns {Promise<Blob>} - JSON file as blob
 */
export const exportTransactionsJSON = async (params = {}) => {
  try {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `/export/transactions/json${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet(url, {}, {
      responseType: 'blob',
      useCache: false
    });
    
    return response;
  } catch (error) {
    console.error('exportTransactionsJSON: Error exporting transactions as JSON:', error);
    throw error;
  }
};

/**
 * Export financial report as PDF
 * @param {Object} params - Query parameters (startDate, endDate, reportType)
 * @returns {Promise<Blob>} - PDF file as blob
 */
export const exportReportPDF = async (params = {}) => {
  try {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `/export/reports/pdf${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet(url, {}, {
      responseType: 'blob',
      useCache: false
    });
    
    return response;
  } catch (error) {
    console.error('exportReportPDF: Error exporting report as PDF:', error);
    throw error;
  }
};

/**
 * Import transactions from CSV
 * @param {File} file - CSV file to import
 * @returns {Promise<Object>} - Import result
 */
export const importTransactionsCSV = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiPost('/import/transactions/csv', formData, [], {
      contentType: 'multipart/form-data',
      cachePrefixToClear: 'transactions'
    });
    
    return response;
  } catch (error) {
    console.error('importTransactionsCSV: Error importing transactions from CSV:', error);
    throw error;
  }
};

/**
 * Import transactions from JSON
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} - Import result
 */
export const importTransactionsJSON = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiPost('/import/transactions/json', formData, [], {
      contentType: 'multipart/form-data',
      cachePrefixToClear: 'transactions'
    });
    
    return response;
  } catch (error) {
    console.error('importTransactionsJSON: Error importing transactions from JSON:', error);
    throw error;
  }
};

// Create a named object for default export
const exportImportApiExports = {
  exportTransactionsCSV,
  exportTransactionsJSON,
  exportReportPDF,
  importTransactionsCSV,
  importTransactionsJSON
};

// Export all export/import API functions
export default exportImportApiExports;
