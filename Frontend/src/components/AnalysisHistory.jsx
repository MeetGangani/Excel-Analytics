import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  loadHistoryFromStorage, 
  deleteAnalysis, 
  clearHistory 
} from '../redux/slices/analysisHistorySlice';
import { 
  setChartType, 
  setSelectedColumns, 
  setChartTitle, 
  setDatasetLabel,
  setSelectedFile, 
  fetchFileData,
  generateChartData 
} from '../redux/slices/chartSlice';
import toast from 'react-hot-toast';

const AnalysisHistory = () => {
  const dispatch = useDispatch();
  const { history } = useSelector(state => state.analysisHistory);
  const [isOpen, setIsOpen] = useState(false);
  
  // Load history from localStorage when component mounts
  useEffect(() => {
    dispatch(loadHistoryFromStorage());
  }, [dispatch]);
  
  // Apply a saved analysis configuration
  const applyAnalysis = async (analysis) => {
    try {
      toast.loading('Restoring analysis...');
      
      // Step 1: Set the selected file ID first
      if (analysis.selectedFileId) {
        dispatch(setSelectedFile(analysis.selectedFileId));
        
        // Step 2: Fetch the file data
        await dispatch(fetchFileData(analysis.selectedFileId)).unwrap();
      } else {
        toast.dismiss();
        toast.error('Cannot restore analysis: File not found');
        return;
      }
      
      // Step 3: Set chart type and other configurations
      dispatch(setChartType(analysis.chartConfig.type));
      
      // Step 4: Set the columns AFTER file data is loaded
      dispatch(setSelectedColumns(analysis.selectedColumns));
      
      // Step 5: Set the chart title and dataset label
      dispatch(setChartTitle(analysis.chartConfig.title));
      dispatch(setDatasetLabel(analysis.chartConfig.datasetLabel));
      
      // Step 6: Generate the chart data
      dispatch(generateChartData());
      
      toast.dismiss();
      toast.success('Analysis configuration restored!');
      setIsOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to restore analysis: ' + (error.message || 'Unknown error'));
      console.error('Error restoring analysis:', error);
    }
  };
  
  // Delete a saved analysis
  const handleDeleteAnalysis = (e, id) => {
    e.stopPropagation();
    dispatch(deleteAnalysis(id));
    toast.success('Analysis deleted');
  };
  
  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history?')) {
      dispatch(clearHistory());
      toast.success('Analysis history cleared');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg border border-blue-200 shadow-sm text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Analysis History</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Recent Analyses</h3>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="py-1">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => applyAnalysis(item)}
                      className="px-3 py-2.5 border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {item.chartConfig.title || 'Untitled Analysis'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteAnalysis(e, item.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        <div className="bg-gray-100 rounded-sm px-1.5 py-0.5 text-xs text-gray-600">
                          {item.chartConfig.type}
                        </div>
                        <div className="bg-gray-100 rounded-sm px-1.5 py-0.5 text-xs text-gray-600 truncate">
                          {item.selectedColumns.x} / {item.selectedColumns.y}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-600">No saved analyses yet</p>
                    <p className="mt-1 text-xs text-gray-500">Create visualizations and save them to see them here</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AnalysisHistory; 