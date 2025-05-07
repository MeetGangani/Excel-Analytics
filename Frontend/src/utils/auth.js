// Authentication utilities

/**
 * Get the authentication token from local storage
 * @returns {string|null} The token if found, null otherwise
 */
export const getToken = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const { token } = JSON.parse(userData);
    return token;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

/**
 * Get the current user data
 * @returns {object|null} The user data if found, null otherwise
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Clear authentication data (logout)
 */
export const logout = () => {
  localStorage.removeItem('user');
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('authChange'));
}; 