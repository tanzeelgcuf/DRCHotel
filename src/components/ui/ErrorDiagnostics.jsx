import React, { useState, useEffect } from 'react';
import errorMonitoring from '../../utils/errorMonitoring';
import './ErrorDiagnostics.css';

/**
 * Error Diagnostics Component
 * Demonstrates safe error handling and provides error statistics
 */
const ErrorDiagnostics = () => {
  const [errors, setErrors] = useState([]);
  const [corsStats, setCorsStats] = useState({ totalErrors: 0, corsErrors: 0, percentage: 0 });
  
  useEffect(() => {
    // Safely fetch errors with circuit breaker pattern protection
    try {
      const allErrors = errorMonitoring.getAllErrors();
      setErrors(allErrors);
      
      const stats = errorMonitoring.getCorsStats();
      setCorsStats(stats);
    } catch (error) {
      // Safe error handling with circuit breaker awareness
      const errorId = errorMonitoring.captureError(error, 'ErrorDiagnostics');
      
      // Check if error was actually captured (might be null if circuit breaker triggered)
      if (!errorId) {
        console.warn('Error handling suppressed by circuit breaker');
      }
      
      // Provide fallback state instead of failing
      setErrors([]);
      setCorsStats({ totalErrors: 0, corsErrors: 0, percentage: 0 });
    }
  }, []);
  
  // Safe trigger of test errors with circuit breaker protection
  const triggerTestError = () => {
    try {
      // Throw a test error
      throw new Error('Test error from ErrorDiagnostics component');
    } catch (error) {
      // Safe error handling
      const errorId = errorMonitoring.captureError(error, 'ErrorDiagnostics.triggerTestError');
      
      // Only continue if error was captured (not blocked by circuit breaker)
      if (errorId) {
        // Refresh error list
        setErrors(errorMonitoring.getAllErrors());
        setCorsStats(errorMonitoring.getCorsStats());
      }
    }
  };
  
  const clearAllErrors = () => {
    try {
      errorMonitoring.clearErrors();
      setErrors([]);
      setCorsStats({ totalErrors: 0, corsErrors: 0, percentage: 0 });
    } catch (error) {
      // Safe error handling
      errorMonitoring.captureError(error, 'ErrorDiagnostics.clearAllErrors');
    }
  };
  
  return (
    <div className="error-diagnostics">
      <h2>Error Diagnostics</h2>
      
      <div className="error-stats">
        <h3>Error Statistics</h3>
        <p>Total Errors: {corsStats.totalErrors}</p>
        <p>CORS Errors: {corsStats.corsErrors}</p>
        <p>CORS Error Percentage: {corsStats.percentage.toFixed(2)}%</p>
      </div>
      
      <div className="error-actions">
        <button onClick={triggerTestError}>Trigger Test Error</button>
        <button onClick={clearAllErrors}>Clear All Errors</button>
      </div>
      
      <div className="error-list">
        <h3>Recent Errors ({errors.length})</h3>
        {errors.length === 0 ? (
          <p>No errors captured yet.</p>
        ) : (
          <ul>
            {errors.map(error => (
              <li key={error.id} className={error.isCorsError ? 'cors-error' : ''}>
                <div className="error-header">
                  <span className="error-id">{error.id}</span>
                  <span className="error-time">{new Date(error.timestamp).toLocaleString()}</span>
                  {error.isCorsError && <span className="error-badge">CORS</span>}
                </div>
                <div className="error-message">{error.message}</div>
                <div className="error-source">Source: {error.source}</div>
                {error.stack && (
                  <details>
                    <summary>Stack Trace</summary>
                    <pre className="error-stack">{error.stack}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ErrorDiagnostics;