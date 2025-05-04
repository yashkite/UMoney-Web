import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { TabMenu } from 'primereact/tabmenu';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from '../contexts/AuthContext';
import UMoneyLogo from './UMoneyLogo';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const profileMenu = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout function from AuthContext
      await logout();
      console.log('Logout successful, redirecting to home page');

      // Navigate to home page after logout
      // Use a small timeout to ensure state updates have time to propagate
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);

      // Even if there's an error, still redirect to home page
      // This ensures the user isn't stuck if logout fails
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  };

  // Navigation items for the tab menu with enhanced styling
  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => navigate('/app/dashboard'),
      className: location.pathname === '/app/dashboard' ? 'active-tab' : ''
    },
    {
      label: 'Needs',
      icon: 'pi pi-fw pi-shopping-bag',
      command: () => navigate('/app/needs'),
      className: location.pathname === '/app/needs' ? 'active-tab' : ''
    },
    {
      label: 'Wants',
      icon: 'pi pi-fw pi-heart',
      command: () => navigate('/app/wants'),
      className: location.pathname === '/app/wants' ? 'active-tab' : ''
    },
    {
      label: 'Savings',
      icon: 'pi pi-fw pi-wallet',
      command: () => navigate('/app/savings'),
      className: location.pathname === '/app/savings' ? 'active-tab' : ''
    },
    {
      label: 'Income',
      icon: 'pi pi-fw pi-dollar',
      command: () => navigate('/app/income'),
      className: location.pathname === '/app/income' ? 'active-tab' : ''
    }
  ];

  // Profile menu items
  const profileItems = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate('/app/profile')
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigate('/app/settings')
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout
    }
  ];

  // Find the active index based on the current path
  const activeIndex = items.findIndex(item => `/app/${item.label.toLowerCase()}` === location.pathname);

  // Get user's first name for greeting
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  // Start template for the menubar with logo
  const start = (
    <div className="flex align-items-center">
      <UMoneyLogo size="small" />
    </div>
  );

  // End template for the menubar with user profile
  const end = (
    <div className="flex align-items-center gap-3">
      <Button
        icon="pi pi-bell"
        className="p-button-rounded p-button-text"
        badge={notificationCount > 0 ? notificationCount.toString() : undefined}
        badgeClassName="p-badge-danger"
        tooltip="Notifications"
        tooltipOptions={{ position: 'bottom' }}
      />

      <div className="user-profile">
        <Button
          className="p-button-text p-button-rounded user-menu-button"
          onClick={(e) => profileMenu.current?.toggle(e)}
          aria-haspopup
          aria-controls="profile-menu"
        >
          <span className="user-name mr-2 hidden md:inline-block">{firstName}</span>
          <Avatar
            icon="pi pi-user"
            shape="circle"
            className="user-avatar"
            style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff' }}
          />
        </Button>
        <Menu
          model={profileItems}
          popup
          ref={profileMenu}
          id="profile-menu"
          className="profile-menu"
          appendTo={document.body}
        />
      </div>
    </div>
  );

  return (
    <div className="layout-wrapper">
      {/* Top Navigation Bar */}
      <div className="layout-topbar shadow-2">
        <Menubar
          start={start}
          end={end}
          className="border-none surface-card layout-menubar"
        />
      </div>

      <div className="layout-main-container">
        <div className="layout-main p-3">
          <Outlet />
        </div>
      </div>

      {/* Bottom Tab Navigation for Mobile */}
      <div className="layout-bottom-tabs shadow-2">
        <TabMenu
          model={items}
          activeIndex={activeIndex >= 0 ? activeIndex : 0}
          className="bottom-tab-menu"
        />
      </div>
    </div>
  );
}

export default Layout;
