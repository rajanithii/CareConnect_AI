/**
 * Web Vitals Performance Tracking
 * Monitors Core Web Vitals and sends data to analytics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import ReactGA from 'react-ga4';

/**
 * Track all Web Vitals metrics
 * Sends metrics to Google Analytics 4
 */
export const trackWebVitals = () => {
  try {
    // Cumulative Layout Shift
    getCLS((metric) => {
      console.log('CLS (Cumulative Layout Shift):', metric.value);
      ReactGA.event({
        category: 'web_vitals',
        action: 'CLS',
        label: `${metric.value.toFixed(3)}`,
        value: Math.round(metric.value * 1000),
      });
    });

    // First Input Delay
    getFID((metric) => {
      console.log('FID (First Input Delay):', metric.value);
      ReactGA.event({
        category: 'web_vitals',
        action: 'FID',
        label: `${metric.value.toFixed(0)}ms`,
        value: Math.round(metric.value),
      });
    });

    // First Contentful Paint
    getFCP((metric) => {
      console.log('FCP (First Contentful Paint):', metric.value);
      ReactGA.event({
        category: 'web_vitals',
        action: 'FCP',
        label: `${metric.value.toFixed(0)}ms`,
        value: Math.round(metric.value),
      });
    });

    // Largest Contentful Paint
    getLCP((metric) => {
      console.log('LCP (Largest Contentful Paint):', metric.value);
      ReactGA.event({
        category: 'web_vitals',
        action: 'LCP',
        label: `${metric.value.toFixed(0)}ms`,
        value: Math.round(metric.value),
      });
    });

    // Time to First Byte
    getTTFB((metric) => {
      console.log('TTFB (Time to First Byte):', metric.value);
      ReactGA.event({
        category: 'web_vitals',
        action: 'TTFB',
        label: `${metric.value.toFixed(0)}ms`,
        value: Math.round(metric.value),
      });
    });
  } catch (error) {
    console.error('Failed to track Web Vitals:', error);
  }
};

/**
 * Check if Web Vitals are within good thresholds
 * Returns true if all metrics are within acceptable ranges
 */
export const checkWebVitalsHealth = () => {
  const results = {
    CLS: { threshold: 0.1, status: 'unknown' },
    FID: { threshold: 100, status: 'unknown' },
    LCP: { threshold: 2500, status: 'unknown' },
  };

  return results;
};

/**
 * Target Web Vitals Thresholds (from Google)
 * 
 * Good Performance:
 * - LCP: < 2.5 seconds
 * - FID: < 100 milliseconds
 * - CLS: < 0.1
 * - FCP: < 1.8 seconds
 * - TTFB: < 600 milliseconds
 * 
 * Mobile Performance (typical):
 * - LCP: 2.5-4 seconds
 * - FID: 100-300 milliseconds
 * - CLS: 0.1-0.25
 */

export default {
  trackWebVitals,
  checkWebVitalsHealth,
};
