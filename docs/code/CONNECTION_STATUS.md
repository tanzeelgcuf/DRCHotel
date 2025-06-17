# Connection Status Component

## Overview

The Connection Status component provides real-time feedback to users about network connectivity and API availability. It monitors both the browser's online/offline status and periodically checks API health.

## Implementation

```jsx
// src/components/ui/ConnectionStatus.jsx

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/apiConfig';
import logger from '../../utils/logger';

/**
 * Connection Status component
 * Monitors network connectivity and API availability
 * Only displays when issues are detected
 */
const ConnectionStatus = () => {
  // Track browser online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Track API connection status
  const [apiConnected, setApiConnected] = useState(true);
  
  // Track last successful API connection time
  const [lastConnected, setLastConnected] = useState(
    localStorage.getItem('last_api_connection') || null
  );
  
  // Check the API health endpoint
  const checkApiHealth = async () => {
    if (!navigator.onLine) return false;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.HEALTH}`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const isConnected = response.ok;
      
      if (isConnected) {
        const now = new Date().toISOString();
        localStorage.setItem('last_api_connection', now);
        setLastConnected(now);
      }
      
      return isConnected;
    } catch (error) {
      logger.warn('API health check failed', error);
      return false;
    }
  };
  
  useEffect(() => {
    // Handle online status changes
    const handleOnline = () => {
      setIsOnline(true);
      // Check API health when we come back online
      checkApiHealth().then(setApiConnected);
    };
    
    const handleOffline = () => setIsOnline(false);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check API health periodically
    const healthCheck = setInterval(async () => {
      const status = await checkApiHealth();
      setApiConnected(status);
    }, 30000); // Every 30 seconds
    
    // Initial health check
    checkApiHealth().then(setApiConnected);
    
    return () => {
      // Clean up
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(healthCheck);
    };
  }, []);
  
  // Only render if there's a connection issue
  if (isOnline && apiConnected) return null;
  
  // Format last connected time
  const formatLastConnected = () => {
    if (!lastConnected) return 'Aucune connexion établie';
    
    const lastTime = new Date(lastConnected);
    return lastTime.toLocaleString();
  };
  
  return (
    <div className={`connection-status ${!isOnline ? 'offline' : 'api-down'}`}>
      {!isOnline ? (
        <div className="offline-message">
          <i className="icon-wifi-off"></i>
          <span>
            Vous êtes hors ligne. Les modifications seront synchronisées lorsque vous serez connecté.
          </span>
        </div>
      ) : (
        <div className="api-down-message">
          <i className="icon-server-off"></i>
          <span>
            Connexion au serveur perdue. Dernière connexion : {formatLastConnected()}
          </span>
          <button onClick={() => checkApiHealth().then(setApiConnected)}>
            Réessayer
          </button>
        </div>
      )}
      
      <style jsx>{`
        .connection-status {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 20px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .offline {
          background-color: #f44336;
        }
        
        .api-down {
          background-color: #ff9800;
        }
        
        .offline-message, .api-down-message {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        button {
          margin-left: 10px;
          padding: 5px 10px;
          background: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        i {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;
```

## Usage

### Adding to the Application Layout

```jsx
// In MainLayout.jsx or App.jsx
import ConnectionStatus from '../components/ui/ConnectionStatus';

function MainLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ConnectionStatus />
    </div>
  );
}
```

### Showing Enhanced Diagnostics to Admins

```jsx
// For admin users, show more detailed connection information
import { useAuth } from '../../context/AuthContext';

function EnhancedConnectionStatus() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Only admins see enhanced version
  if (!isAdmin) {
    return <ConnectionStatus />;
  }
  
  return <AdminConnectionStatus />;
}
```

## Features

1. **Network Connectivity Monitoring**: Utilizes the browser's `navigator.onLine` property and `online`/`offline` events to detect network status changes.

2. **API Health Checks**: Periodically checks the backend API health endpoint to verify service availability.

3. **Visual Feedback**: Provides clear visual indicators with different colors for network vs. API issues.

4. **Retry Mechanism**: Allows users to manually retry the connection check.

5. **Last Connection Timestamp**: Shows the time of the last successful API connection.

6. **Non-intrusive**: Only appears when there's a connection issue, otherwise stays hidden.

## Error Handling

The component handles several error scenarios:

1. **Device Offline**: Detected via browser online/offline events
2. **API Unreachable**: Failed health check request
3. **API Error**: Non-200 response from health endpoint
4. **Request Timeout**: Automatically aborts health checks after 5 seconds

## Performance Considerations

- Health checks use a 5-second timeout to prevent hanging requests
- Component only updates when connection status changes
- Stores last connection timestamp in localStorage to persist across page refreshes
- 30-second interval balances timeliness of updates with reducing network requests

## Customization

The component can be customized by:

1. Adjusting the health check interval based on application needs
2. Modifying the UI based on your application design
3. Adding additional diagnostic information for admin users
4. Extending the functionality to check specific critical API endpoints