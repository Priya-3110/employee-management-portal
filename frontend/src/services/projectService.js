import api from './api.js';

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getRecommendations: (projectId) => api.get(`/projects/recommend/${projectId}`),
  getById: (id) => api.get(`/projects/${id}`),
  create: (payload) => api.post('/projects', payload),
  update: (id, payload) => api.put(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
};
