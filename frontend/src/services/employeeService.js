import api from './api.js';

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getAvailability: () => api.get('/employees/availability'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (formData) => api.post('/employees', formData),
  update: (id, formData) => api.put(`/employees/${id}`, formData),
  remove: (id) => api.delete(`/employees/${id}`),
};
