import { Building2, HeartHandshake, ListChecks, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import DonationTrend from '../../components/charts/DonationTrend';
import BloodGroupChart from '../../components/charts/BloodGroupChart';
import { ADMIN_NAV } from '../../components/common/adminNav';

const STATS = [
  { label: 'Partner hospitals', value: '340', icon: Building2 },
  { label: 'Registered donors', value: '12,400', icon: HeartHandshake },
  { label: 'Requests this month', value: '2,108', icon: ListChecks },
  { label: 'Platform-wide fulfillment', value: '96.8%', icon: TrendingUp },
];

const RECENT_HOSPITALS = [
  { name: 'Sunrise Medical Centre', city: 'Bengaluru', status: 'Pending review' },
  { name: 'Northline Trauma Care', city: 'Coimbatore', status: 'Approved' },
  { name: 'Harbor View Hospital', city: 'Visakhapatnam', status: 'Approved' },
];

export default function Dashboard() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Admin Dashboard" subtitle="Platform-wide overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <s.icon size={18} />
            </span>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-base font-bold text-ink">Platform donation trend</h3>
          <div className="mt-4">
            <DonationTrend />
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-base font-bold text-ink">Blood group distribution</h3>
          <div className="mt-2">
            <BloodGroupChart />
          </div>
        </Card>
      </div>

      <Card className="mt-6" padding="p-0">
        <div className="border-b border-line p-6">
          <h3 className="font-display text-base font-bold text-ink">Recently onboarded hospitals</h3>
        </div>
        <div className="divide-y divide-line">
          {RECENT_HOSPITALS.map((h) => (
            <div key={h.name} className="flex items-center justify-between p-5">
              <div>
                <p className="font-display text-sm font-semibold text-ink">{h.name}</p>
                <p className="text-xs text-muted">{h.city}</p>
              </div>
              <Badge tone={h.status === 'Approved' ? 'success' : 'amber'}>{h.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
