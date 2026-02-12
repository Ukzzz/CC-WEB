import api from './api';

export const resourceService = {
  /**
   * Get all resources with pagination and filters
   */
  getAll: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  /**
   * Get single resource by ID
   */
  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  /**
   * Get resources by hospital
   */
  getByHospital: async (hospitalId) => {
    const response = await api.get(`/resources/hospital/${hospitalId}`);
    return response.data;
  },

  /**
   * Create new resource
   */
  create: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },

  /**
   * Update resource
   */
  update: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  /**
   * Quick update availability
   */
  updateAvailability: async (id, availabilityData) => {
    const response = await api.patch(`/resources/${id}/availability`, availabilityData);
    return response.data;
  },

  /**
   * Delete resource
   */
  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};

export default resourceService;
