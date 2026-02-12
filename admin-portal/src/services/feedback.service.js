import api from './api';

export const feedbackService = {
  getAll: (params) => api.get('/feedback', { params }),
};
