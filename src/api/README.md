# API Layer Documentation

This document provides an overview of the centralized API layer for the Learn Fluent Nepali application.

## Overview

The API layer is designed to provide a consistent and maintainable way to interact with the backend API. It consists of:

1. **httpBase.ts**: A centralized HTTP client that handles all API requests
2. **baseService.ts**: A base service class that all service classes extend
3. **ApiContext.tsx**: A React context for managing API state and callbacks
4. **Service classes**: Specialized service classes for different API endpoints
5. **Redux integration**: Redux store and hooks for managing API state
6. **Error boundary**: Component for catching and displaying errors
7. **Request caching**: Cache manager for improving performance
8. **Request cancellation**: Utilities for cancelling requests
9. **Unit tests**: Tests for the API layer

## HTTP Client (httpBase.ts)

The HTTP client is built on top of Axios and provides:

- Automatic authentication token handling
- Consistent error handling
- Request/response interceptors
- Callback support for success, error, and finally operations
- Request caching for improved performance
- Request cancellation to prevent race conditions and memory leaks

### Usage

```typescript
import { httpClient, ApiCallbacks, RequestOptions } from './httpBase';

// Simple GET request
const data = await httpClient.get('/endpoint');

// GET request with callbacks
const callbacks: ApiCallbacks = {
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
  onFinally: () => console.log('Request completed')
};

const data = await httpClient.get('/endpoint', undefined, callbacks);

// GET request with caching
const options: RequestOptions = {
  cache: {
    key: 'my-cache-key',
    ttl: 5 * 60 * 1000, // 5 minutes
    bypass: false // Set to true to bypass cache
  }
};

const data = await httpClient.get('/endpoint', options, callbacks);

// GET request with cancellation
const requestId = 'my-request-id';
const options: RequestOptions = {
  requestId
};

const data = await httpClient.get('/endpoint', options, callbacks);

// Cancel a request
httpClient.cancelRequest(requestId);

// Clear cache
httpClient.clearCache('my-cache-key');
```

## Base Service (baseService.ts)

The base service class provides a foundation for all service classes. It wraps the HTTP client methods and provides a consistent interface for making API requests.

### Usage

```typescript
import { BaseService } from './baseService';

class MyService extends BaseService {
  async getData() {
    return this.get('/endpoint');
  }
}
```

## API Context (ApiContext.tsx)

The API context provides global state and callbacks for API operations. It includes:

- Loading state management
- Success and error handling
- Toast notifications

### Usage

```tsx
import { useApi } from '@/context/ApiContext';

function MyComponent() {
  const { isLoading, handleSuccess, handleError, handleFinally } = useApi();

  const fetchData = async () => {
    try {
      const data = await myService.getData();
      handleSuccess(data, 'Data loaded successfully');
    } catch (error) {
      handleError(error);
    } finally {
      handleFinally();
    }
  };

  return (
    <div>
      {isLoading ? 'Loading...' : 'Data loaded'}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}
```

## Service Classes

Each service class is responsible for a specific domain of the API:

- **authService.ts**: Authentication operations
- **fileService.ts**: File operations
- **taskService.ts**: Task operations
- etc.

### Example: Auth Service

```typescript
import { BaseService } from './baseService';

class AuthService extends BaseService {
  async login(username, password, tenantSlug) {
    // Implementation
  }
}

export const authService = new AuthService();
```

## Best Practices

1. **Use service classes**: Create a service class for each domain of the API
2. **Use the API context**: Use the API context for global state and callbacks
3. **Handle errors**: Always handle errors in your components
4. **Use TypeScript interfaces**: Define interfaces for request and response data
5. **Use callbacks**: Use callbacks for success, error, and finally operations

## Error Boundary

The error boundary component catches JavaScript errors in child components and displays a fallback UI instead of crashing the whole app.

### Usage

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';
import useErrorHandler from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const doSomething = () => {
    try {
      // Do something that might throw an error
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <ErrorBoundary>
      <div>
        <button onClick={doSomething}>Do Something</button>
      </div>
    </ErrorBoundary>
  );
}
```

## Request Caching

The cache manager provides a way to cache API responses for improved performance.

### Usage

```typescript
import { cacheManager } from '@/api/cacheManager';

// Set data in cache
cacheManager.set('my-cache-key', data, 5 * 60 * 1000); // 5 minutes TTL

// Get data from cache
const data = cacheManager.get('my-cache-key');

// Check if cache has data
const hasData = cacheManager.has('my-cache-key');

// Delete data from cache
cacheManager.delete('my-cache-key');

// Clear all cache
cacheManager.clear();

// Generate a cache key
const cacheKey = cacheManager.generateKey('/endpoint', { param1: 'value1' });
```

## Request Cancellation

The request cancellation utilities provide a way to cancel API requests to prevent race conditions and memory leaks.

### Usage

```tsx
import { useRequestCancellation } from '@/hooks/useRequestCancellation';

function MyComponent() {
  const { generateRequestId, cancelRequest, cancelAllRequests } = useRequestCancellation();

  useEffect(() => {
    const fetchData = async () => {
      const requestId = generateRequestId('myRequest');

      try {
        await httpClient.get('/endpoint', { requestId });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();

    // Cancel all requests on unmount
    return () => {
      cancelAllRequests();
    };
  }, []);

  return (
    <div>
      <button onClick={cancelAllRequests}>Cancel All Requests</button>
    </div>
  );
}
```

## Redux Integration

The API layer includes Redux integration for managing API state. It consists of:

1. **apiSlice.ts**: Redux slice for API state
2. **store.ts**: Redux store configuration
3. **useReduxApi.ts**: Hook for using Redux with API calls

### Usage

```typescript
import { useReduxApi } from '@/hooks/useReduxApi';
import { taskService } from '@/api/taskService';

function MyComponent() {
  const { createApiCallbacks, startLoading, isLoading, getError, getData } = useReduxApi();

  // API key for this component
  const API_KEY = 'myComponent';

  // Get data from Redux store
  const data = getData(API_KEY);
  const loading = isLoading(API_KEY);
  const error = getError(API_KEY);

  const fetchData = async () => {
    try {
      // Start loading
      startLoading(API_KEY);

      // Create callbacks for Redux integration
      const callbacks = createApiCallbacks(API_KEY);

      // Fetch data
      await taskService.fetchTaskSet('123', { include_tasks: true }, callbacks);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
}
```

## Unit Tests

The API layer includes unit tests for:

1. **httpBase.ts**: Tests for the HTTP client
2. **taskService.ts**: Tests for the task service

### Running Tests

```bash
npm test
```

## Migration Guide

If you're migrating from the old API approach to the new centralized API layer:

1. Import the service class instead of individual functions
2. Use the service class methods instead of direct fetch calls
3. Use the API context for global state and callbacks

### Before:

```typescript
import { loginUser } from '@/api/authService';

const handleLogin = async () => {
  const result = await loginUser(username, password, tenantSlug);
  // Handle result
};
```

### After with API Context:

```typescript
import { authService } from '@/api/authService';
import { useApi } from '@/context/ApiContext';

const { handleSuccess, handleError } = useApi();

const handleLogin = async () => {
  try {
    const result = await authService.loginUser(username, password, tenantSlug);
    handleSuccess(result, 'Login successful');
  } catch (error) {
    handleError(error);
  }
};
```

### After with Redux:

```typescript
import { authService } from '@/api/authService';
import { useReduxApi } from '@/hooks/useReduxApi';

function LoginComponent() {
  const { createApiCallbacks, startLoading, isLoading, getError, getData } = useReduxApi();

  const API_KEY = 'login';
  const loading = isLoading(API_KEY);
  const error = getError(API_KEY);
  const data = getData(API_KEY);

  const handleLogin = async () => {
    try {
      startLoading(API_KEY);
      const callbacks = createApiCallbacks(API_KEY);
      await authService.loginUser(username, password, tenantSlug, callbacks);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Login successful!</p>}
      <button onClick={handleLogin} disabled={loading}>Login</button>
    </div>
  );
}
```
