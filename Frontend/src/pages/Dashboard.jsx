import { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getFiles, deleteFile, reset } from '../redux/slices/fileSlice';
import FileUpload from '../components/FileUpload';
import FileAnalysis from '../components/FileAnalysis';
import FileSelector from '../components/FileSelector';
import QuickAnalyze from '../components/QuickAnalyze';
import ChartVisualization from '../components/ChartVisualization';
import ChartSelector from '../components/ChartSelector';
import AnalysisHistory from '../components/AnalysisHistory';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// API URL from environment variable or fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://excel-analyst-backend.onrender.com';

const Dashboard = () => { 
  const [fileToAnalyze, setFileToAnalyze] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Sort and filter states
  const [sortOption, setSortOption] = useState('dateDesc'); // Default sort by newest
  const [filterOption, setFilterOption] = useState('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { files, isLoading, isError, message } = useSelector((state) => state.files);
  
  // Analytics stats
  const [analyzeCount, setAnalyzeCount] = useState(0);
  const [visualizationCount, setVisualizationCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getFiles());
      
      // Load analytics counts from localStorage with user-specific keys
      const userId = user?.user?._id || user?._id;
      if (userId) {
        const storedAnalyzeCount = localStorage.getItem(`analyzeCount_${userId}`);
        const storedVisualizationCount = localStorage.getItem(`visualizationCount_${userId}`);
        
        setAnalyzeCount(storedAnalyzeCount ? parseInt(storedAnalyzeCount) : 0);
        setVisualizationCount(storedVisualizationCount ? parseInt(storedVisualizationCount) : 0);
      }
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to load files');
    }
  }, [isError, message]);

  const handleDeleteFile = (id) => {
    if (deleteConfirm === id) {
      dispatch(deleteFile(id));
      setDeleteConfirm(null);
      toast.success('File deleted successfully');
    } else {
      setDeleteConfirm(id);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const handleAnalyzeFile = (file) => {
    setFileToAnalyze(file);
    
    // Increment analyze count with user-specific storage
    const newCount = analyzeCount + 1;
    setAnalyzeCount(newCount);
    
    // Store with user-specific key
    const userId = user?.user?._id || user?._id;
    if (userId) {
      localStorage.setItem(`analyzeCount_${userId}`, newCount.toString());
    }
  };
  
  // Function to increment visualization count (can be called from child components)
  const incrementVisualizationCount = () => {
    const newCount = visualizationCount + 1;
    setVisualizationCount(newCount);
    
    // Store with user-specific key
    const userId = user?.user?._id || user?._id;
    if (userId) {
      localStorage.setItem(`visualizationCount_${userId}`, newCount.toString());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  // Get file extension from filename
  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };
  
  // Sort files based on sort option
  const getSortedFiles = (filesToSort) => {
    if (!Array.isArray(filesToSort) || filesToSort.length === 0) return [];
    
    return [...filesToSort].sort((a, b) => {
      // Safety check for undefined properties
      if (!a || !b) return 0;
      
      switch (sortOption) {
        case 'nameAsc':
          return (a.filename || '').localeCompare(b.filename || '');
        case 'nameDesc':
          return (b.filename || '').localeCompare(a.filename || '');
        case 'dateAsc':
          return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
        case 'dateDesc':
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
        case 'sizeAsc':
          return (a.size || 0) - (b.size || 0);
        case 'sizeDesc':
          return (b.size || 0) - (a.size || 0);
        default:
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }
    });
  };
  
  // Filter files based on filter option and query
  const getFilteredFiles = (filesToFilter) => {
    if (!Array.isArray(filesToFilter)) return [];
    
    return filesToFilter.filter(file => {
      if (!file) return false;
      
      // Filter by file type
      if (filterOption !== 'all') {
        const extension = getFileExtension(file.filename);
        if (filterOption === 'excel' && !['xlsx', 'xls', 'csv'].includes(extension)) {
          return false;
        }
        if (filterOption === 'csv' && extension !== 'csv') {
          return false;
        }
      }
      
      // Filter by name query
      if (filterQuery && file.filename) {
        return file.filename.toLowerCase().includes(filterQuery.toLowerCase());
      }
      
      return true;
    });
  };
  
  // Apply both sorting and filtering
  const getProcessedFiles = () => {
    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [];
    const filtered = getFilteredFiles(fileArray);
    return getSortedFiles(filtered);
  };

  // Count storage used
  const totalStorage = Array.isArray(files) ? files.reduce((total, file) => total + (file?.size || 0), 0) : 0;
  const storageUsedMB = (totalStorage / (1024 * 1024)).toFixed(2);
  const storagePercent = Math.min(Math.round((totalStorage / (50 * 1024 * 1024)) * 100), 100);

  // Fix button click handlers to stop event propagation
  const handleSortButtonClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setShowSortOptions(!showSortOptions);
    setShowFilterOptions(false);
  };

  const handleFilterButtonClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setShowFilterOptions(!showFilterOptions);
    setShowSortOptions(false);
  };

  const handleSortOptionClick = (e, option) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setSortOption(option);
    setShowSortOptions(false);
  };

  const handleFilterOptionClick = (e, option) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setFilterOption(option);
    setShowFilterOptions(false);
  };

  // Click away handler to close dropdowns
  useEffect(() => {
    const handleClickAway = (event) => {
      // Only close if the click is outside of dropdown menus
      const sortDropdown = document.getElementById('sort-dropdown');
      const filterDropdown = document.getElementById('filter-dropdown');
      
      if (sortDropdown && !sortDropdown.contains(event.target)) {
        setShowSortOptions(false);
      }
      
      if (filterDropdown && !filterDropdown.contains(event.target)) {
        setShowFilterOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickAway);
    
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, []);

  if (!user) {
    return null;
  }

  const FileList = () => {
    const processedFiles = getProcessedFiles();
    
    return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-medium text-gray-900">Your Files</h3>
        
        {/* Search input */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort dropdown */}
          <div id="sort-dropdown" className="relative">
            <button 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center bg-white py-2 px-3 rounded-lg border border-gray-300 shadow-sm"
              onClick={handleSortButtonClick}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </button>
            
            {showSortOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'nameAsc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'nameAsc')}
                  >
                    Name (A to Z)
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'nameDesc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'nameDesc')}
                  >
                    Name (Z to A)
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'dateDesc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'dateDesc')}
                  >
                    Newest First
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'dateAsc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'dateAsc')}
                  >
                    Oldest First
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'sizeDesc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'sizeDesc')}
                  >
                    Size (Largest)
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'sizeAsc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleSortOptionClick(e, 'sizeAsc')}
                  >
                    Size (Smallest)
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Filter dropdown */}
          <div id="filter-dropdown" className="relative">
            <button 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center bg-white py-2 px-3 rounded-lg border border-gray-300 shadow-sm"
              onClick={handleFilterButtonClick}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            
            {showFilterOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${filterOption === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleFilterOptionClick(e, 'all')}
                  >
                    All Files
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${filterOption === 'excel' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleFilterOptionClick(e, 'excel')}
                  >
                    Excel Files
                  </button>
                  <button 
                    className={`block px-4 py-2 text-sm w-full text-left ${filterOption === 'csv' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={(e) => handleFilterOptionClick(e, 'csv')}
                  >
                    CSV Files
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-sm text-gray-500">Loading your files...</p>
        </div>
      ) : processedFiles.length > 0 ? (
        <>
          {/* File count indicator */}
          <div className="mb-2 text-xs text-gray-500">
            Showing {processedFiles.length} {processedFiles.length === 1 ? 'file' : 'files'}
            {filterQuery && <span> matching "{filterQuery}"</span>}
            {filterOption !== 'all' && <span> • Filtered by {filterOption === 'excel' ? 'Excel files' : 'CSV files'}</span>}
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {/* Table layout with properly constrained widths */}
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[45%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="w-[25%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Uploaded
                  </th>
                  <th className="w-[10%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="w-[20%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="w-[45%] px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 truncate">{file.filename}</span>
                      </div>
                    </td>
                    <td className="w-[25%] px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500">{formatDate(file.uploadedAt)}</span>
                    </td>
                    <td className="w-[10%] px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                    </td>
                    <td className="w-[20%] px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-6">
                        <button 
                          onClick={() => handleAnalyzeFile(file)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          aria-label="Analyze file"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            navigate(`/dashboard/files/visualize/${file.id}`);
                            incrementVisualizationCount();
                          }}
                          className="text-amber-600 hover:text-amber-900 transition-colors"
                          aria-label="Visualize file"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className={`${
                            deleteConfirm === file.id ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                          } transition-colors`}
                          aria-label="Delete file"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {files.length > 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching files found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No files uploaded yet</h3>
              <p className="text-sm text-gray-500">Upload your Excel files to analyze and visualize data</p>
            </>
          )}
        </div>
      )}
    </div>
  )};

  const DashboardHome = () => (
    <>
      {/* Stats section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Analytics Overview</h2>
          
          {/* Storage indicator moved here from sidebar */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pr-4">
            <div className="text-sm text-gray-700 whitespace-nowrap">Storage: <span className="text-blue-600 font-medium">{storageUsedMB} MB</span></div>
            <div className="w-24 bg-gray-200 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${storagePercent}%` }}></div>
            </div>
            <div className="text-xs text-gray-500">{storagePercent}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{files.length}</h3>
                  <p className="text-sm text-gray-500">Files Uploaded</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 mr-3">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{analyzeCount}</h3>
                  <p className="text-sm text-gray-500">Analyses Performed</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 mr-3">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{visualizationCount}</h3>
                  <p className="text-sm text-gray-500">Visualizations Created</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <FileList />
    </>
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="files/upload" element={<FileUpload />} />
            <Route path="files/analyze" element={<FileSelector />} />
            <Route path="files/quickanalyze" element={<QuickAnalyze />} />
            <Route path="files/visualize" element={
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Create Visualizations</h2>
                  <AnalysisHistory />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <ChartSelector />
                  </div>
                  <div className="md:col-span-2">
                    <ChartVisualization onChartCreated={incrementVisualizationCount} />
                  </div>
                </div>
              </div>
            } />
            <Route path="files/visualize/:fileId" element={
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Visualize File Data</h2>
                  <AnalysisHistory />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <ChartSelector />
                  </div>
                  <div className="md:col-span-2">
                    <ChartVisualization onChartCreated={incrementVisualizationCount} />
                  </div>
                </div>
              </div>
            } />
            <Route path="files/manage" element={
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">File Manager</h2>
                <FileList />
              </div>
            } />
            {/* Default route */}
            <Route index element={<DashboardHome />} />
          </Routes>
        </div>
      </main>
      
      {fileToAnalyze && (
        <FileAnalysis 
          isOpen={fileToAnalyze !== null} 
          onClose={() => setFileToAnalyze(null)}
          fileId={fileToAnalyze?.id}
          fileName={fileToAnalyze?.filename}
        />
      )}
    </div>
  );
};

export default Dashboard;
