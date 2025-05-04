// umoney-frontend/src/api/utils/apiUtils.js

// Import cache utilities
import { getCachedValue, setCachedValue, clearCacheItem, clearCacheByPrefix } from '../../utils/cacheUtils';

// API base URL
export const API_BASE_URL = 'http://localhost:5000/api';

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get CSRF token from cookies
 * @returns {string|null} - CSRF token or null if not found
 */
export const getCsrfToken = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('XSRF-TOKEN=')) {
      return cookie.substring('XSRF-TOKEN='.length, cookie.length);
    }
  }
  return null;
};

/**
 * Helper function to handle API responses
 * @param {Response} response - Fetch API response object
 * @param {Object} options - Additional options
 * @param {string} options.responseType - Expected response type ('json', 'text', 'blob')
 * @returns {Promise<any>} - Parsed response data
 * @throws {Error} - Error with response details
 */
export const handleResponse = async (response, options = {}) => {
  const { responseType = 'auto' } = options;

  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();

      // Only log in development environment
      if (isDevelopment) {
        console.error('API Error Response:', errorData);
      }

      // Create a custom error object with response data
      const error = new Error(errorData.msg || errorData.message || 'API request failed');
      error.response = {
        status: response.status,
        data: errorData
      };

      throw error;
    } catch (e) {
      // Only log in development environment
      if (isDevelopment) {
        console.error('Error parsing API error response:', e);
      }

      // If this is already our custom error with response data, just rethrow it
      if (e.response) {
        throw e;
      }

      // Otherwise, create a new error with the response status
      const error = new Error(`API request failed with status ${response.status}`);
      error.response = {
        status: response.status,
        data: { msg: 'Failed to parse error response' }
      };

      throw error;
    }
  }

  // If responseType is explicitly set to 'blob', return the blob
  if (responseType === 'blob') {
    const blob = await response.blob();

    // Only log in development environment
    if (isDevelopment) {
      console.log('API Blob Response:', blob);
    }

    return blob;
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');

  // Auto-detect response type if not explicitly set
  if (responseType === 'auto') {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      // Only log in development environment
      if (isDevelopment) {
        console.log('API Response:', data);
      }

      return data;
    } else if (contentType && (
      contentType.includes('text/csv') ||
      contentType.includes('application/json') ||
      contentType.includes('application/pdf')
    )) {
      const blob = await response.blob();

      // Only log in development environment
      if (isDevelopment) {
        console.log('API Blob Response:', blob);
      }

      return blob;
    } else {
      const text = await response.text();

      // Only log in development environment
      if (isDevelopment) {
        console.log('API Text Response:', text);
      }

      return text;
    }
  }

  // Handle explicit responseType
  if (responseType === 'json') {
    const data = await response.json();

    // Only log in development environment
    if (isDevelopment) {
      console.log('API JSON Response:', data);
    }

    return data;
  } else if (responseType === 'text') {
    const text = await response.text();

    // Only log in development environment
    if (isDevelopment) {
      console.log('API Text Response:', text);
    }

    return text;
  }

  // Default fallback
  const text = await response.text();

  // Only log in development environment
  if (isDevelopment) {
    console.log('API Text Response:', text);
  }

  return text;
};

/**
 * Get auth token from localStorage
 * @returns {string|null} - Auth token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set auth token in localStorage
 * @param {string|null} token - Auth token to set or null to remove
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

/**
 * Get common headers for API requests
 * @param {boolean} includeAuth - Whether to include auth token in headers
 * @returns {Object} - Headers object
 */
export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Add CSRF token if available
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Create FormData from object and attachments
 * @param {Object} data - Data object
 * @param {Array} attachments - Array of file attachments
 * @returns {FormData} - FormData object
 */
export const createFormData = (data, attachments = []) => {
  const formData = new FormData();

  // Add data
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  // Add attachments
  attachments.forEach(file => {
    formData.append('attachments', file);
  });

  // Add CSRF token if available
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    formData.append('_csrf', csrfToken);
  }

  return formData;
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional options
 * @param {boolean} options.useCache - Whether to use cache (default: false)
 * @param {number} options.cacheExpiration - Cache expiration time in milliseconds
 * @param {string} options.responseType - Expected response type ('json', 'text', 'blob', 'auto')
 * @returns {Promise<any>} - Response data
 */
export const apiGet = async (endpoint, params = {}, options = {}) => {
  try {
    const { useCache = false, cacheExpiration, responseType = 'auto' } = options;

    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    // Generate a cache key based on the URL
    const cacheKey = `api:${url}`;

    // Check cache if enabled and not requesting a blob
    if (useCache && responseType !== 'blob') {
      const cachedData = getCachedValue(cacheKey);
      if (cachedData) {
        if (isDevelopment) {
          console.log(`Using cached data for ${endpoint}`);
        }
        return cachedData;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });

    const data = await handleResponse(response, { responseType });

    // Cache the response if caching is enabled and not a blob
    if (useCache && data && responseType !== 'blob') {
      setCachedValue(cacheKey, data, cacheExpiration);
    }

    return data;
  } catch (error) {
    if (isDevelopment) {
      console.error(`Error in GET request to ${endpoint}:`, error);
    }
    throw error;
  }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {Array} attachments - Array of file attachments
 * @param {Object} options - Additional options
 * @param {string} options.cachePrefixToClear - Cache prefix to clear after successful request
 * @param {string} options.contentType - Content type ('json', 'multipart/form-data')
 * @param {string} options.responseType - Expected response type ('json', 'text', 'blob', 'auto')
 * @returns {Promise<any>} - Response data
 */
export const apiPost = async (endpoint, data = {}, attachments = [], options = {}) => {
  try {
    const {
      cachePrefixToClear,
      contentType = 'json',
      responseType = 'auto'
    } = options;

    let response;

    if (contentType === 'multipart/form-data' || (attachments && attachments.length > 0)) {
      // Use FormData for file uploads or multipart/form-data
      let formData;

      if (data instanceof FormData) {
        // If data is already FormData, use it directly
        formData = data;
      } else {
        // Otherwise, create FormData from data and attachments
        formData = createFormData(data, attachments);
      }

      // Get auth token for header
      const token = getAuthToken();
      const headers = {
        'Authorization': token ? `Bearer ${token}` : ''
      };

      // Add CSRF token if available
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });
    } else {
      // Regular JSON request
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }

    const responseData = await handleResponse(response, { responseType });

    // Clear related cache items if specified
    if (cachePrefixToClear) {
      clearCacheByPrefix(cachePrefixToClear);
      if (isDevelopment) {
        console.log(`Cleared cache with prefix: ${cachePrefixToClear}`);
      }
    }

    return responseData;
  } catch (error) {
    if (isDevelopment) {
      console.error(`Error in POST request to ${endpoint}:`, error);
    }
    throw error;
  }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {Array} attachments - Array of file attachments
 * @param {Object} options - Additional options
 * @param {string} options.cachePrefixToClear - Cache prefix to clear after successful request
 * @returns {Promise<any>} - Response data
 */
export const apiPut = async (endpoint, data = {}, attachments = [], options = {}) => {
  try {
    const { cachePrefixToClear } = options;
    let response;

    if (attachments && attachments.length > 0) {
      // Use FormData for file uploads
      const formData = createFormData(data, attachments);

      // Get auth token for header
      const token = getAuthToken();
      const headers = {
        'Authorization': token ? `Bearer ${token}` : ''
      };

      // Add CSRF token if available
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: formData,
        credentials: 'include'
      });
    } else {
      // Regular JSON request
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }

    const responseData = await handleResponse(response);

    // Clear related cache items if specified
    if (cachePrefixToClear) {
      clearCacheByPrefix(cachePrefixToClear);
      if (isDevelopment) {
        console.log(`Cleared cache with prefix: ${cachePrefixToClear}`);
      }
    }

    return responseData;
  } catch (error) {
    if (isDevelopment) {
      console.error(`Error in PUT request to ${endpoint}:`, error);
    }
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional options
 * @param {string} options.cachePrefixToClear - Cache prefix to clear after successful request
 * @returns {Promise<any>} - Response data
 */
export const apiDelete = async (endpoint, options = {}) => {
  try {
    const { cachePrefixToClear } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });

    const responseData = await handleResponse(response);

    // Clear related cache items if specified
    if (cachePrefixToClear) {
      clearCacheByPrefix(cachePrefixToClear);
      if (isDevelopment) {
        console.log(`Cleared cache with prefix: ${cachePrefixToClear}`);
      }
    }

    return responseData;
  } catch (error) {
    if (isDevelopment) {
      console.error(`Error in DELETE request to ${endpoint}:`, error);
    }
    throw error;
  }
};

// Create a named object for default export
const apiUtilsExport = {
  API_BASE_URL,
  isDevelopment,
  handleResponse,
  getAuthToken,
  setAuthToken,
  getHeaders,
  createFormData,
  getCsrfToken,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  // Cache utilities
  getCachedValue,
  setCachedValue,
  clearCacheItem,
  clearCacheByPrefix
};

// Export all API utility functions
export default apiUtilsExport;