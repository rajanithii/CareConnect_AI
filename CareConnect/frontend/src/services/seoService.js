/**
 * SEO Utilities
 * Meta tags, structured data, and SEO optimization helpers
 */

/**
 * Generate meta tags for a page
 * @param {object} config - SEO configuration
 * @returns {object} - Meta tags object
 */
export const generateMetaTags = (config) => {
  const {
    title = 'BloodLink AI – AI-Powered Blood Donor Matching',
    description = 'Connect hospitals to compatible blood donors in minutes using AI. Real-time emergency response, predictive analytics, and hospital blood management.',
    keywords = 'blood donation, blood matching, hospital blood bank, emergency response, AI healthcare',
    url = 'https://bloodlink.ai',
    image = 'https://bloodlink.ai/og-image.png',
    type = 'website',
    author = 'BloodLink AI',
  } = config;

  return {
    title,
    description,
    keywords,
    author,
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:type': type,
    'og:image': image,
    'og:image:alt': 'BloodLink AI - Emergency Blood Matching Platform',
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:site': '@bloodlinkAI',
    // Additional
    'viewport': 'width=device-width, initial-scale=1',
    'charset': 'UTF-8',
    'robots': 'index, follow',
  };
};

/**
 * Schema markup for Organization
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'BloodLink AI',
  'url': 'https://bloodlink.ai',
  'logo': 'https://bloodlink.ai/logo.png',
  'description': 'AI-powered blood donor matching platform connecting hospitals with compatible donors',
  'sameAs': [
    'https://twitter.com/bloodlinkAI',
    'https://facebook.com/bloodlinkAI',
    'https://linkedin.com/company/bloodlinkAI',
  ],
  'contact': {
    '@type': 'ContactPoint',
    'contactType': 'customer service',
    'telephone': '+1-XXX-XXX-XXXX',
    'email': 'support@bloodlink.ai',
  },
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Your Address',
    'addressLocality': 'Your City',
    'addressRegion': 'State',
    'postalCode': 'ZIP',
    'addressCountry': 'US',
  },
};

/**
 * Schema markup for SoftwareApplication
 */
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'BloodLink AI',
  'description': 'AI-powered blood donor matching and emergency response system',
  'url': 'https://bloodlink.ai',
  'applicationCategory': 'BusinessApplication, HealthApplication',
  'operatingSystem': 'Web',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '124',
  },
};

/**
 * Schema markup for FAQPage
 */
export const faqPageSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map((faq) => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer,
    },
  })),
});

/**
 * Schema markup for BreadcrumbList
 */
export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url,
  })),
});

/**
 * Generate JSON-LD script tags
 * @param {object} schema - Schema object
 * @returns {string} - JSON-LD script
 */
export const generateJsonLd = (schema) => {
  return JSON.stringify(schema, null, 2);
};

/**
 * Canonical URL tag
 * @param {string} url - Current page URL
 * @returns {string} - Canonical tag
 */
export const getCanonicalUrl = (url) => {
  return url || typeof window !== 'undefined' ? window.location.href : '';
};

/**
 * Check SEO readiness
 * @returns {object} - SEO checklist status
 */
export const checkSEOReadiness = () => {
  const checks = {
    titleTag: !!document.title && document.title.length > 30 && document.title.length < 60,
    metaDescription: !!document.querySelector('meta[name="description"]'),
    h1Tag: !!document.querySelector('h1'),
    mobileOptimized: !!document.querySelector('meta[name="viewport"]'),
    httpsEnabled: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
    structuredData: !!document.querySelector('script[type="application/ld+json"]'),
    pageLang: !!document.documentElement.lang,
  };

  return {
    passed: Object.values(checks).filter(Boolean).length,
    total: Object.keys(checks).length,
    checks,
    percentage: Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100),
  };
};

/**
 * Track page metadata
 */
export const trackPageMetadata = (pageName) => {
  const metadata = {
    page: pageName,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    h1: document.querySelector('h1')?.textContent,
    images: document.querySelectorAll('img').length,
    links: document.querySelectorAll('a').length,
    headings: {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
    },
  };

  console.log('Page Metadata:', metadata);
  return metadata;
};

export default {
  generateMetaTags,
  organizationSchema,
  softwareApplicationSchema,
  faqPageSchema,
  breadcrumbSchema,
  generateJsonLd,
  getCanonicalUrl,
  checkSEOReadiness,
  trackPageMetadata,
};
