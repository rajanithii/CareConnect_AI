import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import AnalyticsOverview from '../../components/charts/AnalyticsOverview';
import BloodGroupChart from '../../components/charts/BloodGroupChart';
import ResponseTimeChart from '../../components/charts/ResponseTimeChart';
import DonationTrend from '../../components/charts/DonationTrend';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATS = [
  { label: 'Requests fulfilled', value: '284', delta: '+12%' },
  { label: 'Avg. response time', value: '4.6 min', delta: '-18%' },
  { label: 'Active donor pool', value: '1,204', delta: '+6%' },
  { label: 'Fulfillment rate', value: '96.2%', delta: '+2.1%' },
];

export default function Analytics() {
  const [hospitalName, setHospitalName] = useState('Hospital');

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { data } = await api.get('/hospital/profile');
        if (mounted) setHospitalName(data?.name || data?.hospital || 'Hospital');
      } catch (err) {
        if (mounted) setHospitalName('Hospital');
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Analytics" subtitle={`Last 30 days · ${hospitalName}`}>
      <AnalyticsOverview stats={STATS} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-base font-bold text-ink">Average response time</h3>
          <p className="text-sm text-muted">Minutes from request to first donor acceptance</p>
          <div className="mt-4">
            <ResponseTimeChart />
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-base font-bold text-ink">Blood group distribution</h3>
          <p className="text-sm text-muted">Of fulfilled requests</p>
          <div className="mt-2">
            <BloodGroupChart />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="font-display text-base font-bold text-ink">Donation trend</h3>
        <p className="text-sm text-muted">Total units received per month</p>
        <div className="mt-4">
          <DonationTrend />
        </div>
      </Card>
    </DashboardLayout>
  );
}
