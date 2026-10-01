/**
 * SEO Helmet Configuration
 * Reusable meta tags and structured data for all pages
 */

// Landing Page Configuration
export const landingPageConfig = {
  title: 'BloodLink AI – AI-Powered Blood Donor Matching',
  description: 'Connect hospitals to compatible blood donors in minutes using AI. Real-time emergency response, predictive analytics, and hospital blood management.',
  keywords: 'blood donation, blood matching, hospital, emergency response, AI healthcare, blood bank',
  url: 'https://bloodlink.ai',
  image: 'https://bloodlink.ai/og-image.png',
  type: 'website',
};

// Feature Page Configuration
export const featuresPageConfig = {
  title: 'BloodLink AI Features – Hospital Blood Management Platform',
  description: 'Discover how BloodLink AI reduces blood waste by 30%, matches donors in 8 minutes, and saves lives.',
  keywords: 'blood matching algorithm, hospital software, blood bank management, AI features',
  url: 'https://bloodlink.ai/features',
  image: 'https://bloodlink.ai/features-og.png',
  type: 'website',
};

// About Page Configuration
export const aboutPageConfig = {
  title: 'About BloodLink AI – Mission to Save Lives',
  description: 'Learn how BloodLink AI is transforming emergency blood response and saving lives with AI-powered matching.',
  keywords: 'about BloodLink, mission, vision, healthcare AI',
  url: 'https://bloodlink.ai/about',
  image: 'https://bloodlink.ai/about-og.png',
  type: 'website',
};

// FAQ Schema
export const faqSchema = [
  {
    question: 'What is BloodLink AI?',
    answer: 'BloodLink AI is an AI-powered platform that connects hospitals with compatible blood donors in minutes, enabling real-time emergency response and blood inventory management.',
  },
  {
    question: 'How does the blood matching algorithm work?',
    answer: 'Our AI analyzes blood type compatibility, geographic proximity, and donor availability to identify the best matches instantly.',
  },
  {
    question: 'Can BloodLink AI integrate with our existing hospital system?',
    answer: 'Yes! BloodLink AI integrates seamlessly with most hospital management systems. Our team handles the setup.',
  },
  {
    question: 'How long does implementation take?',
    answer: 'Typical implementation takes 2-4 weeks including training and data migration.',
  },
  {
    question: 'What is the cost?',
    answer: 'Pricing depends on hospital size and needs. Contact our sales team for a personalized quote.',
  },
  {
    question: 'Is patient data secure?',
    answer: 'Yes. We comply with HIPAA regulations and use enterprise-grade encryption for all data.',
  },
  {
    question: 'How many lives has BloodLink saved?',
    answer: 'BloodLink has directly contributed to saving over 45,000 lives across 320+ hospitals worldwide.',
  },
];

// Breadcrumb Navigation
export const breadcrumbs = {
  landing: [
    { name: 'Home', url: 'https://bloodlink.ai' },
  ],
  features: [
    { name: 'Home', url: 'https://bloodlink.ai' },
    { name: 'Features', url: 'https://bloodlink.ai/features' },
  ],
  about: [
    { name: 'Home', url: 'https://bloodlink.ai' },
    { name: 'About', url: 'https://bloodlink.ai/about' },
  ],
  pricing: [
    { name: 'Home', url: 'https://bloodlink.ai' },
    { name: 'Pricing', url: 'https://bloodlink.ai/pricing' },
  ],
};

export default {
  landingPageConfig,
  featuresPageConfig,
  aboutPageConfig,
  faqSchema,
  breadcrumbs,
};
