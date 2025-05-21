const User = require('../models/User');
const File = require('../models/File');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Get all files
 * @route   GET /api/admin/files
 * @access  Private/Admin
 */
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find().populate('user', 'name email');
    
    // Format the files to match the expected structure
    const formattedFiles = files.map(file => ({
      _id: file._id,
      filename: file.originalName || file.filename,
      owner: {
        _id: file.user?._id || null,
        name: file.user?.name || 'Unknown User',
        email: file.user?.email || 'unknown'
      },
      size: file.size || 0,
      uploadedAt: file.createdAt,
      contentType: file.contentType
    }));
    
    res.status(200).json(formattedFiles);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching files',
      error: error.message
    });
  }
};

/**
 * @desc    Get system stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total files
    const totalFiles = await File.countDocuments();
    
    // Calculate total storage (sum of all file sizes)
    const files = await File.find();
    const totalStorage = files.reduce((acc, file) => acc + (file.size || 0), 0);
    
    // Get active users (users who logged in within the last 30 days)
    // Note: This would require a lastLogin field in your User model
    // For now, we'll just return the total users as active users
    const activeUsers = totalUsers;
    
    res.status(200).json({
      totalUsers,
      totalFiles,
      totalStorage,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:userId
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow admin to delete their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }
    
    await User.deleteOne({ _id: user._id });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a file
 * @route   DELETE /api/admin/files/:fileId
 * @access  Private/Admin
 */
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    await File.deleteOne({ _id: file._id });
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting file',
      error: error.message
    });
  }
};

/**
 * @desc    Get analytics data for admin dashboard
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Get user registration data by month (last 6 months)
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    
    const usersByMonth = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get file uploads by month (last 6 months)
    const filesByMonth = await File.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 },
          totalSize: { $sum: "$size" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get storage distribution by file type
    const storageByType = await File.aggregate([
      {
        $group: {
          _id: "$contentType",
          count: { $sum: 1 },
          totalSize: { $sum: "$size" }
        }
      },
      { $sort: { totalSize: -1 } }
    ]);

    // Format the months for the charts
    const monthLabels = [];
    const userData = [];
    const fileData = [];
    const storageData = [];

    // Create arrays with data for the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      monthLabels.push(monthYear);
      
      const monthKey = { month: date.getMonth() + 1, year: date.getFullYear() };
      
      // Find user data for this month
      const userMonth = usersByMonth.find(
        item => item._id.month === monthKey.month && item._id.year === monthKey.year
      );
      userData.push(userMonth ? userMonth.count : 0);
      
      // Find file data for this month
      const fileMonth = filesByMonth.find(
        item => item._id.month === monthKey.month && item._id.year === monthKey.year
      );
      fileData.push(fileMonth ? fileMonth.count : 0);
      storageData.push(fileMonth ? Math.round(fileMonth.totalSize / 1024 / 1024) : 0); // Convert to MB
    }

    // Format storage by type for charts
    const fileTypeLabels = storageByType.map(item => {
      const type = item._id || 'unknown';
      return type.split('/')[1] || type; // Get file extension or use full type
    });
    
    const fileTypeSizes = storageByType.map(item => 
      Math.round(item.totalSize / 1024 / 1024) // Convert to MB
    );
    
    const fileTypeCounts = storageByType.map(item => item.count);

    res.status(200).json({
      userGrowth: {
        labels: monthLabels,
        data: userData
      },
      fileUploads: {
        labels: monthLabels,
        data: fileData
      },
      storageUsage: {
        labels: monthLabels,
        data: storageData
      },
      fileTypes: {
        labels: fileTypeLabels,
        sizes: fileTypeSizes,
        counts: fileTypeCounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics data',
      error: error.message
    });
  }
}; 