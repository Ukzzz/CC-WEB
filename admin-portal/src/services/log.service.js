import api from './api';

export const logService = {
  getLogs: (params) => api.get('/logs', { params }),
};
