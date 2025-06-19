// src/services/apiService.js
import logger from '../utils/logger';
import { parseApiError } from '../utils/errorHandler';
import errorMonitoring from '../utils/errorMonitoring';
import { REQUEST_TIMEOUTS, apiConfig } from '../config/api';

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

  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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
  if (isCorsError(error)) {
    return false;
  }
  
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }
  
  if (error instanceof Response) {
    return error.status >= 500 && error.status < 600;
  }
  
  return false;
};

/**
 * Build full URL with base URL
 * @param {string} endpoint - The endpoint path
 * @returns {string} - Full URL
 */
const buildFullUrl = (endpoint) => {
  // If endpoint already includes the base URL, return as is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // If endpoint starts with /, use it directly with base URL
  if (endpoint.startsWith('/')) {
    return `${apiConfig.BASE_URL}${endpoint}`;
  }
  
  // Otherwise, add /api/v1 prefix
  return `${apiConfig.BASE_URL}/api/v1/${endpoint}`;
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
    
    // Build full URL
    const fullUrl = buildFullUrl(url);
    
    const headers = createHeaders(customHeaders);
    const config = {
      method,
      headers,
      mode: 'cors',
      ...options,
    };
    
    delete config.body;
    delete config.credentials;
    
    if (body && typeof body === 'object') {
      console.log(`Request ${method} to ${fullUrl}:`, body);
      
      config.body = JSON.stringify(body);
      
      if (body instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    try {
      logger.logApiRequest(method, fullUrl, body);
      
      console.log(`Sending ${method} request to ${fullUrl} with config:`, {
        method: config.method,
        headers: config.headers,
        body: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined
      });
      
      const response = await fetch(fullUrl, config);
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
      
      logger.logApiResponse(method, fullUrl, response.status, data);
      
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
      if (error.name === 'AbortError') {
        logger.error(`API request timeout after ${timeout}ms: ${method} ${fullUrl}`);
        return { 
          success: false, 
          error: `La requête a expiré après ${timeout / 1000} secondes. Veuillez réessayer.`,
          isTimeout: true
        };
      }
      
      if (isCorsError(error)) {
        handleCorsError(error, method, fullUrl);
        return { 
          success: false, 
          error: 'Erreur de connexion au serveur (CORS). Le serveur a été configuré.',
          details: 'Le problème a été résolu en supprimant le mode "credentials" des requêtes API.',
          isCors: true
        };
      }
      
      logger.error(`API Error: ${method} ${fullUrl}`, error);
      
      if (!skipRetry && attempt < MAX_RETRY_ATTEMPTS && shouldRetry(error)) {
        const delay = getRetryDelay(attempt);
        logger.warn(`Retrying API call (${attempt + 1}/${MAX_RETRY_ATTEMPTS}) to ${fullUrl} after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(this.request(url, options, attempt + 1));
          }, delay);
        });
      }
      
      const errorMessage = await parseApiError(error);
      return { 
        success: false, 
        error: errorMessage,
        status: error.status 
      };
    } finally {
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
      timeout: REQUEST_TIMEOUTS.UPLOAD,
    });
  },
  
  /**
   * Simple diagnostic function to test CORS settings
   * @param {string} url - URL to test
   * @returns {Promise<Object>} - Test results
   */
  async testCorsConfig(url) {
    try {
      const fullUrl = buildFullUrl(url);
      logger.info(`Running CORS test for ${fullUrl}`);
      
      const basicResult = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' }
      });
      
      const preflightResult = await fetch(fullUrl, {
        method: 'OPTIONS',
        mode: 'cors',
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
        handleCorsError(error, 'CORS-TEST', buildFullUrl(url));
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