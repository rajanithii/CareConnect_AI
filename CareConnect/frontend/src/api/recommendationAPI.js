/**
 * Module 5: Recommendation Engine API Wrapper
 * Thin axios layer for recommendation endpoints
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

export const recommendationAPI = {
  /**
   * Generate smart recommendations for blood management
   * @param {number} hospitalId - Target hospital
   * @returns {Promise} RecommendationSummaryOut
   */
  async generateRecommendations(hospitalId) {
    const response = await api.post('/recommendations/generate', {
      hospital_id: hospitalId,
    });
    return response.data;
  },

  /**
   * Update recommendation status
   * @param {number} recId - Recommendation ID
   * @param {string} status - New status (PENDING, IN_PROGRESS, COMPLETED, DISMISSED)
   * @param {string} notes - Optional notes
   * @returns {Promise} Updated RecommendationOut
   */
  async updateRecommendation(recId, status, notes = null) {
    const response = await api.patch(`/recommendations/recommendations/${recId}`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Start a donor campaign
   * @param {number} hospitalId - Hospital initiating campaign
   * @param {string} bloodGroup - Target blood group
   * @param {string} campaignName - Campaign name
   * @param {number} targetUnits - Target units to collect
   * @returns {Promise} DonorCampaignOut
   */
  async startCampaign(hospitalId, bloodGroup, campaignName, targetUnits) {
    const response = await api.post('/recommendations/campaigns/start', {
      blood_group: bloodGroup,
      campaign_name: campaignName,
      target_units: targetUnits,
    }, {
      params: { hospital_id: hospitalId },
    });
    return response.data;
  },

  /**
   * Update campaign progress
   * @param {number} campaignId - Campaign ID
   * @param {number} unitsCollected - Units collected so far
   * @param {string} status - Campaign status
   * @returns {Promise} Updated DonorCampaignOut
   */
  async updateCampaign(campaignId, unitsCollected = null, status = null) {
    const response = await api.patch(`/recommendations/campaigns/${campaignId}`, null, {
      params: {
        units_collected: unitsCollected,
        status,
      },
    });
    return response.data;
  },

  /**
   * Health check
   * @returns {Promise} Status object
   */
  async healthCheck() {
    const response = await api.get('/recommendations/health');
    return response.data;
  },
};

export default recommendationAPI;
