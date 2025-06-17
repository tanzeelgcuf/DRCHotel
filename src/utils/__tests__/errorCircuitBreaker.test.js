/**
 * Test file for verifying error circuit breaker functionality
 */

import errorMonitoring from '../errorMonitoring';

/**
 * This test file demonstrates the circuit breaker pattern in the error monitoring system
 * It can be run with Jest or similar test framework
 */

// Reset the error monitoring state before running tests
beforeEach(() => {
  errorMonitoring.errorCount = 0;
  errorMonitoring.errorsById.clear();
  errorMonitoring.corsErrorCount = 0;
  errorMonitoring.processingError = false;
  errorMonitoring.errorDepth = 0;
});

describe('Error Circuit Breaker', () => {
  test('Should prevent recursive error handling', () => {
    // Mock console.warn to verify it was called
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;
    
    try {
      // Manually set processingError to simulate already processing an error
      errorMonitoring.processingError = true;
      
      // Try to capture an error while already processing one
      const result = errorMonitoring.captureError(new Error('Test error'));
      
      // Verify circuit breaker prevented processing and returned null
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Circuit breaker triggered - preventing recursive error'
      );
    } finally {
      // Restore original console.warn
      console.warn = originalConsoleWarn;
      // Reset processing state
      errorMonitoring.processingError = false;
    }
  });
  
  test('Should limit error recursion depth', () => {
    // Mock console.warn to verify it was called
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;
    
    try {
      // Manually set errorDepth beyond MAX_ERROR_DEPTH
      errorMonitoring.errorDepth = errorMonitoring.MAX_ERROR_DEPTH + 1;
      
      // Try to capture an error at excessive depth
      const result = errorMonitoring.captureError(new Error('Deep error'));
      
      // Verify circuit breaker prevented processing and returned null
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Circuit breaker triggered - preventing recursive error'
      );
    } finally {
      // Restore original console.warn
      console.warn = originalConsoleWarn;
      // Reset depth
      errorMonitoring.errorDepth = 0;
    }
  });
  
  test('Should handle errors within error processing', () => {
    // Mock console.error to verify it was called
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;
    
    try {
      // Create a test error
      const testError = new Error('Test error');
      
      // Mock the isCorsError method to throw an error
      const originalIsCorsError = errorMonitoring.isCorsError;
      errorMonitoring.isCorsError = () => {
        throw new Error('Error within error processing');
      };
      
      try {
        // Try to capture an error which will cause an internal error
        const result = errorMonitoring.captureError(testError);
        
        // Should return null due to internal error
        expect(result).toBeNull();
        
        // Verify error was logged
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error in error handling system:',
          'Error within error processing'
        );
        
        // Verify processingError was reset
        expect(errorMonitoring.processingError).toBe(false);
        
        // Verify errorDepth was decremented
        expect(errorMonitoring.errorDepth).toBe(0);
      } finally {
        // Restore original method
        errorMonitoring.isCorsError = originalIsCorsError;
      }
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });
  
  test('Should ignore errors from circuit breaker messages', () => {
    // Mock console methods
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;
    
    try {
      // Create a circuit breaker error message
      const cbError = new Error('Circuit breaker triggered - preventing recursive error');
      
      // Skip console.error override and directly test the captureError method
      const errorMonitoringInstance = errorMonitoring;
      
      // Save original implementation
      const originalCaptureError = errorMonitoringInstance.captureError;
      
      // Replace with mock to check if it's called
      errorMonitoringInstance.captureError = jest.fn();
      
      try {
        // Call console.error with circuit breaker message
        errorMonitoring.setupGlobalHandlers();
        console.error(cbError);
        
        // Verify captureError was not called for circuit breaker message
        expect(errorMonitoringInstance.captureError).not.toHaveBeenCalled();
      } finally {
        // Restore original implementation
        errorMonitoringInstance.captureError = originalCaptureError;
      }
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });
});