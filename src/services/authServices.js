// services/authService.js
import { httpService } from './httpClient';
import { apiConfig } from '../config/api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
    this.USER_KEY = 'user';
  }

  // Login user
  async login(credentials) {
    try {
      const response = await httpService.post(
        apiConfig.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      if (response.token) {
        // Store authentication data
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        
        if (response.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await httpService.post(
        apiConfig.ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if token exists
      if (this.getToken()) {
        await httpService.post(apiConfig.ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await httpService.post(
        apiConfig.ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );

      if (response.token) {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        
        if (response.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Validate current token
  async validateToken() {
    try {
      const response = await httpService.get(apiConfig.ENDPOINTS.AUTH.VALIDATE_TOKEN);
      return response.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await httpService.get(apiConfig.ENDPOINTS.AUTH.PROFILE);
      
      // Update stored user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check user role
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getUser();
    return roles.includes(user?.role);
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Initialize auth state (call on app startup)
  async initializeAuth() {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    try {
      // Validate existing token
      const isValid = await this.validateToken();
      
      if (!isValid) {
        // Try to refresh token
        await this.refreshToken();
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearAuthData();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Auth context helpers for React
export const useAuthContext = () => {
  return {
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUser(),
    token: authService.getToken(),
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService)
  };
};

export default authService;