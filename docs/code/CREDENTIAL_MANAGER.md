# Credential Manager

## Overview

The Credential Manager is a utility for securely managing authentication tokens with expiration handling. It provides a consistent interface for token storage, retrieval, and validation.

## Implementation

```javascript
// src/utils/credentialManager.js

/**
 * Credential Manager utility for handling authentication tokens
 * with built-in expiration handling.
 */
export const credentialManager = {
  /**
   * Store authentication token with expiration time
   * @param {string} token - JWT or authentication token
   * @param {number} expiresInSeconds - Token expiration time in seconds
   */
  setToken(token, expiresInSeconds = 3600) {
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    localStorage.setItem('token', token);
    localStorage.setItem('token_expires_at', expiresAt);
  },
  
  /**
   * Get token with expiration check
   * @returns {string|null} - The token or null if expired/missing
   */
  getToken() {
    const token = localStorage.setItem('token');
    const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
    
    if (!token) return null;
    
    // Check if token is expired
    if (expiresAt && Date.now() > expiresAt) {
      this.clearToken();
      return null;
    }
    
    return token;
  },
  
  /**
   * Clear token and expiration data
   */
  clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires_at');
  },
  
  /**
   * Check if token exists and is valid
   * @returns {boolean} - Whether a valid token exists
   */
  hasValidToken() {
    return this.getToken() !== null;
  },
  
  /**
   * Get token expiration time
   * @returns {number|null} - Expiration timestamp or null
   */
  getTokenExpiration() {
    const expiresAt = localStorage.getItem('token_expires_at');
    return expiresAt ? parseInt(expiresAt) : null;
  },
  
  /**
   * Calculate time until token expiration
   * @returns {number|null} - Seconds until expiration or null if expired/missing
   */
  getSecondsUntilExpiration() {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return null;
    
    const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);
    return secondsLeft > 0 ? secondsLeft : null;
  }
};

export default credentialManager;
```

## Usage

### Storing a token

```javascript
import { credentialManager } from '../utils/credentialManager';

// Store token with default expiration (1 hour)
credentialManager.setToken('jwt-token-here');

// Store token with custom expiration (2 hours)
credentialManager.setToken('jwt-token-here', 7200);
```

### Retrieving a token

```javascript
import { credentialManager } from '../utils/credentialManager';

// Get token (returns null if expired)
const token = credentialManager.getToken();

// Use in API requests
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Clearing credentials on logout

```javascript
import { credentialManager } from '../utils/credentialManager';

function handleLogout() {
  credentialManager.clearToken();
  // Additional logout logic...
}
```

### Checking expiration for preemptive refresh

```javascript
import { credentialManager } from '../utils/credentialManager';

function checkAndRefreshToken() {
  const secondsLeft = credentialManager.getSecondsUntilExpiration();
  
  // If token is about to expire in less than 5 minutes, refresh it
  if (secondsLeft !== null && secondsLeft < 300) {
    // Call refresh token API
  }
}
```

## Integration with Auth Context

```javascript
// In AuthContext.jsx

useEffect(() => {
  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      // Use credential manager instead of direct localStorage access
      const token = credentialManager.getToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Token is valid, verify with the server if needed
      // ...
      
      setIsAuthenticated(true);
    } catch (err) {
      logger.error('Error verifying authentication', err);
      setIsAuthenticated(false);
      setUser(null);
      credentialManager.clearToken();
    } finally {
      setIsLoading(false);
    }
  };
  
  verifyAuth();
}, []);
```

## Security Considerations

- This utility only uses localStorage, which may not be suitable for high-security applications
- For increased security, consider implementing refresh tokens
- Consider encrypting the token before storing (though this provides minimal additional security in a browser environment)