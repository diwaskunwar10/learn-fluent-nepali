import { configureStore } from '@reduxjs/toolkit';
import apiReducer from './apiSlice';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    api: apiReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
