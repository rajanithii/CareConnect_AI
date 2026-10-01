import api from './axios';

/**
 * Forecasting API wrapper — thin axios client for demand prediction endpoints.
 * Follows the bloodBankAPI pattern from Module 1/2.
 */

export const forecastingAPI = {
  /**
   * Generate demand forecast
   * @param {Object} payload - { hospital_id, days_ahead?, include_recommendations? }
   * @returns {Promise} Forecast with daily/weekly predictions, trends, recommendations
   */
  forecastDemand: (payload) =>
    api.post('/forecasting/demand', payload),

  /**
   * Predict festival/event impact on blood demand
   * @param {Object} payload - { hospital_id, events: [{event_name, event_date, event_type}] }
   * @returns {Promise} Festival forecast with demand projections per event
   */
  forecastFestivalImpact: (payload) =>
    api.post('/forecasting/festival-impact', payload),

  /**
   * Analyze peak demand patterns
   * @param {number} hospitalId
   * @param {number} daysLookback - Historical days to analyze (default 90)
   * @returns {Promise} Peak analysis with ranked days, blood groups, urgencies
   */
  analyzePeakPatterns: (hospitalId, daysLookback = 90) =>
    api.get('/forecasting/peak-patterns', {
      params: { hospital_id: hospitalId, days_lookback: daysLookback },
    }),

  /**
   * Analyze seasonal demand patterns
   * @param {number} hospitalId
   * @param {number} monthsLookback - Historical months to analyze (default 12)
   * @returns {Promise} Seasonal analysis with monthly breakdown and recommendations
   */
  analyzeSeasonalPatterns: (hospitalId, monthsLookback = 12) =>
    api.get('/forecasting/seasonal-patterns', {
      params: { hospital_id: hospitalId, months_lookback: monthsLookback },
    }),

  /**
   * Health check for forecasting service
   * @returns {Promise} { status, service }
   */
  healthCheck: () =>
    api.get('/forecasting/health'),
};
