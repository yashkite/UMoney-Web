import { API_BASE_URL, getHeaders, handleResponse } from '../api/utils/api';

export const RecipientModel = {
  async getRecipients() {
    const response = await fetch(`${API_BASE_URL}/recipients`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });

    return handleResponse(response);
  },

  async addRecipient(recipientData) {
    const response = await fetch(`${API_BASE_URL}/recipients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(recipientData),
      credentials: 'include'
    });

    return handleResponse(response);
  }
};