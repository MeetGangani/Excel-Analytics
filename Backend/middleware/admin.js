const User = require('../models/User');

/**
 * Middleware to check if user has admin role
 * Must be used after auth middleware (protect)
 */
exports.isAdmin = async (req, res, next) => {
  try {
    // User should be available from auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if user is admin
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as an admin'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error checking admin status'
    });
  }
}; 