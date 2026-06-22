import api from './api.js';

export const recommendationService = {
  getAvailability: () => api.get('/recommendations/availability'),
  getRecommendations: (projectId) => api.get(`/recommendations/project/${projectId}`),
};
