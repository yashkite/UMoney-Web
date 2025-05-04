/**
 * Currency utility functions for the UMoney application
 * Centralizes exchange rates and currency conversion logic
 */

// List of supported currencies with symbols and names
const supportedCurrencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
];

// Currency conversion rates (in a real app, these would come from an API)
const exchangeRates = {
  INR: 1,
  USD: 83.12,
  EUR: 90.27,
  GBP: 105.67,
  JPY: 0.55,
  AUD: 54.89,
  CAD: 61.23,
  SGD: 61.85,
  CHF: 94.32,
  CNY: 11.45
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} - Converted amount
 */
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // Convert to INR first (base currency), then to target currency
  const amountInINR = amount * exchangeRates[fromCurrency];
  return amountInINR / exchangeRates[toCurrency];
};

/**
 * Get all supported currencies
 * @returns {string[]} - Array of currency codes
 */
const getSupportedCurrencies = () => {
  return Object.keys(exchangeRates);
};

/**
 * Check if a currency is supported
 * @param {string} currency - Currency code to check
 * @returns {boolean} - Whether the currency is supported
 */
const isSupportedCurrency = (currency) => {
  return exchangeRates.hasOwnProperty(currency);
};

/**
 * Get currency details by code
 * @param {string} currencyCode - The currency code
 * @returns {Object|null} - The currency details or null if not found
 */
const getCurrencyDetails = (currencyCode) => {
  return supportedCurrencies.find(currency => currency.code === currencyCode) || null;
};

/**
 * Format an amount in the specified currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code
 * @returns {string} - The formatted amount
 */
const formatCurrency = (amount, currencyCode = 'INR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

module.exports = {
  exchangeRates,
  supportedCurrencies,
  convertCurrency,
  getSupportedCurrencies,
  isSupportedCurrency,
  getCurrencyDetails,
  formatCurrency
};