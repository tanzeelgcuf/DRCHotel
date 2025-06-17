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
          <i className="bx bx-wifi-off"></i>
          <span>
            Vous êtes hors ligne. Les modifications seront synchronisées lorsque vous serez connecté.
          </span>
        </div>
      ) : (
        <div className="api-down-message">
          <i className="bx bx-server"></i>
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
          color: #ff9800;
        }
        
        i {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;