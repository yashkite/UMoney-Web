// umoney-backend/controllers/incomeTransactionDelete.js

const Transaction = require('../models/Transaction');

/**
 * Delete an income transaction and its distributions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
exports.deleteIncomeTransaction = async (req, res) => {
  try {
    console.log('deleteIncomeTransaction: Transaction ID:', req.params.id);

    const transactionId = req.params.id;
    const userId = req.user.id;

    // Find the income transaction
    const incomeTransaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
      transactionType: 'Income'
    });

    if (!incomeTransaction) {
      console.log('deleteIncomeTransaction: Transaction not found or not an income transaction');
      return res.status(404).json({ msg: 'Income transaction not found' });
    }

    // Get the IDs of the distributed transactions
    const { needs: needsId, wants: wantsId, savings: savingsId } = incomeTransaction.distributedTransactions || {};

    // Delete the distributed transactions
    const deletePromises = [];
    
    if (needsId) {
      deletePromises.push(Transaction.findByIdAndDelete(needsId));
    }
    
    if (wantsId) {
      deletePromises.push(Transaction.findByIdAndDelete(wantsId));
    }
    
    if (savingsId) {
      deletePromises.push(Transaction.findByIdAndDelete(savingsId));
    }

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    console.log('deleteIncomeTransaction: Distributed transactions deleted');

    // Delete the income transaction
    await Transaction.findByIdAndDelete(transactionId);
    console.log('deleteIncomeTransaction: Income transaction deleted');

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Income transaction and distributions deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting income transaction:', err);
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);

    res.status(500).json({
      msg: 'Server Error',
      details: err.message
    });
  }
};
