import { forecastingAPI } from '../api/forecastingAPI';

/**
 * Forecasting service — high-level data access layer.
 * Unwraps axios responses, adds error handling, transforms data for UI.
 * Follows bloodBankService pattern from Module 1/2.
 */

export const forecastingService = {
  /**
   * Generate 30-day demand forecast
   * @param {number} hospitalId
   * @param {Object} options - { daysAhead?, includeRecommendations? }
   * @returns {Promise<Object>} Forecast with daily predictions, trends, recommendations
   * @throws {Error} API error with detail message
   */
  async forecastDemand(hospitalId, options = {}) {
    try {
      const { data } = await forecastingAPI.forecastDemand({
        hospital_id: hospitalId,
        days_ahead: options.daysAhead || 30,
        include_recommendations: options.includeRecommendations !== false,
      });
      return data;
    } catch (err) {
      throw this._parseError(err, 'demand forecast');
    }
  },

  /**
   * Predict festival impact
   * @param {number} hospitalId
   * @param {Array} events - [{event_name, event_date, event_type}]
   * @returns {Promise<Object>} Festival forecast with per-event predictions
   * @throws {Error} API error with detail message
   */
  async forecastFestivalImpact(hospitalId, events) {
    try {
      if (!events || events.length === 0) {
        throw new Error('At least one event required');
      }
      const { data } = await forecastingAPI.forecastFestivalImpact({
        hospital_id: hospitalId,
        events,
      });
      return data;
    } catch (err) {
      throw this._parseError(err, 'festival impact forecast');
    }
  },

  /**
   * Analyze peak demand patterns
   * @param {number} hospitalId
   * @param {number} daysLookback - Historical days (default 90)
   * @returns {Promise<Object>} Peak analysis with ranked days, groups, urgencies
   * @throws {Error} API error with detail message
   */
  async analyzePeakPatterns(hospitalId, daysLookback = 90) {
    try {
      const { data } = await forecastingAPI.analyzePeakPatterns(hospitalId, daysLookback);
      return data;
    } catch (err) {
      throw this._parseError(err, 'peak pattern analysis');
    }
  },

  /**
   * Analyze seasonal patterns
   * @param {number} hospitalId
   * @param {number} monthsLookback - Historical months (default 12)
   * @returns {Promise<Object>} Seasonal analysis with monthly breakdown
   * @throws {Error} API error with detail message
   */
  async analyzeSeasonalPatterns(hospitalId, monthsLookback = 12) {
    try {
      const { data } = await forecastingAPI.analyzeSeasonalPatterns(hospitalId, monthsLookback);
      return data;
    } catch (err) {
      throw this._parseError(err, 'seasonal pattern analysis');
    }
  },

  /**
   * Check if forecasting service is available
   * @returns {Promise<boolean>} true if healthy
   */
  async isServiceHealthy() {
    try {
      await forecastingAPI.healthCheck();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Parse and standardize error messages from API
   * @private
   */
  _parseError(err, context) {
    if (err.response?.data?.detail) {
      return new Error(err.response.data.detail);
    }
    if (err.message) {
      return new Error(err.message);
    }
    return new Error(`Failed to complete ${context}. Please try again.`);
  },
};
