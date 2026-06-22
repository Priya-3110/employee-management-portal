import api from './api.js';

export const dashboardService = {
  getSummary: () => api.get('/dashboard'),
};
