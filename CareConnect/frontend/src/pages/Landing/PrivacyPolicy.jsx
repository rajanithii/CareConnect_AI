import LandingLayout from '../../layouts/LandingLayout';

export default function PrivacyPolicy() {
  return (
    <LandingLayout>
      <div className="container-page max-w-2xl py-32">
        <h1 className="font-display text-4xl font-extrabold text-ink">Privacy Policy</h1>
        <p className="mt-4 text-muted">
          BloodLink AI collects only the information required to match donors with hospital
          requests safely. Location data is shared with a hospital only after a donor accepts
          a specific request. Full policy details will be published here.
        </p>
      </div>
    </LandingLayout>
  );
}
