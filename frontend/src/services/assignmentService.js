import api from './api.js';

export const assignmentService = {
  create: (payload) => api.post('/assignments', payload),
  remove: (id) => api.delete(`/assignments/${id}`),
  getByProject: (projectId) => api.get(`/assignments/project/${projectId}`),
  getByEmployee: (employeeId) => api.get(`/assignments/employee/${employeeId}`),
};
