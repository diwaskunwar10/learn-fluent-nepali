import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Interface for API state
 */
export interface ApiState {
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  data: Record<string, any>;
}

/**
 * Initial state for API slice
 */
const initialState: ApiState = {
  loading: {},
  errors: {},
  data: {}
};

/**
 * API slice for Redux store
 */
const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    /**
     * Set loading state for a specific API request
     */
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      state.loading[key] = loading;
    },
    
    /**
     * Set error state for a specific API request
     */
    setError: (state, action: PayloadAction<{ key: string; error: string | null }>) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
    
    /**
     * Set data for a specific API request
     */
    setData: (state, action: PayloadAction<{ key: string; data: any }>) => {
      const { key, data } = action.payload;
      state.data[key] = data;
    },
    
    /**
     * Clear state for a specific API request
     */
    clearApiState: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state.loading[key];
      delete state.errors[key];
      delete state.data[key];
    },
    
    /**
     * Reset all API state
     */
    resetApiState: (state) => {
      state.loading = {};
      state.errors = {};
      state.data = {};
    }
  }
});

// Export actions
export const { setLoading, setError, setData, clearApiState, resetApiState } = apiSlice.actions;

// Export reducer
export default apiSlice.reducer;
