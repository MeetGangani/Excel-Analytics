import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFiles, resetAnalysis } from '../redux/slices/fileSlice';
import { motion } from 'framer-motion';
import FileAnalysis from './FileAnalysis';
import toast from 'react-hot-toast';

const FileSelector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const dispatch = useDispatch();
  const { files, isLoading, isError, message } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to load files');
    }
  }, [isError, message]);

  const handleSelectFile = (file) => {
    dispatch(resetAnalysis());
    setSelectedFile(file);
    setShowAnalysis(true);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    dispatch(resetAnalysis());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Analyze Files</h1>
        <p className="text-gray-600">Select a file to analyze with AI</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : files && files.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
              onClick={() => handleSelectFile(file)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-blue-50 rounded-lg">
                      <svg 
                        className="h-8 w-8 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 truncate max-w-xs">{file.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFile(file);
                    }}
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Analyze with AI
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1" 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Files Found</h3>
          <p className="mt-2 text-gray-600">Upload Excel files to analyze them with AI</p>
          <div className="mt-6">
            <button 
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              onClick={() => window.location.href = '/dashboard/files/upload'}
            >
              Upload Files
            </button>
          </div>
        </div>
      )}

      {showAnalysis && selectedFile && (
        <FileAnalysis 
          fileId={selectedFile.id} 
          fileName={selectedFile.filename} 
          onClose={handleCloseAnalysis} 
        />
      )}
    </div>
  );
};

export default FileSelector; 