import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, CancelTokenSource } from 'axios';
import { cacheManager, CacheOptions } from './cacheManager';
// import { toast } from '@/components/ui/sonner';
import { toast } from 'react-hot-toast';
// Define the base API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/v1';

// Map to store active request cancel tokens
const cancelTokens = new Map<string, CancelTokenSource>();

// Flag to prevent multiple redirects
let isRedirecting = false;

/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Interface for API error
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Interface for API callbacks
 */
export interface ApiCallbacks<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onFinally?: () => void;
}

/**
 * Interface for request options
 */
export interface RequestOptions extends AxiosRequestConfig {
  /** Cache options */
  cache?: CacheOptions;
  /** Request ID for cancellation */
  requestId?: string;
  /** Parameters for the request */
  params?: any;
}

/**
 * HTTP client for making API requests
 */
class HttpClient {
  private client: AxiosInstance;

  constructor() {
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Get user data from localStorage
        const userData = localStorage.getItem('nepali_user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.token && user.tokenType) {
              config.headers.Authorization = `${user.tokenType} ${user.token}`;
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle specific error cases
        if (error.response?.status === 401 && !isRedirecting) {
          // Set flag to prevent multiple redirects
          isRedirecting = true;

          // Unauthorized - clear user data but keep tenant_slug
          localStorage.removeItem('nepali_user');

          // Show simple toast message for 5 seconds
          toast.dismiss(); // Clears any existing toasts
          toast.error('🔒 Token expired. Please login again.');

          // Get tenant slug if available
          const tenantSlug = localStorage.getItem('nepali_app_client');

          // Cancel all pending requests to prevent more 401 errors
          this.clearActiveRequests();

          // Use setTimeout to ensure the toast is displayed before redirect
          setTimeout(() => {
            // Redirect to login page with tenant slug if available
            if (tenantSlug) {
              window.location.href = `/${tenantSlug}/login`;
            } else {
              window.location.href = '/';
            }
          }, 100);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   * @param url The URL to request
   * @param config Optional request options
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  async get<T = any>(
    url: string,
    config?: RequestOptions,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    // Generate a unique request ID if not provided
    const requestId = config?.requestId || `get:${url}:${Date.now()}`;

    // Cancel any existing request with the same ID
    this.cancelRequest(requestId);

    // Create a new cancel token
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokens.set(requestId, cancelTokenSource);

    // Check cache if caching is enabled
    if (config?.cache && !config.cache.bypass) {
      const cacheKey = config.cache.key || cacheManager.generateKey(url, config.params);
      const cachedData = cacheManager.get<T>(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);

        // Clean up cancel token
        cancelTokens.delete(requestId);

        // Call success callback with cached data
        if (callbacks?.onSuccess) {
          callbacks.onSuccess(cachedData);
        }

        // Call finally callback
        if (callbacks?.onFinally) {
          callbacks.onFinally();
        }

        return cachedData;
      }
    }

    try {
      // Add cancel token to request config
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: cancelTokenSource.token
      };

      const response: AxiosResponse<T> = await this.client.get(url, requestConfig);

      // Cache the response if caching is enabled
      if (config?.cache && !config.cache.bypass) {
        const cacheKey = config.cache.key || cacheManager.generateKey(url, config.params);
        cacheManager.set<T>(cacheKey, response.data, config.cache.ttl);
      }

      // Clean up cancel token
      cancelTokens.delete(requestId);

      if (callbacks?.onSuccess) {
        callbacks.onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      // Don't handle cancellation errors
      if (axios.isCancel(error)) {
        console.log(`Request cancelled: ${error.message}`);
        throw error;
      }

      const apiError = this.handleError(error);

      if (callbacks?.onError) {
        callbacks.onError(apiError);
      }

      throw apiError;
    } finally {
      if (callbacks?.onFinally) {
        callbacks.onFinally();
      }
    }
  }

  /**
   * Cancel a request by ID
   * @param requestId The request ID
   */
  cancelRequest(requestId: string): void {
    const cancelTokenSource = cancelTokens.get(requestId);

    if (cancelTokenSource) {
      cancelTokenSource.cancel(`Request ${requestId} cancelled`);
      cancelTokens.delete(requestId);
    }
  }

  /**
   * Make a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional request options
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestOptions,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    // Generate a unique request ID if not provided
    const requestId = config?.requestId || `post:${url}:${Date.now()}`;

    // Cancel any existing request with the same ID
    this.cancelRequest(requestId);

    // Create a new cancel token
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokens.set(requestId, cancelTokenSource);

    try {
      // Add cancel token to request config
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: cancelTokenSource.token
      };

      const response: AxiosResponse<T> = await this.client.post(url, data, requestConfig);

      // Clean up cancel token
      cancelTokens.delete(requestId);

      if (callbacks?.onSuccess) {
        callbacks.onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      // Don't handle cancellation errors
      if (axios.isCancel(error)) {
        console.log(`Request cancelled: ${error.message}`);
        throw error;
      }

      const apiError = this.handleError(error);

      if (callbacks?.onError) {
        callbacks.onError(apiError);
      }

      throw apiError;
    } finally {
      if (callbacks?.onFinally) {
        callbacks.onFinally();
      }
    }
  }

  /**
   * Make a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional request options
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestOptions,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    // Generate a unique request ID if not provided
    const requestId = config?.requestId || `put:${url}:${Date.now()}`;

    // Cancel any existing request with the same ID
    this.cancelRequest(requestId);

    // Create a new cancel token
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokens.set(requestId, cancelTokenSource);

    try {
      // Add cancel token to request config
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: cancelTokenSource.token
      };

      const response: AxiosResponse<T> = await this.client.put(url, data, requestConfig);

      // Clean up cancel token
      cancelTokens.delete(requestId);

      if (callbacks?.onSuccess) {
        callbacks.onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      // Don't handle cancellation errors
      if (axios.isCancel(error)) {
        console.log(`Request cancelled: ${error.message}`);
        throw error;
      }

      const apiError = this.handleError(error);

      if (callbacks?.onError) {
        callbacks.onError(apiError);
      }

      throw apiError;
    } finally {
      if (callbacks?.onFinally) {
        callbacks.onFinally();
      }
    }
  }

  /**
   * Make a DELETE request
   * @param url The URL to request
   * @param config Optional request options
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  async delete<T = any>(
    url: string,
    config?: RequestOptions,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    // Generate a unique request ID if not provided
    const requestId = config?.requestId || `delete:${url}:${Date.now()}`;

    // Cancel any existing request with the same ID
    this.cancelRequest(requestId);

    // Create a new cancel token
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokens.set(requestId, cancelTokenSource);

    try {
      // Add cancel token to request config
      const requestConfig: AxiosRequestConfig = {
        ...config,
        cancelToken: cancelTokenSource.token
      };

      const response: AxiosResponse<T> = await this.client.delete(url, requestConfig);

      // Clean up cancel token
      cancelTokens.delete(requestId);

      if (callbacks?.onSuccess) {
        callbacks.onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      // Don't handle cancellation errors
      if (axios.isCancel(error)) {
        console.log(`Request cancelled: ${error.message}`);
        throw error;
      }

      const apiError = this.handleError(error);

      if (callbacks?.onError) {
        callbacks.onError(apiError);
      }

      throw apiError;
    } finally {
      if (callbacks?.onFinally) {
        callbacks.onFinally();
      }
    }
  }

  /**
   * Handle API errors
   * @param error The error to handle
   * @returns Standardized API error
   */
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as any;
      return {
        message: responseData?.detail || axiosError.message || 'An error occurred',
        status: axiosError.response?.status,
        data: responseData
      };
    }
    return {
      message: error.message || 'An unknown error occurred'
    };
  }

  /**
   * Clear all active requests
   */
  clearActiveRequests(): void {
    for (const [requestId, cancelTokenSource] of cancelTokens.entries()) {
      cancelTokenSource.cancel(`Request ${requestId} cancelled due to cleanup`);
      cancelTokens.delete(requestId);
    }
  }

  /**
   * Clear cache
   * @param key Optional cache key to clear specific entry
   */
  clearCache(key?: string): void {
    if (key) {
      cacheManager.delete(key);
    } else {
      cacheManager.clear();
    }
  }

  /**
   * Reset the redirecting flag
   * This can be used after a successful login to allow 401 handling again
   */
  resetRedirectFlag(): void {
    isRedirecting = false;
  }
}

// Export a singleton instance
export const httpClient = new HttpClient();
