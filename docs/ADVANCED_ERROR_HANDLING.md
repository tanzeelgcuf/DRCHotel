# Advanced Error Handling Documentation

This document explains the error handling architecture of the DRC App Front and how to troubleshoot common issues.

## Error Handling Architecture

The application uses a multi-layered approach to error handling:

1. **Error Boundary Components**: React error boundaries that catch JavaScript errors in their child component tree
2. **API Error Handling**: Centralized error handling for API requests
3. **Error Monitoring**: Global error monitoring system for tracking and categorizing errors
4. **Logging System**: Structured logging with different severity levels

## Error Monitoring

The error monitoring system (`/src/utils/errorMonitoring.js`) provides these key features:

- **Global Error Capture**: Captures unhandled errors and promise rejections
- **Error Categorization**: Categorizes errors (API, CORS, validation, etc.)
- **Error Tracking**: Generates unique error IDs and tracks error frequency
- **Error Context**: Captures context information for better debugging

### Preventing Recursive Errors

The error monitoring system includes circuit breaker mechanisms to prevent recursive errors and infinite loops:

```javascript
// Circuit breaker implementation in errorMonitoring.js
constructor() {
  this.errorCount = 0;
  this.errorsById = new Map();
  this.corsErrorCount = 0;
  this.processingError = false;
  this.errorDepth = 0;
  this.MAX_ERROR_DEPTH = 5;
  this.setupGlobalHandlers();
}

captureError(error, source = 'runtime') {
  // Circuit breaker to prevent recursive error capturing
  if (this.processingError || this.errorDepth > this.MAX_ERROR_DEPTH) {
    console.warn('Circuit breaker triggered - preventing recursive error');
    return null;
  }
  
  try {
    this.processingError = true;
    this.errorDepth++;
    
    // Error processing logic with safe try/catch blocks
    // ...
    
    // Safe logging with try/catch blocks to prevent cascading errors
    try {
      logger.error(`Error captured [${errorId}]: ${error.message}`, error);
    } catch (logError) {
      console.error(`Error captured [${errorId}]: ${error.message} (Logger failed: ${logError.message})`);
    }
    
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
```

### Common Error Categories

The system categorizes errors for better diagnosis:

1. **API Errors**: Issues with API requests (status codes, timeouts)
2. **CORS Errors**: Cross-origin resource sharing issues
3. **UI Errors**: React rendering errors
4. **Network Errors**: Internet connectivity issues
5. **Authorization Errors**: Authentication or permission issues

## Troubleshooting Common Issues

### CORS Issues

CORS issues typically appear when:
- The API server doesn't include proper CORS headers
- The frontend makes requests to a different origin than configured
- Credentials handling is misconfigured

**Solution**:
1. Verify the API server includes these headers:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Allow-Credentials`
2. Check the frontend is using the correct API URL
3. Use the API Diagnostics component to test CORS configuration

### Maximum Call Stack Size Exceeded

This error typically appears when there's an infinite loop, often in error handling code.

**Solution**:
1. Look for recursive function calls without proper exit conditions
2. Check for event handlers that trigger their own events
3. Verify error monitoring isn't causing recursive logging
4. Add circuit breakers to error handling functions

**Implemented Safeguards**:
- Circuit breaker pattern in error monitoring prevents infinite recursion
- Tracking error processing depth to limit recursion depth
- Try/catch blocks with fallback console methods for all error handling logic
- Exclusion of internal error handling messages from being re-processed
- Safe wrappers around error logging functions

### Offline Support Issues

Problems with offline queueing often appear as:
- Duplicate requests when coming back online
- Failed synchronization after reconnection
- Lost queued requests

**Solution**:
1. Check the request queue implementation
2. Verify proper storage of queued requests
3. Implement de-duplication of requests
4. Add retry strategies with exponential backoff

## Adding Custom Error Handling

To add custom error handling for specific features:

```javascript
import errorMonitoring from '../utils/errorMonitoring';

try {
  // Potentially error-prone code
} catch (error) {
  // Add context to the error
  const errorId = errorMonitoring.captureError(error, 'custom-feature');
  
  // Check if error was actually captured (might be null if circuit breaker triggered)
  if (errorId) {
    // Add additional handling as needed
    console.log(`Error was captured with ID: ${errorId}`);
  }
  
  // Always continue with graceful fallback
  // Do not re-throw errors in error handling code
}
```

## Error Monitoring Dashboard

The admin panel includes an error monitoring dashboard at `/admin/diagnostics` which shows:

1. Recent errors with stack traces
2. Error categories and frequencies
3. CORS configuration testing
4. API health checks

Use this dashboard to diagnose and troubleshoot issues in real-time.