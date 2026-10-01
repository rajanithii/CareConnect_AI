/**
 * Module 5: Recommendation Engine Service
 * Unwraps API responses and handles errors
 */

import recommendationAPI from '../api/recommendationAPI';

export const recommendationService = {
  /**
   * Generate recommendations for hospital
   * @param {number} hospitalId
   * @returns {Promise}
   */
  async generateRecommendations(hospitalId) {
    try {
      const result = await recommendationAPI.generateRecommendations(hospitalId);
      return {
        success: true,
        data: result,
        recommendations: result.active_recommendations || [],
        campaigns: result.active_campaigns || [],
        byPriority: result.by_priority || {},
        byType: result.by_type || {},
      };
    } catch (error) {
      return this._handleError(error, 'Failed to generate recommendations');
    }
  },

  /**
   * Update recommendation status
   * @param {number} recId
   * @param {string} status
   * @param {string} notes
   * @returns {Promise}
   */
  async updateRecommendation(recId, status, notes) {
    try {
      const rec = await recommendationAPI.updateRecommendation(recId, status, notes);
      return {
        success: true,
        data: rec,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to update recommendation');
    }
  },

  /**
   * Start donor campaign
   * @param {number} hospitalId
   * @param {string} bloodGroup
   * @param {string} campaignName
   * @param {number} targetUnits
   * @returns {Promise}
   */
  async startCampaign(hospitalId, bloodGroup, campaignName, targetUnits) {
    try {
      const campaign = await recommendationAPI.startCampaign(
        hospitalId,
        bloodGroup,
        campaignName,
        targetUnits
      );
      return {
        success: true,
        data: campaign,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to start campaign');
    }
  },

  /**
   * Update campaign
   * @param {number} campaignId
   * @param {number} unitsCollected
   * @param {string} status
   * @returns {Promise}
   */
  async updateCampaign(campaignId, unitsCollected, status) {
    try {
      const campaign = await recommendationAPI.updateCampaign(
        campaignId,
        unitsCollected,
        status
      );
      return {
        success: true,
        data: campaign,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to update campaign');
    }
  },

  /**
   * Get priority badge color
   * @param {string} priority
   * @returns {Object}
   */
  getPriorityBadge(priority) {
    const badges = {
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      LOW: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
    };
    return badges[priority] || badges.LOW;
  },

  /**
   * Get recommendation type label
   * @param {string} type
   * @returns {Object}
   */
  getRecTypeLabel(type) {
    const types = {
      DONOR_CAMPAIGN: { icon: '👥', label: 'Donor Campaign', color: 'text-blue-600' },
      REFILL: { icon: '📦', label: 'Inventory Refill', color: 'text-purple-600' },
      TRANSFER: { icon: '🚚', label: 'Inter-Hospital Transfer', color: 'text-indigo-600' },
      DEFER_PROCEDURES: { icon: '⏸️', label: 'Defer Procedures', color: 'text-orange-600' },
    };
    return types[type] || types.DONOR_CAMPAIGN;
  },

  /**
   * Calculate campaign progress percent
   * @param {Object} campaign
   * @returns {number}
   */
  getCampaignProgress(campaign) {
    if (!campaign.target_units || campaign.target_units === 0) return 0;
    return Math.min(100, (campaign.units_collected / campaign.target_units) * 100);
  },

  /**
   * Parse error response
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    console.error('Recommendation error:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  },
};

export default recommendationService;
