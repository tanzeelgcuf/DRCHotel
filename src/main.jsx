import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './components/error/ErrorBoundary';
import './utils/errorMonitoring'; // Import to initialize global error monitoring
import logger from './utils/logger';

// Log application startup
logger.info('Application starting', { 
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE || 'development'
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
