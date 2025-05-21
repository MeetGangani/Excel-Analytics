import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { analyzeFile, resetAnalysis } from '../redux/slices/fileSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FileAnalysis = ({ fileId, fileName, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [isOpen, setIsOpen] = useState(true);
  
  const dispatch = useDispatch();
  const { isAnalyzing, currentAnalysis, isError, message } = useSelector(state => state.files);
  
  // Reset analysis state when component mounts
  useEffect(() => {
    dispatch(resetAnalysis());
  }, [dispatch]);
  
  // Debug logging
  useEffect(() => {
    console.log('FileAnalysis component state:', {
      fileId,
      fileName,
      isAnalyzing,
      currentAnalysis: currentAnalysis ? 'present' : 'null',
      isError,
      message
    });
  }, [fileId, fileName, isAnalyzing, currentAnalysis, isError, message]);

  // Predefined prompts for quick selection
  const predefinedPrompts = [
    "What insights can be drawn from this data?",
    "Identify patterns in the data",
    "Summarize the main findings",
    "Extract all questions from this file",
    "Find anomalies in the data",
    "What conclusions can be made from this dataset?"
  ];

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      console.error('Analysis error:', message);
    }
  }, [isError, message]);
  
  const handleAnalyze = () => {
    if (!prompt.trim() && analysisType === 'custom') {
      toast.error('Please enter a prompt for analysis');
      return;
    }
    
    // Reset previous analysis state before starting new analysis
    dispatch(resetAnalysis());
    
    console.log('Initiating file analysis:', { fileId, analysisType, prompt });
    toast.loading('Analyzing your file...', { id: 'analysis' });
    
    dispatch(analyzeFile({ 
      fileId, 
      customPrompt: prompt, 
      analysisType 
    }))
      .unwrap()
      .then((result) => {
        console.log('Analysis completed successfully:', result);
        toast.dismiss('analysis');
        toast.success('Analysis completed successfully');
      })
      .catch((error) => {
        console.error('Analysis failed:', error);
        toast.dismiss('analysis');
        toast.error('Analysis failed: ' + (error?.message || 'Unknown error'));
      });
  };
  
  const handlePredefinedPrompt = (selectedPrompt) => {
    setPrompt(selectedPrompt);
    setAnalysisType('custom');
  };
  
  const handleClose = () => {
    setIsOpen(false);
    // Delay to allow animation to complete
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
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
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClose}
    >
      <motion.div 
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: isOpen ? 1 : 0.9, y: isOpen ? 0 : 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-xl font-semibold">Analyze File: {fileName}</h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Analysis Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
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
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center ${
                isAnalyzing 
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
        
        {/* Analysis Results */}
        <div className="p-6 flex-1 overflow-auto">
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
              
              {/* Show provider information if available */}
              {currentAnalysis.provider && (
                <div className="mb-4 text-sm text-gray-500 flex items-center">
                  <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analysis powered by: {currentAnalysis.provider}
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
            <div className="bg-blue-50 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Ready to Analyze</h3>
              <p className="mt-2 text-gray-600">Choose an analysis type and click "Analyze" to get insights from your file</p>
              <p className="mt-1 text-sm text-gray-500">
                Analysis is performed using Google's Gemini AI
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileAnalysis; 