/**
 * useScrollDepth Hook
 * Tracks how far users scroll down the page at various milestones
 */

import { useEffect } from 'react';
import { trackScrollDepth } from '../services/analytics';

/**
 * Hook to track scroll depth at 25%, 50%, 75%, and 100%
 * Prevents duplicate tracking of same depth
 */
export const useScrollDepth = () => {
  useEffect(() => {
    let maxScroll = 0;
    const trackedDepths = [25, 50, 75, 100];

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolled = window.scrollY;

      // Calculate scroll depth percentage
      const scrollDepth = ((scrolled + windowHeight) / documentHeight) * 100;

      // Track at milestones (only if greater than previous max)
      trackedDepths.forEach((depth) => {
        if (scrollDepth >= depth && maxScroll < depth) {
          maxScroll = depth;
          trackScrollDepth(Math.min(depth, 100));
          console.log(`Scroll depth tracked: ${depth}%`);
        }
      });
    };

    // Add passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

/**
 * Hook to track time spent on page
 * @param {number} intervalMs - Interval to check (default 30 seconds)
 * @param {function} onTimeUpdate - Callback with time spent in ms
 */
export const useTimeOnPage = (intervalMs = 30000, onTimeUpdate) => {
  useEffect(() => {
    let timeSpent = 0;

    const timer = setInterval(() => {
      timeSpent += intervalMs;
      if (onTimeUpdate) {
        onTimeUpdate(timeSpent);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, onTimeUpdate]);
};

/**
 * Hook to track visibility (when user leaves/returns to page)
 * @param {function} onVisibilityChange - Callback with visibility boolean
 */
export const usePageVisibility = (onVisibilityChange) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      if (onVisibilityChange) {
        onVisibilityChange(isVisible);
      }
      console.log(`Page visibility: ${isVisible ? 'visible' : 'hidden'}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onVisibilityChange]);
};

export default {
  useScrollDepth,
  useTimeOnPage,
  usePageVisibility,
};
