import apiService from './apiService';
import logger from '../utils/logger';
import { apiConfig } from '../config/api';

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
      
      // Use the health endpoint from your backend
      const healthEndpoint = apiConfig.ENDPOINTS.HEALTH;
      
      const response = await apiService.get(healthEndpoint, { 
        skipRetry: true,
        timeout: 5000
      });
      
      if (response.success) {
        this.healthStatus = {
          isOnline: true,
          lastCheck: new Date(),
          error: null,
          serverInfo: response.data
        };
        logger.info('API health check successful', response.data);
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
  
  /**
   * Test API connectivity and log detailed information
   * @returns {Promise<Object>} Test results
   */
  async testConnectivity() {
    logger.info('Starting comprehensive API connectivity test');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      apiUrl: apiConfig.BASE_URL,
      environment: import.meta.env.VITE_ENV,
      tests: {}
    };
    
    try {
      // Test 1: Health endpoint
      logger.info('Testing health endpoint...');
      const healthResult = await this.checkHealth();
      testResults.tests.health = {
        success: healthResult.isOnline,
        response: healthResult.serverInfo,
        error: healthResult.error
      };
      
      // Test 2: CORS configuration
      logger.info('Testing CORS configuration...');
      const corsResult = await apiService.testCorsConfig(apiConfig.ENDPOINTS.HEALTH);
      testResults.tests.cors = corsResult;
      
      // Test 3: Authentication endpoints (without credentials)
      logger.info('Testing authentication endpoint availability...');
      try {
        const authTest = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.LOGIN}`, {
          method: 'OPTIONS',
          mode: 'cors'
        });
        testResults.tests.authentication = {
          success: authTest.ok,
          status: authTest.status,
          headers: Object.fromEntries([...authTest.headers.entries()])
        };
      } catch (authError) {
        testResults.tests.authentication = {
          success: false,
          error: authError.message
        };
      }
      
      logger.info('API connectivity test completed', testResults);
      return testResults;
      
    } catch (error) {
      logger.error('API connectivity test failed', error);
      testResults.error = error.message;
      return testResults;
    }
  }
}

export default new ApiMonitor();