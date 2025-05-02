const fs = require('fs');
const path = require('path');
const File = require('../models/File');

// Try to import the Gemini API, but don't fail if it's not available
let genAI;
let model;

try {
  // Optional import for Gemini AI with correct destructuring
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  // Initialize Gemini API if the API key is available
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('Gemini AI initialized successfully');
  } else {
    console.log('Gemini AI not initialized: Missing API key');
  }
} catch (error) {
  console.log('Gemini AI not available:', error.message);
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
    const { analysisType = 'comprehensive' } = req.body;

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
    let totalRows = 0;
    let totalColumns = 0;
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      // Convert sheet to JSON
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      // Skip empty sheets
      if (jsonData.length === 0) continue;
      
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

    // If Gemini AI is available, use it for analysis
    if (model) {
      try {
        console.log('Analyzing file with Gemini AI');
        
        // Prepare prompt for Gemini AI
        const fileInfo = {
          filename: fileData.originalName,
          fileSize: fileData.size,
          sheets: Object.keys(extractedData).length,
          totalRows,
          totalColumns
        };
        
        // Build a detailed prompt based on the extracted data
        let prompt = `Please analyze this Excel file: ${fileData.originalName}
            
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

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Structure the AI response
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
        const analysis = {
          summary: sections.summary.join(' ').trim() || `Analysis of ${fileData.originalName}`,
          insights: sections.insights.filter(item => item.length > 10) || 
            [`No specific insights could be derived from ${fileData.originalName}`],
          recommendations: sections.recommendations.filter(item => item.length > 10) || 
            [`Consider a more detailed analysis of ${fileData.originalName}`],
          dataQualityIssues: sections.dataQualityIssues.filter(item => item.length > 10) || 
            [`No specific data quality issues identified in ${fileData.originalName}`]
        };
        
        return res.status(200).json({
          success: true,
          analysis
        });
      } catch (aiError) {
        console.error('Gemini AI analysis error:', aiError);
        
        // Fall back to basic analysis
        const basicAnalysis = generateBasicAnalysis(fileData, extractedData);
        
        return res.status(200).json({
          success: true,
          analysis: basicAnalysis,
          note: 'AI-powered analysis failed, showing basic analysis instead'
        });
      }
    } else {
      // If Gemini AI is not available, use basic analysis
      console.log('Gemini AI not available, using basic analysis');
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

/**
 * @desc    Upload and analyze file with Gemini AI
 * @route   POST /api/ai/analyze/upload
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

    // Validate that it's an Excel file
    const file = req.file;
    if (!file.mimetype.includes('excel') && 
        !file.originalname.endsWith('.xlsx') && 
        !file.originalname.endsWith('.xls')) {
      return res.status(400).json({
        success: false,
        message: 'Only Excel files are allowed'
      });
    }

    // Validate file size
    const maxSizeInBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return res.status(400).json({
        success: false,
        message: 'File exceeds the maximum size limit of 50 MB'
      });
    }

    // Save to MongoDB for temporary analysis
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname;
    
    // Save to MongoDB temporarily (will be cleaned up later)
    const tempFile = new File({
      filename: filename,
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      content: file.buffer,
      user: req.user.id
    });

    await tempFile.save();

    // Analyze using the same logic as analyzeFile
    if (!xlsx) {
      await tempFile.deleteOne();
      return res.status(500).json({
        success: false,
        message: 'Excel processing library not available'
      });
    }

    // Extract data from the Excel file
    const workbook = xlsx.read(tempFile.content, { type: 'buffer' });
    
    // If no sheets were found
    if (workbook.SheetNames.length === 0) {
      await tempFile.deleteOne();
      return res.status(400).json({
        success: false,
        message: 'No sheets found in the Excel file'
      });
    }

    // Prepare data for analysis
    const extractedData = {};
    let totalRows = 0;
    let totalColumns = 0;
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      // Convert sheet to JSON
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      // Skip empty sheets
      if (jsonData.length === 0) continue;
      
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

    let analysis;
    
    // If Gemini AI is available, use it for analysis
    if (model) {
      try {
        console.log('Analyzing uploaded file with Gemini AI');
        
        // Prepare prompt for Gemini AI
        const fileInfo = {
          filename: tempFile.originalName,
          fileSize: tempFile.size,
          sheets: Object.keys(extractedData).length,
          totalRows,
          totalColumns
        };
        
        // Build a detailed prompt based on the extracted data
        let prompt = `Please analyze this Excel file: ${tempFile.originalName}
            
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

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Structure the AI response
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
        analysis = {
          summary: sections.summary.join(' ').trim() || `Analysis of ${tempFile.originalName}`,
          insights: sections.insights.filter(item => item.length > 10) || 
            [`No specific insights could be derived from ${tempFile.originalName}`],
          recommendations: sections.recommendations.filter(item => item.length > 10) || 
            [`Consider a more detailed analysis of ${tempFile.originalName}`],
          dataQualityIssues: sections.dataQualityIssues.filter(item => item.length > 10) || 
            [`No specific data quality issues identified in ${tempFile.originalName}`]
        };
      } catch (aiError) {
        console.error('Gemini AI analysis error:', aiError);
        
        // Fall back to basic analysis
        analysis = generateBasicAnalysis(tempFile, extractedData);
      }
    } else {
      // If Gemini AI is not available, use basic analysis
      console.log('Gemini AI not available, using basic analysis');
      analysis = generateBasicAnalysis(tempFile, extractedData);
    }

    // Clean up temporary file
    await tempFile.deleteOne();

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('File upload and analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing uploaded file',
      error: error.message
    });
  }
};

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