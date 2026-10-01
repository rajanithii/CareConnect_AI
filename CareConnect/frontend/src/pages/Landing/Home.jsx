import { useEffect } from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import Hero from '../../components/landing/Hero';
import Partners from '../../components/landing/Partners';
import FeatureCards from '../../components/landing/FeatureCards';
import Workflow from '../../components/landing/Workflow';
import AISection from '../../components/landing/AISection';
import Statistics from '../../components/landing/Statistics';
import WhyBloodLink from '../../components/landing/WhyBloodLink';
import Testimonials from '../../components/landing/Testimonials';
import FAQ from '../../components/landing/FAQ';
import CTA from '../../components/landing/CTA';
import {
  landingPageConfig,
  faqSchema,
} from '../../config/seoConfig';
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  breadcrumbSchema,
} from '../../services/seoService';

export default function Home() {
  useEffect(() => {
    const breadcrumbItems = [{ name: 'Home', url: landingPageConfig.url }];
    const structuredData = [
      organizationSchema,
      softwareApplicationSchema,
      faqPageSchema(faqSchema),
      breadcrumbSchema(breadcrumbItems),
    ];

    document.title = landingPageConfig.title;

    const setMeta = (selector, attr, value) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', landingPageConfig.description);
    setMeta('meta[name="keywords"]', 'content', landingPageConfig.keywords);
    setMeta('meta[property="og:title"]', 'content', landingPageConfig.title);
    setMeta('meta[property="og:description"]', 'content', landingPageConfig.description);
    setMeta('meta[property="og:type"]', 'content', landingPageConfig.type);
    setMeta('meta[property="og:url"]', 'content', landingPageConfig.url);
    setMeta('meta[property="og:image"]', 'content', landingPageConfig.image);
    setMeta('meta[property="og:image:alt"]', 'content', 'BloodLink AI emergency blood donor matching platform');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', landingPageConfig.title);
    setMeta('meta[name="twitter:description"]', 'content', landingPageConfig.description);
    setMeta('meta[name="twitter:image"]', 'content', landingPageConfig.image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', landingPageConfig.url);

    let schemaScript = document.head.querySelector('script[data-seo-schema="bloodlink-home"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('data-seo-schema', 'bloodlink-home');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(structuredData);

    return () => {
      const metaSelectors = [
        'meta[name="description"]',
        'meta[name="keywords"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:type"]',
        'meta[property="og:url"]',
        'meta[property="og:image"]',
        'meta[property="og:image:alt"]',
        'meta[name="twitter:card"]',
        'meta[name="twitter:title"]',
        'meta[name="twitter:description"]',
        'meta[name="twitter:image"]',
      ];

      metaSelectors.forEach((selector) => {
        const element = document.head.querySelector(selector);
        if (element && element.dataset.seoManaged === 'bloodlink-home') {
          element.remove();
        }
      });

      const canonicalTag = document.head.querySelector('link[rel="canonical"]');
      if (canonicalTag && canonicalTag.getAttribute('href') === landingPageConfig.url) {
        canonicalTag.remove();
      }

      const jsonLd = document.head.querySelector('script[data-seo-schema="bloodlink-home"]');
      if (jsonLd) jsonLd.remove();
    };
  }, []);

  return (
    <LandingLayout>
      <Hero />
      <Partners />
      <FeatureCards />
      <Workflow />
      <AISection />
      <Statistics />
      <WhyBloodLink />
      <Testimonials />
      <FAQ />
      <CTA />
    </LandingLayout>
  );
}
