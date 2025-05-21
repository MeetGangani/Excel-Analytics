import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Create API service for admin operations
const adminService = {
  // Get all users
  getUsers: async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/users`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get all files
  getFiles: async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/files`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch files');
    }
  },

  // Get dashboard stats
  getStats: async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/stats`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Get analytics data
  getAnalytics: async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/analytics`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  },

  // Delete a user
  deleteUser: async (userId, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${API_URL}/users/${userId}`, config);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Delete a file
  deleteFile: async (fileId, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${API_URL}/files/${fileId}`, config);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  },

  // Update user role
  updateUserRole: async (userId, role, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },

  // Get system logs
  getLogs: async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/logs`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system logs');
    }
  }
};

export default adminService; 