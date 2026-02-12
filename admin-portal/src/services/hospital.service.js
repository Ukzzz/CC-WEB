import api from './api';

export const hospitalService = {
  /**
   * Get all hospitals with pagination and filters
   */
  getAll: async (params = {}) => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  },

  /**
   * Get single hospital by ID
   */
  getById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  /**
   * Create new hospital
   */
  create: async (hospitalData) => {
    const response = await api.post('/hospitals', hospitalData);
    return response.data;
  },

  /**
   * Update hospital
   */
  update: async (id, hospitalData) => {
    const response = await api.put(`/hospitals/${id}`, hospitalData);
    return response.data;
  },

  /**
   * Delete hospital (soft delete)
   */
  delete: async (id) => {
    const response = await api.delete(`/hospitals/${id}`);
    return response.data;
  },

  /**
   * Get hospital statistics
   */
  getStats: async (id) => {
    const response = await api.get(`/hospitals/${id}/stats`);
    return response.data;
  },
};

export default hospitalService;
