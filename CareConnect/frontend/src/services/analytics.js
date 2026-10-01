/**
 * Google Analytics 4 Integration
 * Tracks user behavior, conversions, and engagement metrics
 */

import ReactGA from 'react-ga4';

// Replace with your actual GA4 Tracking ID
const GA_TRACKING_ID = process.env.REACT_APP_GA_ID || 'G-XXXXXXXXXX';

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
  try {
    ReactGA.initialize(GA_TRACKING_ID, {
      testMode: process.env.NODE_ENV === 'development',
      gtagOptions: {
        anonymize_ip: true,
      },
    });
    console.log('Google Analytics initialized:', GA_TRACKING_ID);
  } catch (error) {
    console.error('Failed to initialize GA4:', error);
  }
};

/**
 * Track page view
 * @param {string} pageName - Name of the page for identification
 */
export const trackPageView = (pageName) => {
  try {
    ReactGA.pageview(window.location.pathname, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_name: pageName,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

/**
 * Track CTA button clicks
 * @param {string} buttonName - Name/label of the button
 * @param {string} section - Section where the button is located
 */
export const trackCTAClick = (buttonName, section) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'click_cta',
      label: `${section} - ${buttonName}`,
      value: 1,
    });
  } catch (error) {
    console.error('Failed to track CTA click:', error);
  }
};

/**
 * Track section views
 * @param {string} sectionName - Name of the section viewed
 */
export const trackSectionView = (sectionName) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'section_view',
      label: sectionName,
      value: Math.round(window.scrollY),
    });
  } catch (error) {
    console.error('Failed to track section view:', error);
  }
};

/**
 * Track form submissions
 * @param {string} formName - Name of the form
 * @param {number} fieldCount - Number of fields in the form
 */
export const trackFormSubmit = (formName, fieldCount) => {
  try {
    ReactGA.event({
      category: 'conversion',
      action: 'form_submit',
      label: formName,
      value: fieldCount,
    });
  } catch (error) {
    console.error('Failed to track form submit:', error);
  }
};

/**
 * Track scroll depth
 * @param {number} depth - Scroll depth percentage (0-100)
 */
export const trackScrollDepth = (depth) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'scroll_depth',
      label: `${depth}%`,
      value: depth,
    });
  } catch (error) {
    console.error('Failed to track scroll depth:', error);
  }
};

/**
 * Track outbound link clicks
 * @param {string} url - URL of the external link
 * @param {boolean} newWindow - Whether link opens in new window
 */
export const trackOutboundLink = (url, newWindow = false) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'click_outbound_link',
      label: url,
      value: newWindow ? 1 : 0,
    });
  } catch (error) {
    console.error('Failed to track outbound link:', error);
  }
};

/**
 * Track newsletter signup
 * @param {string} email - Email address (domain only is tracked)
 */
export const trackNewsletterSignup = (email) => {
  try {
    const domain = email.split('@')[1] || 'unknown';
    ReactGA.event({
      category: 'conversion',
      action: 'newsletter_signup',
      label: domain,
      value: 1,
    });
  } catch (error) {
    console.error('Failed to track newsletter signup:', error);
  }
};

/**
 * Track file downloads
 * @param {string} fileName - Name of the file downloaded
 * @param {string} fileType - Type/extension of the file
 */
export const trackDownload = (fileName, fileType) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'file_download',
      label: `${fileName} (${fileType})`,
      value: 1,
    });
  } catch (error) {
    console.error('Failed to track download:', error);
  }
};

/**
 * Track video plays
 * @param {string} videoTitle - Title of the video
 * @param {string} videoId - ID or identifier of the video
 */
export const trackVideoPlay = (videoTitle, videoId) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'video_play',
      label: videoTitle,
      value: 1,
    });
  } catch (error) {
    console.error('Failed to track video play:', error);
  }
};

/**
 * Track feature interest
 * @param {string} featureName - Name of the feature
 */
export const trackFeatureInterest = (featureName) => {
  try {
    ReactGA.event({
      category: 'engagement',
      action: 'feature_interest',
      label: featureName,
      value: 1,
    });
  } catch (error) {
    console.error('Failed to track feature interest:', error);
  }
};

/**
 * Track button clicks with custom properties
 * @param {string} buttonId - ID or name of the button
 * @param {string} category - Event category
 * @param {object} properties - Additional properties to track
 */
export const trackEvent = (buttonId, category, properties = {}) => {
  try {
    ReactGA.event({
      category: category || 'engagement',
      action: 'custom_event',
      label: buttonId,
      ...properties,
    });
  } catch (error) {
    console.error('Failed to track custom event:', error);
  }
};

/**
 * Set user properties
 * @param {string} userId - Unique user identifier
 * @param {object} customData - Custom user properties
 */
export const setUserProperties = (userId, customData = {}) => {
  try {
    ReactGA.gtag?.('config', GA_TRACKING_ID, {
      user_id: userId,
      ...customData,
    });
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

export default {
  initGA,
  trackPageView,
  trackCTAClick,
  trackSectionView,
  trackFormSubmit,
  trackScrollDepth,
  trackOutboundLink,
  trackNewsletterSignup,
  trackDownload,
  trackVideoPlay,
  trackFeatureInterest,
  trackEvent,
  setUserProperties,
};
