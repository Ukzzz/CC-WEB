import api from './api';

export const dashboardService = {
  /**
   * Get dashboard overview statistics
   */
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  /**
   * Get hospital statistics
   */
  getHospitalStats: async () => {
    const response = await api.get('/dashboard/hospitals/stats');
    return response.data;
  },

  /**
   * Get resource summary
   */
  getResourceSummary: async () => {
    const response = await api.get('/dashboard/resources/summary');
    return response.data;
  },
};

export default dashboardService;
