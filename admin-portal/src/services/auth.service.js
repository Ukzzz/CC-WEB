import api from './api';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current admin profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Register new admin (Super Admin only)
   */
  register: async (adminData) => {
    const response = await api.post('/auth/register', adminData);
    return response.data;
  },
  // Super Admin: Get all admins
  getAdmins: async () => {
    try {
      const response = await api.get('/auth/admins');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch admins';
    }
  },

  // Super Admin: Register new admin
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post('/auth/register', adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to register admin';
    }
  }
};

export default authService;
