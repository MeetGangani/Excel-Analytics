const express = require('express');
const { 
  uploadFiles, 
  getFiles, 
  getFileById,
  deleteFile,
  downloadFile,
  analyzeFile, 
  analyzeUploadedFile 
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public routes - none

// Protected routes (require authentication)
router.get('/', protect, getFiles);
router.get('/:id', protect, getFileById);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);
router.post('/upload', protect, upload.array('files'), uploadFiles);

// Analysis routes
router.post('/:fileId/analyze', protect, analyzeFile);
router.post('/analyze/upload', protect, upload.single('file'), analyzeUploadedFile);

module.exports = router; 