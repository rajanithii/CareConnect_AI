import api from './axios';

export const hospitalAuthAPI = {
  login: (email, password) => api.post('/hospital-auth/login', { email, password }),
  register: (payload) => api.post('/hospital-auth/register', payload),
  getById: (id) => api.get(`/hospital-auth/${id}`),
};