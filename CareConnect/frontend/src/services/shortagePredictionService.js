/**
 * Module 4: Blood Shortage Prediction Service
 * Unwraps API responses and handles errors
 */

import shortagePredictionAPI from '../api/shortagePredictionAPI';

export const shortagePredictionService = {
  /**
   * Predict shortages for a hospital
   * @param {number} hospitalId
   * @param {number} daysAhead
   * @returns {Promise} {activeAlerts, riskAssessment, recommendations}
   */
  async predictShortages(hospitalId, daysAhead = 7) {
    try {
      const result = await shortagePredictionAPI.predictShortages(hospitalId, daysAhead);
      return {
        success: true,
        data: result,
        activeAlerts: result.active_alerts || [],
        riskAssessment: result.risk_assessment,
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      return this._handleError(error, 'Failed to predict shortages');
    }
  },

  /**
   * Get active alerts
   * @param {number} hospitalId
   * @returns {Promise} Array of alerts
   */
  async getActiveAlerts(hospitalId) {
    try {
      const alerts = await shortagePredictionAPI.getActiveAlerts(hospitalId);
      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch alerts');
    }
  },

  /**
   * Resolve an alert
   * @param {number} alertId
   * @param {string} resolutionNotes
   * @returns {Promise}
   */
  async resolveAlert(alertId, resolutionNotes) {
    try {
      const alert = await shortagePredictionAPI.resolveAlert(alertId, resolutionNotes);
      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to resolve alert');
    }
  },

  /**
   * Check service health
   * @returns {Promise}
   */
  async healthCheck() {
    try {
      const status = await shortagePredictionAPI.healthCheck();
      return status.status === 'ok';
    } catch {
      return false;
    }
  },

  /**
   * Format alert level for display
   * @param {string} level - CRITICAL, HIGH, MEDIUM, LOW
   * @returns {Object} {color, icon, label}
   */
  getAlertLevelDisplay(level) {
    const levels = {
      CRITICAL: { color: 'bg-red-600', icon: '🔴', label: 'Critical', textColor: 'text-red-600' },
      HIGH: { color: 'bg-orange-500', icon: '🟠', label: 'High', textColor: 'text-orange-500' },
      MEDIUM: { color: 'bg-yellow-500', icon: '🟡', label: 'Medium', textColor: 'text-yellow-500' },
      LOW: { color: 'bg-green-500', icon: '🟢', label: 'Low', textColor: 'text-green-500' },
    };
    return levels[level] || levels.LOW;
  },

  /**
   * Parse error response
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    console.error('Shortage prediction error:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  },
};

export default shortagePredictionService;
