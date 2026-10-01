import api from './axios';

export const aiAPI = {
  getMatching: (requestId) => api.get(`/matching/${requestId}`),
  analyzeRequest: (payload) => api.post('/ai/analyze', payload),
  getPriorityScore: (requestId) => api.get(`/ai/priority/${requestId}`),
  getPredictions: (params) => api.get('/ai/predictions', { params }),
};
