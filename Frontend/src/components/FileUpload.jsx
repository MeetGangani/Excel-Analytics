import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFiles, reset } from '../redux/slices/fileSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  // Track nested drag events to avoid flicker when moving over children
  const dragCounter = useRef(0);
  
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message, uploadSuccess } = useSelector(state => state.files);

  // Maximum file size in bytes (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  // Maximum number of files
  const MAX_FILE_COUNT = 5;

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Upload failed');
      setUploadProgress(0);
    }

    if (uploadSuccess) {
      toast.success('Files uploaded successfully!');
      setSelectedFiles([]);
      setUploadProgress(0);
    }

    return () => {
      dispatch(reset());
    };
  }, [uploadSuccess, isError, message, dispatch]);

  const validateFiles = (files) => {
    const validExtensions = ['xlsx', 'xls'];
    const validFiles = [];
    const invalidFiles = [];
    
    for (let file of files) {
      const filenameParts = file.name.split('.');
      const extension = filenameParts.length > 1 ? filenameParts.pop().toLowerCase() : '';
      
      if (!validExtensions.includes(extension)) {
        invalidFiles.push(`${file.name} (invalid format)`);
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 10MB limit)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (invalidFiles.length > 0) {
      toast.error(
        <div>
          <p>Some files couldn't be added:</p>
          <ul className="mt-1 ml-2 text-xs list-disc">
            {invalidFiles.map((filename, i) => (
              <li key={i}>{filename}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Check if adding these files would exceed the max count
    if (validFiles.length + selectedFiles.length > MAX_FILE_COUNT) {
      toast.error(`You can only upload up to ${MAX_FILE_COUNT} files at once`);
      return validFiles.slice(0, MAX_FILE_COUNT - selectedFiles.length);
    }
    
    return validFiles;
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Indicate copy action
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
      // Clear the drag data
      if (e.dataTransfer.items) {
        e.dataTransfer.items.clear();
      } else {
        e.dataTransfer.clearData();
      }
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    setUploadProgress(10);
    
    // Use the uploadFiles action from fileSlice
    dispatch(uploadFiles(formData));
    
    // Simulate progress since we don't have progress tracking in the Redux action
    const timer = setInterval(() => {
      setUploadProgress(prevProgress => {
        if (prevProgress >= 90) {
          clearInterval(timer);
          return prevProgress;
        }
        return prevProgress + 10;
      });
    }, 500);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'xlsx':
      case 'xls':
        return (
          <svg className="w-6 h-6 flex-shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 16H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload Excel Files
      </h2>
      
      <div className="mb-6">
        {/* Main upload card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Upload area */}
          <motion.div 
            className={`relative flex items-center justify-center w-full p-8 transition-all ${
            isDragging 
                ? 'bg-blue-50 border-2 border-dashed border-blue-400' 
                : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
            whileHover={{ scale: 1.002 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <input 
            ref={fileInputRef}
            id="file-upload" 
            type="file" 
            className="hidden" 
              accept=".xlsx, .xls"
            multiple
            onChange={handleFileSelect}
            disabled={isLoading}
          />
          
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-3xl">
              {/* Left side - icon and text */}
              <div className="flex flex-col items-center md:items-start mb-4 md:mb-0 text-center md:text-left">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  className="mb-3 text-blue-500"
                >
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m0 0V8m0 0l-4 4m4-4l4 4m-8 8h8a4 4 0 004-4V8a4 4 0 00-4-4H7a4 4 0 00-4 4v8a4 4 0 004 4z" />
            </svg>
                </motion.div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Upload your Excel files</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Drag and drop your Excel files here, or click the button to browse
                </p>
                <div className="flex flex-wrap items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
                    <span className="mr-1">•</span> .xlsx
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                    <span className="mr-1">•</span> .xls
                  </span>
                </div>
              </div>
              
              {/* Right side - button */}
              <motion.button
              type="button"
              onClick={handleBrowseFiles}
                className="px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center"
              disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Select Files
              </motion.button>
            </div>
            
            {/* Overlay when dragging */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 px-6 py-4 rounded-lg shadow-lg border border-blue-200">
                  <p className="text-lg font-medium text-blue-600">Drop files here</p>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* File restrictions info */}
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Max {MAX_FILE_COUNT} files (10MB each)
              </div>
              <div className="text-xs text-gray-500">
                {selectedFiles.length} of {MAX_FILE_COUNT} files selected
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
      {selectedFiles.length > 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Selected Files</h3>
              <button 
                onClick={() => setSelectedFiles([])} 
                disabled={isLoading}
                className={`text-xs ${isLoading ? 'text-gray-400' : 'text-gray-500 hover:text-red-500'} font-medium flex items-center`}
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
            {selectedFiles.map((file, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex items-center overflow-hidden mr-3">
                      {getFileIcon(file.name)}
                      <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                    <motion.button 
                      className="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-red-50 flex-shrink-0"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                  aria-label="Remove file"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                    </motion.button>
                  </motion.li>
            ))}
          </ul>
              
              {/* Upload button */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between">
          {isLoading ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
                        <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ ease: "easeInOut" }}
                        ></motion.div>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleUpload}
                      disabled={selectedFiles.length === 0}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${
                        selectedFiles.length === 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                      } transition-colors`}
                      whileHover={selectedFiles.length > 0 ? { scale: 1.02 } : {}}
                      whileTap={selectedFiles.length > 0 ? { scale: 0.98 } : {}}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {`Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
                    </motion.button>
                  )}
                </div>
              </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add this CSS at the end of your component file */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
