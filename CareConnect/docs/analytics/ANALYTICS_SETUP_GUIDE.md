# BloodLink AI Landing Page - Analytics & Conversion Tracking Setup Guide

## Overview
Complete analytics implementation including Google Analytics 4, Hotjar heatmaps, conversion tracking, A/B testing, and performance monitoring.

---

## PART 1: Installation & Setup

### Step 1: Install Required Dependencies

```bash
npm --prefix frontend install react-ga4 @hotjar/browser web-vitals uuid
```

### Step 2: Configure Environment Variables

```bash
cp frontend/.env.example frontend/.env.local
```

Then edit `frontend/.env.local` and add your tracking IDs:

```env
# Google Analytics 4 - Get from Google Analytics dashboard
REACT_APP_GA_ID=G-YOUR_TRACKING_ID

# Hotjar - Get from Hotjar dashboard  
REACT_APP_HOTJAR_ID=YOUR_SITE_ID

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000
```

### Step 3: Initialize Analytics in main.jsx

```javascript
import { initGA, trackPageView } from './services/analytics';
import { initHotjar } from './services/heatmap';
import { trackWebVitals } from './services/webvitals';

// Initialize analytics on app startup
initGA();
initHotjar();
trackWebVitals();

// Track initial page view
trackPageView('Landing Page');
```

---

## PART 2: Track Page Navigation

Update your `App.jsx` to track page views on route changes:

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './services/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return (
    // ... your app content
  );
}
```

---

## PART 3: Track Scroll Depth

Use the `useScrollDepth` hook in your landing page:

```javascript
import { useScrollDepth } from './hooks/useScrollDepth';

export default function LandingPage() {
  useScrollDepth(); // Automatically tracks 25%, 50%, 75%, 100%

  return (
    // ... landing page content
  );
}
```

---

## PART 4: Track CTA Clicks

Update your CTA components to track conversions:

```javascript
import { trackCTAClick, trackFormSubmit } from './services/analytics';
import { trackCTAEngagement } from './services/heatmap';

function CTAButton() {
  const handleClick = () => {
    // Track to Google Analytics
    trackCTAClick('Get Started', 'Hero Section');
    
    // Track to Hotjar
    trackCTAEngagement('Get Started Button');
    
    // Navigate to signup
    navigate('/auth/register');
  };

  return (
    <button onClick={handleClick} className="btn-cta">
      Get Started
    </button>
  );
}
```

---

## PART 5: Newsletter Signup Tracking

```javascript
import axios from 'axios';
import { trackFormSubmit, trackNewsletterSignup } from './services/analytics';

async function handleNewsletterSignup(email) {
  try {
    // Send signup to backend
    await axios.post('/api/newsletter/subscribe', {
      email,
      name: 'Anonymous',
    });

    // Track to Google Analytics
    trackFormSubmit('Newsletter Signup', 1);
    trackNewsletterSignup(email);

    // Show success message
    alert('Thanks for subscribing!');
  } catch (error) {
    console.error('Signup failed:', error);
  }
}
```

---

## PART 6: A/B Testing Implementation

### Example: Test CTA Button Color

```javascript
import { getTestVariant, trackTestConversion } from './services/abtesting';

function CTASection() {
  // Get assigned variant (consistent per user)
  const variant = getTestVariant('cta_button_color', ['red', 'cyan']);

  const handleClick = () => {
    // Track conversion
    trackTestConversion('cta_button_color', variant, true, {
      section: 'hero',
      timestamp: new Date().toISOString(),
    });

    navigate('/auth/register');
  };

  // Apply variant-specific styling
  const buttonClass = variant === 'red' ? 'btn-red' : 'btn-cyan';

  return (
    <button onClick={handleClick} className={`btn-cta ${buttonClass}`}>
      Get Started
    </button>
  );
}
```

### Running an A/B Test

1. **Define test configuration:**
   - Test ID: `cta_button_color`
   - Variants: `['red', 'cyan']`
   - Duration: 2-4 weeks
   - Success metric: 5% improvement in CTR

2. **Monitor results in Google Analytics:**
   - Look for `ab_test` events
   - Compare conversion rates by variant
   - Calculate statistical significance

3. **Determine winner:**
   - If variant A outperforms variant B by 5%+, rollout variant A
   - If no significant difference, keep original
   - If variant B wins significantly, implement variant B

---

## PART 7: Backend Newsletter Integration

The backend endpoint is ready at `/api/newsletter/subscribe`:

```bash
# Test endpoint
curl -X POST http://localhost:8000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

Response:
```json
{
  "message": "Successfully subscribed to newsletter!",
  "email": "user@example.com",
  "status": "pending_confirmation"
}
```

---

## PART 8: Key Metrics to Monitor

### Traffic Metrics
- Page views (total unique visits)
- Bounce rate (users who leave without interaction)
- Average session duration
- Device breakdown (mobile: 60%, desktop: 35%, tablet: 5%)

### Engagement Metrics
- Scroll depth (target: 75%+ users scroll past hero)
- Time on page (target: 2+ minutes)
- Section views (which sections are most viewed)
- Click-through rate by button

### Conversion Metrics
- CTA clicks (target: 10%+ CTR)
- Newsletter signups (target: 3%+ conversion)
- Contact form submissions
- Overall conversion rate (target: 5%+)

### Performance Metrics
- Page load time (target: < 2 seconds)
- Lighthouse score (target: > 90)
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

## PART 9: Google Analytics Dashboard Setup

### Create Conversion Goals

1. Go to Google Analytics 4 → Admin → Events
2. Create custom event: `newsletter_signup`
3. Create custom event: `click_cta`
4. Create custom event: `ab_test_conversion`

### Create Dashboard

1. Analytics → Dashboards → Create Dashboard
2. Add widgets:
   - Page views (top section)
   - Scroll depth distribution
   - CTA clicks by button
   - Newsletter signups over time
   - Conversion rate trend

---

## PART 10: Hotjar Setup

### Enable Session Recording

1. Log in to Hotjar dashboard
2. Site Settings → Recording & Playback
3. Enable "Record user sessions"
4. Set sample rate to 10-20%

### Create Heatmaps

1. Heatmaps → Create new heatmap
2. Select page: Landing page
3. Monitor: Clicks, Scrolls, Mouse movements
4. Review patterns weekly

### Set up Conversion Funnels

1. Funnels → Create new funnel
2. Steps:
   - Page view (landing page)
   - Scroll 25%
   - View features section
   - Scroll to CTA
   - Click CTA button
   - Redirect to registration

---

## PART 11: Testing in Development

### Check if Tracking Works

Open browser DevTools → Network tab and look for:

1. **Google Analytics requests:**
   - `https://www.google-analytics.com/g/collect`
   - Check payload for events

2. **Hotjar requests:**
   - `https://static.hotjar.com/...`
   - Should load on page view

3. **Console errors:**
   - No "GA4 initialization failed" errors
   - No "Hotjar not found" errors

### Test Specific Conversions

```javascript
// In browser console:
import { trackCTAClick } from './services/analytics';
trackCTAClick('Test Button', 'Test Section');
// Should see event in Google Analytics
```

---

## PART 12: Production Deployment Checklist

Before deploying to production:

- [ ] Remove all `console.log()` statements from analytics
- [ ] Replace mock GA_TRACKING_ID with production ID
- [ ] Replace mock HOTJAR_ID with production ID
- [ ] Test all conversion events
- [ ] Verify GDPR/privacy compliance
- [ ] Add privacy policy explaining tracking
- [ ] Set up Google Search Console
- [ ] Enable Google Analytics goals/conversions
- [ ] Set up alerts for anomalies
- [ ] Monitor first week closely

---

## PART 13: Privacy & GDPR Compliance

### Add Privacy Disclaimer

Add to your privacy policy:

```
We use Google Analytics and Hotjar to understand how users interact with our site.
These services may collect personal information including IP address and cookies.
Users can opt-out by enabling "Do Not Track" in their browser settings.
```

### Disable Tracking for Users with DNT

```javascript
// In analytics.js
if (navigator.doNotTrack === '1') {
  console.log('Do Not Track enabled - analytics disabled');
  export const trackEvent = () => {}; // Disable all tracking
}
```

---

## PART 14: Monthly Reporting

### Metrics to Report

Create monthly report with:

1. **Traffic Summary**
   - Total page views
   - Unique visitors
   - Bounce rate
   - Avg session duration

2. **Conversion Summary**
   - CTA clicks (count & rate)
   - Newsletter signups
   - Total conversions
   - Conversion rate %

3. **Top Performers**
   - Most viewed sections
   - Best performing CTAs
   - Traffic sources

4. **Recommendations**
   - Low-performing sections to optimize
   - A/B test winners
   - Next month's focus areas

### Report Template

Use this section as a monthly reporting checklist; a separate report template is not included.

---

## PART 15: Troubleshooting

### GA4 Events Not Appearing

1. Check if GA_TRACKING_ID is correct (starts with G-)
2. Wait 24-48 hours for data to appear
3. Check Google Analytics dashboard for events
4. Verify CORS is not blocking requests

### Hotjar Not Loading

1. Verify HOTJAR_ID is set correctly
2. Check if site is on free tier (limited features)
3. Look for Hotjar script in Network tab
4. Check browser console for errors

### Scroll Depth Not Tracking

1. Ensure useScrollDepth hook is in LandingPage
2. Check console for "Scroll depth tracked" messages
3. Verify page is tall enough (document must be scrollable)
4. Test on actual page, not in local dev with small viewport

### Newsletter Signup Failing

1. Check backend is running
2. Test endpoint: `curl http://localhost:8000/api/newsletter/subscribe`
3. Verify email is valid format
4. Check CORS configuration in backend

---

## Summary

✅ Analytics infrastructure set up and ready  
✅ All tracking services integrated  
✅ A/B testing framework ready  
✅ Performance monitoring enabled  
✅ Newsletter integration complete  

Next steps: Deploy to production and monitor metrics!

---

For questions or issues, refer to the original documentation files:
- `ANALYTICS_SETUP_GUIDE.md` - Analytics setup details
- `../seo/SEO_KEYWORD_STRATEGY.md` - SEO strategy
- `../../frontend/.env.example` - Frontend environment template
