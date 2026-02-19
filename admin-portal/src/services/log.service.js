import api from './api';

export const logService = {
  getLogs: async (params) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },
};
