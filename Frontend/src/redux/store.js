import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import fileReducer from './slices/fileSlice';
import chartReducer from './slices/chartSlice';
import analysisHistoryReducer, { loadHistoryFromStorage } from './slices/analysisHistorySlice';

// Load initial analysis history from localStorage if available
const loadInitialAnalysisHistory = () => {
  try {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      return { history: JSON.parse(savedHistory), isLoading: false, error: null };
    }
  } catch (error) {
    console.error('Failed to load analysis history from localStorage:', error);
  }
  return undefined; // use default initial state from the slice
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
    charts: chartReducer,
    analysisHistory: analysisHistoryReducer,
  },
  preloadedState: {
    analysisHistory: loadInitialAnalysisHistory()
  }
});

export default store;
