import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import errorMonitoring from '../../utils/errorMonitoring';
import logger from '../../utils/logger';
import { API_ENDPOINTS } from '../../constants/apiConfig';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * API Diagnostics component for troubleshooting API and CORS issues
 * This component should only be accessible to administrators
 */
const ApiDiagnostics = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [corsStats, setCorsStats] = useState(null);
  const [activeTest, setActiveTest] = useState('health');
  
  // Get CORS error statistics on mount
  useEffect(() => {
    setCorsStats(errorMonitoring.getCorsStats());
  }, []);

  /**
   * Run diagnostic tests for API health
   */
  const runHealthCheck = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      logger.info('Running API health check diagnostics');
      
      // Test 1: Check API health endpoint
      const healthCheck = await apiService.get(API_ENDPOINTS.HEALTH, {
        skipRetry: true,
        timeout: 5000
      });
      
      // Test 2: Ping basic endpoints
      const authEndpoint = await apiService.testCorsConfig(API_ENDPOINTS.AUTH.LOGIN);
      
      // Get error stats
      const errorStats = errorMonitoring.getCorsStats();
      setCorsStats(errorStats);
      
      setResults({
        timestamp: new Date().toISOString(),
        healthCheck,
        authEndpoint,
        errorStats,
        environment: import.meta.env.MODE,
        apiUrl: API_ENDPOINTS.BASE_URL,
        browserInfo: {
          userAgent: navigator.userAgent,
          origin: window.location.origin,
          protocol: window.location.protocol,
        }
      });
    } catch (error) {
      logger.error('Error running diagnostics', error);
      setResults({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Run CORS test for a custom URL
   */
  const runCorsTest = async () => {
    if (!customUrl.trim()) return;
    
    setLoading(true);
    setResults(null);
    
    try {
      logger.info(`Running CORS test for URL: ${customUrl}`);
      const corsTest = await apiService.testCorsConfig(customUrl);
      setResults({
        timestamp: new Date().toISOString(),
        customUrlTest: corsTest,
        url: customUrl
      });
    } catch (error) {
      logger.error('Error running CORS test', error);
      setResults({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Clear all error logs
   */
  const clearErrors = () => {
    errorMonitoring.clearErrors();
    setCorsStats(errorMonitoring.getCorsStats());
    logger.info('Error logs cleared');
  };
  
  return (
    <div className="api-diagnostics">
      <h2>API & CORS Diagnostics</h2>
      
      <div className="diagnostic-tabs">
        <button 
          className={activeTest === 'health' ? 'active' : ''} 
          onClick={() => setActiveTest('health')}
        >
          Health Check
        </button>
        <button 
          className={activeTest === 'cors' ? 'active' : ''} 
          onClick={() => setActiveTest('cors')}
        >
          CORS Test
        </button>
        <button 
          className={activeTest === 'logs' ? 'active' : ''} 
          onClick={() => setActiveTest('logs')}
        >
          Error Logs
        </button>
      </div>
      
      {activeTest === 'health' && (
        <div className="diagnostic-panel">
          <p>Run a health check on the API to verify connectivity and CORS configuration.</p>
          <button onClick={runHealthCheck} disabled={loading}>
            {loading ? 'Running...' : 'Run Health Check'}
          </button>
        </div>
      )}
      
      {activeTest === 'cors' && (
        <div className="diagnostic-panel">
          <p>Test a specific URL for CORS configuration.</p>
          <div className="url-input">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter URL to test"
              disabled={loading}
            />
            <button onClick={runCorsTest} disabled={loading || !customUrl.trim()}>
              {loading ? 'Testing...' : 'Test URL'}
            </button>
          </div>
          <small>Example: {API_ENDPOINTS.BASE_URL}/health</small>
        </div>
      )}
      
      {activeTest === 'logs' && (
        <div className="diagnostic-panel">
          <div className="error-stats">
            <h3>Error Statistics</h3>
            {corsStats && (
              <div>
                <p>Total Errors: {corsStats.totalErrors}</p>
                <p>CORS Errors: {corsStats.corsErrors}</p>
                <p>Percentage: {corsStats.percentage.toFixed(2)}%</p>
                <button onClick={clearErrors}>Clear Error Logs</button>
              </div>
            )}
          </div>
          
          <div className="cors-errors">
            <h3>CORS Error Logs</h3>
            <div className="error-table">
              {errorMonitoring.getCorsErrors().length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>URL</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorMonitoring.getCorsErrors().map((error) => (
                      <tr key={error.id}>
                        <td>{new Date(error.timestamp).toLocaleTimeString()}</td>
                        <td>{error.url}</td>
                        <td>{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No CORS errors logged</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {loading && <LoadingSpinner />}
      
      {results && !loading && (
        <div className="diagnostic-results">
          <h3>Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
      
      <style jsx>{`
        .api-diagnostics {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .diagnostic-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .diagnostic-tabs button {
          padding: 10px 15px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 3px solid transparent;
        }
        
        .diagnostic-tabs button.active {
          border-bottom-color: #0d6efd;
          font-weight: bold;
        }
        
        .diagnostic-panel {
          margin-bottom: 20px;
        }
        
        .url-input {
          display: flex;
          margin-top: 10px;
        }
        
        .url-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ced4da;
          border-radius: 4px 0 0 4px;
        }
        
        .url-input button {
          border-radius: 0 4px 4px 0;
        }
        
        button {
          padding: 8px 15px;
          background-color: #0d6efd;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .error-table {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 10px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        
        th {
          background-color: #f8f9fa;
        }
        
        .diagnostic-results {
          margin-top: 20px;
          padding: 15px;
          background: #f1f1f1;
          border-radius: 4px;
          overflow-x: auto;
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default ApiDiagnostics;