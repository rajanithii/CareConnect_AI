import api from './axios';

export const bloodBankAPI = {
  // Units
  createUnit: (payload) => api.post('/blood-bank/units', payload),
  getUnits: (params) => api.get('/blood-bank/units', { params }),
  getUnitById: (id) => api.get(`/blood-bank/units/${id}`),
  getUnitByCode: (code) => api.get(`/blood-bank/units/code/${code}`),
  getUnitLogs: (id) => api.get(`/blood-bank/units/${id}/logs`),

  reserveUnit: (id, requestId) =>
    api.patch(`/blood-bank/units/${id}/reserve`, { request_id: requestId }),
  unreserveUnit: (id) => api.patch(`/blood-bank/units/${id}/unreserve`),
  issueUnit: (id, issuedTo) =>
    api.patch(`/blood-bank/units/${id}/issue`, { issued_to: issuedTo }),
  discardUnit: (id, reason) =>
    api.patch(`/blood-bank/units/${id}/discard`, { reason }),
  moveUnit: (id, storageLocationId) =>
    api.patch(`/blood-bank/units/${id}/location`, { storage_location_id: storageLocationId }),

  scanExpiredUnits: (hospitalId) =>
    api.post('/blood-bank/units/scan-expired', null, { params: { hospital_id: hospitalId } }),

  // Storage locations
  createLocation: (payload) => api.post('/blood-bank/locations', payload),
  getLocations: (hospitalId) =>
    api.get('/blood-bank/locations', { params: { hospital_id: hospitalId } }),

  // Summary
  getSummary: (hospitalId) =>
    api.get('/blood-bank/summary', { params: { hospital_id: hospitalId } }),

  // Analytics (Module 2)
  getAnalyticsOverview: (hospitalId) =>
    api.get('/blood-bank/analytics/overview', { params: { hospital_id: hospitalId } }),
  getBloodGroupDistribution: (hospitalId) =>
    api.get('/blood-bank/analytics/blood-group-distribution', { params: { hospital_id: hospitalId } }),
  getUsageTrend: (hospitalId, months = 6) =>
    api.get('/blood-bank/analytics/usage-trend', { params: { hospital_id: hospitalId, months } }),
  getStatusHeatmap: (hospitalId) =>
    api.get('/blood-bank/analytics/status-heatmap', { params: { hospital_id: hospitalId } }),
};
