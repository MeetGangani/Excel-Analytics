import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js/auto';

const Chart2D = ({ fileData, filename = 'Data File' }) => {
  const [selectedChart, setSelectedChart] = useState('bar');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const [chartTitle, setChartTitle] = useState(`${filename} Visualization`);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Set available columns from file data
  useEffect(() => {
    if (fileData && fileData.data && fileData.data.length > 0) {
      // Get column headers from the first row
      const headers = Object.keys(fileData.data[0]);
      setAvailableColumns(headers);
      
      // Set default X and Y axes
      if (headers.length >= 2) {
        setSelectedXAxis(headers[0]);
        setSelectedYAxis(headers[1]);
      }
    }
  }, [fileData]);

  // Create or update chart when settings change
  useEffect(() => {
    if (!chartRef.current || !fileData || !selectedXAxis || !selectedYAxis) return;

    // Clear previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Prepare data
    const chartData = prepareChartData();
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: selectedChart,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!chartTitle,
            text: chartTitle,
            font: {
              size: 16,
            }
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: selectedYAxis
            }
          },
          x: {
            title: {
              display: true,
              text: selectedXAxis
            }
          }
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [fileData, selectedChart, selectedXAxis, selectedYAxis, chartTitle]);

  const prepareChartData = () => {
    if (!fileData || !fileData.data || !selectedXAxis || !selectedYAxis) {
      return { labels: [], datasets: [] };
    }

    // Extract data points
    const labels = fileData.data.map(row => row[selectedXAxis]);
    const dataPoints = fileData.data.map(row => {
      const val = row[selectedYAxis];
      return typeof val === 'number' ? val : isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    });

    // Generate colors based on chart type
    const colors = generateColors(dataPoints.length);

    // Create dataset configuration
    let datasets = [];
    
    if (selectedChart === 'bar' || selectedChart === 'line') {
      datasets = [{
        label: selectedYAxis,
        data: dataPoints,
        backgroundColor: selectedChart === 'line' ? 'rgba(75, 192, 192, 0.2)' : colors,
        borderColor: selectedChart === 'line' ? 'rgba(75, 192, 192, 1)' : colors.map(c => c.replace('0.6', '1')),
        borderWidth: 1,
        tension: selectedChart === 'line' ? 0.3 : 0 // Smooth curve for line charts
      }];
    } else if (selectedChart === 'pie' || selectedChart === 'doughnut') {
      datasets = [{
        label: selectedYAxis,
        data: dataPoints,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6', '1')),
        borderWidth: 1
      }];
    } else if (selectedChart === 'scatter') {
      // Convert data for scatter plot (need x, y format)
      const scatterData = fileData.data.map(row => {
        return {
          x: typeof row[selectedXAxis] === 'number' ? row[selectedXAxis] : parseFloat(row[selectedXAxis]) || 0,
          y: typeof row[selectedYAxis] === 'number' ? row[selectedYAxis] : parseFloat(row[selectedYAxis]) || 0
        };
      });
      
      datasets = [{
        label: `${selectedXAxis} vs ${selectedYAxis}`,
        data: scatterData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7
      }];
    }

    return { labels, datasets };
  };

  const generateColors = (count) => {
    const baseColors = [
      'rgba(75, 192, 192, 0.6)', // Teal
      'rgba(54, 162, 235, 0.6)', // Blue
      'rgba(255, 99, 132, 0.6)', // Pink
      'rgba(255, 206, 86, 0.6)', // Yellow
      'rgba(153, 102, 255, 0.6)', // Purple
      'rgba(255, 159, 64, 0.6)', // Orange
      'rgba(199, 199, 199, 0.6)', // Gray
    ];
    
    // If we have fewer colors than needed, repeat them
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  };

  const handleExportChart = () => {
    if (!chartRef.current) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `${chartTitle || 'chart'}.png`;
    link.href = chartRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Create 2D Visualization</h3>
        <p className="mt-1 text-sm text-gray-600">
          Select chart type and data to generate a visualization
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="md:col-span-1 space-y-4">
          {/* Chart Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type
            </label>
            <select
              value={selectedChart}
              onChange={e => setSelectedChart(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
          
          {/* X-Axis Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X-Axis Data
            </label>
            <select
              value={selectedXAxis}
              onChange={e => setSelectedXAxis(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={availableColumns.length === 0}
            >
              {availableColumns.length === 0 ? (
                <option value="">No columns available</option>
              ) : (
                availableColumns.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))
              )}
            </select>
          </div>
          
          {/* Y-Axis Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y-Axis Data
            </label>
            <select
              value={selectedYAxis}
              onChange={e => setSelectedYAxis(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={availableColumns.length === 0}
            >
              {availableColumns.length === 0 ? (
                <option value="">No columns available</option>
              ) : (
                availableColumns.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))
              )}
            </select>
          </div>
          
          {/* Chart Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={e => setChartTitle(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter chart title"
            />
          </div>
          
          {/* Export Button */}
          <button
            onClick={handleExportChart}
            disabled={!chartInstance.current}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export Chart as PNG
          </button>
        </div>
        
        {/* Chart Display Area */}
        <div className="md:col-span-3 bg-white p-4 rounded-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
          {fileData && selectedXAxis && selectedYAxis ? (
            <div className="w-full h-[400px]">
              <canvas ref={chartRef}></canvas>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium">
                {availableColumns.length === 0 
                  ? 'No data available for visualization' 
                  : 'Select column data to generate chart'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Chart2D.propTypes = {
  fileData: PropTypes.shape({
    data: PropTypes.array.isRequired,
  }),
  filename: PropTypes.string,
};

export default Chart2D; 