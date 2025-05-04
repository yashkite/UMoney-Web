// umoney-frontend/src/utils/cacheUtils.js

/**
 * Simple in-memory cache for API responses
 * This helps reduce redundant API calls for the same data
 */
const cache = new Map();

/**
 * Default cache expiration time in milliseconds (5 minutes)
 */
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found or expired
 */
export const getCachedValue = (key) => {
  if (!key) return null;

  const cachedItem = cache.get(key);
  if (!cachedItem) return null;

  const { value, expiration } = cachedItem;
  const now = Date.now();

  // Check if the cached value has expired
  if (now > expiration) {
    cache.delete(key);
    return null;
  }

  return value;
};

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [expirationMs] - Cache expiration time in milliseconds
 */
export const setCachedValue = (key, value, expirationMs = DEFAULT_CACHE_EXPIRATION) => {
  if (!key) return;

  const expiration = Date.now() + expirationMs;
  cache.set(key, { value, expiration });
};

/**
 * Clear a specific item from the cache
 * @param {string} key - Cache key to clear
 */
export const clearCacheItem = (key) => {
  if (!key) return;
  cache.delete(key);
};

/**
 * Clear all items from the cache
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Clear all cache items that match a prefix
 * @param {string} prefix - Prefix to match
 */
export const clearCacheByPrefix = (prefix) => {
  if (!prefix) return;

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

// Create a named object for default export
const cacheUtils = {
  getCachedValue,
  setCachedValue,
  clearCacheItem,
  clearCache,
  clearCacheByPrefix
};

export default cacheUtils;
