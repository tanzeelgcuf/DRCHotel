# Request Queue for Offline Support

## Overview

The Request Queue utility provides offline support by queuing API requests when the user is offline and processing them when connectivity is restored.

## Implementation

```javascript
// src/utils/requestQueue.js

/**
 * Request Queue for handling offline API requests
 * Stores requests when offline and processes them when connection is restored
 */
export const requestQueue = {
  /**
   * Queue of pending requests
   * @type {Array<Object>}
   */
  queue: [],
  
  /**
   * Add a request to the offline queue
   * @param {Object} request - The request to queue
   * @param {string} request.url - Request URL
   * @param {string} request.method - HTTP method
   * @param {Object} [request.body] - Request payload
   * @param {Object} [request.headers] - Request headers
   */
  addToQueue(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    this.saveQueue();
  },
  
  /**
   * Save queue to localStorage
   * @private
   */
  saveQueue() {
    localStorage.setItem('pendingRequests', JSON.stringify(this.queue));
  },
  
  /**
   * Process all pending requests in the queue
   * @returns {Promise<Array>} - Array of results from processed requests
   */
  async processPendingRequests() {
    if (!navigator.onLine) {
      console.warn('Cannot process pending requests while offline');
      return [];
    }
    
    const pendingRequests = [...this.queue];
    this.queue = [];
    this.saveQueue();
    
    const results = [];
    
    // Process requests sequentially to maintain order
    for (const request of pendingRequests) {
      try {
        const result = await apiService.request(request.url, {
          method: request.method,
          body: request.body,
          headers: request.headers
        });
        results.push({ id: request.id, success: true, result });
      } catch (error) {
        results.push({ id: request.id, success: false, error });
        console.error(`Failed to process queued request ${request.id}:`, error);
      }
    }
    
    return results;
  },
  
  /**
   * Get the current queue length
   * @returns {number} - Number of pending requests
   */
  getPendingCount() {
    return this.queue.length;
  },
  
  /**
   * Clear all pending requests
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  },
  
  /**
   * Initialize queue from localStorage and set up event listeners
   */
  initialize() {
    try {
      const saved = localStorage.getItem('pendingRequests');
      if (saved) {
        this.queue = JSON.parse(saved) || [];
      }
    } catch (e) {
      console.error('Error loading pending requests from localStorage:', e);
      this.queue = [];
    }
    
    // Process requests when app comes online
    window.addEventListener('online', () => {
      console.log('Internet connection restored. Processing pending requests...');
      this.processPendingRequests();
    });
    
    // Listen for offline status
    window.addEventListener('offline', () => {
      console.log('Internet connection lost. Requests will be queued.');
    });
    
    // Initial check - process if online
    if (navigator.onLine && this.queue.length > 0) {
      console.log(`Found ${this.queue.length} pending requests. Processing...`);
      this.processPendingRequests();
    }
  }
};

// Initialize the request queue when module is imported
requestQueue.initialize();

export default requestQueue;
```

## Usage

### Integration with API Service

```javascript
// Modified apiService.request method

async request(url, options = {}, attempt = 0) {
  // Check if offline
  if (!navigator.onLine) {
    // Only queue mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      requestQueue.addToQueue({
        url,
        method: options.method,
        body: options.body,
        headers: createHeaders(options.headers)
      });
      
      return {
        success: false,
        queued: true,
        error: 'Request queued - device is offline',
        queueLength: requestQueue.getPendingCount()
      };
    } else {
      return {
        success: false,
        error: 'Device is offline',
        offline: true
      };
    }
  }
  
  // Proceed with normal request if online
  // ...existing implementation...
}
```

### Displaying Queue Status to User

```jsx
// components/QueueStatus.jsx

import React from 'react';
import { requestQueue } from '../utils/requestQueue';

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
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  if (pendingCount === 0) return null;
  
  return (
    <div className="queue-status">
      {isOnline ? (
        <div className="processing">
          Synchronizing {pendingCount} pending request(s)...
        </div>
      ) : (
        <div className="queued">
          {pendingCount} request(s) queued for when you're back online
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
```

### Manual Queue Processing

```javascript
import { requestQueue } from '../utils/requestQueue';

// In a settings or admin component
function syncOfflineData() {
  if (requestQueue.getPendingCount() > 0) {
    if (navigator.onLine) {
      requestQueue.processPendingRequests().then(results => {
        console.log('Processed pending requests:', results);
        // Show success/error notification
      });
    } else {
      // Show error - still offline
    }
  } else {
    // No pending requests
  }
}
```

## Use Cases

1. **Form submissions in offline mode**: User can submit forms while offline, and they'll be processed when online.

2. **Offline data entry**: Users can continue entering data in offline environments, with the app handling synchronization.

3. **Intermittent connectivity**: The app remains functional in environments with spotty internet access.

## Limitations

- Not suitable for all API requests (especially those requiring immediate server validation)
- Storage limits of localStorage
- No conflict resolution mechanism for concurrent edits
- No encryption of queued data

## Future Improvements

- Add prioritization of queued requests
- Implement conflict resolution strategies
- Add encryption for sensitive queued data
- Add support for file uploads when back online