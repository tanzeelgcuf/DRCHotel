// src/config/api.js
const API_CONFIG = {
  // Backend server details
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://34.30.198.6:8081',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH_TOKEN: '/auth/refresh-token',
      VALIDATE_TOKEN: '/auth/validate-token',
      PROFILE: '/auth/profile',
      LOGOUT: '/auth/logout'
    },
    
    // Hotel Management endpoints (for DRCHotel)
    HOTELS: {
      LIST: '/api/establishments',
      CREATE: '/api/establishments',
      GET_BY_ID: '/api/establishments',
      UPDATE: '/api/establishments',
      DELETE: '/api/establishments',
      REGISTER_DRC: '/api/establishments/register-drc-hotel',
      VERIFY: '/api/establishments/{id}/verify',
      STATS: '/api/establishments/{id}/stats'
    },
    
    // Client Management
    CLIENTS: {
      LIST: '/api/clients',
      CREATE: '/api/clients',
      GET_BY_ID: '/api/clients',
      UPDATE: '/api/clients',
      DELETE: '/api/clients',
      REGISTER_GUEST: '/api/clients/register-hotel-guest',
      VERIFY: '/api/clients/{id}/verify',
      BLOCK: '/api/clients/{id}/block',
      UNBLOCK: '/api/clients/{id}/unblock',
      STAYS: '/api/clients/{id}/stays',
      PENDING: '/api/clients/pending',
      VERIFIED: '/api/clients/verified'
    },
    
    // Stays Management
    STAYS: {
      LIST: '/api/stays',
      CREATE: '/api/stays',
      GET_BY_ID: '/api/stays',
      UPDATE: '/api/stays',
      DELETE: '/api/stays',
      CLOSE: '/api/stays/{id}/close',
      CANCEL: '/api/stays/{id}/cancel',
      EXTEND: '/api/stays/{id}/extend',
      TO_CLOSE: '/api/stays/to-close',
      BULK_CLOSE: '/api/stays/bulk-close',
      REPORT: '/api/stays/{id}/report'
    },
    
    // Police Intelligence endpoints (for DRCPol)
    INTELLIGENCE: {
      WATCHLIST: '/intelligence/watchlist',
      WATCHLIST_MATCHES: '/intelligence/watchlist/matches',
      ALERTS: '/intelligence/alerts',
      CASES: '/intelligence/cases',
      DASHBOARD: '/intelligence/dashboard',
      SEARCH_BY_FACE: '/intelligence/watchlist/search-by-face'
    },
    
    // Facial Recognition
    FACIAL_RECOGNITION: {
      SCAN: '/facial-recognition/scan',
      UPLOAD: '/facial-recognition/clients/{clientId}/upload',
      SEARCH: '/facial-recognition/search',
      CAMERA_FEED: '/facial-recognition/camera-feed',
      BIOMETRICS: '/facial-recognition/biometrics'
    },
    
    // Documents
    DOCUMENTS: {
      UPLOAD: '/documents',
      GET_BY_ID: '/documents',
      BY_ENTITY: '/documents/entity/{type}/{id}',
      VERIFY: '/documents/{id}/verify',
      DELETE: '/documents/{id}/delete'
    },
    
    // Users Management
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET_BY_ID: '/api/users',
      UPDATE: '/api/users',
      DELETE: '/api/users',
      CHANGE_PASSWORD: '/api/users/{id}/change-password'
    },
    
    // Health Check
    HEALTH: '/health'
  }
};

// Environment-specific configurations
const ENVIRONMENTS = {
  development: {
    BASE_URL: 'http://localhost:8081',
    DEBUG: true
  },
  staging: {
    BASE_URL: 'http://34.30.198.6:8081',
    DEBUG: true
  },
  production: {
    BASE_URL: 'http://34.30.198.6:8081',
    DEBUG: false
  }
};

// Get current environment config
const ENV = import.meta.env.VITE_ENV || 'production';
const ENV_CONFIG = ENVIRONMENTS[ENV] || ENVIRONMENTS.production;

// Final configuration
export const apiConfig = {
  ...API_CONFIG,
  ...ENV_CONFIG,
  // Helper function to build full URL
  buildUrl: (endpoint) => {
    return `${ENV_CONFIG.BASE_URL}${endpoint}`;
  },
  
  // Helper function to replace URL parameters
  buildUrlWithParams: (endpoint, params = {}) => {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`{${key}}`, params[key]);
    });
    return `${ENV_CONFIG.BASE_URL}${url}`;
  }
};

// For backward compatibility with your existing code
export const API_ENDPOINTS = {
  BASE_URL: apiConfig.BASE_URL,
  ...apiConfig.ENDPOINTS
};

// Request timeouts
export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 60000,
  DOWNLOAD: 60000
};

export default apiConfig;