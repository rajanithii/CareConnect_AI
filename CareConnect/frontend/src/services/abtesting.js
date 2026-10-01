/**
 * A/B Testing Framework
 * Provides utilities for running A/B tests and tracking variant performance
 */

import { v4 as uuidv4 } from 'uuid';
import ReactGA from 'react-ga4';

const STORAGE_KEY = 'ab_test_variants';

/**
 * Generate or retrieve user ID for consistent test assignment
 */
const getUserId = () => {
  let userId = localStorage.getItem('ab_user_id');

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('ab_user_id', userId);
  }

  return userId;
};

/**
 * Consistent hashing function to assign variant
 * Same user always gets same variant across sessions
 */
const hashStringToNumber = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Get test variant for user
 * Ensures consistent assignment across sessions
 * 
 * @param {string} testId - Unique ID for the test
 * @param {array} variants - Array of variant names/ids
 * @returns {string} - Assigned variant name
 */
export const getTestVariant = (testId, variants = ['control', 'variant']) => {
  try {
    // Check local storage first
    const stored = localStorage.getItem(STORAGE_KEY);
    const testsMap = stored ? JSON.parse(stored) : {};

    if (testsMap[testId]) {
      return testsMap[testId];
    }

    // Generate consistent variant assignment
    const userId = getUserId();
    const hash = hashStringToNumber(userId + testId);
    const variantIndex = hash % variants.length;
    const assignedVariant = variants[variantIndex];

    // Store assignment
    testsMap[testId] = assignedVariant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testsMap));

    console.log(`Test ${testId}: User assigned to variant "${assignedVariant}"`);

    return assignedVariant;
  } catch (error) {
    console.error('Failed to get test variant:', error);
    return variants[0]; // Fallback to first variant
  }
};

/**
 * Track A/B test conversion
 * 
 * @param {string} testId - Unique ID for the test
 * @param {string} variantName - Name of the variant
 * @param {boolean} converted - Whether user converted
 * @param {object} metadata - Additional conversion metadata
 */
export const trackTestConversion = (
  testId,
  variantName,
  converted = false,
  metadata = {}
) => {
  try {
    ReactGA.event({
      category: 'ab_test',
      action: `test_${testId}`,
      label: variantName,
      value: converted ? 1 : 0,
      ...metadata,
    });

    console.log(`Test conversion tracked: ${testId} - ${variantName} - ${converted}`);
  } catch (error) {
    console.error('Failed to track test conversion:', error);
  }
};

/**
 * Get all active test variants for user
 * @returns {object} - Map of testId -> variant
 */
export const getActiveTests = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get active tests:', error);
    return {};
  }
};

/**
 * Reset a specific test (for development)
 * @param {string} testId - Test to reset
 */
export const resetTest = (testId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const testsMap = stored ? JSON.parse(stored) : {};
    delete testsMap[testId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testsMap));
    console.log(`Test ${testId} reset`);
  } catch (error) {
    console.error('Failed to reset test:', error);
  }
};

/**
 * Reset all tests (for development)
 */
export const resetAllTests = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('ab_user_id');
    console.log('All tests reset');
  } catch (error) {
    console.error('Failed to reset all tests:', error);
  }
};

/**
 * Example A/B Test Configuration
 * 
 * CTA Button Color Test:
 * const variant = getTestVariant('cta_button_color', ['red', 'cyan']);
 * // Use variant to render appropriate button color
 * 
 * On conversion (CTA click):
 * trackTestConversion('cta_button_color', variant, true, {
 *   button_section: 'hero',
 *   time_to_click: 5000,
 * });
 */

/**
 * A/B Test Hook Configuration
 * Recommended test duration: 2-4 weeks
 * Sample size: Minimum 100 conversions per variant
 * Success criteria: 5%+ improvement in conversion rate
 */

export default {
  getTestVariant,
  trackTestConversion,
  getActiveTests,
  resetTest,
  resetAllTests,
};
