import { useEffect, useRef } from 'react';
import { httpClient } from '@/api/httpBase';

/**
 * Hook for managing request cancellation
 * @param requestIds Array of request IDs to cancel on unmount
 */
export function useRequestCancellation(requestIds: string[] = []) {
  // Store request IDs in a ref to avoid re-renders
  const requestIdsRef = useRef<string[]>(requestIds);
  
  // Update ref when requestIds change
  useEffect(() => {
    requestIdsRef.current = requestIds;
  }, [requestIds]);
  
  // Cancel requests on unmount
  useEffect(() => {
    return () => {
      // Cancel all requests in the ref
      requestIdsRef.current.forEach(requestId => {
        httpClient.cancelRequest(requestId);
      });
    };
  }, []);
  
  /**
   * Generate a unique request ID
   * @param prefix Optional prefix for the request ID
   * @returns Unique request ID
   */
  const generateRequestId = (prefix: string = 'request'): string => {
    const id = `${prefix}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    requestIdsRef.current.push(id);
    return id;
  };
  
  /**
   * Cancel a specific request
   * @param requestId The request ID to cancel
   */
  const cancelRequest = (requestId: string): void => {
    httpClient.cancelRequest(requestId);
    requestIdsRef.current = requestIdsRef.current.filter(id => id !== requestId);
  };
  
  /**
   * Cancel all tracked requests
   */
  const cancelAllRequests = (): void => {
    requestIdsRef.current.forEach(requestId => {
      httpClient.cancelRequest(requestId);
    });
    requestIdsRef.current = [];
  };
  
  return {
    generateRequestId,
    cancelRequest,
    cancelAllRequests
  };
}

export default useRequestCancellation;
