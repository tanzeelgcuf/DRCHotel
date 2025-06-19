// src/contexts/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

// Auth states
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth actions
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case authActions.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case authActions.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const isInitialized = await authService.initializeAuth();
      
      if (isInitialized) {
        const user = authService.getUser();
        const token = authService.getToken();
        
        dispatch({
          type: authActions.LOGIN_SUCCESS,
          payload: { user, token }
        });
      } else {
        dispatch({ type: authActions.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      dispatch({ type: authActions.CLEAR_ERROR });

      const response = await authService.login(credentials);
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });

      toast.success(`Welcome back, ${response.user.firstName}!`);
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      dispatch({ type: authActions.CLEAR_ERROR });

      const response = await authService.register(userData);
      
      toast.success('Registration successful! Please check your email for activation.');
      dispatch({ type: authActions.SET_LOADING, payload: false });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: authActions.LOGOUT });
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch({ type: authActions.LOGOUT });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.getProfile();
      dispatch({
        type: authActions.UPDATE_USER,
        payload: updatedUser
      });
      
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  // Helper functions
  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles) => {
    return authService.hasAnyRole(roles);
  };

  const contextValue = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    
    // Helpers
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;