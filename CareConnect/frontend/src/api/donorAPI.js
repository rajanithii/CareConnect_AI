import api from './axios';

export const donorAPI = {
  getAll: (params) => api.get('/donors', { params }),
  getById: (id) => api.get(`/donors/${id}`),
  updateProfile: (id, payload) => api.put(`/donors/${id}`, payload),
  toggleAvailability: (id, isAvailable) =>
    api.patch(`/donors/${id}/availability`, { isAvailable }),
  getDonationHistory: (id) => api.get(`/donors/${id}/history`),
  getNearby: (params) => api.get('/donors/nearby', { params }),
};
