import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import Chart2D from './visualizations/Chart2D';
import Chart3D from './visualizations/Chart3D';
import { getToken } from '../utils/auth';

const Visualizations = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationType, setVisualizationType] = useState('2d');

  // Fetch the user's files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:5000/api/files', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        // Filter out files without valid IDs
        const validFiles = (data.files || []).filter(file => file && file._id && file._id !== 'undefined');
        console.log('Valid files for visualization:', validFiles);
        setFiles(validFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to load your files. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [navigate]);

  // Fetch file data when a file is selected
  const handleFileSelect = async (file) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      setFileData(null);
      
      // Validate file and file._id
      if (!file || !file._id || file._id === 'undefined') {
        throw new Error('Invalid file selected. Missing file ID.');
      }
      
      // Log the file ID for debugging
      console.log('Fetching data for file ID:', file._id);
      console.log('Selected file:', file);
      
      const token = getToken();
      
      const fileId = file.id || file._id; // Try both possible ID fields
      
      const response = await fetch(`http://localhost:5000/api/files/${fileId}/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(`Failed to fetch file data: ${errorData.message || response.status}`);
      }

      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid data format returned:', data);
        throw new Error('The server returned invalid data format');
      }
      
      setFileData(data);
    } catch (error) {
      console.error('Error fetching file data:', error);
      setError(`Failed to load file data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Visualizations</h2>
          <p className="text-gray-600 mb-6">
            Create interactive charts and visualizations from your Excel data.
          </p>

          {/* File Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Excel File</h3>
            {loading && !fileData ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedFile && selectedFile._id === file._id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-green-600 mr-3"
                      >
                        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.uploadDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No Excel files found</p>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => navigate('/dashboard/files')}
                >
                  Upload Excel Files
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Visualization Type Selection */}
          {selectedFile && fileData && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visualization Type
              </h3>
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${
                    visualizationType === '2d'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setVisualizationType('2d')}
                >
                  2D Charts
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    visualizationType === '3d'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setVisualizationType('3d')}
                >
                  3D Visualizations
                </button>
              </div>
            </div>
          )}

          {/* Chart Components */}
          {selectedFile && fileData && (
            <div>
              {visualizationType === '2d' ? (
                <Chart2D fileData={fileData} filename={selectedFile.filename} />
              ) : (
                <Chart3D fileData={fileData} filename={selectedFile.filename} />
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Visualizations; 