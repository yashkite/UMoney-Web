// umoney-frontend/src/controllers/ExportImportController.js

import { exportImportApi } from '../api';

export const ExportImportController = {
  /**
   * Export transactions as CSV
   * @param {Object} params - Query parameters (startDate, endDate, transactionType)
   * @returns {Promise<void>} - Initiates file download
   */
  async exportTransactionsCSV(params = {}) {
    try {
      const blob = await exportImportApi.exportTransactionsCSV(params);
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('ExportImportController: Error exporting transactions as CSV:', error);
      throw error;
    }
  },
  
  /**
   * Export transactions as JSON
   * @param {Object} params - Query parameters (startDate, endDate, transactionType)
   * @returns {Promise<void>} - Initiates file download
   */
  async exportTransactionsJSON(params = {}) {
    try {
      const blob = await exportImportApi.exportTransactionsJSON(params);
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'transactions.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('ExportImportController: Error exporting transactions as JSON:', error);
      throw error;
    }
  },
  
  /**
   * Export financial report as PDF
   * @param {Object} params - Query parameters (startDate, endDate, reportType)
   * @returns {Promise<void>} - Initiates file download
   */
  async exportReportPDF(params = {}) {
    try {
      const blob = await exportImportApi.exportReportPDF(params);
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'financial-report.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('ExportImportController: Error exporting report as PDF:', error);
      throw error;
    }
  },
  
  /**
   * Import transactions from CSV
   * @param {File} file - CSV file to import
   * @returns {Promise<Object>} - Import result
   */
  async importTransactionsCSV(file) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      return await exportImportApi.importTransactionsCSV(file);
    } catch (error) {
      console.error('ExportImportController: Error importing transactions from CSV:', error);
      throw error;
    }
  },
  
  /**
   * Import transactions from JSON
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} - Import result
   */
  async importTransactionsJSON(file) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      return await exportImportApi.importTransactionsJSON(file);
    } catch (error) {
      console.error('ExportImportController: Error importing transactions from JSON:', error);
      throw error;
    }
  }
};

export default ExportImportController;
