import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import NeedsPage from '../pages/NeedsPage';
import WantsPage from '../pages/WantsPage';
import SavingsPage from '../pages/SavingsPage';
import IncomePage from '../pages/IncomePage';
import SetupWizardPage from '../pages/SetupWizardPage.js';
import Layout from '../components/Layout';
import LoginPageSuccess from '../pages/LoginPageSuccess'; // Import LoginPageSuccess

// Get auth state from localStorage for initial routing
const getAuthState = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Create a loader that checks authentication and redirects if needed
const protectedRouteLoader = () => {
  if (!getAuthState()) {
    return { redirect: '/login' };
  }
  return null;
};

// Create a router with future flags enabled
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/login',
      element: <LoginPage />,
      loader: () => {
        // If already authenticated, redirect to dashboard
        if (getAuthState()) {
          return { redirect: '/app/dashboard' };
        }
        return null;
      }
    },
    {
      path: '/login/success',
      element: <LoginPageSuccess />,
    },
    {
      path: '/setup',
      element: <SetupWizardPage />,
      loader: protectedRouteLoader,
    },
    {
      path: '/app',
      element: <Layout />,
      loader: protectedRouteLoader,
      children: [
        {
          path: 'dashboard',
          element: <DashboardPage />
        },
        {
          path: 'needs',
          element: <NeedsPage />
        },
        {
          path: 'wants',
          element: <WantsPage />
        },
        {
          path: 'savings',
          element: <SavingsPage />
        },
        {
          path: 'income',
          element: <IncomePage />
        },
        {
          path: 'reports',
          element: <ReportsPage />
        },
        {
          path: 'settings',
          element: <SettingsPage />
        },
        {
          path: 'profile',
          element: <ProfilePage />
        }
      ]
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ],
  {
    // Enable future flags to address warnings
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    },
    // Disable warnings
    unstable_viewTransition: true,
    basename: ''
  }
);

export default router;
