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
    const token = localStorage.getItem('token');
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