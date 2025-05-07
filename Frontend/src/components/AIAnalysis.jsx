import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';

const AIAnalysis = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploadMode, setUploadMode] = useState(false); // Toggle between existing files and upload mode
  const [newFile, setNewFile] = useState(null); // For direct upload
  const [showCustomPrompt, setShowCustomPrompt] = useState(false); // Toggle for custom prompt
  const [customPrompt, setCustomPrompt] = useState(''); // Store the custom prompt
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user's files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/');
          return;
        }

        const { token } = JSON.parse(userData);
        
        const response = await fetch('http://localhost:5000/api/files', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        setFiles(data.files || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [navigate]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setAnalysis(null); // Clear previous analysis
  };

  const handleNewFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Only Excel files (.xlsx, .xls) are allowed.');
      return;
    }
    
    setNewFile(file);
    setError(null);
    setAnalysis(null);
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
  };

  const toggleCustomPrompt = () => {
    setShowCustomPrompt(!showCustomPrompt);
    // Clear custom prompt when toggling off
    if (showCustomPrompt) {
      setCustomPrompt('');
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile && !newFile) {
      setError('Please select a file to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/');
        return;
      }

      const { token } = JSON.parse(userData);
      
      // If we're analyzing an existing file
      if (selectedFile && !newFile) {
        const response = await fetch(`http://localhost:5000/api/files/${selectedFile.id}/analyze`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisType: 'comprehensive',
            customPrompt: customPrompt
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze file');
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } 
      // If we're uploading and analyzing a new file
      else if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        formData.append('analysisType', 'comprehensive');
        
        // Add custom prompt to form data if provided
        if (customPrompt) {
          formData.append('customPrompt', customPrompt);
        }

        const response = await fetch('http://localhost:5000/api/files/analyze/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze file');
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setNewFile(null);
    setSelectedFile(null);
    setCustomPrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to render the appropriate analysis content
  const renderAnalysisContent = () => {
    if (!analysis) return null;

    // Check if it's a custom analysis
    if (analysis.customAnalysis) {
      // This is a custom prompt analysis, render it differently
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900">
              {analysis.message ? analysis.message : 'Custom Analysis Results'}
            </h3>
            <div className="mt-4 p-5 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-line">
              {analysis.customAnalysis}
            </div>
          </div>
        </div>
      );
    }

    // Otherwise, render the structured analysis
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-900">Summary</h3>
          <p className="mt-1 text-sm text-gray-600">{analysis.summary}</p>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-900">Key Insights</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600">{insight}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-900">Recommendations</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600">{recommendation}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-900">Data Quality Issues</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {analysis.dataQualityIssues.map((issue, index) => (
              <li key={index} className="text-sm text-gray-600">{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Fix layout by ensuring this container has proper min-height and no excessive margins */}
      <div className="h-full min-h-[80vh] max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Analysis with Gemini</h1>
          <p className="mt-2 text-sm text-gray-700">
            Use Google's Gemini AI to analyze your Excel files and get actionable insights.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File selection */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Select a File</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadMode(false)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    !uploadMode
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Existing Files
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode(true)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    uploadMode
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload New
                </button>
              </div>
            </div>
            
            {/* Upload New File Section */}
            {uploadMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Excel File for Analysis
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload Excel file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            accept=".xlsx,.xls" 
                            className="sr-only" 
                            onChange={handleNewFileSelect}
                            ref={fileInputRef}
                            disabled={analyzing}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Excel files only (.xlsx, .xls)
                      </p>
                    </div>
                  </div>
                </div>

                {newFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-900 truncate">{newFile.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({(newFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                )}

                {/* Custom Prompt Toggle */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleCustomPrompt}
                      className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      {showCustomPrompt ? (
                        <>
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Hide Custom Prompt
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Use Custom Prompt
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showCustomPrompt && (
                    <div className="mt-2">
                      <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your analysis prompt for Gemini
                      </label>
                      <textarea
                        id="customPrompt"
                        name="customPrompt"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="E.g., Give me the first 5 questions or Show me sales trends by region"
                        value={customPrompt}
                        onChange={handleCustomPromptChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Be specific about what you want Gemini to extract or analyze from your data.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={analyzeFile}
                    disabled={!newFile || analyzing}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    {analyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze with Gemini AI'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Existing Files Section
              loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No files available</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload some Excel files first.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/files')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Upload Files
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer border ${
                          selectedFile?.id === file.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleFileSelect(file)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Prompt Toggle */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={toggleCustomPrompt}
                        className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                      >
                        {showCustomPrompt ? (
                          <>
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Hide Custom Prompt
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Use Custom Prompt
                          </>
                        )}
                      </button>
                    </div>
                    
                    {showCustomPrompt && (
                      <div className="mt-2">
                        <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                          Enter your analysis prompt for Gemini
                        </label>
                        <textarea
                          id="customPrompt"
                          name="customPrompt"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="E.g., Give me the first 5 questions or Show me sales trends by region"
                          value={customPrompt}
                          onChange={handleCustomPromptChange}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Be specific about what you want Gemini to extract or analyze from your data.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={analyzeFile}
                      disabled={!selectedFile || analyzing}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                    >
                      {analyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        'Analyze with Gemini AI'
                      )}
                    </button>
                  </div>
                </>
              )
            )}
          </div>

          {/* Analysis results */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Analysis Results</h2>
              {analysis && (
                <button
                  onClick={resetAnalysis}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
              )}
            </div>
            
            {!selectedFile && !newFile ? (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No file selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a file to analyze with Gemini AI.</p>
              </div>
            ) : analyzing ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Analyzing your data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {customPrompt ? 'Gemini AI is processing your custom query...' : 'Gemini AI is processing your file and generating insights...'}
                  </p>
                </div>
              </div>
            ) : analysis ? (
              // Use the renderAnalysisContent helper to display the right format
              <div className="space-y-6">
                {renderAnalysisContent()}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Export Analysis
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ready to analyze</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {showCustomPrompt ? 
                    'Enter your custom prompt and click "Analyze with Gemini AI".' : 
                    'Click "Analyze with Gemini AI" to start the analysis.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAnalysis; 