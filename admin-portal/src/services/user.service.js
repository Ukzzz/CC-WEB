import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  getStats: () => api.get('/users/stats'),
};
