/**
 * Hotjar Integration
 * Provides heatmaps, session recordings, and user behavior analytics
 */

const HOTJAR_ID = process.env.REACT_APP_HOTJAR_ID || '12345';

/**
 * Initialize Hotjar
 */
export const initHotjar = () => {
  try {
    // Load Hotjar tracking code
    const hj = window.hj || function() {
      (hj.q = hj.q || []).push(arguments);
    };
    window.hj = hj;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${HOTJAR_ID}.js?sv=6`;
    document.head.appendChild(script);

    // Initialize
    if (window.hj) {
      window.hj('identify', null); // Anonymous tracking
      window.hj('event', 'landing_page_view');
    }
    
    console.log('Hotjar initialized:', HOTJAR_ID);
  } catch (error) {
    console.error('Failed to initialize Hotjar:', error);
  }
};

/**
 * Track user behavior with Hotjar
 * @param {string} event - Event name
 * @param {object} properties - Event properties
 */
export const trackUserBehavior = (event, properties = {}) => {
  try {
    if (window.hj) {
      window.hj('event', event, properties);
    }
  } catch (error) {
    console.error('Failed to track user behavior:', error);
  }
};

/**
 * Track form interactions
 * @param {string} formName - Name of the form
 * @param {string} fieldName - Name of the field being interacted with
 */
export const trackFormInteraction = (formName, fieldName) => {
  try {
    if (window.hj) {
      window.hj('event', `form_interaction: ${formName}`, {
        field: fieldName,
      });
    }
  } catch (error) {
    console.error('Failed to track form interaction:', error);
  }
};

/**
 * Track page specific events
 * @param {string} pageName - Name of the page
 * @param {string} eventName - Name of the event
 */
export const trackPageEvent = (pageName, eventName) => {
  try {
    if (window.hj) {
      window.hj('event', `${pageName}: ${eventName}`);
    }
  } catch (error) {
    console.error('Failed to track page event:', error);
  }
};

/**
 * Track CTA engagement
 * @param {string} ctaName - Name of the CTA
 */
export const trackCTAEngagement = (ctaName) => {
  try {
    if (window.hj) {
      window.hj('event', `cta_engagement: ${ctaName}`);
    }
  } catch (error) {
    console.error('Failed to track CTA engagement:', error);
  }
};

export default {
  initHotjar,
  trackUserBehavior,
  trackFormInteraction,
  trackPageEvent,
  trackCTAEngagement,
};
