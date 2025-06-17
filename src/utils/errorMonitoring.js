import logger from './logger';

/**
 * Global error monitoring and reporting system
 * This could be extended to integrate with external error tracking services
 */
class ErrorMonitoring {
  constructor() {
    this.errorCount = 0;
    this.errorsById = new Map();
    this.corsErrorCount = 0;
    this.processingError = false;
    this.errorDepth = 0;
    this.MAX_ERROR_DEPTH = 5;
    this.setupGlobalHandlers();
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      try {
        this.captureError(event.reason || new Error('Unhandled Promise rejection'));
      } catch (handlerError) {
        console.error('Error in unhandledrejection handler:', handlerError.message);
      }
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      try {
        this.captureError(event.error || new Error(event.message));
      } catch (handlerError) {
        console.error('Error in error event handler:', handlerError.message);
      }
    });

    // Replace console.error to capture errors logged to console
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Always call the original console.error first
      originalConsoleError.apply(console, args);
      
      try {
        // Only process if not already handling an error and below max depth
        if (!this.processingError && this.errorDepth <= this.MAX_ERROR_DEPTH) {
          // Extract error object if present
          const error = args.find(arg => arg instanceof Error) || new Error(args.join(' '));
          
          // Skip if the error message suggests it's from our own error handling
          if (!error.message.includes('Circuit breaker triggered') && 
              !error.message.includes('Error in error handling system') &&
              !error.message.includes('Failed to log error')) {
            this.captureError(error, 'console.error');
          }
        }
      } catch (handlerError) {
        // Last resort fallback - use original console.error
        originalConsoleError.call(console, 'Error in console.error handler:', handlerError.message);
      }
    };
  }
  
  /**
   * Generate a unique error ID
   * @returns {string} - Unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if an error is a CORS error
   * @param {Error} error - The error to check
   * @returns {boolean} - Whether the error is CORS-related
   */
  isCorsError(error) {
    // CORS errors typically contain these specific phrases
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    const errorName = error.name?.toLowerCase() || '';
    
    const corsIndicators = [
      'access-control-allow-origin',
      'cross-origin',
      'cors',
      'blocked by cors policy',
      'origin is not allowed',
      'has been blocked by cors',
      'cross origin request'
    ];
    
    // Check if any CORS indicator is present in the error
    return corsIndicators.some(indicator => 
      errorMessage.includes(indicator) || 
      errorStack.includes(indicator) || 
      errorName.includes(indicator)
    );
  }

  /**
   * Capture and process an error
   * @param {Error} error - The error to capture
   * @param {string} source - Source of the error
   * @returns {string|null} - Error ID or null if circuit breaker triggered
   */
  captureError(error, source = 'runtime') {
    // Circuit breaker to prevent recursive error capturing
    if (this.processingError || this.errorDepth > this.MAX_ERROR_DEPTH) {
      console.warn('Circuit breaker triggered - preventing recursive error');
      return null;
    }
    
    try {
      this.processingError = true;
      this.errorDepth++;
      
      this.errorCount++;
      const errorId = this.generateErrorId();
      
      // Check if this is a CORS error
      const isCors = this.isCorsError(error);
      if (isCors) {
        this.corsErrorCount++;
      }
      
      const errorInfo = {
        id: errorId,
        message: error.message || String(error),
        stack: error.stack,
        source,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        isCorsError: isCors,
        errorDepth: this.errorDepth,
      };
      
      this.errorsById.set(errorId, errorInfo);
      
      // Add special logging for CORS errors
      if (isCors) {
        try {
          const corsLogData = {
            ...errorInfo,
            corsError: true,
            corsErrorCount: this.corsErrorCount,
            origins: {
              location: window.location.origin,
              documentDomain: document.domain,
              referrer: document.referrer
            },
            headers: this.getRequestHeaders()
          };
          logger.error(`CORS ERROR [${errorId}]: ${error.message}`, corsLogData);
          
          // Provide hints in the console for developers
          console.warn(`[CORS ERROR DETECTED] This may indicate an API configuration issue. Please check:
          1. The server's CORS configuration (Access-Control-Allow-Origin header)
          2. The request's Origin header
          3. Whether credentials are being sent with the request
          4. If preflight OPTIONS requests are properly handled by the server
          `);
        } catch (logError) {
          // Fallback if logger triggers an error
          console.error(`CORS ERROR [${errorId}]: ${error.message} (Logger failed: ${logError.message})`);
        }
      } else {
        // Log regular errors normally with try/catch to prevent recursive errors
        try {
          logger.error(`Error captured [${errorId}]: ${error.message}`, error);
        } catch (logError) {
          // Fallback if logger triggers an error
          console.error(`Error captured [${errorId}]: ${error.message} (Logger failed: ${logError.message})`);
        }
      }
      
      // If integrated with an error tracking service like Sentry, you would send it here
      // this.sendToErrorTrackingService(errorInfo);
      
      return errorId;
    } catch (metaError) {
      // Last resort fallback if anything in our error handling fails
      console.error('Error in error handling system:', metaError.message);
      return null;
    } finally {
      this.processingError = false;
      this.errorDepth--;
    }
  }
  
  /**
   * Get request headers for diagnostic purposes
   * @returns {Object} Common request headers
   */
  getRequestHeaders() {
    // In a real app, you might have access to the actual request headers
    // For now, we just return what we know would be sent
    return {
      'origin': window.location.origin,
      'referer': window.location.href,
      'user-agent': navigator.userAgent,
      'content-type': 'application/json',
      // We can't actually inspect Authorization headers for security reasons
      'authorization': 'Bearer [REDACTED]'
    };
  }
  
  /**
   * Send error to external tracking service
   * @param {Object} errorInfo - Error information
   */
  sendToErrorTrackingService(errorInfo) {
    // Example integration with a service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(errorInfo.message), {
    //     extra: errorInfo
    //   });
    // }
  }
  
  /**
   * Get all captured errors
   * @returns {Array} - Array of captured errors
   */
  getAllErrors() {
    return Array.from(this.errorsById.values());
  }
  
  /**
   * Get all CORS errors
   * @returns {Array} - Array of CORS errors
   */
  getCorsErrors() {
    return Array.from(this.errorsById.values())
      .filter(error => error.isCorsError);
  }
  
  /**
   * Get error by ID
   * @param {string} id - Error ID
   * @returns {Object|null} - Error info or null if not found
   */
  getErrorById(id) {
    return this.errorsById.get(id) || null;
  }
  
  /**
   * Clear all captured errors
   */
  clearErrors() {
    this.errorsById.clear();
    this.errorCount = 0;
    this.corsErrorCount = 0;
  }
  
  /**
   * Get CORS error statistics
   * @returns {Object} - CORS error stats
   */
  getCorsStats() {
    return {
      totalErrors: this.errorCount,
      corsErrors: this.corsErrorCount,
      percentage: this.errorCount ? (this.corsErrorCount / this.errorCount) * 100 : 0
    };
  }
}

export default new ErrorMonitoring();