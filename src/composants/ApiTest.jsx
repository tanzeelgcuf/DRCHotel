// src/components/ApiTest.jsx
import { useState, useEffect } from 'react';
import { checkServerHealth } from '../services/httpClient';
import { toast } from 'react-toastify';

export function ApiTest() {
  const [status, setStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      console.log('🔄 Testing API connection...');
      const response = await checkServerHealth();
      
      setServerInfo(response);
      setStatus('connected');
      toast.success('✅ API connection successful!');
      console.log('✅ API Response:', response);
      
    } catch (err) {
      setError(err);
      setStatus('error');
      toast.error(`❌ API connection failed: ${err.message}`);
      console.error('❌ API Error:', err);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔄';
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <div className={`flex items-center mb-4 ${getStatusColor()}`}>
        <span className="mr-2 text-xl">{getStatusIcon()}</span>
        <span className="font-medium">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Environment:</strong> {import.meta.env.VITE_ENV}
        </p>
      </div>

      {serverInfo && (
        <div className="mb-4 p-3 bg-green-50 rounded border">
          <h3 className="font-medium text-green-800 mb-2">Server Response:</h3>
          <pre className="text-xs text-green-700 overflow-auto">
            {JSON.stringify(serverInfo, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded border">
          <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
          <p className="text-sm text-red-700">
            <strong>Message:</strong> {error.message}
          </p>
          <p className="text-sm text-red-700">
            <strong>Status:</strong> {error.status}
          </p>
          {error.details && (
            <p className="text-sm text-red-700">
              <strong>Details:</strong> {JSON.stringify(error.details)}
            </p>
          )}
        </div>
      )}

      <button
        onClick={testConnection}
        disabled={status === 'checking'}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'checking' ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  );
}

export default ApiTest;