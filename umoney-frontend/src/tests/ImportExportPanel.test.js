// umoney-frontend/src/tests/ImportExportPanel.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ImportExportPanel from '../components/ImportExportPanel';
import { ExportImportController } from '../controllers/ExportImportController';

// Mock the ExportImportController
jest.mock('../controllers/ExportImportController', () => ({
  ExportImportController: {
    exportTransactionsCSV: jest.fn().mockResolvedValue({ success: true }),
    exportTransactionsJSON: jest.fn().mockResolvedValue({ success: true }),
    exportReportPDF: jest.fn().mockResolvedValue({ success: true }),
    importTransactionsCSV: jest.fn().mockResolvedValue({ 
      data: { imported: 5, errors: 0 } 
    }),
    importTransactionsJSON: jest.fn().mockResolvedValue({ 
      data: { imported: 3, errors: 1, errorDetails: [{ row: 2, message: 'Invalid data' }] } 
    })
  }
}));

// Mock the FileUpload component from PrimeReact
jest.mock('primereact/fileupload', () => ({
  FileUpload: ({ uploadHandler, chooseLabel }) => (
    <div data-testid="file-upload">
      <button 
        data-testid="upload-button" 
        onClick={() => uploadHandler({ files: [new File([''], 'test.csv')] })}
      >
        {chooseLabel}
      </button>
    </div>
  )
}));

describe('ImportExportPanel Component', () => {
  test('renders export and import tabs', () => {
    render(<ImportExportPanel />);
    
    expect(screen.getByText('Data Import & Export')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });
  
  test('allows selecting date range for export', () => {
    render(<ImportExportPanel />);
    
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });
  
  test('allows selecting transaction type for export', () => {
    render(<ImportExportPanel />);
    
    expect(screen.getByLabelText('Transaction Type')).toBeInTheDocument();
  });
  
  test('shows export format options', () => {
    render(<ImportExportPanel />);
    
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
  });
  
  test('handles CSV export', async () => {
    render(<ImportExportPanel />);
    
    const exportButton = screen.getByText('Export as CSV');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(ExportImportController.exportTransactionsCSV).toHaveBeenCalled();
    });
  });
  
  test('handles JSON export', async () => {
    render(<ImportExportPanel />);
    
    const exportButton = screen.getByText('Export as JSON');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(ExportImportController.exportTransactionsJSON).toHaveBeenCalled();
    });
  });
  
  test('handles PDF export', async () => {
    render(<ImportExportPanel />);
    
    const exportButton = screen.getByText('Generate PDF Report');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(ExportImportController.exportReportPDF).toHaveBeenCalled();
    });
  });
  
  test('switches to import tab', () => {
    render(<ImportExportPanel />);
    
    const importTab = screen.getByText('Import Data');
    fireEvent.click(importTab);
    
    expect(screen.getByText('Import from CSV')).toBeInTheDocument();
    expect(screen.getByText('Import from JSON')).toBeInTheDocument();
  });
  
  test('handles CSV import', async () => {
    render(<ImportExportPanel />);
    
    // Switch to import tab
    const importTab = screen.getByText('Import Data');
    fireEvent.click(importTab);
    
    // Find and click the upload button
    const uploadButtons = screen.getAllByTestId('upload-button');
    fireEvent.click(uploadButtons[0]); // First upload button is for CSV
    
    await waitFor(() => {
      expect(ExportImportController.importTransactionsCSV).toHaveBeenCalled();
      expect(screen.getByText('Successfully imported: 5 transactions')).toBeInTheDocument();
    });
  });
  
  test('handles JSON import with errors', async () => {
    render(<ImportExportPanel />);
    
    // Switch to import tab
    const importTab = screen.getByText('Import Data');
    fireEvent.click(importTab);
    
    // Find and click the upload button
    const uploadButtons = screen.getAllByTestId('upload-button');
    fireEvent.click(uploadButtons[1]); // Second upload button is for JSON
    
    await waitFor(() => {
      expect(ExportImportController.importTransactionsJSON).toHaveBeenCalled();
      expect(screen.getByText('Successfully imported: 3 transactions')).toBeInTheDocument();
      expect(screen.getByText('Errors: 1')).toBeInTheDocument();
      expect(screen.getByText('Row 2: Invalid data')).toBeInTheDocument();
    });
  });
});
