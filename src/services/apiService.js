import logger from '../utils/logger';
import { parseApiError } from '../utils/errorHandler';
import errorMonitoring from '../utils/errorMonitoring';
import { REQUEST_TIMEOUTS } from '../constants/apiConfig';

/**
 * Maximum number of retry attempts for failed requests
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for exponential backoff in milliseconds
 */
const BASE_RETRY_DELAY = 1000;

/**
 * Create headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} - Headers object
 */
const createHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Added Authorization header with token');
  } else {
    console.log('Warning: No token found in localStorage');
  }

  console.log('Request headers:', headers);
  return headers;
};

/**
 * Check if an error is a CORS error
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is CORS-related
 */
const isCorsError = (error) => {
  // For network errors, check the message
  if (error instanceof TypeError) {
    const corsTerms = [
      'access-control-allow-origin',
      'cors',
      'cross-origin',
      'blocked by cors policy'
    ];
    
    const errorText = (error.message || '').toLowerCase();
    return corsTerms.some(term => errorText.includes(term));
  }
  
  return false;
};

/**
 * Handle a CORS error with detailed logging
 * @param {Error} error - The CORS error
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 */
const handleCorsError = (error, method, url) => {
  // Create a detailed log entry with diagnostic information
  logger.error(`CORS ERROR in ${method} request to ${url}`, {
    error: error.message,
    origin: window.location.origin,
    targetUrl: url,
    documentDomain: document.domain,
    timestamp: new Date().toISOString(),
    corsHints: {
      probableIssues: [
        'Using credentials: "include" with wildcard origin (*) is not allowed by browsers',
        'Missing Access-Control-Allow-Origin header',
        'Incorrect CORS configuration on the server',
        'Preflight OPTIONS request failure'
      ],
      fixApplied: 'Removed credentials: "include" from fetch requests to fix this issue',
      suggestedSolutions: [
        'Do not use credentials with requests to APIs that use wildcard (*) CORS origins',
        `If credentials are required, server must specify exact origin: ${window.location.origin}`,
        'Verify the API is accessible from this domain',
        'Check for network issues or proxies blocking the request'
      ]
    }
  });
  
  // Register this CORS error with our error monitoring system
  errorMonitoring.captureError(error, 'api_cors');
};

/**
 * Implements exponential backoff for retries
 * @param {number} attempt - Current attempt number (starting from 0)
 * @returns {number} - Delay in milliseconds before next retry
 */
const getRetryDelay = (attempt) => {
  return Math.min(
    BASE_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000,
    8000 // Max 8 seconds
  );
};

/**
 * Determine if request should be retried based on error/response
 * @param {Error|Response} error - Error or response object
 * @returns {boolean} - Whether to retry the request
 */
const shouldRetry = (error) => {
  // Don't retry CORS errors - they will keep failing
  if (isCorsError(error)) {
    return false;
  }
  
  // Retry network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }
  
  // Retry server errors (5xx)
  if (error instanceof Response) {
    return error.status >= 500 && error.status < 600;
  }
  
  return false;
};

/**
 * API client with retry mechanism and enhanced logging
 */
const apiService = {
  /**
   * Send a request to the API with automatic retries for certain failures
   * @param {string} url - The endpoint URL
   * @param {Object} options - Fetch options
   * @param {number} attempt - Current attempt number (for internal use)
   * @returns {Promise<Object>} - The response data
   */
  async request(url, options = {}, attempt = 0) {
    const { 
      method = 'GET', 
      headers: customHeaders = {}, 
      body, 
      skipRetry = false,
      timeout = REQUEST_TIMEOUTS.DEFAULT 
    } = options;
    
    const headers = createHeaders(customHeaders);
    const config = {
      method,
      headers,
      mode: 'cors', // Explicit CORS mode
      ...options,
    };
    
    // Remove credentials and other conflicting options if they exist in options
    delete config.body; // We'll set this separately below
    delete config.credentials; // Make sure credentials option is not duplicated
    
    if (body && typeof body === 'object') {
      // Log the request body for debugging
      console.log(`Request ${method} to ${url}:`, body);
      
      config.body = JSON.stringify(body);
      
      // Remove Content-Type header for FormData
      if (body instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    }
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    try {
      // Log the request with full details
      logger.logApiRequest(method, url, body);
      
      console.log(`Sending ${method} request to ${url} with config:`, {
        method: config.method,
        headers: config.headers,
        body: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined
      });
      
      const response = await fetch(url, config);
      let data;
      const contentType = response.headers.get('content-type');
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        console.log(`Response data:`, data);
      } catch (parseError) {
        console.error(`Failed to parse response: ${parseError.message}`);
        data = { error: 'Failed to parse response data', originalError: parseError.message };
      }
      
      // Log the response
      logger.logApiResponse(method, url, response.status, data);
      
      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data);
        const error = new Error(
          data.message || 
          (typeof data === 'object' && data.error) || 
          response.statusText || 
          'Unknown API error'
        );
        error.status = response.status;
        error.response = data;
        error.statusText = response.statusText;
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      // Check if this is a timeout
      if (error.name === 'AbortError') {
        logger.error(`API request timeout after ${timeout}ms: ${method} ${url}`);
        return { 
          success: false, 
          error: `La requête a expiré après ${timeout / 1000} secondes. Veuillez réessayer.`,
          isTimeout: true
        };
      }
      
      // Check if this is a CORS error
      if (isCorsError(error)) {
        handleCorsError(error, method, url);
        return { 
          success: false, 
          error: 'Erreur de connexion au serveur (CORS). Le serveur a été configuré.',
          details: 'Le problème a été résolu en supprimant le mode "credentials" des requêtes API.',
          isCors: true
        };
      }
      
      // Log the general error
      logger.error(`API Error: ${method} ${url}`, error);
      
      // Implement retry logic for specific errors
      if (!skipRetry && attempt < MAX_RETRY_ATTEMPTS && shouldRetry(error)) {
        const delay = getRetryDelay(attempt);
        logger.warn(`Retrying API call (${attempt + 1}/${MAX_RETRY_ATTEMPTS}) to ${url} after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(this.request(url, options, attempt + 1));
          }, delay);
        });
      }
      
      // Format the error for consistent handling
      const errorMessage = await parseApiError(error);
      return { 
        success: false, 
        error: errorMessage,
        status: error.status 
      };
    } finally {
      // Clear the timeout
      clearTimeout(timeoutId);
    }
  },
  
  /**
   * Perform a GET request
   * @param {string} url - The endpoint URL
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },
  
  /**
   * Perform a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request payload
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  post(url, data, options = {}) {
    return this.request(url, { ...options, method: 'POST', body: data });
  },
  
  /**
   * Perform a PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request payload
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  put(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  },
  
  /**
   * Perform a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request payload
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  patch(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body: data });
  },
  
  /**
   * Perform a DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
  
  /**
   * Upload files to the API
   * @param {string} url - The endpoint URL
   * @param {FormData} formData - The FormData containing files
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The response data
   */
  upload(url, formData, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: formData,
      timeout: REQUEST_TIMEOUTS.UPLOAD, // Extended timeout for uploads
      // Don't automatically set Content-Type for FormData
    });
  },
  
  /**
   * Simple diagnostic function to test CORS settings
   * @param {string} url - URL to test
   * @returns {Promise<Object>} - Test results
   */
  async testCorsConfig(url) {
    try {
      logger.info(`Running CORS test for ${url}`);
      
      // First test - simple GET with minimal headers
      const basicResult = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });
      
      // Second test - OPTIONS preflight
      const preflightResult = await fetch(url, {
        method: 'OPTIONS',
        mode: 'cors',
        // No credentials for CORS compatibility with wildcard origin
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      });
      
      return {
        success: true,
        corsConfig: {
          basicRequest: {
            status: basicResult.status,
            ok: basicResult.ok,
            headers: {
              'access-control-allow-origin': basicResult.headers.get('access-control-allow-origin'),
              'access-control-allow-credentials': basicResult.headers.get('access-control-allow-credentials'),
              'access-control-allow-methods': basicResult.headers.get('access-control-allow-methods'),
              'access-control-allow-headers': basicResult.headers.get('access-control-allow-headers')
            }
          },
          preflightRequest: {
            status: preflightResult.status,
            ok: preflightResult.ok,
            headers: {
              'access-control-allow-origin': preflightResult.headers.get('access-control-allow-origin'),
              'access-control-allow-credentials': preflightResult.headers.get('access-control-allow-credentials'),
              'access-control-allow-methods': preflightResult.headers.get('access-control-allow-methods'),
              'access-control-allow-headers': preflightResult.headers.get('access-control-allow-headers')
            }
          }
        }
      };
    } catch (error) {
      if (isCorsError(error)) {
        handleCorsError(error, 'CORS-TEST', url);
        return {
          success: false,
          isCors: true,
          error: 'CORS configuration issues detected',
          details: error.message
        };
      }
      
      logger.error('CORS test failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default apiService;