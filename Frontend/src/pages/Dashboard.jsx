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
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [fileToAnalyze, setFileToAnalyze] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { files, isLoading } = useSelector((state) => state.files);
  
  // Analytics stats
  const [analyzeCount, setAnalyzeCount] = useState(0);
  const [visualizationCount, setVisualizationCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getFiles());
      
      // Load analytics counts from localStorage or API
      const storedAnalyzeCount = localStorage.getItem('analyzeCount');
      const storedVisualizationCount = localStorage.getItem('visualizationCount');
      
      setAnalyzeCount(storedAnalyzeCount ? parseInt(storedAnalyzeCount) : 0);
      setVisualizationCount(storedVisualizationCount ? parseInt(storedVisualizationCount) : 0);
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

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
    
    // Increment analyze count
    const newCount = analyzeCount + 1;
    setAnalyzeCount(newCount);
    localStorage.setItem('analyzeCount', newCount.toString());
  };
  
  // Function to increment visualization count (can be called from child components)
  const incrementVisualizationCount = () => {
    const newCount = visualizationCount + 1;
    setVisualizationCount(newCount);
    localStorage.setItem('visualizationCount', newCount.toString());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Count storage used
  const totalStorage = files.reduce((total, file) => total + file.size, 0);
  const storageUsedMB = (totalStorage / (1024 * 1024)).toFixed(2);
  const storagePercent = Math.min(Math.round((totalStorage / (50 * 1024 * 1024)) * 100), 100);

  if (!user) {
    return null;
  }

  const FileList = () => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Your Files</h3>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
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
      ) : files.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{formatDate(file.uploadedAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleAnalyzeFile(file)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
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
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No files uploaded yet</h3>
          <p className="text-sm text-gray-500">Upload your Excel files to analyze and visualize data</p>
        </div>
      )}
    </div>
  );

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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Visualizations</h2>
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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Visualize File Data</h2>
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
