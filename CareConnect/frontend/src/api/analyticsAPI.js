import api from './axios';

export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getResponseTimes: (params) => api.get('/analytics/response-times', { params }),
  getDonationTrends: (params) => api.get('/analytics/donation-trends', { params }),
  getBloodGroupDistribution: (params) =>
    api.get('/analytics/blood-groups', { params }),
};
