import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/api/httpBase';

/**
 * Interface for API context
 */
interface ApiContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  handleSuccess: <T>(data: T, message?: string) => void;
  handleError: (error: ApiError) => void;
  handleFinally: () => void;
}

// Create context with default values
const ApiContext = createContext<ApiContextType | undefined>(undefined);

/**
 * API context provider component
 */
export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Set loading state
   */
  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  /**
   * Handle successful API response
   * @param data The response data
   * @param message Optional success message to display
   */
  const handleSuccess = <T,>(data: T, message?: string) => {
    if (message) {
      toast.success(message);
    }
    return data;
  };

  /**
   * Handle API error
   * @param error The API error
   */
  const handleError = (error: ApiError) => {
    toast.error(error.message || 'An error occurred');
    console.error('API Error:', error);
  };

  /**
   * Handle final API call cleanup
   */
  const handleFinally = () => {
    setIsLoading(false);
  };

  // Context value
  const value: ApiContextType = {
    isLoading,
    setLoading,
    handleSuccess,
    handleError,
    handleFinally
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

/**
 * Hook to use the API context
 */
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
