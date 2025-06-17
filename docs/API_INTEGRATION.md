# API Integration Documentation

This document outlines the API integration architecture for the DRC App Frontend. It provides guidelines for working with API endpoints and explains the key components used for handling API requests.

## Table of Contents

1. [API Configuration](#api-configuration)
2. [API Service](#api-service)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Hooks](#hooks)
6. [Offline Support](#offline-support)
7. [Monitoring and Diagnostics](#monitoring-and-diagnostics)

## API Configuration

API endpoints are centralized in `/src/constants/apiConfig.js` to ensure consistency across the application.

```javascript
// Base API URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://34.30.198.6:8080';

// API version path
const API_VERSION = '/api/v1';

// Full API base path
const API_PATH = `${API_BASE_URL}${API_VERSION}`;

// Object containing all API endpoints organized by resource
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_PATH}/auth/login`,
    REGISTER: `${API_PATH}/auth/register`,
    // ...
  },
  
  // Client endpoints
  CLIENTS: {
    BASE: `${API_PATH}/clients`,
    GET_ALL: `${API_PATH}/clients`,
    GET_BY_ID: (id) => `${API_PATH}/clients/${id}`,
    REGISTER_HOTEL_GUEST: `${API_PATH}/clients/register-hotel-guest`,
    // ...
  },
  
  // Establishment endpoints
  ESTABLISHMENTS: {
    BASE: `${API_PATH}/establishments`,
    // ...
  },
  
  // Health check endpoint for monitoring
  HEALTH: `${API_BASE_URL}/health`,
};
```

## API Service

The API service (`/src/services/apiService.js`) provides methods for making API requests with consistent error handling, retries, and monitoring.

Key features:
- Automatic token inclusion from localStorage
- CORS error detection and handling
- Request retries with exponential backoff
- Response parsing and error formatting
- Support for various HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Request timeout handling

Example usage:

```javascript
import apiService from '../services/apiService';

// Make a GET request
const response = await apiService.get('/api/v1/clients');

// Make a POST request
const response = await apiService.post('/api/v1/clients', clientData);
```

## Authentication

Authentication is managed through the Authentication Context (`/src/context/AuthContext.jsx`). It provides:

- Login/logout functionality
- Token storage and verification
- User state management
- Protected routes

Example usage:

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, login, logout, user } = useAuth();
  
  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.success) {
      // Redirect or show success
    }
  };
  
  return (
    // Component JSX
  );
}
```

## Error Handling

Error handling is centralized in these key components:

1. **Error Monitoring** (`/src/utils/errorMonitoring.js`): Captures and categorizes errors, especially focusing on CORS issues.

2. **Error Boundary** (`/src/components/error/ErrorBoundary.jsx`): React component for catching and displaying errors.

3. **API Error Handler** (`/src/utils/errorHandler.js`): Utility for parsing and formatting API errors.

## Hooks

Custom hooks simplify API integration in components:

### useApi Hook

```javascript
import useApi from '../hooks/useApi';

function ClientList() {
  const { get, isLoading, error, data } = useApi();
  
  useEffect(() => {
    get(API_ENDPOINTS.CLIENTS.GET_ALL);
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    // Render client list using data
  );
}
```

## Offline Support

The application includes offline support through:

1. **Request Queueing**: Requests made while offline are queued and processed when connection is restored.

2. **Connection Status Monitoring**: A component that displays connection status and notifies users when offline.

3. **Local Storage Caching**: Critical data is cached locally for offline access.

## Monitoring and Diagnostics

The application includes comprehensive API diagnostics and monitoring:

1. **API Diagnostics Component** (`/src/components/admin/ApiDiagnostics.jsx`): Admin-only component for diagnosing API and CORS issues.

2. **Logger** (`/src/utils/logger.js`): Consistent logging across the application.

3. **Health Checks**: Regular health checks to verify API connectivity.

Example of running a manual CORS test:

```javascript
const corsTestResult = await apiService.testCorsConfig(API_ENDPOINTS.BASE_URL);
console.log(corsTestResult);
```

## Best Practices

When working with the API:

1. **Always use the centralized configuration**: Import endpoints from `apiConfig.js` rather than hardcoding URLs.

2. **Handle loading and error states**: Every API call should have appropriate loading indicators and error handling.

3. **Use the API service**: Don't use `fetch` directly; use the `apiService` for consistent handling.

4. **Implement retry logic for critical operations**: Use the built-in retry mechanism for important operations.

5. **Monitor CORS issues**: Use the diagnostic tools to identify and resolve CORS problems early.