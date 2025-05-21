const express = require('express');
const { 
  uploadFiles, 
  getFiles, 
  getFileById,
  deleteFile,
  downloadFile,
  analyzeFile, 
  analyzeUploadedFile,
  getFileData 
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage with proper limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, callback) => {
    // Accept excel files only
    if (
      file.mimetype.includes('excel') || 
      file.originalname.endsWith('.xlsx') || 
      file.originalname.endsWith('.xls')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Only Excel files are allowed'));
    }
  }
});

const router = express.Router();

// Public routes - none

// Protected routes (require authentication)
router.get('/', protect, getFiles);
router.get('/:id', protect, getFileById);
router.get('/:id/data', protect, getFileData);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);
router.post('/upload', protect, upload.array('files'), uploadFiles);

// Analysis routes
router.post('/:fileId/analyze', protect, analyzeFile);
router.post('/analyze/upload', protect, upload.single('file'), analyzeUploadedFile);

module.exports = router; 