const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const XLSX = require('xlsx');
const asyncHandler = require('express-async-handler');

// Helper function to verify model before making API calls
async function verifyGeminiModel() {
  if (!model) return false;
  
  try {
    // Try a simple prompt to check if the model works
    const result = await model.generateContent("Hello, just checking if you're available.");
    if (result && result.response) {
      return true;
    }
  } catch (error) {
    console.log('Gemini model verification failed:', error.message);
    return false;
  }
  return false;
}

// Helper function to use OpenAI if available
async function tryWithOpenAI(prompt) {
  if (!openai) return null;
  
  try {
    console.log('Attempting analysis with OpenAI');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful Excel data analyst." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000
    });
    
    if (response && response.choices && response.choices[0]) {
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.log('OpenAI analysis failed:', error.message);
  }
  
  return null;
}

// Try to import the Gemini API, but don't fail if it's not available
let genAI;
let model;
let openai;

try {
  // Optional import for Gemini AI with correct destructuring
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  // Initialize Gemini API if the API key is available
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Update to use the latest model name
    // Try first with gemini-1.5-pro, fallback to gemini-pro-latest if needed
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      console.log('Gemini AI initialized successfully with gemini-1.5-pro model');
    } catch (modelError) {
      // If the first model fails, try the alternative
      try {
        model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        console.log('Gemini AI initialized successfully with gemini-pro-latest model');
      } catch (alternativeError) {
        // Last resort: try with gemini-pro
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log('Gemini AI initialized successfully with gemini-pro model');
      }
    }
  } else {
    console.log('Gemini AI not initialized: Missing API key');
  }
} catch (error) {
  console.log('Gemini AI not available:', error.message);
}

// Try to initialize OpenAI as a fallback
try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI initialized as fallback');
  }
} catch (error) {
  console.log('OpenAI not available:', error.message);
}

// Optional import for xlsx
let xlsx;
try {
  xlsx = require('xlsx');
  console.log('XLSX library initialized successfully');
} catch (error) {
  console.log('XLSX library not available:', error.message);
}

/**
 * @desc    Upload Excel files
 * @route   POST /api/files/upload
 * @access  Private
 */
exports.uploadFiles = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      });
    }

    console.log(`[INFO] Upload request received with ${req.files.length} files`);
    
    // Process each uploaded file
    const uploadedFiles = [];
    for (const file of req.files) {
      // Validate Excel format
      if (!file.mimetype.includes('excel') && 
          !file.originalname.endsWith('.xlsx') && 
          !file.originalname.endsWith('.xls')) {
        continue;
      }

      // Validate file size (max 50 MB)
      const maxSizeInBytes = 50 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds the maximum size limit of 50 MB`
        });
      }

      // Create unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + file.originalname;

      // Save to MongoDB
      const newFile = new File({
        filename: filename,
        originalName: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        content: file.buffer,
        user: req.user.id
      });

      // Save file to database
      await newFile.save();

      console.log(`[INFO] Saved file to database: ${newFile.originalName} with ID ${newFile._id}`);
      
      uploadedFiles.push({
        id: newFile._id,
        filename: newFile.originalName,
        size: newFile.size,
        uploadedAt: newFile.createdAt
      });
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid Excel files were uploaded'
      });
    }

    res.status(201).json({
      success: true,
      count: uploadedFiles.length,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

/**
 * @desc    Get all files for a user
 * @route   GET /api/files
 * @access  Private
 */
exports.getFiles = async (req, res) => {
  try {
    console.log(`[INFO] Get files request for user ${req.user.id}`);
    
    // Get files from MongoDB
    const files = await File.findByUser(req.user.id);
    
    console.log(`[INFO] Found ${files.length} files for user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(file => ({
        id: file._id,
        filename: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt
      }))
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a file
 * @route   DELETE /api/files/:id
 * @access  Private
 */
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file in MongoDB
    const file = await File.findById(id);
    
    // If file not found
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if this file belongs to the current user
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this file'
      });
    }
    
    // Delete the file from MongoDB
    await file.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

/**
 * @desc    Get file details by ID
 * @route   GET /api/files/:id
 * @access  Private
 */
exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file in MongoDB
    const file = await File.findById(id);
    
    // If not found, return 404
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if this file belongs to the current user
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this file'
      });
    }
    
    res.status(200).json({
      success: true,
      file: {
        id: file._id,
        filename: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error.message
    });
  }
};

/**
 * @desc    Download file content
 * @route   GET /api/files/:id/download
 * @access  Private
 */
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file in MongoDB
    const file = await File.findById(id);
    
    // If not found, return 404
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if this file belongs to the current user
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this file'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    // Send the file content
    res.send(file.content);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
};

/**
 * @desc    Analyze file with Gemini AI
 * @route   POST /api/ai/analyze/:fileId
 * @access  Private
 */
exports.analyzeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { analysisType = 'comprehensive', customPrompt = '' } = req.body;

    console.log('Received custom prompt:', customPrompt);

    // Get the file from MongoDB
    const fileData = await File.findById(fileId);
    
    // If not found, return 404
    if (!fileData) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if this file belongs to the current user
    if (fileData.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to analyze this file'
      });
    }

    // Check if xlsx is available
    if (!xlsx) {
      return res.status(500).json({
        success: false,
        message: 'Excel processing library not available'
      });
    }

    // Extract data from the Excel file
    const workbook = xlsx.read(fileData.content, { type: 'buffer' });
    
    // If no sheets were found
    if (workbook.SheetNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sheets found in the Excel file'
      });
    }

    // Prepare data for analysis
    const extractedData = {};
    let allRows = [];
    let totalRows = 0;
    let totalColumns = 0;
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      // Convert sheet to JSON
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      // Skip empty sheets
      if (jsonData.length === 0) continue;
      
      // Store full data for specific analysis needs
      allRows = [...allRows, ...jsonData];
      
      // Count rows and find the maximum number of columns
      const sheetRows = jsonData.length;
      const sheetCols = Math.max(...jsonData.map(row => row.length));
      
      totalRows += sheetRows;
      totalColumns = Math.max(totalColumns, sheetCols);
      
      // Get headers (first row) if available
      const headers = jsonData[0] || [];
      
      // Store the sheet data
      extractedData[sheetName] = {
        rows: sheetRows,
        columns: sheetCols,
        headers: headers,
        // Include a sample of the data (up to 100 rows)
        sample: jsonData.slice(0, Math.min(100, jsonData.length))
      };
    }

    // Direct processing for question extraction requests
    if (customPrompt && customPrompt.toLowerCase().includes("question") && allRows.length > 0) {
      // Try to detect and extract questions directly
      const questions = extractQuestions(allRows);
      
      // If we found questions, return them directly for simple requests
      if (questions.length > 0 && customPrompt.toLowerCase().match(/first|top|give me|show me|list/)) {
        // Extract number from prompt (e.g., "first 5 questions" -> 5)
        const numberMatch = customPrompt.match(/\d+/);
        const numQuestions = numberMatch ? parseInt(numberMatch[0]) : 5;
        
        const result = {
          customAnalysis: questions.slice(0, numQuestions).join('\n\n'),
          totalQuestions: questions.length,
          requestedQuestions: numQuestions,
          message: `Showing ${Math.min(numQuestions, questions.length)} of ${questions.length} questions found.`
        };
        
        return res.status(200).json({
          success: true,
          analysis: result
        });
      }
    }

    // Handle custom keyword-based extraction
    if (customPrompt && (
      customPrompt.toLowerCase().includes("extract") || 
      customPrompt.toLowerCase().includes("find") || 
      customPrompt.toLowerCase().includes("get") ||
      customPrompt.toLowerCase().includes("show")
    )) {
      const result = processCustomExtraction(customPrompt, allRows, extractedData);
      if (result) {
        return res.status(200).json({
          success: true,
          analysis: result
        });
      }
    }

    // Try Gemini AI analysis
    let analysisResult = null;
    
    // Check if model exists and is accessible
    const modelIsAvailable = model ? await verifyGeminiModel() : false;
    
    if (modelIsAvailable) {
      try {
        console.log('Analyzing file with Gemini AI');
        
        // Prepare file info for the prompt
        const fileInfo = {
          filename: fileData.originalName,
          fileSize: fileData.size,
          sheets: Object.keys(extractedData).length,
          totalRows,
          totalColumns
        };
        
        let prompt;
        
        // Always prioritize custom prompts
        if (customPrompt && customPrompt.trim()) {
          // User provided a custom prompt - use it with data context
          prompt = `I'm analyzing an Excel file named "${fileData.originalName}". 
The file contains ${Object.keys(extractedData).length} sheets with a total of ${totalRows} rows.

Your task: ${customPrompt.trim()}

Here's a summary of each sheet:
`;
          
          for (const [sheetName, data] of Object.entries(extractedData)) {
            prompt += `
Sheet: ${sheetName}
- Rows: ${data.rows}
- Columns: ${data.columns}
- Headers: ${JSON.stringify(data.headers)}
          
Sample data (first 10 rows):
${data.sample.slice(0, 10).map(row => JSON.stringify(row)).join('\n')}
`;
          }
          
          // Make it crystal clear that we want a direct answer to the custom prompt
          prompt += `\n\nPlease DIRECTLY answer: ${customPrompt.trim()}
Do not include general analysis unless requested.
Respond in a way that directly addresses the specific request.`;
        } 
        else {
          // Use the default comprehensive prompt
          prompt = `Please analyze this Excel file: ${fileData.originalName}
              
File contains ${Object.keys(extractedData).length} sheets with a total of ${totalRows} rows.
              
Here's a summary of each sheet:
`;
          
          for (const [sheetName, data] of Object.entries(extractedData)) {
            prompt += `
Sheet: ${sheetName}
- Rows: ${data.rows}
- Columns: ${data.columns}
- Headers: ${data.headers.join(', ')}
            
Sample data (up to 10 rows):
${data.sample.slice(0, 10).map(row => JSON.stringify(row)).join('\n')}
`;
          }
          
          prompt += `
Based on this data, please provide:
1. A comprehensive summary of what this Excel file contains
2. Key insights from the data (patterns, trends, anomalies)
3. Specific recommendations based on the data
4. Any data quality issues or improvements that could be made

If there's not enough information to provide a complete analysis, focus on what you can discern from the available data.
`;
        }

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // If using custom prompt, return the raw response without additional processing
        if (customPrompt && customPrompt.trim()) {
          // Basic formatting for custom prompt responses
          analysisResult = {
            customAnalysis: text,
            rawPrompt: customPrompt
          };
        } else {
          // For standard analysis, structure the AI response
          const analysisLines = text.split('\n');
          
          // Extract sections from the AI response
          const sections = {
            summary: [],
            insights: [],
            recommendations: [],
            dataQualityIssues: []
          };
          
          let currentSection = 'summary';
          
          for (const line of analysisLines) {
            // Check for section headers
            if (line.match(/key insights|insights|patterns|trends/i)) {
              currentSection = 'insights';
              continue;
            } else if (line.match(/recommendations|suggested actions|next steps/i)) {
              currentSection = 'recommendations';
              continue;
            } else if (line.match(/data quality|improvements|issues|concerns/i)) {
              currentSection = 'dataQualityIssues';
              continue;
            }
            
            // Add non-empty lines to the current section
            if (line.trim() && !line.match(/^[0-9]+\./)) {
              sections[currentSection].push(line.trim());
            }
          }
          
          // Build the analysis object
          analysisResult = {
            summary: sections.summary.join(' ').trim() || `Analysis of ${fileData.originalName}`,
            insights: sections.insights.filter(item => item.length > 10) || 
              [`No specific insights could be derived from ${fileData.originalName}`],
            recommendations: sections.recommendations.filter(item => item.length > 10) || 
              [`Consider a more detailed analysis of ${fileData.originalName}`],
            dataQualityIssues: sections.dataQualityIssues.filter(item => item.length > 10) || 
              [`No specific data quality issues identified in ${fileData.originalName}`]
          };
        }
      } catch (aiError) {
        console.error('Gemini AI analysis error:', aiError);
        // Try OpenAI as fallback if available
        if (openai) {
          try {
            const openaiText = await tryWithOpenAI(prompt);
            if (openaiText) {
              if (customPrompt && customPrompt.trim()) {
                analysisResult = {
                  customAnalysis: openaiText,
                  rawPrompt: customPrompt,
                  provider: "OpenAI (fallback)"
                };
              } else {
                // For standard analysis with OpenAI, use simpler formatting
                analysisResult = {
                  summary: `Analysis of ${fileData.originalName} (via OpenAI)`,
                  insights: [openaiText.split('\n\n')[0] || "Key insights from the data"],
                  recommendations: [openaiText.split('\n\n')[1] || "Consider reviewing the full analysis"],
                  dataQualityIssues: [openaiText.split('\n\n')[2] || "No specific issues identified"],
                  provider: "OpenAI (fallback)"
                };
              }
            }
          } catch (openaiError) {
            console.error('OpenAI fallback error:', openaiError);
          }
        }
      }
    }

    // If we have a result from Gemini, return it
    if (analysisResult) {
      return res.status(200).json({
        success: true,
        analysis: analysisResult
      });
    }
    
    // Fallback processing if Gemini fails or is unavailable
    console.log('Fallback processing for:', customPrompt || 'standard analysis');
    
    // For custom prompts, try to generate meaningful output even without AI
    if (customPrompt && customPrompt.trim()) {
      // Extract questions if that's what was requested
      if (customPrompt.toLowerCase().includes("question")) {
        const questions = extractQuestions(allRows);
        
        if (questions.length > 0) {
          // Extract number from prompt (e.g., "first 5 questions" -> 5)
          const numberMatch = customPrompt.match(/\d+/);
          const numQuestions = numberMatch ? parseInt(numberMatch[0]) : 5;
          
          return res.status(200).json({
            success: true,
            analysis: {
              customAnalysis: questions.slice(0, numQuestions).join('\n\n'),
              totalQuestions: questions.length,
              requestedQuestions: numQuestions,
              message: `Showing ${Math.min(numQuestions, questions.length)} of ${questions.length} questions found.`
            }
          });
        }
      }
      
      // Handle other types of custom prompts with a meaningful response
      return res.status(200).json({
        success: true,
        analysis: {
          customAnalysis: `For your request "${customPrompt}", here's what I found in the Excel file:\n\n` +
            `The file contains ${totalRows} rows and ${totalColumns} columns across ${Object.keys(extractedData).length} sheets.\n\n` +
            `Unable to process your specific request due to AI service limitation. Please try a simpler request like "give me the first 5 questions" or contact support.`,
          rawPrompt: customPrompt,
          message: "Limited response due to AI service unavailability"
        }
      });
    } else {
      // For standard analysis, return basic analysis
      const basicAnalysis = generateBasicAnalysis(fileData, extractedData);
      return res.status(200).json({
        success: true,
        analysis: basicAnalysis,
        note: 'AI-powered analysis not available, showing basic analysis instead'
      });
    }
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing file',
      error: error.message
    });
  }
};

// Helper function to extract questions from row data
function extractQuestions(allRows) {
  const questions = [];
  const questionPattern = /^Q\d+|^\d+[\.\)]/i;
  
  // First pass - look for question-like rows with patterns
  for (let i = 0; i < Math.min(allRows.length, 200); i++) {
    const row = allRows[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || '');
      if (firstCell && (questionPattern.test(firstCell) || (firstCell.length > 20 && firstCell.includes('?')))) {
        questions.push(firstCell);
      }
    }
  }
  
  // If we didn't find many questions with patterns, look for longer text cells
  if (questions.length < 5) {
    for (let i = 0; i < Math.min(allRows.length, 200); i++) {
      const row = allRows[i];
      if (row && row.length > 0) {
        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j] || '');
          if (cell && cell.length > 30 && !questions.includes(cell)) {
            questions.push(cell);
          }
        }
      }
    }
  }
  
  return questions;
}

// Helper function to handle custom extraction requests
function processCustomExtraction(customPrompt, allRows, extractedData) {
  // Try to determine what the user wants to extract
  const prompt = customPrompt.toLowerCase();
  
  // Extract questions
  if (prompt.includes("question")) {
    const questions = extractQuestions(allRows);
    if (questions.length > 0) {
      const numberMatch = prompt.match(/\d+/);
      const numItems = numberMatch ? parseInt(numberMatch[0]) : 10;
      
      return {
        customAnalysis: questions.slice(0, numItems).join('\n\n'),
        totalFound: questions.length,
        requestedItems: numItems,
        message: `Showing ${Math.min(numItems, questions.length)} of ${questions.length} questions found.`
      };
    }
  }
  
  // Extract column data
  const sheetNames = Object.keys(extractedData);
  if (sheetNames.length > 0) {
    const firstSheet = extractedData[sheetNames[0]];
    
    // Check if user is asking for specific column data
    const headers = firstSheet.headers.map(h => String(h).toLowerCase());
    
    for (const header of headers) {
      if (prompt.includes(header)) {
        // User wants data from a specific column
        const columnIndex = headers.indexOf(header);
        const columnData = [];
        
        // Extract data from that column
        for (let i = 1; i < Math.min(firstSheet.sample.length, 20); i++) {
          const row = firstSheet.sample[i];
          if (row && row.length > columnIndex && row[columnIndex]) {
            columnData.push(row[columnIndex]);
          }
        }
        
        if (columnData.length > 0) {
          return {
            customAnalysis: `Data from column "${header}":\n\n${columnData.join('\n')}`,
            message: `Showing data from the "${header}" column`
          };
        }
      }
    }
  }
  
  // No specific extraction logic matched
  return null;
}

/**
 * Generate basic analysis based on file properties and extracted data
 * @param {Object} fileData - The file data object
 * @param {Object} extractedData - The extracted data from the Excel file
 * @returns {Object} - The basic analysis
 */
function generateBasicAnalysis(fileData, extractedData) {
  const fileName = fileData.originalName || fileData.filename;
  const fileSize = fileData.size || 1000000;
  
  // Calculate total rows and columns
  let totalRows = 0;
  let totalColumns = 0;
  const sheetNames = Object.keys(extractedData);
  
  sheetNames.forEach(sheetName => {
    const sheetData = extractedData[sheetName];
    totalRows += sheetData.rows;
    totalColumns = Math.max(totalColumns, sheetData.columns);
  });
  
  // Generate column names from headers
  const columnNames = [];
  if (sheetNames.length > 0) {
    const firstSheet = extractedData[sheetNames[0]];
    if (firstSheet.headers && firstSheet.headers.length > 0) {
      firstSheet.headers.forEach(header => {
        if (header && header.toString().trim()) {
          columnNames.push(header.toString().trim());
        }
      });
    }
  }
  
  // Get a few column names to reference in insights
  const sampleColumns = columnNames.slice(0, 3).filter(Boolean);
  
  return {
    summary: `${fileName} contains ${totalRows} rows and ${totalColumns} columns across ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}.`,
    insights: [
      `The file contains data organized into ${sheetNames.length} sheet(s) with a total of ${totalRows} records.`,
      sampleColumns.length > 0 ? `Key columns include: ${sampleColumns.join(', ')}` : `The file has ${totalColumns} columns of data.`,
      `The data appears to be ${fileName.includes('Report') ? 'a report' : 'a dataset'} with ${totalRows} entries.`
    ],
    recommendations: [
      `Review the data in ${sheetNames[0] || 'the first sheet'} as it contains the most information.`,
      `Consider creating visualizations for key metrics to better understand trends.`,
      `Analyze patterns over time if date information is available in the dataset.`
    ],
    dataQualityIssues: [
      `Check for missing values in important columns.`,
      `Verify data consistency across sheets.`,
      `Ensure numeric columns are properly formatted for analysis.`
    ]
  };
}

/**
 * @desc    Analyze uploaded file with Gemini AI (single request)
 * @route   POST /api/files/analyze/upload
 * @access  Private
 */
exports.analyzeUploadedFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Check if xlsx is available
    if (!xlsx) {
      return res.status(500).json({
        success: false,
        message: 'Excel processing library not available'
      });
    }

    const { analysisType = 'comprehensive', customPrompt = '' } = req.body;
    const file = req.file;

    // Validate Excel format
    if (!file.mimetype.includes('excel') && 
        !file.originalname.endsWith('.xlsx') && 
        !file.originalname.endsWith('.xls')) {
      return res.status(400).json({
        success: false,
        message: 'Only Excel files are supported'
      });
    }

    // Extract data from the Excel file
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    
    // If no sheets were found
    if (workbook.SheetNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sheets found in the Excel file'
      });
    }

    // Prepare data for analysis (using same logic as analyzeFile)
    const extractedData = {};
    let allRows = [];
    let totalRows = 0;
    let totalColumns = 0;
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      // Convert sheet to JSON
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      // Skip empty sheets
      if (jsonData.length === 0) continue;
      
      // Store full data for specific analysis needs
      allRows = [...allRows, ...jsonData];
      
      // Count rows and find the maximum number of columns
      const sheetRows = jsonData.length;
      const sheetCols = Math.max(...jsonData.map(row => row.length));
      
      totalRows += sheetRows;
      totalColumns = Math.max(totalColumns, sheetCols);
      
      // Get headers (first row) if available
      const headers = jsonData[0] || [];
      
      // Store the sheet data
      extractedData[sheetName] = {
        rows: sheetRows,
        columns: sheetCols,
        headers: headers,
        // Include a sample of the data (up to 100 rows)
        sample: jsonData.slice(0, Math.min(100, jsonData.length))
      };
    }

    // Direct processing for question extraction requests
    if (customPrompt && customPrompt.toLowerCase().includes("question") && allRows.length > 0) {
      // Try to detect and extract questions directly
      const questions = extractQuestions(allRows);
      
      // If we found questions, return them directly for simple requests
      if (questions.length > 0 && customPrompt.toLowerCase().match(/first|top|give me|show me|list/)) {
        // Extract number from prompt (e.g., "first 5 questions" -> 5)
        const numberMatch = customPrompt.match(/\d+/);
        const numQuestions = numberMatch ? parseInt(numberMatch[0]) : 5;
        
        const result = {
          customAnalysis: questions.slice(0, numQuestions).join('\n\n'),
          totalQuestions: questions.length,
          requestedQuestions: numQuestions,
          message: `Showing ${Math.min(numQuestions, questions.length)} of ${questions.length} questions found.`
        };
        
        return res.status(200).json({
          success: true,
          analysis: result
        });
      }
    }

    // Handle custom keyword-based extraction
    if (customPrompt && (
      customPrompt.toLowerCase().includes("extract") || 
      customPrompt.toLowerCase().includes("find") || 
      customPrompt.toLowerCase().includes("get") ||
      customPrompt.toLowerCase().includes("show")
    )) {
      const result = processCustomExtraction(customPrompt, allRows, extractedData);
      if (result) {
        return res.status(200).json({
          success: true,
          analysis: result
        });
      }
    }

    // Try Gemini AI analysis (same logic as analyzeFile)
    let analysisResult = null;
    
    // Check if model exists and is accessible
    const modelIsAvailable = model ? await verifyGeminiModel() : false;
    
    if (modelIsAvailable) {
      try {
        console.log('Analyzing uploaded file with Gemini AI');
        
        // Prepare file info for the prompt
        const fileInfo = {
          filename: file.originalname,
          fileSize: file.size,
          sheets: Object.keys(extractedData).length,
          totalRows,
          totalColumns
        };
        
        let prompt;
        
        // Always prioritize custom prompts
        if (customPrompt && customPrompt.trim()) {
          // User provided a custom prompt - use it with data context
          prompt = `I'm analyzing an Excel file named "${file.originalname}". 
The file contains ${Object.keys(extractedData).length} sheets with a total of ${totalRows} rows.

Your task: ${customPrompt.trim()}

Here's a summary of each sheet:
`;
          
          for (const [sheetName, data] of Object.entries(extractedData)) {
            prompt += `
Sheet: ${sheetName}
- Rows: ${data.rows}
- Columns: ${data.columns}
- Headers: ${JSON.stringify(data.headers)}
          
Sample data (first 10 rows):
${data.sample.slice(0, 10).map(row => JSON.stringify(row)).join('\n')}
`;
          }
          
          // Make it crystal clear that we want a direct answer to the custom prompt
          prompt += `\n\nPlease DIRECTLY answer: ${customPrompt.trim()}
Do not include general analysis unless requested.
Respond in a way that directly addresses the specific request.`;
        } 
        else {
          // Use the default comprehensive prompt
          prompt = `Please analyze this Excel file: ${file.originalname}
              
File contains ${Object.keys(extractedData).length} sheets with a total of ${totalRows} rows.
              
Here's a summary of each sheet:
`;
          
          for (const [sheetName, data] of Object.entries(extractedData)) {
            prompt += `
Sheet: ${sheetName}
- Rows: ${data.rows}
- Columns: ${data.columns}
- Headers: ${data.headers.join(', ')}
            
Sample data (up to 10 rows):
${data.sample.slice(0, 10).map(row => JSON.stringify(row)).join('\n')}
`;
          }
          
          prompt += `
Based on this data, please provide:
1. A comprehensive summary of what this Excel file contains
2. Key insights from the data (patterns, trends, anomalies)
3. Specific recommendations based on the data
4. Any data quality issues or improvements that could be made

If there's not enough information to provide a complete analysis, focus on what you can discern from the available data.
`;
        }

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // If using custom prompt, return the raw response without additional processing
        if (customPrompt && customPrompt.trim()) {
          // Basic formatting for custom prompt responses
          analysisResult = {
            customAnalysis: text,
            rawPrompt: customPrompt
          };
        } else {
          // For standard analysis, structure the AI response
          const analysisLines = text.split('\n');
          
          // Extract sections from the AI response
          const sections = {
            summary: [],
            insights: [],
            recommendations: [],
            dataQualityIssues: []
          };
          
          let currentSection = 'summary';
          
          for (const line of analysisLines) {
            // Check for section headers
            if (line.match(/key insights|insights|patterns|trends/i)) {
              currentSection = 'insights';
              continue;
            } else if (line.match(/recommendations|suggested actions|next steps/i)) {
              currentSection = 'recommendations';
              continue;
            } else if (line.match(/data quality|improvements|issues|concerns/i)) {
              currentSection = 'dataQualityIssues';
              continue;
            }
            
            // Add non-empty lines to the current section
            if (line.trim() && !line.match(/^[0-9]+\./)) {
              sections[currentSection].push(line.trim());
            }
          }
          
          // Build the analysis object
          analysisResult = {
            summary: sections.summary.join(' ').trim() || `Analysis of ${file.originalname}`,
            insights: sections.insights.filter(item => item.length > 10) || 
              [`No specific insights could be derived from ${file.originalname}`],
            recommendations: sections.recommendations.filter(item => item.length > 10) || 
              [`Consider a more detailed analysis of ${file.originalname}`],
            dataQualityIssues: sections.dataQualityIssues.filter(item => item.length > 10) || 
              [`No specific data quality issues identified in ${file.originalname}`]
          };
        }
      } catch (aiError) {
        console.error('Gemini AI analysis error:', aiError);
        // Try OpenAI as fallback if available
        if (openai) {
          try {
            const openaiText = await tryWithOpenAI(prompt);
            if (openaiText) {
              if (customPrompt && customPrompt.trim()) {
                analysisResult = {
                  customAnalysis: openaiText,
                  rawPrompt: customPrompt,
                  provider: "OpenAI (fallback)"
                };
              } else {
                // For standard analysis with OpenAI, use simpler formatting
                analysisResult = {
                  summary: `Analysis of ${file.originalname} (via OpenAI)`,
                  insights: [openaiText.split('\n\n')[0] || "Key insights from the data"],
                  recommendations: [openaiText.split('\n\n')[1] || "Consider reviewing the full analysis"],
                  dataQualityIssues: [openaiText.split('\n\n')[2] || "No specific issues identified"],
                  provider: "OpenAI (fallback)"
                };
              }
            }
          } catch (openaiError) {
            console.error('OpenAI fallback error:', openaiError);
          }
        }
      }
    }

    // If we have a result from Gemini, return it
    if (analysisResult) {
      return res.status(200).json({
        success: true,
        analysis: analysisResult
      });
    }
    
    // Fallback processing if Gemini fails or is unavailable
    console.log('Fallback processing for:', customPrompt || 'standard analysis');
    
    // For custom prompts, try to generate meaningful output even without AI
    if (customPrompt && customPrompt.trim()) {
      // Extract questions if that's what was requested
      if (customPrompt.toLowerCase().includes("question")) {
        const questions = extractQuestions(allRows);
        
        if (questions.length > 0) {
          // Extract number from prompt (e.g., "first 5 questions" -> 5)
          const numberMatch = customPrompt.match(/\d+/);
          const numQuestions = numberMatch ? parseInt(numberMatch[0]) : 5;
          
          return res.status(200).json({
            success: true,
            analysis: {
              customAnalysis: questions.slice(0, numQuestions).join('\n\n'),
              totalQuestions: questions.length,
              requestedQuestions: numQuestions,
              message: `Showing ${Math.min(numQuestions, questions.length)} of ${questions.length} questions found.`
            }
          });
        }
      }
      
      // Handle other types of custom prompts with a meaningful response
      return res.status(200).json({
        success: true,
        analysis: {
          customAnalysis: `For your request "${customPrompt}", here's what I found in the Excel file:\n\n` +
            `The file contains ${totalRows} rows and ${totalColumns} columns across ${Object.keys(extractedData).length} sheets.\n\n` +
            `Unable to process your specific request due to AI service limitation. Please try a simpler request like "give me the first 5 questions" or contact support.`,
          rawPrompt: customPrompt,
          message: "Limited response due to AI service unavailability"
        }
      });
    } else {
      // For standard analysis, return basic analysis
      const basicAnalysis = generateBasicAnalysis({
        originalName: file.originalname,
        size: file.size
      }, extractedData);
      
      return res.status(200).json({
        success: true,
        analysis: basicAnalysis,
        note: 'AI-powered analysis not available, showing basic analysis instead'
      });
    }
  } catch (error) {
    console.error('File upload analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing uploaded file',
      error: error.message
    });
  }
};

/**
 * @desc    Get data from Excel file for visualization
 * @route   GET /api/files/:id/data
 * @access  Private
 */
exports.getFileData = asyncHandler(async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    // Find the file by ID and user ID
    const file = await File.findOne({
      _id: fileId,
      user: userId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if the file exists in the database
    if (!file.content) {
      return res.status(404).json({
        success: false,
        message: 'File data not found',
      });
    }

    // Parse Excel file data
    const workbook = XLSX.read(file.content, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert the worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Extract headers from the first row
    const headers = Object.keys(jsonData[0] || {});

    // Return the processed data
    res.status(200).json({
      success: true,
      headers,
      data: jsonData,
      sheetName,
      totalRows: jsonData.length
    });
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file data',
      error: error.message,
    });
  }
}); 