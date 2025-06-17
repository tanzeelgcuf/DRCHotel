import { useState, useCallback } from 'react';
import apiService from '../services/apiService';
import logger from '../utils/logger';
import { requestQueue } from '../utils/requestQueue';

/**
 * Custom hook for implementing optimistic UI updates
 * 
 * This hook allows components to immediately update the UI
 * before the server response is received, improving perceived performance
 * while handling error cases by reverting to the previous state if needed.
 * 
 * @returns {Object} Hook methods and state
 */
const useOptimisticUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousState, setPreviousState] = useState(null);
  
  /**
   * Perform an optimistic update for a resource
   * 
   * @param {string} url - API endpoint URL
   * @param {Object} currentData - Current state data
   * @param {Object} updateData - Update to apply
   * @param {Function} optimisticUpdater - Function to generate the optimistic updated state
   * @param {string} method - HTTP method to use (default: 'PUT')
   * @returns {Promise<Object>} Result of the API call
   */
  const update = useCallback(async (
    url, 
    currentData, 
    updateData, 
    optimisticUpdater,
    method = 'PUT'
  ) => {
    setIsLoading(true);
    setError(null);
    
    // Store the original state in case we need to revert
    setPreviousState(currentData);
    
    // Apply the optimistic update locally
    const optimisticResult = optimisticUpdater(currentData, updateData);
    
    // If we're offline, queue the request and return the optimistic result
    if (!navigator.onLine) {
      logger.info(`Optimistic update queued for ${url} (offline)`);
      
      requestQueue.addToQueue({
        url,
        method,
        body: updateData,
        metadata: {
          isOptimistic: true,
          timestamp: Date.now()
        }
      });
      
      setIsLoading(false);
      return {
        success: true,
        data: optimisticResult,
        queued: true
      };
    }
    
    // Otherwise, make the actual API call
    try {
      const apiMethod = method.toLowerCase();
      let response;
      
      if (apiMethod === 'put') {
        response = await apiService.put(url, updateData);
      } else if (apiMethod === 'post') {
        response = await apiService.post(url, updateData);
      } else if (apiMethod === 'patch') {
        response = await apiService.patch(url, updateData);
      } else if (apiMethod === 'delete') {
        response = await apiService.delete(url);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      if (!response.success) {
        // If the API call failed, revert to the previous state
        setError(response.error);
        setPreviousState(null);
        logger.error(`API error during optimistic update: ${response.error}`);
        
        return {
          success: false,
          error: response.error,
          previousState: currentData
        };
      }
      
      // Success - clear the previous state since we don't need it anymore
      setPreviousState(null);
      logger.debug(`Optimistic update succeeded for ${url}`);
      
      return {
        success: true,
        data: response.data || optimisticResult
      };
    } catch (err) {
      setError(err.message);
      logger.error('Error during optimistic update:', err);
      
      return {
        success: false,
        error: err.message,
        previousState: currentData
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Rollback to the previous state (can be called manually if needed)
   * @returns {Object|null} The previous state or null if not available
   */
  const rollback = useCallback(() => {
    if (previousState) {
      const result = { ...previousState };
      setPreviousState(null);
      return result;
    }
    return null;
  }, [previousState]);
  
  return {
    update,
    rollback,
    isLoading,
    error,
    hasPreviousState: previousState !== null
  };
};

export default useOptimisticUpdate;