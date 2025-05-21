import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  history: [],
  isLoading: false,
  error: null
};

// Create slice
const analysisHistorySlice = createSlice({
  name: 'analysisHistory',
  initialState,
  reducers: {
    saveAnalysis: (state, action) => {
      // Add a new analysis to history with timestamp
      const newAnalysis = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      
      state.history.unshift(newAnalysis); // Add to beginning of array
      
      // Keep only the most recent 20 analyses
      if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
      }
      
      // Also save to localStorage for persistence
      try {
        const existingHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        const updatedHistory = [newAnalysis, ...existingHistory].slice(0, 20);
        localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save analysis to localStorage:', error);
      }
    },
    
    loadHistoryFromStorage: (state) => {
      try {
        const savedHistory = localStorage.getItem('analysisHistory');
        if (savedHistory) {
          state.history = JSON.parse(savedHistory);
        }
      } catch (error) {
        console.error('Failed to load analysis history from localStorage:', error);
        state.error = 'Failed to load saved analyses';
      }
    },
    
    deleteAnalysis: (state, action) => {
      const analysisId = action.payload;
      state.history = state.history.filter(item => item.id !== analysisId);
      
      // Update localStorage
      try {
        const updatedHistory = state.history;
        localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to update localStorage after deletion:', error);
      }
    },
    
    clearHistory: (state) => {
      state.history = [];
      try {
        localStorage.removeItem('analysisHistory');
      } catch (error) {
        console.error('Failed to clear analysis history from localStorage:', error);
      }
    }
  }
});

export const { 
  saveAnalysis, 
  loadHistoryFromStorage, 
  deleteAnalysis, 
  clearHistory 
} = analysisHistorySlice.actions;

export default analysisHistorySlice.reducer; 