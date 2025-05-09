import { useState, useCallback } from 'react';

/**
 * Hook for handling errors in functional components
 * to be used with ErrorBoundary
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  /**
   * Handle an error by setting it in state
   * This will trigger the error boundary
   */
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else if (typeof error === 'string') {
      setError(new Error(error));
    } else {
      setError(new Error('An unknown error occurred'));
    }
    // Re-throw the error to be caught by the error boundary
    throw error;
  }, []);

  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    resetError
  };
}

export default useErrorHandler;
