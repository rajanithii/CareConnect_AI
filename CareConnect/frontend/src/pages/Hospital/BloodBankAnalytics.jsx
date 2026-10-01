import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import AnalyticsOverview from '../../components/charts/AnalyticsOverview';
import BloodGroupChart from '../../components/charts/BloodGroupChart';
import DonationTrend from '../../components/charts/DonationTrend';
import InventoryHeatmap from '../../components/charts/InventoryHeatmap';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { bloodBankService } from '../../services/bloodBankService';
import { useAuth } from '../../hooks/useAuth';

export default function BloodBankAnalytics() {
  const { user } = useAuth();
  const hospitalId = user?.id;

  const [stats, setStats] = useState([]);
  const [bloodGroupData, setBloodGroupData] = useState(null);
  const [usageTrend, setUsageTrend] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hospitalId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [overview, distribution, trend, statusHeatmap] = await Promise.all([
          bloodBankService.getAnalyticsOverview(hospitalId),
          bloodBankService.getBloodGroupDistribution(hospitalId),
          bloodBankService.getUsageTrend(hospitalId, 6),
          bloodBankService.getStatusHeatmap(hospitalId),
        ]);
        setStats(overview || []);
        setBloodGroupData(distribution || []);
        setUsageTrend(trend || []);
        setHeatmap(statusHeatmap || null);
      } catch (err) {
        setError(err?.response?.data?.detail || 'Unable to load blood bank analytics.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hospitalId]);

  return (
    <DashboardLayout
      navItems={HOSPITAL_NAV}
      title="Blood Bank Analytics"
      subtitle="Live inventory trends — not request/donor analytics"
    >
      {loading ? (
        <Card className="flex items-center justify-center p-10">
          <Loader label="Loading inventory analytics..." />
        </Card>
      ) : error ? (
        <Card className="flex items-center justify-center p-10 text-sm text-red-600">{error}</Card>
      ) : (
        <>
          <AnalyticsOverview stats={stats} />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-base font-bold text-ink">Units issued per month</h3>
              <p className="text-sm text-muted">Last 6 months, based on the audit trail</p>
              <div className="mt-4">
                <DonationTrend data={usageTrend?.map((d) => ({ month: d.month, units: d.units }))} />
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-base font-bold text-ink">Current stock by blood group</h3>
              <p className="text-sm text-muted">Available + reserved units</p>
              <div className="mt-2">
                <BloodGroupChart data={bloodGroupData} />
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <h3 className="font-display text-base font-bold text-ink">Inventory heatmap</h3>
            <p className="text-sm text-muted">Every unit, by blood group and lifecycle status</p>
            <div className="mt-5">
              <InventoryHeatmap data={heatmap} />
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
