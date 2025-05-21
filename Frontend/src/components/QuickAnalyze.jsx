import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { analyzeUploadedFile, resetAnalysis } from '../redux/slices/fileSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const QuickAnalyze = () => {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [drag, setDrag] = useState(false);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  
  const dispatch = useDispatch();
  const { isAnalyzing, currentAnalysis, isError, message } = useSelector(state => state.files);

  // Reset analysis state when component mounts
  useEffect(() => {
    dispatch(resetAnalysis());
    setShowAnalysisResults(false);
  }, [dispatch]);

  // Predefined prompts for quick selection
  const predefinedPrompts = [
    "What insights can be drawn from this data?",
    "Identify patterns in the data",
    "Summarize the main findings",
    "Extract all questions from this file",
    "Find anomalies in the data",
    "What conclusions can be made from this dataset?"
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDrag(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate it's an Excel file
    if (
      selectedFile &&
      (selectedFile.type.includes('excel') || 
       selectedFile.name.endsWith('.xlsx') || 
       selectedFile.name.endsWith('.xls'))
    ) {
      setFile(selectedFile);
      
      // Show warning for large files
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast.warning('This file is quite large. Analysis may take longer or process only part of the data.');
      }
      
    } else {
      toast.error('Please select a valid Excel file (.xlsx, .xls)');
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      toast.error('Please select a file to analyze');
      return;
    }

    if (analysisType === 'custom' && !prompt.trim()) {
      toast.error('Please enter a prompt for analysis');
      return;
    }
    
    // Reset previous analysis state
    dispatch(resetAnalysis());
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysisType', analysisType);
    
    if (analysisType === 'custom' && prompt.trim()) {
      formData.append('customPrompt', prompt);
    }
    
    console.log('Sending analysis request for file:', file.name);
    toast.loading('Analyzing your file...', { id: 'analysis' });
    
    // Track errors in redux state
    if (isError) {
      console.error('Analysis error:', message);
      toast.error('Previous analysis failed: ' + message);
    }
    
    dispatch(analyzeUploadedFile({ formData }))
      .unwrap()
      .then((result) => {
        console.log('Analysis result:', result);
        toast.dismiss('analysis');
        toast.success('Analysis completed successfully');
        setShowAnalysisResults(true);
      })
      .catch((error) => {
        console.error('Analysis failed:', error);
        toast.dismiss('analysis');
        toast.error('Analysis failed: ' + (error?.message || 'Unknown error'));
        // Still show the results panel which will display the error
        setShowAnalysisResults(true);
      });
  };

  const handlePredefinedPrompt = (selectedPrompt) => {
    setPrompt(selectedPrompt);
    setAnalysisType('custom');
  };

  const handleReset = () => {
    setFile(null);
    setPrompt('');
    setAnalysisType('comprehensive');
    setShowAnalysisResults(false);
  };
  
  // Basic formatting for markdown-like text
  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Handle bullet points
    const withBullets = text.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    
    // Handle line breaks
    const withLineBreaks = withBullets.replace(/\n\n/g, '<br /><br />');
    
    return withLineBreaks;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Quick Analysis</h1>
        <p className="text-gray-600">Upload and instantly analyze an Excel file with AI</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        {!showAnalysisResults ? (
          <>
            {/* File upload area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 ${
                drag ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              } transition-colors`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 text-green-700 p-2 rounded-full mb-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Excel File
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">
                    Drag and drop your Excel file here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleInputChange}
                      />
                    </label>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Only Excel files (.xlsx, .xls) up to 50MB are supported</p>
                </>
              )}
            </div>

            {/* Analysis controls */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  >
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="custom">Custom Prompt</option>
                  </select>
                </div>
                
                {analysisType === 'custom' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Extract all questions from this file"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      rows="2"
                      disabled={isAnalyzing}
                    ></textarea>
                  </div>
                )}
              </div>
              
              {analysisType === 'custom' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Prompts
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedPrompts.map((predefinedPrompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePredefinedPrompt(predefinedPrompt)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200"
                        disabled={isAnalyzing}
                      >
                        {predefinedPrompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center ${
                  !file || isAnalyzing
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Analyze with AI
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Analysis Results</h3>
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Analyze another file
              </button>
            </div>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Analyzing your file with AI...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : currentAnalysis ? (
              <div className="space-y-6">
                {/* Show API limitation notice if present */}
                {currentAnalysis.note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Service Limitation</h3>
                        <div className="mt-1 text-sm text-amber-700">
                          <p>
                            AI-powered analysis is currently unavailable due to service limitations. We've provided a basic analysis of your file instead. For more detailed insights, please try again later when the AI service is available.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentAnalysis.customAnalysis ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatAnalysisText(currentAnalysis.customAnalysis) }}
                    />
                    {currentAnalysis.message && (
                      <div className="mt-4 text-sm text-gray-500 italic">
                        {currentAnalysis.message}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Summary Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                      <p className="text-gray-700">{currentAnalysis.summary}</p>
                    </div>
                    
                    {/* Insights Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {currentAnalysis.insights && currentAnalysis.insights.map((insight, index) => (
                          <li key={index} className="text-gray-700">{insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Recommendations Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {currentAnalysis.recommendations && currentAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Data Quality Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Quality Issues</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {currentAnalysis.dataQualityIssues && currentAnalysis.dataQualityIssues.map((issue, index) => (
                          <li key={index} className="text-gray-700">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Analysis Failed</h3>
                <p className="mt-2 text-gray-600">There was an error analyzing your file. Please try again.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuickAnalyze; 