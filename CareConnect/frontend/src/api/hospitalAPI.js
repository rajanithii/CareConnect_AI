import api from './axios';

export const hospitalAPI = {
  createRequest: (payload) => api.post('/requests/create', payload),

  getRequests: () => api.get('/hospital/requests'),
  getRequestById: (id) => api.get(`/hospital/requests/${id}`),
  completeRequest: (id) => api.patch(`/hospital/requests/${id}/complete`),
  cancelRequest: (id) => api.patch(`/hospital/requests/${id}/cancel`),
  getStatistics: () => api.get('/hospital/statistics'),

  getAcceptedRequests: () => api.get('/hospital/requests/accepted'),
  getTracking: (requestId) => api.get(`/hospital/requests/${requestId}/tracking`),
};