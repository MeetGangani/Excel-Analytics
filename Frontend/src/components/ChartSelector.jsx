import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setChartType, 
  setSelectedColumns, 
  setChartTitle, 
  setDatasetLabel,
  generateChartData,
  setSelectedFile,
  fetchFileData
} from '../redux/slices/chartSlice';
import { getFiles } from '../redux/slices/fileSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Card from './ui/Card';
import Button from './ui/Button';
import Skeleton, { SkeletonGroup } from './ui/Skeleton';

const ChartSelector = () => {
  const dispatch = useDispatch();
  const { availableColumns, selectedColumns, chartConfig, selectedFileId, isLoading } = useSelector(state => state.charts);
  const { files } = useSelector(state => state.files);
  
  const [chartOptions, setChartOptions] = useState({
    title: chartConfig.title,
    datasetLabel: chartConfig.datasetLabel,
  });
  
  // Fetch all available files when component mounts
  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);
  
  // Available chart types
  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: 'chart-bar' },
    { id: 'line', name: 'Line Chart', icon: 'chart-line' },
    { id: 'pie', name: 'Pie Chart', icon: 'chart-pie' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: 'chart-doughnut' },
    { id: 'polar', name: 'Polar Area Chart', icon: 'chart-polar' },
    { id: 'radar', name: 'Radar Chart', icon: 'chart-radar' },
    { id: '3d-scatter', name: '3D Scatter', icon: 'chart-3d-scatter' },
    { id: '3d-surface', name: '3D Surface', icon: 'chart-3d-surface' },
  ];

  // Update chart data when columns change
  useEffect(() => {
    if (selectedColumns.x && selectedColumns.y) {
      dispatch(generateChartData());
    }
  }, [selectedColumns, dispatch]);
  
  // Memoized selected file for performance
  const selectedFile = useMemo(() => {
    return files.find(file => file.id === selectedFileId);
  }, [files, selectedFileId]);

  // Handle file selection
  const handleFileSelect = (fileId) => {
    if (fileId) {
      dispatch(setSelectedFile(fileId));
      dispatch(fetchFileData(fileId));
      
      // Reset column selections when file changes
      dispatch(setSelectedColumns({ x: '', y: '' }));
      
      toast.success('Loading file data for visualization...');
    }
  };

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
    
    toast.success('Chart options updated');
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
      case 'chart-3d-scatter':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l14 14" />
          </svg>
        );
      case 'chart-3d-surface':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      elevation="md" 
      padding="lg" 
      className="animate-fade-in h-full overflow-y-auto"
      header={
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Visualization Config</h2>
          {selectedFile && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full truncate max-w-[150px]">
              {selectedFile.filename}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* File Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File to Visualize
          </label>
          <div className="relative">
            {isLoading && !selectedFileId ? (
              <Skeleton height="45px" className="rounded-lg" />
            ) : (
              <div className="relative">
                <select
                  value={selectedFileId || ''}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500 appearance-none bg-white shadow-sm"
                  disabled={isLoading}
                >
                  <option value="">Select a file</option>
                  {files.map((file) => (
                    <option key={file.id} value={file.id}>{file.filename}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          {files.length === 0 && (
            <div className="mt-2 flex items-center bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              No files available. Please upload Excel files first.
            </div>
          )}
          {selectedFile && !isLoading && (
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              File selected and ready for analysis
            </div>
          )}
        </div>
        
        {/* Chart Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </label>
          {isLoading && !selectedFileId ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="70px" className="rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chartTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChartTypeSelect(type.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all h-[70px] ${                    chartConfig.type === type.id                      ? 'bg-blue-600 border-2 border-blue-700 text-white font-medium'                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'                  }`}
                  disabled={!selectedFileId || isLoading}
                >
                  <ChartIcon type={type.icon} />
                  <span className="mt-1.5 text-xs">{type.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
        
        {/* Data Mapping */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Data Mapping
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-9 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-9 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {!selectedFileId ? (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-lg text-xs flex items-start">
                  <svg className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Please select a file to map data for visualization.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>                    <label className="block text-xs font-medium text-gray-600 mb-1.5">                      X-Axis (Labels)                    </label>                    <div className="relative">                      <select                        value={selectedColumns.x}                        onChange={(e) => handleColumnSelect('x', e.target.value)}                        className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 appearance-none bg-white shadow-sm"                      >                        <option value="">Select column</option>                        {availableColumns.map((column) => (                          <option key={`x-${column}`} value={column}>{column}</option>                        ))}                      </select>                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />                        </svg>                      </div>                    </div>                  </div>                                    <div>                    <label className="block text-xs font-medium text-gray-600 mb-1.5">                      Y-Axis (Values)                    </label>                    <div className="relative">                      <select                        value={selectedColumns.y}                        onChange={(e) => handleColumnSelect('y', e.target.value)}                        className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 appearance-none bg-white shadow-sm"                      >                        <option value="">Select column</option>                        {availableColumns.map((column) => (                          <option key={`y-${column}`} value={column}>{column}</option>                        ))}                      </select>                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />                        </svg>                      </div>                    </div>                  </div>                                    {/* Z-Axis selector for 3D charts */}                  {(chartConfig.type === '3d-scatter' || chartConfig.type === '3d-surface') && (                    <div className="sm:col-span-2 mt-3">                      <label className="block text-xs font-medium text-gray-600 mb-1.5">                        Z-Axis (3D Values)                      </label>                      <div className="relative">                        <select                          value={selectedColumns.z}                          onChange={(e) => handleColumnSelect('z', e.target.value)}                          className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 appearance-none bg-white shadow-sm"                        >                          <option value="">Select column (optional)</option>                          {availableColumns.map((column) => (                            <option key={`z-${column}`} value={column}>{column}</option>                          ))}                        </select>                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />                          </svg>                        </div>                      </div>                      <p className="mt-1 text-xs text-gray-500">                        For 3D charts, select a third dimension or leave empty to use index values                      </p>                    </div>                  )}                </div>
              )}
            </>
          )}
          
          {availableColumns.length === 0 && selectedFileId && !isLoading && (
            <p className="mt-2 text-xs text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No data columns available. The selected file may be empty or have an unsupported format.
            </p>
          )}
        </div>
        
        {/* Chart Options */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Chart Options
          </h3>
          {isLoading ? (
            <SkeletonGroup rows={2} />
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Chart Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={chartOptions.title}
                  onChange={handleChartOptionChange}
                  placeholder="Enter chart title"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  disabled={!selectedFileId || isLoading}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Dataset Label
                </label>
                <input
                  type="text"
                  name="datasetLabel"
                  value={chartOptions.datasetLabel}
                  onChange={handleChartOptionChange}
                  placeholder="Enter dataset label"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  disabled={!selectedFileId || isLoading}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Apply Button */}
        <Button
          onClick={applyChartOptions}
          disabled={!selectedFileId || isLoading || (!selectedColumns.x && !selectedColumns.y)}
          variant={!selectedFileId || isLoading || (!selectedColumns.x && !selectedColumns.y) ? 'primary' : 'primary'}
          fullWidth
          size="md"
          startIcon={isLoading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        >
          {isLoading ? 'Loading...' : 'Apply Changes'}
        </Button>
      </div>
    </Card>
  );
};

export default ChartSelector;
