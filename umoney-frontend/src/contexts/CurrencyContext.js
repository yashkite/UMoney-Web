import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

// Define a list of supported currencies (can be expanded)
// Consider fetching this list from an API or configuration file in a real app
export const supportedCurrencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
    // Add more currencies as needed
];

// Function to get currency details by code
export const getCurrencyDetails = (code) => {
    return supportedCurrencies.find(c => c.code === code) || supportedCurrencies[0]; // Default to USD if not found
};

// Create the context
const CurrencyContext = createContext();

// Create a provider component
export const CurrencyProvider = ({ children }) => {
    // TODO: Implement logic to detect user's locale (e.g., from browser navigator.language)
    //       and map it to a default currency code from supportedCurrencies.
    //       This might involve a mapping or a small library.
    //       Example: const userLocale = navigator.language; -> map to 'EUR', 'INR', etc.
    //       Store the detected/selected currency in localStorage to persist choice.
    // For now, default to USD. Get from localStorage if available.
    const [currencyCode, setCurrencyCode] = useState(() => {
    const storedCurrency = localStorage.getItem('userCurrency');
    if (storedCurrency) return storedCurrency;

    // Try to get user's country code from browser
    let userCountry = 'US'; // Default to US
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone) {
          const parts = timeZone.split('/');
          if (parts.length > 0) {
            userCountry = parts[0];
          }
        }
      }
    } catch (error) {
      console.warn('Could not determine user country from timezone:', error);
    }

    // Map country to currency
    const countryToCurrency = {
      US: 'USD',
      IN: 'INR',
      GB: 'GBP',
      JP: 'JPY',
      DE: 'EUR',
      FR: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
      CN: 'CNY',
      RU: 'RUB',
      BR: 'BRL',
      CA: 'CAD',
      AU: 'AUD',
      ZA: 'ZAR',
      MX: 'MXN',
      AR: 'ARS',
      TR: 'TRY',
      KR: 'KRW',
      SG: 'SGD',
      NZ: 'NZD',
      // Add more country mappings as needed
    };

    return countryToCurrency[userCountry] || 'USD';
  });

    // Update localStorage when currency changes
    useEffect(() => {
        localStorage.setItem('userCurrency', currencyCode);
    }, [currencyCode]);

    const value = useMemo(() => ({
        currencyCode,
        setCurrencyCode,
        getCurrencyDetails, // Provide the utility function
        supportedCurrencies // Provide the list of currencies
    }), [currencyCode]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

// Create a custom hook to use the currency context
export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};