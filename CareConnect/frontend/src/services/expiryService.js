/**
 * Module 7: Blood Expiry Management Service
 * Unwraps API responses and handles errors
 */

import expiryAPI from '../api/expiryAPI';

export const expiryService = {
  /**
   * Scan for expiring units
   * @param {number} hospitalId
   * @returns {Promise}
   */
  async scanExpiry(hospitalId) {
    try {
      const result = await expiryAPI.scanExpiry(hospitalId);
      return {
        success: true,
        data: result,
        alerts: result.active_alerts || [],
        fifoRecommendations: result.fifo_recommendations || [],
        breakdown: result.expiring_breakdown || {},
        wastage: result.estimated_wastage_units || 0,
        wastageCost: result.estimated_wastage_cost || 0,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to scan expiry');
    }
  },

  /**
   * Get FIFO recommendation
   * @param {number} hospitalId
   * @param {string} bloodGroup
   * @returns {Promise}
   */
  async getFIFORecommendation(hospitalId, bloodGroup) {
    try {
      const rec = await expiryAPI.getFIFORecommendation(hospitalId, bloodGroup);
      return {
        success: true,
        data: rec,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to get FIFO recommendation');
    }
  },

  /**
   * Dismiss alert
   * @param {number} alertId
   * @param {string} reason
   * @returns {Promise}
   */
  async dismissAlert(alertId, reason) {
    try {
      const alert = await expiryAPI.dismissAlert(alertId, reason);
      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to dismiss alert');
    }
  },

  /**
   * Generate report
   * @param {number} hospitalId
   * @param {string} reportPeriod
   * @returns {Promise}
   */
  async generateReport(hospitalId, reportPeriod) {
    try {
      const report = await expiryAPI.generateReport(hospitalId, reportPeriod);
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to generate report');
    }
  },

  /**
   * Get alert level badge
   * @param {string} level
   * @returns {Object}
   */
  getAlertLevelBadge(level) {
    const badges = {
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'Expired' },
      URGENT: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠', label: 'Urgent' },
      WARNING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡', label: 'Warning' },
    };
    return badges[level] || badges.WARNING;
  },

  /**
   * Format date
   * @param {Date|string} date
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  },

  /**
   * Format currency
   * @param {number} amount
   * @returns {string}
   */
  formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  },

  /**
   * Parse error response
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    console.error('Expiry management error:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  },
};

export default expiryService;
