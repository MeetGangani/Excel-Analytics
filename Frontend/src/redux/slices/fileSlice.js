import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files';

// Get all files
export const getFiles = createAsyncThunk(
  'files/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch files';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Upload files
export const uploadFiles = createAsyncThunk(
  'files/upload',
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/upload`, formData, config);
      return response.data;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to upload files';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a file
export const deleteFile = createAsyncThunk(
  'files/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to delete file';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Analyze an existing file
export const analyzeFile = createAsyncThunk(
  'files/analyze',
  async ({ fileId, customPrompt = '', analysisType = 'comprehensive' }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const data = { customPrompt, analysisType };
      const response = await axios.post(
        `${API_URL}/${fileId}/analyze`, 
        data,
        config
      );
      return { fileId, analysis: response.data };
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to analyze file';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Analyze a newly uploaded file
export const analyzeUploadedFile = createAsyncThunk(
  'files/analyzeUpload',
  async ({ formData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/analyze/upload`, 
        formData,
        config
      );
      return response.data;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to analyze uploaded file';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  files: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  currentAnalysis: null,
  isAnalyzing: false,
  uploadSuccess: false,
};

// Create slice
const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.uploadSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get files
      .addCase(getFiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.files = action.payload.files;
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upload files
      .addCase(uploadFiles.pending, (state) => {
        state.isLoading = true;
        state.uploadSuccess = false;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.uploadSuccess = true;
        state.files = [...action.payload.files, ...state.files];
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.uploadSuccess = false;
      })
      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.files = state.files.filter((file) => file.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Analyze file
      .addCase(analyzeFile.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(analyzeFile.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.isSuccess = true;
        state.currentAnalysis = action.payload.analysis;
      })
      .addCase(analyzeFile.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Analyze uploaded file
      .addCase(analyzeUploadedFile.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(analyzeUploadedFile.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.isSuccess = true;
        state.currentAnalysis = action.payload;
      })
      .addCase(analyzeUploadedFile.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = fileSlice.actions;
export default fileSlice.reducer; 