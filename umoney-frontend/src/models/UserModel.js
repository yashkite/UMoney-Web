import { apiUtils } from '../api/utils/api';
const { API_BASE_URL, getHeaders, handleResponse } = apiUtils;

export const UserModel = {
  // Update user profile
  async updateUserProfile(profileData) {
    console.log('UserModel: Updating profile with data:', profileData);
    console.log('UserModel: API URL:', `${API_BASE_URL}/auth/profile`);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      console.log('UserModel: Response status:', response.status);
      return handleResponse(response);
    } catch (error) {
      console.error('UserModel: Error updating profile:', error);
      throw error;
    }
  }
};