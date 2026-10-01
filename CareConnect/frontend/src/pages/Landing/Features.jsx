import LandingLayout from '../../layouts/LandingLayout';
import FeatureCards from '../../components/landing/FeatureCards';

export default function Features() {
  return (
    <LandingLayout>
      <div className="pt-24">
        <FeatureCards />
      </div>
    </LandingLayout>
  );
}
