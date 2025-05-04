import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { useAuth } from '../contexts/AuthContext';
import { ProfileController } from '../controllers/ProfileController';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Load user profile data
  useEffect(() => {
    if (user) {
      console.log('ProfilePage: Loading user data into form:', user);
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      console.log('ProfilePage: Saving profile with data:', {
        name: profileData.name,
        phone: profileData.phone
      });

      // Call the API to update the profile
      const result = await ProfileController.updateUserProfile({
        name: profileData.name,
        phone: profileData.phone
      });

      console.log('ProfilePage: Profile update result:', result);

      // Update the user context with the new profile data
      const updatedUser = {
        ...user,
        name: profileData.name,
        phone: profileData.phone
      };

      console.log('ProfilePage: Updating user in context with:', updatedUser);

      // Update the user in the AuthContext
      updateUser(updatedUser);

      // Store the updated user data in localStorage to persist across refreshes
      console.log('ProfilePage: Updating localStorage with new profile data');
      localStorage.setItem('userData', JSON.stringify({
        name: profileData.name,
        phone: profileData.phone
      }));

      toast.current.show({
        severity: 'success',
        summary: 'Profile Updated',
        detail: 'Your profile has been updated successfully',
        life: 3000
      });

      setEditMode(false);
    } catch (error) {
      console.error('ProfilePage: Error updating profile:', error);

      // More detailed error message
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }

      toast.current.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: errorMessage,
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setEditMode(false);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="p-3">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold m-0 mb-2 text-gradient">My Profile</h1>
        <p className="text-500 m-0">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <Card className="dashboard-card shadow-3 mb-4">
        <div className="flex flex-column md:flex-row align-items-center md:align-items-start">
          {/* Profile Avatar */}
          <div className="flex flex-column align-items-center mb-4 md:mb-0 md:mr-5">
            <Avatar
              label={getInitials(profileData.name)}
              size="xlarge"
              shape="circle"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                width: '100px',
                height: '100px',
                fontSize: '2.5rem'
              }}
            />
            {!editMode && (
              <Button
                label="Edit Profile"
                icon="pi pi-user-edit"
                className="p-button-rounded p-button-outlined mt-3"
                onClick={() => setEditMode(true)}
              />
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 w-full">
            {editMode ? (
              <div className="p-fluid">
                <div className="field mb-3">
                  <label htmlFor="name" className="font-bold block mb-2">Full Name</label>
                  <InputText
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div className="field mb-3">
                  <label htmlFor="email" className="font-bold block mb-2">Email Address</label>
                  <InputText
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled
                  />
                  <small className="text-500">Email cannot be changed</small>
                </div>

                <div className="field mb-3">
                  <label htmlFor="phone" className="font-bold block mb-2">Phone Number</label>
                  <InputText
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2 justify-content-end mt-4">
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-outlined p-button-secondary"
                    onClick={handleCancelEdit}
                  />
                  <Button
                    label="Save Changes"
                    icon="pi pi-check"
                    onClick={handleSaveProfile}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">{profileData.name || 'User'}</h2>

                <div className="mb-3">
                  <div className="flex align-items-center mb-2">
                    <i className="pi pi-envelope text-primary mr-2"></i>
                    <span className="font-semibold mr-2">Email:</span>
                    <span>{profileData.email || 'Not provided'}</span>
                  </div>

                  <div className="flex align-items-center">
                    <i className="pi pi-phone text-primary mr-2"></i>
                    <span className="font-semibold mr-2">Phone:</span>
                    <span>{profileData.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Security Card */}
      <Card
        title="Account Security"
        subTitle="Manage your account security settings"
        className="dashboard-card shadow-3 mb-4"
      >
        <div className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-bold mb-2 block">Password</label>
                <div className="flex align-items-center">
                  <Button
                    label="Change Password"
                    icon="pi pi-lock"
                    className="p-button-outlined"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Coming Soon', detail: 'This feature will be available in a future update.' })}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-bold mb-2 block">Two-Factor Authentication</label>
                <div className="flex align-items-center">
                  <Button
                    label="Enable 2FA"
                    icon="pi pi-shield"
                    className="p-button-outlined"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Coming Soon', detail: 'This feature will be available in a future update.' })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Connected Accounts Card */}
      <Card
        title="Connected Accounts"
        subTitle="Manage your connected accounts and services"
        className="dashboard-card shadow-3"
      >
        <div className="p-fluid">
          {/* Google Account */}
          <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-3 p-3 border-1 border-round surface-border">
            <div className="flex align-items-center mb-3 md:mb-0">
              <div className="flex align-items-center justify-content-center mr-3" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(219, 68, 55, 0.1)'
              }}>
                <i className="pi pi-google text-xl" style={{ color: '#DB4437' }}></i>
              </div>
              <div>
                <div className="font-medium">Google</div>
                <div className="text-sm text-500">Connected as {user?.email || 'user@example.com'}</div>
              </div>
            </div>
            <Button
              label="Disconnect"
              icon="pi pi-link-alt"
              className="p-button-outlined p-button-sm p-button-danger"
              onClick={() => toast.current.show({
                severity: 'info',
                summary: 'Coming Soon',
                detail: 'This feature will be available in a future update.'
              })}
            />
          </div>

          {/* Microsoft Account */}
          <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between p-3 border-1 border-round surface-border">
            <div className="flex align-items-center mb-3 md:mb-0">
              <div className="flex align-items-center justify-content-center mr-3" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 164, 239, 0.1)'
              }}>
                <i className="pi pi-microsoft text-xl" style={{ color: '#00A4EF' }}></i>
              </div>
              <div>
                <div className="font-medium">Microsoft</div>
                <div className="text-sm text-500">Not connected</div>
              </div>
            </div>
            <Button
              label="Connect"
              icon="pi pi-link"
              className="p-button-outlined p-button-sm"
              onClick={() => toast.current.show({
                severity: 'info',
                summary: 'Coming Soon',
                detail: 'This feature will be available in a future update.'
              })}
            />
          </div>

          {/* Info Message */}
          <div className="mt-3 p-3 border-1 border-dashed border-round surface-border bg-gray-50">
            <div className="flex align-items-center">
              <i className="pi pi-info-circle text-primary mr-2"></i>
              <span className="text-sm text-600">
                Connected accounts allow you to sign in to UMoney using your existing accounts.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
