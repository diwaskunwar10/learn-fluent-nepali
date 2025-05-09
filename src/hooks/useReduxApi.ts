import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, setData } from '../store/apiSlice';
import { ApiCallbacks } from '../api/httpBase';

/**
 * Hook for using Redux with API calls
 */
export const useReduxApi = () => {
  const dispatch = useDispatch<AppDispatch>();
  const apiState = useSelector((state: RootState) => state.api);

  /**
   * Create API callbacks for Redux integration
   * @param key The key to use for storing API state
   * @returns API callbacks for success, error, and finally
   */
  const createApiCallbacks = <T>(key: string): ApiCallbacks<T> => {
    return {
      onSuccess: (data: T) => {
        dispatch(setData({ key, data }));
        dispatch(setError({ key, error: null }));
      },
      onError: (error) => {
        dispatch(setError({ key, error: error.message }));
      },
      onFinally: () => {
        dispatch(setLoading({ key, loading: false }));
      }
    };
  };

  /**
   * Start loading for a specific API request
   * @param key The key to use for storing API state
   */
  const startLoading = (key: string) => {
    dispatch(setLoading({ key, loading: true }));
  };

  /**
   * Get loading state for a specific API request
   * @param key The key to use for storing API state
   * @returns Loading state
   */
  const isLoading = (key: string) => {
    return apiState.loading[key] || false;
  };

  /**
   * Get error state for a specific API request
   * @param key The key to use for storing API state
   * @returns Error state
   */
  const getError = (key: string) => {
    return apiState.errors[key] || null;
  };

  /**
   * Get data for a specific API request
   * @param key The key to use for storing API state
   * @returns Data
   */
  const getData = <T>(key: string): T | null => {
    return apiState.data[key] as T || null;
  };

  return {
    createApiCallbacks,
    startLoading,
    isLoading,
    getError,
    getData
  };
};

// Type-safe hooks for useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector<RootState, T>(selector);
