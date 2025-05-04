import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import router from './router';
import primeReactConfig from './config/primeReactConfig';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';
import './styles/custom.css';

function App() {
  return (
    <PrimeReactProvider value={primeReactConfig}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PrimeReactProvider>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const [routerInitialized, setRouterInitialized] = useState(false);

  // Initialize router once authentication state is determined
  useEffect(() => {
    if (!loading) {
      console.log('Auth state determined, initializing router. isAuthenticated:', isAuthenticated);
      setRouterInitialized(true);
    }
  }, [loading, isAuthenticated]);

  if (loading || !routerInitialized) {
    return <div className="flex justify-content-center align-items-center min-h-screen">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      <span className="ml-2">Loading application...</span>
    </div>;
  }

  // Wrap the router with the CurrencyProvider
  return (
    <CurrencyProvider>
      <RouterProvider router={router} />
    </CurrencyProvider>
  );
}

export default App;
