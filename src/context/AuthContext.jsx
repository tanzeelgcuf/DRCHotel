import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../constants/apiConfig';
import apiService from '../services/apiService';
import logger from '../utils/logger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check if user is authenticated on mount and token changes
   */
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Optional: Validate token with the server
        // const response = await apiService.get('/api/auth/verify');
        // if (response.success) {
        //   setUser(response.data.user);
        //   setIsAuthenticated(true);
        // } else {
        //   localStorage.removeItem('token');
        //   setIsAuthenticated(false);
        //   setUser(null);
        // }
        
        // For now, just assume the token is valid if it exists
        setIsAuthenticated(true);
      } catch (err) {
        logger.error('Error verifying authentication', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  /**
   * Log in a user
   * @param {string} email - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Result of login attempt
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, { 
        username, 
        password 
      });
      
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUser(userData);
        logger.info('User logged in successfully', { username });
        return { success: true };
      } else {
        setError(response.error || 'Erreur d\'authentification');
        logger.warn('Login failed', { username, error: response.error });
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur d\'authentification';
      setError(errorMsg);
      logger.error('Login error', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result of registration attempt
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success) {
        logger.info('User registered successfully', { username: userData.username });
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Erreur lors de la création du compte');
        logger.warn('Registration failed', { username: userData.username, error: response.error });
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la création du compte';
      setError(errorMsg);
      logger.error('Registration error', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out the current user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    logger.info('User logged out');
  }, []);

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Result of profile update
   */
  const updateProfile = useCallback(async (userData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.put(`${API_ENDPOINTS.USERS}/profile`, userData);
      
      if (response.success) {
        setUser({...user, ...response.data});
        logger.info('User profile updated successfully');
        return { success: true, data: response.data };
      } else {
        logger.warn('Profile update failed', { error: response.error });
        return { success: false, error: response.error };
      }
    } catch (err) {
      logger.error('Profile update error', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Memoize context value to prevent unnecessary renders
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
