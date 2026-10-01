/**
 * Module 7: Blood Expiry Management API Wrapper
 * Thin axios layer for expiry endpoints
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloodlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const expiryAPI = {
  /**
   * Scan for expiring blood units and generate alerts
   * @param {number} hospitalId
   * @returns {Promise} ExpiryDashboardOut
   */
  async scanExpiry(hospitalId) {
    const response = await api.post('/blood-expiry/scan-and-alert', null, {
      params: { hospital_id: hospitalId },
    });
    return response.data;
  },

  /**
   * Get FIFO recommendation for a blood group
   * @param {number} hospitalId
   * @param {string} bloodGroup
   * @returns {Promise} FIFORecommendationOut
   */
  async getFIFORecommendation(hospitalId, bloodGroup) {
    const response = await api.get('/blood-expiry/fifo-recommendation', {
      params: { hospital_id: hospitalId, blood_group: bloodGroup },
    });
    return response.data;
  },

  /**
   * Dismiss an expiry alert
   * @param {number} alertId
   * @param {string} reason
   * @returns {Promise} ExpiryAlertOut
   */
  async dismissAlert(alertId, reason = null) {
    const response = await api.post(`/blood-expiry/alerts/${alertId}/dismiss`, {
      alert_id: alertId,
      reason,
    });
    return response.data;
  },

  /**
   * Generate monthly expiry report
   * @param {number} hospitalId
   * @param {string} reportPeriod - "YYYY-MM" format
   * @returns {Promise} ExpiryReportOut
   */
  async generateReport(hospitalId, reportPeriod) {
    const response = await api.post('/blood-expiry/reports/generate', {
      hospital_id: hospitalId,
      report_period: reportPeriod,
    });
    return response.data;
  },

  /**
   * Health check
   * @returns {Promise} Status object
   */
  async healthCheck() {
    const response = await api.get('/blood-expiry/health');
    return response.data;
  },
};

export default expiryAPI;
