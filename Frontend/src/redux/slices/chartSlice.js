import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files';

// Get file data for visualization
export const fetchFileData = createAsyncThunk(
  'charts/fetchFileData',
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
  selectedFileId: '',
  chartConfig: {
    type: 'bar',
    datasetLabel: '',
    title: '',
    labels: [],
    datasets: [],
    backgroundColor: [
      'rgba(59, 130, 246, 0.7)',   // blue-500
      'rgba(16, 185, 129, 0.7)',   // emerald-500
      'rgba(239, 68, 68, 0.7)',    // red-500
      'rgba(245, 158, 11, 0.7)',   // amber-500
      'rgba(139, 92, 246, 0.7)',   // purple-500
      'rgba(236, 72, 153, 0.7)',   // pink-500
      'rgba(20, 184, 166, 0.7)',   // teal-500
      'rgba(249, 115, 22, 0.7)',   // orange-500
      'rgba(79, 70, 229, 0.7)',    // indigo-500
      'rgba(6, 182, 212, 0.7)',    // cyan-500
      'rgba(132, 204, 22, 0.7)',   // lime-500
      'rgba(217, 70, 239, 0.7)',   // fuchsia-500
    ],
    borderColor: [
      'rgba(59, 130, 246, 1)',    // blue-500
      'rgba(16, 185, 129, 1)',    // emerald-500
      'rgba(239, 68, 68, 1)',     // red-500
      'rgba(245, 158, 11, 1)',    // amber-500
      'rgba(139, 92, 246, 1)',    // purple-500
      'rgba(236, 72, 153, 1)',    // pink-500
      'rgba(20, 184, 166, 1)',    // teal-500
      'rgba(249, 115, 22, 1)',    // orange-500
      'rgba(79, 70, 229, 1)',     // indigo-500
      'rgba(6, 182, 212, 1)',     // cyan-500
      'rgba(132, 204, 22, 1)',    // lime-500
      'rgba(217, 70, 239, 1)',    // fuchsia-500
    ],
  },
  selectedColumns: {
    x: '',
    y: '',
    z: '',
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
    setSelectedFile: (state, action) => {
      state.selectedFileId = action.payload;
    },
    generateChartData: (state) => {
      if (!state.fileData || !state.fileData.data || !state.fileData.data.length) {
        console.warn('No file data available for chart generation');
        return;
      }

      const { data } = state.fileData;
      const { x, y, z } = state.selectedColumns;

      // Check if we have the required columns
      if (!x || !y) {
        console.warn('Required columns (X and Y) not selected for chart generation');
        
        // Clear datasets to avoid displaying incorrect data
        state.chartConfig.labels = [];
        state.chartConfig.datasets = [];
        return;
      }

      // Ensure columns exist in the data
      if (!data[0].hasOwnProperty(x) || !data[0].hasOwnProperty(y)) {
        console.warn('Selected columns not found in data');
        
        // Clear datasets to avoid displaying incorrect data
        state.chartConfig.labels = [];
        state.chartConfig.datasets = [];
        return;
      }

      // Extract labels (x-axis data)
      const labels = data.map(item => item[x]);
      state.chartConfig.labels = labels;

      // Extract dataset (y-axis data) with robust parsing - supports commas, currency, percents, and parentheses negatives
      const coerceNumber = (val) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return isFinite(val) ? val : 0;
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (typeof val === 'string') {
          let s = val.trim();
          if (s === '' || /^(n\/a|na|null|-)$/i.test(s)) return 0;
          // Handle negatives in parentheses, e.g., (123)
          const negMatch = s.match(/^\((.*)\)$/);
          if (negMatch) s = '-' + negMatch[1];
          // Handle percentage
          const isPercent = /%$/.test(s);
          if (isPercent) s = s.replace(/%$/, '');
          // Remove currency symbols, commas, and spaces
          s = s.replace(/[,$€£₹\s]/g, '');
          const n = Number(s);
          if (!isFinite(n)) return 0;
          return isPercent ? n / 100 : n;
        }
        return 0;
      };
      const values = data.map(item => coerceNumber(item[y]));
      
      if (['bar', 'pie', 'doughnut', 'polarArea'].includes(state.chartConfig.type)) {
        // For chart types that support multiple colors for data points
        state.chartConfig.datasets = [
          {
            label: state.chartConfig.datasetLabel || y,
            data: values,
            backgroundColor: values.map((_, index) => 
              state.chartConfig.backgroundColor[index % state.chartConfig.backgroundColor.length]
            ),
            borderColor: values.map((_, index) => 
              state.chartConfig.borderColor[index % state.chartConfig.borderColor.length]
            ),
            borderWidth: 1,
          },
        ];
      } else {
        // For line, scatter, bubble and other chart types that use a single color per dataset
        state.chartConfig.datasets = [
          {
            label: state.chartConfig.datasetLabel || y,
            data: values,
            backgroundColor: state.chartConfig.backgroundColor[0],
            borderColor: state.chartConfig.borderColor[0],
            borderWidth: 1,
          },
        ];
      }
      
      // Add a second dataset for z values if present (for 3D charts)
      if (z && (state.chartConfig.type === '3d-scatter' || state.chartConfig.type === '3d-surface')) {
        // Verify Z column exists in data
        if (data[0].hasOwnProperty(z)) {
          const zValues = data.map(item => coerceNumber(item[z]));
          state.chartConfig.datasets.push({
            label: z,
            data: zValues,
            backgroundColor: state.chartConfig.backgroundColor[1],
            borderColor: state.chartConfig.borderColor[1],
            borderWidth: 1,
          });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get file data
      .addCase(fetchFileData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fileData = action.payload;
        state.availableColumns = action.payload.headers || [];
        
        // Reset selected columns when new data is loaded
        state.selectedColumns = {
          x: state.availableColumns[0] || '',
          y: state.availableColumns[1] || '',
          z: state.availableColumns[2] || '',
        };
      })
      .addCase(fetchFileData.rejected, (state, action) => {
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
  setSelectedFile,
  generateChartData 
} = chartSlice.actions;
export default chartSlice.reducer;
