import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setChartType, 
  setSelectedColumns, 
  setChartTitle, 
  setDatasetLabel,
  generateChartData 
} from '../redux/slices/chartSlice';
import { motion } from 'framer-motion';

const ChartSelector = () => {
  const dispatch = useDispatch();
  const { availableColumns, selectedColumns, chartConfig } = useSelector(state => state.charts);
  
  const [chartOptions, setChartOptions] = useState({
    title: chartConfig.title,
    datasetLabel: chartConfig.datasetLabel,
  });
  
  // Available chart types
  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: 'chart-bar' },
    { id: 'line', name: 'Line Chart', icon: 'chart-line' },
    { id: 'pie', name: 'Pie Chart', icon: 'chart-pie' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: 'chart-doughnut' },
    { id: 'polar', name: 'Polar Area Chart', icon: 'chart-polar' },
    { id: 'radar', name: 'Radar Chart', icon: 'chart-radar' },
  ];

  // Update chart data when columns change
  useEffect(() => {
    if (selectedColumns.x && selectedColumns.y) {
      dispatch(generateChartData());
    }
  }, [selectedColumns, dispatch]);

  // Handle chart type selection
  const handleChartTypeSelect = (type) => {
    dispatch(setChartType(type));
    dispatch(generateChartData());
  };
  
  // Handle column selection
  const handleColumnSelect = (axis, column) => {
    dispatch(setSelectedColumns({
      ...selectedColumns,
      [axis]: column
    }));
  };
  
  // Update chart options
  const handleChartOptionChange = (e) => {
    const { name, value } = e.target;
    setChartOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply chart options
  const applyChartOptions = () => {
    dispatch(setChartTitle(chartOptions.title));
    dispatch(setDatasetLabel(chartOptions.datasetLabel));
    dispatch(generateChartData());
  };
  
  // Icon components for chart types
  const ChartIcon = ({ type }) => {
    switch(type) {
      case 'chart-bar':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'chart-line':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'chart-pie':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case 'chart-doughnut':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
          </svg>
        );
      case 'chart-polar':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M7 7l10 10M7 17L17 7" />
          </svg>
        );
      case 'chart-radar':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M5.63 5.63l12.73 12.73M5.63 18.36l12.73-12.73" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Visualization Configuration</h2>
      
      {/* Chart Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chart Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {chartTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChartTypeSelect(type.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                chartConfig.type === type.id
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChartIcon type={type.icon} />
              <span className="mt-2 text-sm">{type.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Data Mapping */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">
          Data Mapping
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              X-Axis (Labels)
            </label>
            <select
              value={selectedColumns.x}
              onChange={(e) => handleColumnSelect('x', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select column</option>
              {availableColumns.map((column) => (
                <option key={`x-${column}`} value={column}>{column}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Y-Axis (Values)
            </label>
            <select
              value={selectedColumns.y}
              onChange={(e) => handleColumnSelect('y', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select column</option>
              {availableColumns.map((column) => (
                <option key={`y-${column}`} value={column}>{column}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Chart Options */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">
          Chart Options
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Chart Title
            </label>
            <input
              type="text"
              name="title"
              value={chartOptions.title}
              onChange={handleChartOptionChange}
              placeholder="Enter chart title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Dataset Label
            </label>
            <input
              type="text"
              name="datasetLabel"
              value={chartOptions.datasetLabel}
              onChange={handleChartOptionChange}
              placeholder="Enter dataset label"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Apply Button */}
      <button
        onClick={applyChartOptions}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
      >
        Apply Changes
      </button>
    </div>
  );
};

export default ChartSelector;
