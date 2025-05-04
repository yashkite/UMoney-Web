import { UserModel } from '../models/UserModel';

export const ProfileController = {
  /**
   * Update user profile information
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Response with updated profile data
   */
  async updateUserProfile(profileData) {
    try {
      console.log('ProfileController: Updating user profile with data:', profileData);
      const result = await UserModel.updateUserProfile(profileData);
      console.log('ProfileController: Profile updated successfully:', result);
      return result;
    } catch (error) {
      console.error('ProfileController: Error updating profile:', error);
      throw error;
    }
  }
};
