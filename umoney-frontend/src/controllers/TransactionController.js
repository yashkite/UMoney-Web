import { TransactionModel } from '../models/TransactionModel';

export const TransactionController = {
  async getTransactions(params = {}) {
    try {
      return await TransactionModel.getTransactions(params);
    } catch (error) {
      console.error('TransactionController: Error fetching transactions:', error);
      throw error;
    }
  },

  async getTransactionSummary() {
    try {
      return await TransactionModel.getTransactionSummary();
    } catch (error) {
      console.error('TransactionController: Error fetching transaction summary:', error);
      throw error;
    }
  },

  async addIncome(incomeData, attachments = []) {
    try {
      return await TransactionModel.addIncome(incomeData, attachments);
    } catch (error) {
      console.error('TransactionController: Error adding income:', error);
      throw error;
    }
  },

  async addExpense(expenseData, attachments = []) {
    try {
      return await TransactionModel.addExpense(expenseData, attachments);
    } catch (error) {
      console.error('TransactionController: Error adding expense:', error);
      throw error;
    }
  },

  async updateTransaction(id, transactionData) {
    try {
      return await TransactionModel.updateTransaction(id, transactionData);
    } catch (error) {
      console.error('TransactionController: Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      return await TransactionModel.deleteTransaction(id);
    } catch (error) {
      console.error('TransactionController: Error deleting transaction:', error);
      throw error;
    }
  },

  async addSavings(savingsData, attachments = []) {
    try {
      return await TransactionModel.addSavings(savingsData, attachments);
    } catch (error) {
      console.error('TransactionController: Error adding savings transaction:', error);
      throw error;
    }
  },

  async updateSavings(id, savingsData, attachments = []) {
    try {
      return await TransactionModel.updateSavings(id, savingsData, attachments);
    } catch (error) {
      console.error('TransactionController: Error updating savings transaction:', error);
      throw error;
    }
  }
};