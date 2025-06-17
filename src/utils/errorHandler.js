/**
 * Parse API error responses
 * @param {Error|Response} error - The error object or response
 * @returns {string} - Formatted error message
 */
export const parseApiError = async (error) => {
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  // If it's an Error object with a message
  if (error instanceof Error) return error.message;

  // If it's a Response object from fetch
  if (error instanceof Response) {
    try {
      const data = await error.json();
      return data.message || data.error || 'Une erreur est survenue';
    } catch (e) {
      return error.statusText || 'Une erreur est survenue';
    }
  }

  // Default error message
  return 'Une erreur est survenue';
};

/**
 * Format validation errors from form submissions
 * @param {Object} errors - Object containing field errors
 * @returns {Object} - Formatted errors object
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return {};
  
  // If errors is already in the right format, return it
  if (typeof errors === 'object' && !Array.isArray(errors)) {
    return errors;
  }
  
  // If errors is an array, convert to object
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      if (error.field && error.message) {
        acc[error.field] = error.message;
      }
      return acc;
    }, {});
  }
  
  return {};
};

/**
 * Create a standard error handler for async functions
 * @param {Function} callback - Function to execute on error
 * @returns {Function} - Error handler function
 */
export const createErrorHandler = (callback) => {
  return async (error) => {
    const message = await parseApiError(error);
    callback(message);
  };
};