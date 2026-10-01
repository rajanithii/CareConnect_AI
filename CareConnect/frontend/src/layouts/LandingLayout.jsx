import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EmergencyBanner from '../components/landing/EmergencyBanner';
import PageWrapper from '../components/layout/PageWrapper';

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <EmergencyBanner />
      <Navbar />
      <PageWrapper>{children}</PageWrapper>
      <Footer />
    </div>
  );
}
