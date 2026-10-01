import LandingLayout from '../../layouts/LandingLayout';
import FAQSection from '../../components/landing/FAQ';

export default function FAQPage() {
  return (
    <LandingLayout>
      <div className="pt-24">
        <FAQSection />
      </div>
    </LandingLayout>
  );
}
