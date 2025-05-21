import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files';

// Get file data for visualization
export const getFileData = createAsyncThunk(
  'charts/getFileData',
  async (fileId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/${fileId}/data`, config);
      return response.data;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch file data';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  fileData: null,
  chartConfig: {
    type: 'bar',
    datasetLabel: '',
    title: '',
    labels: [],
    datasets: [],
    backgroundColor: [
      'rgba(37, 99, 235, 0.5)',  // blue-600
      'rgba(29, 78, 216, 0.5)',  // blue-700
      'rgba(30, 64, 175, 0.5)',  // blue-800
      'rgba(59, 130, 246, 0.5)', // blue-500
      'rgba(96, 165, 250, 0.5)', // blue-400
      'rgba(147, 197, 253, 0.5)' // blue-300
    ],
    borderColor: [
      'rgba(37, 99, 235, 1)',   // blue-600
      'rgba(29, 78, 216, 1)',   // blue-700
      'rgba(30, 64, 175, 1)',   // blue-800
      'rgba(59, 130, 246, 1)',  // blue-500
      'rgba(96, 165, 250, 1)',  // blue-400
      'rgba(147, 197, 253, 1)'  // blue-300
    ],
  },
  selectedColumns: {
    x: '',
    y: '',
  },
  availableColumns: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Create slice
const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    resetCharts: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setChartType: (state, action) => {
      state.chartConfig.type = action.payload;
    },
    setSelectedColumns: (state, action) => {
      state.selectedColumns = action.payload;
    },
    setChartTitle: (state, action) => {
      state.chartConfig.title = action.payload;
    },
    setDatasetLabel: (state, action) => {
      state.chartConfig.datasetLabel = action.payload;
    },
    generateChartData: (state) => {
      if (!state.fileData || !state.selectedColumns.x || !state.selectedColumns.y) {
        return;
      }

      const { data } = state.fileData;
      const { x, y } = state.selectedColumns;

      // Extract labels (x-axis data)
      const labels = data.map(item => item[x]);
      state.chartConfig.labels = labels;

      // Extract dataset (y-axis data)
      const values = data.map(item => parseFloat(item[y]) || 0);
      
      state.chartConfig.datasets = [
        {
          label: state.chartConfig.datasetLabel || y,
          data: values,
          backgroundColor: state.chartConfig.backgroundColor[0],
          borderColor: state.chartConfig.borderColor[0],
          borderWidth: 1,
        },
      ];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get file data
      .addCase(getFileData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fileData = action.payload;
        state.availableColumns = action.payload.headers || [];
        
        // Reset selected columns when new data is loaded
        state.selectedColumns = {
          x: state.availableColumns[0] || '',
          y: state.availableColumns[1] || '',
        };
      })
      .addCase(getFileData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  resetCharts, 
  setChartType, 
  setSelectedColumns, 
  setChartTitle, 
  setDatasetLabel, 
  generateChartData 
} = chartSlice.actions;
export default chartSlice.reducer;
