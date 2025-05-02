const jwt = require('jsonwebtoken');

/**
 * Generate JWT token with user ID as payload
 * @param {string} id - User ID to include in token payload
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken; 