import React, { useState, useEffect } from 'react';
import { requestQueue } from '../../utils/requestQueue';

/**
 * Component to display the status of requests queued for offline processing
 * Shows a notification when there are pending requests to be synced
 */
const QueueStatus = () => {
  const [pendingCount, setPendingCount] = useState(requestQueue.getPendingCount());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Update pending count when localStorage changes
    const handleStorageChange = () => {
      setPendingCount(requestQueue.getPendingCount());
    };
    
    // Check pending count periodically
    const checkQueue = setInterval(() => {
      setPendingCount(requestQueue.getPendingCount());
    }, 5000);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkQueue);
    };
  }, []);
  
  // Only show when there are pending requests
  if (pendingCount === 0) return null;
  
  const handleSync = () => {
    if (isOnline && pendingCount > 0) {
      requestQueue.processPendingRequests();
    }
  };
  
  return (
    <div className={`queue-status ${isOnline ? 'ready' : 'waiting'}`}>
      <i className={`bx ${isOnline ? 'bx-sync' : 'bx-time'}`}></i>
      
      {isOnline ? (
        <span>
          {pendingCount} demande(s) en attente de synchronisation
          <button onClick={handleSync}>Synchroniser maintenant</button>
        </span>
      ) : (
        <span>
          {pendingCount} demande(s) en attente d'être en ligne
        </span>
      )}
      
      <style jsx>{`
        .queue-status {
          position: fixed;
          bottom: ${isOnline ? '0' : '40px'};
          left: 0;
          right: 0;
          padding: 8px 15px;
          color: white;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          z-index: 999;
        }
        
        .ready {
          background-color: #4caf50;
        }
        
        .waiting {
          background-color: #ff9800;
        }
        
        button {
          margin-left: 10px;
          padding: 3px 8px;
          background: white;
          color: #4caf50;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        i {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default QueueStatus;