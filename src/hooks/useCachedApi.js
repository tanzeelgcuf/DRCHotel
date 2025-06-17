import { useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import logger from '../utils/logger';

/**
 * Custom hook for making API requests with caching support
 * @param {number} defaultCacheTTL - Default cache lifetime in milliseconds (default: 1 minute)
 * @returns {Object} - API methods and state
 */
const useCachedApi = (defaultCacheTTL = 60000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [cache, setCache] = useState(new Map());
  
  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  /**
   * Clear the entire cache
   */
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);
  
  /**
   * Clear specific cache entry by key
   * @param {string} cacheKey - The cache key to remove
   */
  const clearCacheItem = useCallback((cacheKey) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, []);
  
  /**
   * Create a cache key from URL and params
   * @param {string} url - Request URL
   * @param {Object} params - Additional params to include in cache key
   * @returns {string} - Cache key
   */
  const createCacheKey = useCallback((url, params = {}) => {
    return `${url}|${JSON.stringify(params)}`;
  }, []);
  
  /**
   * Make a GET request with caching
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @param {Object} cacheOptions - Caching options
   * @returns {Promise<Object>} - The response data or error
   */
  const getCached = useCallback(async (url, options = {}, cacheOptions = {}) => {
    const {
      cacheTTL = defaultCacheTTL,
      bypassCache = false,
      cacheKey: customCacheKey = null
    } = cacheOptions;
    
    const cacheKey = customCacheKey || createCacheKey(url, options);
    
    // Try to get from cache first if not bypassing
    if (!bypassCache) {
      const cachedItem = cache.get(cacheKey);
      if (cachedItem && Date.now() < cachedItem.expiresAt) {
        logger.debug(`Cache hit for ${url}`);
        setData(cachedItem.data);
        return cachedItem.response;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get(url, options);
      
      if (response.success) {
        setData(response.data);
        
        // Cache the successful response
        if (cacheTTL > 0) {
          setCache(prevCache => {
            const newCache = new Map(prevCache);
            newCache.set(cacheKey, {
              data: response.data,
              response,
              expiresAt: Date.now() + cacheTTL
            });
            return newCache;
          });
          
          logger.debug(`Cached response for ${url} (expires in ${cacheTTL/1000}s)`);
        }
      } else {
        setError(response.error);
        logger.error(`API request error for ${url}`, { error: response.error });
      }
      
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      setIsLoading(false);
      logger.error(`Unexpected error in useCachedApi.getCached for ${url}`, err);
      return { success: false, error: errorMessage };
    }
  }, [cache, createCacheKey, defaultCacheTTL]);
  
  /**
   * Check if a URL is cached
   * @param {string} url - URL to check
   * @param {Object} params - Additional params to include in cache key
   * @returns {boolean} - Whether the URL is cached and valid
   */
  const isCached = useCallback((url, params = {}) => {
    const cacheKey = createCacheKey(url, params);
    const cachedItem = cache.get(cacheKey);
    return cachedItem && Date.now() < cachedItem.expiresAt;
  }, [cache, createCacheKey]);
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    let total = 0;
    let valid = 0;
    let expired = 0;
    
    cache.forEach(item => {
      total++;
      if (now < item.expiresAt) {
        valid++;
      } else {
        expired++;
      }
    });
    
    return { total, valid, expired };
  }, [cache]);
  
  // Clean up expired cache items periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCache(prevCache => {
        const newCache = new Map();
        let expired = 0;
        
        prevCache.forEach((value, key) => {
          if (now < value.expiresAt) {
            newCache.set(key, value);
          } else {
            expired++;
          }
        });
        
        if (expired > 0) {
          logger.debug(`Cleaned up ${expired} expired cache items`);
        }
        
        return newCache;
      });
    }, 60000); // Clean expired items every minute
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  return {
    isLoading,
    error,
    data,
    getCached,
    isCached,
    clearCache,
    clearCacheItem,
    getCacheStats,
    reset
  };
};

export default useCachedApi;