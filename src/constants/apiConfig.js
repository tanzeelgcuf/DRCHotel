/**
 * API configuration with all endpoints used in the application
 */

// Base API URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://34.30.198.6:8081';

// API version path
const API_VERSION = '/api';

// Full API base path
const API_PATH = `${API_BASE_URL}${API_VERSION}`;

/**
 * Object containing all API endpoints organized by resource
 */
export const API_ENDPOINTS = {
  // For health monitoring and configuration
  BASE_URL: API_BASE_URL,
  API_VERSION: API_VERSION,
  API_PATH: API_PATH,
  
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_PATH}/auth/login`,
    REGISTER: `${API_PATH}/auth/register`,
    VERIFY: `${API_PATH}/auth/verify`,
    REFRESH: `${API_PATH}/auth/refresh-token`,
    FORGOT_PASSWORD: `${API_PATH}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PATH}/auth/reset-password`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_PATH}/users/profile`,
    UPDATE_PROFILE: `${API_PATH}/users/profile`,
    CHANGE_PASSWORD: `${API_PATH}/users/change-password`,
  },
  
  // Client endpoints
  CLIENTS: {
    BASE: `${API_PATH}/clients`,
    GET_ALL: `${API_PATH}/clients`,
    GET_BY_ID: (id) => `${API_PATH}/clients/${id}`,
    REGISTER_HOTEL_GUEST: `${API_PATH}/clients/register-hotel-guest`,
    UPDATE: (id) => `${API_PATH}/clients/${id}`,
    DELETE: (id) => `${API_PATH}/clients/${id}`,
  },
  
  // Establishment endpoints
  ESTABLISHMENTS: {
    BASE: `${API_PATH}/establishments`,
    GET_ALL: `${API_PATH}/establishments`,
    GET_BY_ID: (id) => `${API_PATH}/establishments/${id}`,
    CREATE: `${API_PATH}/establishments`,
    UPDATE: (id) => `${API_PATH}/establishments/${id}`,
    DELETE: (id) => `${API_PATH}/establishments/${id}`,
  },
  
  // Health check endpoint for monitoring
  HEALTH: `${API_BASE_URL}/health`,
};

// Request timeout durations
export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  EXTENDED: 60000, // 60 seconds for larger operations
  UPLOAD: 120000, // 2 minutes for file uploads
  HEALTH_CHECK: 5000, // 5 seconds for health checks
};

export default API_ENDPOINTS;