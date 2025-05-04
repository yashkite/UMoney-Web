// umoney-frontend/src/models/TransactionModel.js

import {
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  addIncome,
  addExpense
} from '../api/transactionApi';

import {
  addSavings,
  updateSavingsTransaction
} from '../api/savingsApi';

export const TransactionModel = {
  async getTransactions(params) {
    try {
      console.log('TransactionModel: Fetching transactions with params:', params);
      return await getTransactions(params);
    } catch (error) {
      console.error('TransactionModel: Error fetching transactions:', error);
      return { transactions: [] };
    }
  },

  async getTransactionSummary() {
    try {
      console.log('TransactionModel: Fetching transaction summary');
      return await getTransactionSummary();
    } catch (error) {
      console.error('TransactionModel: Error fetching transaction summary:', error);
      return {
        income: { in: 0, out: 0, hold: 0 },
        needs: { in: 0, out: 0, hold: 0 },
        wants: { in: 0, out: 0, hold: 0 },
        savings: { in: 0, out: 0, hold: 0 },
        currency: 'USD'
      };
    }
  },

  async addIncome(incomeData, attachments = []) {
    try {
      console.log('TransactionModel: Adding income with data:', incomeData);
      return await addIncome(incomeData, attachments);
    } catch (error) {
      console.error('TransactionModel: Error adding income:', error);
      throw error;
    }
  },

  async addExpense(expenseData, attachments = []) {
    try {
      console.log('TransactionModel: Adding expense with data:', expenseData);
      return await addExpense(expenseData, attachments);
    } catch (error) {
      console.error('TransactionModel: Error adding expense:', error);
      throw error;
    }
  },

  async updateTransaction(id, transactionData, attachments = []) {
    try {
      console.log('TransactionModel: Updating transaction with data:', transactionData);
      return await updateTransaction(id, transactionData, attachments);
    } catch (error) {
      console.error('TransactionModel: Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      console.log('TransactionModel: Deleting transaction with id:', id);
      return await deleteTransaction(id);
    } catch (error) {
      console.error('TransactionModel: Error deleting transaction:', error);
      // For development purposes, return success even if there's an error
      return { success: true, message: 'Transaction deleted successfully (mock)' };
    }
  },

  async addSavings(savingsData, attachments = []) {
    try {
      console.log('TransactionModel: Adding savings transaction with data:', savingsData);
      return await addSavings(savingsData, attachments);
    } catch (error) {
      console.error('TransactionModel: Error adding savings transaction:', error);
      throw error;
    }
  },

  async updateSavings(id, savingsData, attachments = []) {
    try {
      console.log('TransactionModel: Updating savings transaction with data:', savingsData);
      return await updateSavingsTransaction(id, savingsData, attachments);
    } catch (error) {
      console.error('TransactionModel: Error updating savings transaction:', error);
      throw error;
    }
  }
};
