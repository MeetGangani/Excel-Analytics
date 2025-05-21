const express = require('express');
const {
  getUsers,
  getFiles,
  getStats,
  deleteUser,
  deleteFile,
  getAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const router = express.Router();

// All routes use the auth middleware (protect) and admin middleware
// Must be admin to access these routes
router.use(protect, isAdmin);

// User routes
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);

// File routes
router.get('/files', getFiles);
router.delete('/files/:fileId', deleteFile);

// Stats route
router.get('/stats', getStats);

// Analytics route
router.get('/analytics', getAnalytics);

module.exports = router; 