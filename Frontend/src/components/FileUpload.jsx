import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFiles, reset } from '../redux/slices/fileSlice';
import toast from 'react-hot-toast';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message, uploadSuccess } = useSelector(state => state.files);

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

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Filter Excel and CSV files
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['xlsx', 'xls', 'csv'].includes(extension);
      });
      
      if (validFiles.length !== files.length) {
        toast.error('Only Excel and CSV files are allowed');
      }
      
      setSelectedFiles(validFiles);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      // Filter Excel and CSV files
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['xlsx', 'xls', 'csv'].includes(extension);
      });
      
      if (validFiles.length !== files.length) {
        toast.error('Only Excel and CSV files are allowed');
      }
      
      setSelectedFiles(validFiles);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Upload Excel Files</h2>
      
      <div className="mb-6">
        <div 
          className={`relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-blue-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept=".xlsx, .xls, .csv"
            multiple
            onChange={handleFileSelect}
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center py-5">
            <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-700 font-medium">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Excel files only (.xlsx, .xls, .csv)
            </p>
            <button
              type="button"
              onClick={handleBrowseFiles}
              className="mt-3 px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="truncate max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700 focus:outline-none p-1"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                  aria-label="Remove file"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedFiles([])}
          disabled={selectedFiles.length === 0 || isLoading}
          className={`px-4 py-2 rounded-lg text-sm ${
            selectedFiles.length === 0 || isLoading
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Clear
        </button>
        
        <button
          type="button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isLoading}
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            selectedFiles.length === 0 || isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
          } transition-colors`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Upload Files'
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
