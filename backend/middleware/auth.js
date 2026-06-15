const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware - Authenticates users via JWT token in cookies
 * Attaches authenticated user to req.user for use in protected routes
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from cookie
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token ID (exclude password field)
    req.user = await User.findById(decoded.id).select('-password');

    // Check if user still exists in database
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Handle different JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { protect };