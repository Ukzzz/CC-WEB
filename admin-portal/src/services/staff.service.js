import api from './api';

export const staffService = {
  /**
   * Get all staff with pagination and filters
   */
  getAll: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  /**
   * Get single staff member by ID
   */
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  /**
   * Get staff by hospital
   */
  getByHospital: async (hospitalId) => {
    const response = await api.get(`/staff/hospital/${hospitalId}`);
    return response.data;
  },

  /**
   * Create new staff member
   */
  create: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  /**
   * Update staff member
   */
  update: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },

  /**
   * Delete staff member (soft delete)
   */
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
};

export default staffService;
