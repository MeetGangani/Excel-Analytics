import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Plot from 'react-plotly.js';
import * as XLSX from 'xlsx';
import { saveAnalysis } from '../redux/slices/analysisHistorySlice';

// Register the chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartVisualization = ({ onChartCreated }) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const [exportFormat, setExportFormat] = useState('png');
  const [dataFormat, setDataFormat] = useState('xlsx');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showDataExportOptions, setShowDataExportOptions] = useState(false);
  const { chartConfig, fileData, selectedColumns, selectedFileId } = useSelector(state => state.charts);
  const { user } = useSelector(state => state.auth);
  const [chartRendered, setChartRendered] = useState(false);
  
  // Function to sanitize ONLY numeric data (for y-axis values)
  const sanitizeNumericData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(value => {
      // Handle null, undefined, empty string
      if (value === null || value === undefined || value === '') {
        return 0;
      }
      
      // If it's already a number, return it
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      
      // Convert string to number
      if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point and minus sign
        let cleanValue = value.replace(/[^0-9.-]/g, '');
        
        // Handle percentage values (remove % and convert)
        if (value.includes('%')) {
          cleanValue = cleanValue.replace('%', '');
          const numValue = parseFloat(cleanValue);
          return isNaN(numValue) ? 0 : numValue;
        }
        
        const numValue = parseFloat(cleanValue);
        return isNaN(numValue) ? 0 : numValue;
      }
      
      // Fallback to 0 for any other type
      return 0;
    });
  };

  // Function to sanitize labels (x-axis values like customer names)
  const sanitizeLabels = (labels) => {
    if (!labels || !Array.isArray(labels)) return [];
    
    return labels.map(label => {
      // Keep original value if it's already a string
      if (typeof label === 'string') {
        return label.trim(); // Just trim whitespace
      }
      
      // Convert to string if it's not
      return String(label || 'Unknown');
    });
  };

  // Create sanitized chart data
  const getSanitizedChartData = () => {
    if (!chartConfig || !chartConfig.datasets || chartConfig.datasets.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Sanitize labels (x-axis) as strings - DON'T convert to numbers
    const sanitizedLabels = sanitizeLabels(chartConfig.labels);

    // Sanitize only dataset data (y-axis) as numbers
    const sanitizedDatasets = chartConfig.datasets.map(dataset => ({
      ...dataset,
      data: sanitizeNumericData(dataset.data)
    }));

    return {
      labels: sanitizedLabels,
      datasets: sanitizedDatasets
    };
  };

  // Check if we have data to display
  const sanitizedData = getSanitizedChartData();
  const hasData = sanitizedData.datasets.length > 0 && sanitizedData.labels.length > 0;

  // Debug logging to check data
  useEffect(() => {
    if (hasData) {
      console.log('Chart Labels (X-axis):', sanitizedData.labels);
      console.log('Chart Dataset Data (Y-axis):', sanitizedData.datasets[0]?.data);
      console.log('Labels type check:', sanitizedData.labels.map(label => typeof label));
      console.log('Data type check:', sanitizedData.datasets[0]?.data.map(val => typeof val));
    }
  }, [hasData, sanitizedData]);

  // Increment visualization count in localStorage directly
  const incrementLocalVisualizationCount = () => {
    const userId = user?.user?._id || user?._id;
    if (userId) {
      const currentCount = localStorage.getItem(`visualizationCount_${userId}`);
      const newCount = (currentCount ? parseInt(currentCount) : 0) + 1;
      localStorage.setItem(`visualizationCount_${userId}`, newCount.toString());
    }
  };

  // Call onChartCreated callback when a chart is successfully rendered for the first time
  useEffect(() => {
    if (hasData && !chartRendered) {
      setChartRendered(true);
      
      // Increment visualization count in localStorage
      incrementLocalVisualizationCount();
      
      // Call parent callback if provided
      if (onChartCreated) {
        onChartCreated();
      }
    }
  }, [hasData, chartRendered, onChartCreated]);
  
  // Reset chartRendered when the chart type or data changes
  useEffect(() => {
    setChartRendered(false);
  }, [chartConfig.type, chartConfig.datasets]);
  
  // Save analysis to history
  const saveCurrentAnalysis = () => {
    if (!hasData) return;
    
    const analysisData = {
      chartConfig,
      selectedColumns,
      selectedFileId,
      fileInfo: fileData ? {
        name: fileData.sheetName,
        totalRows: fileData.totalRows
      } : null
    };
    
    dispatch(saveAnalysis(analysisData));
    toast.success('Analysis saved to history!');
  };
  
  // Calculate proper y-axis range for numeric data only
  const getYAxisConfig = () => {
    if (!hasData || sanitizedData.datasets.length === 0) return {};

    const allValues = sanitizedData.datasets.flatMap(dataset => dataset.data || []);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Add some padding to the range
    const padding = (maxValue - minValue) * 0.1 || 1;
    const suggestedMin = Math.max(0, minValue - padding);
    const suggestedMax = maxValue + padding;

    return {
      beginAtZero: minValue >= 0,
      suggestedMin: minValue < 0 ? suggestedMin : undefined,
      suggestedMax: suggestedMax > 1 ? suggestedMax : undefined,
      ticks: {
        callback: function(value) {
          if (Math.abs(value) < 1 && value !== 0) {
            return value.toFixed(3);
          }
          return value.toLocaleString();
        }
      }
    };
  };

  // Enhanced x-axis configuration for categorical data
  const getXAxisConfig = () => {
    return {
      type: 'category', // Explicitly set as category for string labels
      title: {
        display: true,
        text: selectedColumns.x,
        font: { weight: 'bold' }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        maxRotation: 45, // Rotate labels if they're long
        minRotation: 0,
        callback: function(value, index) {
          const label = this.getLabelForValue(value);
          // Truncate long customer names
          return label.length > 15 ? label.substring(0, 15) + '...' : label;
        }
      }
    };
  };

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!chartConfig.title,
        text: chartConfig.title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: function(context) {
            // Show full customer name in tooltip even if truncated on axis
            return context[0]?.label || '';
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`;
          }
        }
      },
    },
    scales: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' || chartConfig.type === 'polarArea' 
      ? undefined 
      : {
          x: getXAxisConfig(),
          y: {
            title: {
              display: true,
              text: selectedColumns.y,
              font: { weight: 'bold' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ...getYAxisConfig()
          },
        },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
  };
  
  // Export chart as image or PDF
  const exportChart = async () => {
    if (!chartRef.current) return;
    
    try {
      toast.loading('Preparing export...');
      const chartElement = chartRef.current;
      
      // Create a canvas from the chart
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      
      if (exportFormat === 'png') {
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const filename = `${chartConfig.title || 'chart'}-${new Date().toISOString().slice(0, 10)}.png`;
        link.download = filename;
        link.href = image;
        link.click();
        toast.dismiss();
        toast.success(`Chart exported as: ${filename}`);
      } else {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
        });
        
        pdf.setFontSize(16);
        pdf.text(chartConfig.title || 'Chart Export', 14, 15);
        
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
        if (fileData && fileData.sheetName) {
          pdf.text(`Source: ${fileData.sheetName}`, 14, 27);
        }
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 14, 35, pdfWidth, pdfHeight);
        
        const filename = `${chartConfig.title || 'chart'}-${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(filename);
        toast.dismiss();
        toast.success(`Chart exported as: ${filename}`);
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast.dismiss();
      toast.error('Failed to export chart');
    }
  };
  
  // Export data in various formats
  const exportData = () => {
    if (!fileData || !fileData.data) {
      toast.error('No data available to export');
      return;
    }
    
    try {
      const { data } = fileData;
      const filename = `${chartConfig.title || 'data'}-${new Date().toISOString().slice(0, 10)}`;
      
      if (dataFormat === 'csv') {
        const headers = Object.keys(data[0]).join(',');
        const csvRows = data.map(row => {
          return Object.values(row).map(value => {
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',');
        });
        
        const csvContent = [headers, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        
        toast.success(`Data exported as: ${filename}.csv`);
      } else if (dataFormat === 'json') {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
        
        toast.success(`Data exported as: ${filename}.json`);
      } else if (dataFormat === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        
        toast.success(`Data exported as: ${filename}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };
  
  // Render the appropriate chart type
  const renderChart = () => {
    if (!hasData) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chart data</h3>
            <p className="mt-1 text-sm text-gray-500">Select data columns to visualize</p>
          </div>
        </div>
      );
    }
    
    // For 3D charts using Plotly
    if (chartConfig.type === '3d-scatter' || chartConfig.type === '3d-surface') {
      const plotlyData = [];
      
      if (chartConfig.type === '3d-scatter') {
        const sanitizedYData = sanitizeNumericData(chartConfig.datasets[0]?.data || []);
        const sanitizedZData = chartConfig.datasets.length > 1 && chartConfig.datasets[1]?.data 
          ? sanitizeNumericData(chartConfig.datasets[1].data) 
          : Array.from({length: sanitizedData.labels.length}, (_, i) => i);
        
        const scatterData = {
          type: 'scatter3d',
          mode: 'markers',
          name: chartConfig.datasetLabel || 'Dataset',
          x: sanitizedData.labels, // Keep as strings for customer names
          y: sanitizedYData,
          z: sanitizedZData,
          marker: {
            size: 6,
            color: chartConfig.datasets[0].backgroundColor || 'rgba(75, 192, 192, 0.8)',
            line: {
              color: 'rgba(255, 255, 255, 0.5)',
              width: 0.5
            },
            opacity: 0.8
          }
        };
        plotlyData.push(scatterData);
      } else if (chartConfig.type === '3d-surface') {
        const zValues = sanitizeNumericData(chartConfig.datasets[0]?.data || []);
        
        const dataLength = Math.ceil(Math.sqrt(zValues.length));
        const zMatrix = [];
        for (let i = 0; i < dataLength; i++) {
          const row = [];
          for (let j = 0; j < dataLength; j++) {
            const index = i * dataLength + j;
            row.push(index < zValues.length ? zValues[index] : 0);
          }
          zMatrix.push(row);
        }
        
        const surfaceData = {
          type: 'surface',
          z: zMatrix,
          colorscale: 'Viridis',
          contours: {
            z: {
              show: true,
              usecolormap: true,
              highlightcolor: "#42f462",
              project: {z: true}
            }
          }
        };
        plotlyData.push(surfaceData);
      }
      
      const plotlyLayout = {
        title: chartConfig.title,
        autosize: true,
        margin: { l: 0, r: 0, b: 0, t: 40 },
        scene: {
          xaxis: { title: selectedColumns.x },
          yaxis: { title: selectedColumns.y },
          zaxis: { title: chartConfig.datasets.length > 1 ? selectedColumns.z : 'Index' }
        }
      };

      const plotlyConfig = {
        responsive: true,
        displayModeBar: true,
        toImageButtonOptions: {
          format: 'png',
          filename: `${chartConfig.title || 'chart'}-${new Date().toISOString().slice(0, 10)}`,
          height: 800,
          width: 1200,
          scale: 2
        }
      };
      
      return (
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={plotlyConfig}
          style={{width: "100%", height: "500px"}}
        />
      );
    }
    
    // For regular Chart.js charts - use sanitized data
    switch (chartConfig.type) {
      case 'bar':
        return <Bar data={sanitizedData} options={chartOptions} />;
      case 'line':
        return <Line data={sanitizedData} options={chartOptions} />;
      case 'pie':
        return <Pie data={sanitizedData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={sanitizedData} options={chartOptions} />;
      case 'polar':
        return <PolarArea data={sanitizedData} options={chartOptions} />;
      case 'radar':
        return <Radar data={sanitizedData} options={chartOptions} />;
      default:
        return <Bar data={sanitizedData} options={chartOptions} />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {chartConfig.title || 'Chart Visualization'}
        </h2>
        
        {hasData && (
          <div className="flex items-center gap-2">
            {/* Save Analysis Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveCurrentAnalysis}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </motion.button>
            
            {/* Export Data Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDataExportOptions(!showDataExportOptions)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Data
              </motion.button>
              
              {showDataExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1 border border-gray-200 rounded-md">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Export Format</label>
                      <select
                        value={dataFormat}
                        onChange={(e) => setDataFormat(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div className="px-3 py-2 text-center">
                      <button
                        onClick={() => {
                          exportData();
                          setShowDataExportOptions(false);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Export Chart Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </motion.button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1 border border-gray-200 rounded-md">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Export Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="png">PNG Image</option>
                        <option value="pdf">PDF Document</option>
                      </select>
                    </div>
                    <div className="px-3 py-2 text-center">
                      <button
                        onClick={() => {
                          exportChart();
                          setShowExportOptions(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div ref={chartRef} className="mt-4 chart-container p-4 bg-white rounded-lg border border-gray-100">
        {renderChart()}
      </div>
      
      {hasData && fileData && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p>
            Showing data from: <span className="font-medium">{fileData.sheetName || 'Unknown sheet'}</span> | 
            X-Axis: <span className="font-medium">{selectedColumns.x}</span> | 
            Y-Axis: <span className="font-medium">{selectedColumns.y}</span> | 
            {selectedColumns.z && (chartConfig.type === '3d-scatter' || chartConfig.type === '3d-surface') && (
              <>Z-Axis: <span className="font-medium">{selectedColumns.z}</span> | </>
            )}
            Total records: <span className="font-medium">{fileData.totalRows || 0}</span>
            {(chartConfig.type === '3d-scatter' || chartConfig.type === '3d-surface') && (
              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">3D Chart</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartVisualization;
