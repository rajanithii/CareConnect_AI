/**
 * Module 4: Blood Shortage Prediction API Wrapper
 * Thin axios layer for shortage prediction endpoints
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

export const shortagePredictionAPI = {
  /**
   * Analyze blood shortage risk across all blood groups
   * @param {number} hospitalId - Target hospital
   * @param {number} daysAhead - Forecast horizon (1-30)
   * @returns {Promise} ShortageSummaryOut
   */
  async predictShortages(hospitalId, daysAhead = 7) {
    const response = await api.post('/shortage-prediction/analyze', {
      hospital_id: hospitalId,
      days_ahead: daysAhead,
    });
    return response.data;
  },

  /**
   * Get all active shortage alerts for a hospital
   * @param {number} hospitalId - Target hospital
   * @returns {Promise} Array of ShortageAlertOut
   */
  async getActiveAlerts(hospitalId) {
    const response = await api.get('/shortage-prediction/alerts', {
      params: { hospital_id: hospitalId },
    });
    return response.data;
  },

  /**
   * Resolve a shortage alert
   * @param {number} alertId - Alert ID
   * @param {string} resolutionNotes - Optional notes
   * @returns {Promise} Updated ShortageAlertOut
   */
  async resolveAlert(alertId, resolutionNotes = null) {
    const response = await api.post(`/shortage-prediction/alerts/${alertId}/resolve`, {
      alert_id: alertId,
      resolution_notes: resolutionNotes,
    });
    return response.data;
  },

  /**
   * Health check
   * @returns {Promise} Status object
   */
  async healthCheck() {
    const response = await api.get('/shortage-prediction/health');
    return response.data;
  },
};

export default shortagePredictionAPI;
