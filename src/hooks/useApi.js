import { useState, useCallback } from 'react';
import apiService from '../services/apiService';
import logger from '../utils/logger';

/**
 * Custom hook for making API requests with loading and error states
 */
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Make a request to the API
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - The response data or error
   */
  const request = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.request(url, options);
      
      if (response.success) {
        setData(response.data);
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
      logger.error(`Unexpected error in useApi.request for ${url}`, err);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Shorthand for GET requests
   */
  const get = useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'GET' });
  }, [request]);

  /**
   * Shorthand for POST requests
   */
  const post = useCallback((url, data, options = {}) => {
    return request(url, { ...options, method: 'POST', body: data });
  }, [request]);

  /**
   * Shorthand for PUT requests
   */
  const put = useCallback((url, data, options = {}) => {
    return request(url, { ...options, method: 'PUT', body: data });
  }, [request]);

  /**
   * Shorthand for PATCH requests
   */
  const patch = useCallback((url, data, options = {}) => {
    return request(url, { ...options, method: 'PATCH', body: data });
  }, [request]);

  /**
   * Shorthand for DELETE requests
   */
  const del = useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'DELETE' });
  }, [request]);

  /**
   * Shorthand for file upload
   */
  const upload = useCallback((url, formData, options = {}) => {
    return apiService.upload(url, formData, options);
  }, []);

  return {
    isLoading,
    error,
    data,
    request,
    get,
    post,
    put,
    patch,
    del,
    upload,
    reset
  };
};

export default useApi;