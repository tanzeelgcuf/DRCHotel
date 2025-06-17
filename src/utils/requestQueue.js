import apiService from '../services/apiService';
import logger from './logger';

/**
 * Request Queue for handling offline API requests
 * Stores requests when offline and processes them when connection is restored
 */
export const requestQueue = {
  /**
   * Queue of pending requests
   * @type {Array<Object>}
   */
  queue: [],
  
  /**
   * Add a request to the offline queue
   * @param {Object} request - The request to queue
   * @param {string} request.url - Request URL
   * @param {string} request.method - HTTP method
   * @param {Object} [request.body] - Request payload
   * @param {Object} [request.headers] - Request headers
   */
  addToQueue(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    this.saveQueue();
    
    logger.info(`Request queued for offline processing: ${request.method} ${request.url}`);
  },
  
  /**
   * Save queue to localStorage
   * @private
   */
  saveQueue() {
    localStorage.setItem('pendingRequests', JSON.stringify(this.queue));
  },
  
  /**
   * Process all pending requests in the queue
   * @returns {Promise<Array>} - Array of results from processed requests
   */
  async processPendingRequests() {
    if (!navigator.onLine) {
      logger.warn('Cannot process pending requests while offline');
      return [];
    }
    
    if (this.queue.length === 0) {
      return [];
    }
    
    logger.info(`Processing ${this.queue.length} pending requests`);
    
    const pendingRequests = [...this.queue];
    this.queue = [];
    this.saveQueue();
    
    const results = [];
    
    // Process requests sequentially to maintain order
    for (const request of pendingRequests) {
      try {
        logger.info(`Processing queued request: ${request.method} ${request.url}`);
        
        const result = await apiService.request(request.url, {
          method: request.method,
          body: request.body,
          headers: request.headers
        });
        
        results.push({ id: request.id, success: true, result });
      } catch (error) {
        results.push({ id: request.id, success: false, error });
        logger.error(`Failed to process queued request ${request.id}:`, error);
      }
    }
    
    logger.info(`Completed processing ${pendingRequests.length} pending requests`);
    return results;
  },
  
  /**
   * Get the current queue length
   * @returns {number} - Number of pending requests
   */
  getPendingCount() {
    return this.queue.length;
  },
  
  /**
   * Clear all pending requests
   */
  clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    this.saveQueue();
    logger.info(`Cleared ${count} pending requests from queue`);
  },
  
  /**
   * Initialize queue from localStorage and set up event listeners
   */
  initialize() {
    try {
      const saved = localStorage.getItem('pendingRequests');
      if (saved) {
        this.queue = JSON.parse(saved) || [];
        if (this.queue.length > 0) {
          logger.info(`Loaded ${this.queue.length} pending requests from storage`);
        }
      }
    } catch (e) {
      logger.error('Error loading pending requests from localStorage:', e);
      this.queue = [];
    }
    
    // Process requests when app comes online
    window.addEventListener('online', () => {
      logger.info('Internet connection restored. Processing pending requests...');
      this.processPendingRequests();
    });
    
    // Listen for offline status
    window.addEventListener('offline', () => {
      logger.info('Internet connection lost. Requests will be queued.');
    });
    
    // Initial check - process if online
    if (navigator.onLine && this.queue.length > 0) {
      logger.info(`Found ${this.queue.length} pending requests. Processing...`);
      setTimeout(() => this.processPendingRequests(), 3000); // Small delay to ensure app is ready
    }
  }
};

// Initialize the request queue when module is imported
requestQueue.initialize();

export default requestQueue;