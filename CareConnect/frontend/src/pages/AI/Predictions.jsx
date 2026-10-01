import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import PredictionCard from '../../components/ai/PredictionCard';
import DonationTrend from '../../components/charts/DonationTrend';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';

const PREDICTIONS = [
  { group: 'O-', trend: 'down', change: '-14%', note: 'Projected shortage within 2 weeks — consider a targeted drive.' },
  { group: 'AB-', trend: 'down', change: '-9%', note: 'Low stock trending lower; rarest group in your region.' },
  { group: 'O+', trend: 'up', change: '+6%', note: 'Healthy supply expected to continue through next month.' },
  { group: 'B+', trend: 'up', change: '+3%', note: 'Stable — no action needed at this time.' },
];

export default function Predictions() {
  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Predictions" subtitle="Forecasted supply by blood group, next 30 days">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PREDICTIONS.map((p) => (
          <PredictionCard key={p.group} {...p} />
        ))}
      </div>

      <Card className="mt-6">
        <h3 className="font-display text-base font-bold text-ink">Historical donation volume</h3>
        <p className="text-sm text-muted">Used to train the shortage prediction model</p>
        <div className="mt-4">
          <DonationTrend />
        </div>
      </Card>
    </DashboardLayout>
  );
}
