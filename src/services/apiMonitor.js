import apiService from './apiService';
import logger from '../utils/logger';
import { API_ENDPOINTS } from '../constants/apiConfig';

/**
 * Service to monitor API health and connectivity
 */
class ApiMonitor {
  constructor() {
    this.isCheckingHealth = false;
    this.healthStatus = {
      isOnline: true,
      lastCheck: null,
      error: null
    };
    
    // Automatically check API connectivity when network status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.checkHealth());
      window.addEventListener('offline', () => {
        logger.warn('Browser reports network is offline');
        this.healthStatus.isOnline = false;
        this.healthStatus.lastCheck = new Date();
        this.healthStatus.error = 'Network connection is offline';
      });
    }
  }
  
  /**
   * Check if the API is healthy and reachable
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    if (this.isCheckingHealth) {
      return this.healthStatus;
    }
    
    this.isCheckingHealth = true;
    
    try {
      logger.info('Checking API health');
      
      // Check a simple endpoint like health check or a basic endpoint
      // You may need to create a dedicated health check endpoint
      const healthEndpoint = `${API_ENDPOINTS.BASE_URL}/health` || API_ENDPOINTS.AUTH.LOGIN;
      
      const response = await apiService.get(healthEndpoint, { 
        skipRetry: true,  // Skip retries for health checks
        timeout: 5000     // Short timeout for health checks
      });
      
      if (response.success) {
        this.healthStatus = {
          isOnline: true,
          lastCheck: new Date(),
          error: null
        };
        logger.info('API health check successful');
      } else {
        this.healthStatus = {
          isOnline: false,
          lastCheck: new Date(),
          error: response.error || 'API returned an error'
        };
        logger.warn('API health check failed', { error: response.error });
      }
    } catch (error) {
      this.healthStatus = {
        isOnline: false,
        lastCheck: new Date(),
        error: error.message || 'Failed to connect to API'
      };
      logger.error('API health check error', error);
    } finally {
      this.isCheckingHealth = false;
    }
    
    return this.healthStatus;
  }
  
  /**
   * Get the current health status
   * @returns {Object} Current health status
   */
  getStatus() {
    return this.healthStatus;
  }
  
  /**
   * Check if the API is currently online
   * @returns {boolean} Whether API is online
   */
  isOnline() {
    return this.healthStatus.isOnline;
  }
  
  /**
   * Start periodic health checks
   * @param {number} interval - Interval in milliseconds
   * @returns {number} Interval ID
   */
  startPeriodicChecks(interval = 60000) {
    // Check immediately
    this.checkHealth();
    
    // Then set up interval
    return setInterval(() => {
      this.checkHealth();
    }, interval);
  }
  
  /**
   * Stop periodic health checks
   * @param {number} intervalId - Interval ID to clear
   */
  stopPeriodicChecks(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

export default new ApiMonitor();