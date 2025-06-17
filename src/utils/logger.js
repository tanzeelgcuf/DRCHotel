const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

const ENV = import.meta.env.MODE || 'development';

class Logger {
  constructor() {
    this.isProduction = ENV === 'production';
  }

  /**
   * Format log messages consistently
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   * @returns {Object} Formatted log data
   */
  formatLog(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
      environment: ENV
    };
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  debug(message, data = {}) {
    if (this.isProduction) return;
    
    const formattedData = this.formatLog(LOG_LEVELS.DEBUG, message, data);
    console.debug(`[DEBUG] ${message}`, formattedData);
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  info(message, data = {}) {
    const formattedData = this.formatLog(LOG_LEVELS.INFO, message, data);
    console.info(`[INFO] ${message}`, formattedData);
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  warn(message, data = {}) {
    const formattedData = this.formatLog(LOG_LEVELS.WARN, message, data);
    console.warn(`[WARN] ${message}`, formattedData);
  }

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {Object|Error} error - Error object or additional data
   */
  error(message, error = {}) {
    try {
      let errorData = {};
      
      if (error instanceof Error) {
        errorData = {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack,
        };
      } else {
        errorData = error;
      }
      
      const formattedData = this.formatLog(LOG_LEVELS.ERROR, message, { error: errorData });
      console.error(`[ERROR] ${message}`, formattedData);
      
      // Could integrate with error tracking service here (e.g., Sentry)
      // if (window.Sentry) {
      //   window.Sentry.captureException(error);
      // }
    } catch (logError) {
      // Fallback if anything fails during logging
      console.error(`Failed to log error: ${message} - Logging system error: ${logError.message}`);
    }
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   */
  logApiRequest(method, url, data) {
    this.debug(`API Request: ${method} ${url}`, { 
      method, 
      url, 
      data: this.isProduction ? '[REDACTED]' : data 
    });
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status code
   * @param {Object} data - Response data
   */
  logApiResponse(method, url, status, data) {
    try {
      if (status >= 400) {
        this.error(`API Error: ${method} ${url} returned ${status}`, {
          method,
          url,
          status,
          response: data
        });
      } else {
        this.debug(`API Response: ${method} ${url} returned ${status}`, {
          method,
          url,
          status,
          response: this.isProduction ? '[REDACTED]' : data
        });
      }
    } catch (logError) {
      // Fallback if anything fails during API response logging
      console.error(`Failed to log API response: ${method} ${url} (${status}) - Logging system error: ${logError.message}`);
    }
  }
}

export default new Logger();