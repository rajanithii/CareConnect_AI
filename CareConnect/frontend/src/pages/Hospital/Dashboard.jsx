import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FilePlus2,
  BrainCircuit,
  Navigation,
  BarChart3,
  Droplet,
  Clock,
  TrendingUp,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { hospitalService } from '../../services/hospitalService';
import api from '../../api/axios';

const STATUS_TONE = {
  Matching: 'ai',
  Notified: 'amber',
  Accepted: 'cyan',
  Completed: 'success',
};

export default function HospitalDashboardPage() {
  const [statistics, setStatistics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalName, setHospitalName] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, requestsResponse] = await Promise.all([
          hospitalService.getStatistics(),
          hospitalService.getRequests(),
        ]);

        const normalizedRequests = Array.isArray(requestsResponse)
          ? requestsResponse
          : requestsResponse?.requests || [];

        const sortedRequests = sortRequestsNewestFirst(normalizedRequests);

        setStatistics(statsResponse || {});
        setRequests(sortedRequests);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
        setError('Unable to load dashboard data. Please try again.');
        setStatistics(null);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/hospital/profile');
        if (mounted) setHospitalName(data?.name || null);
      } catch (err) {
        if (mounted) setHospitalName(null);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Map statistics to stat cards
  const STATS = [
    { label: 'Active requests', value: statistics?.active_requests || '0', icon: ListChecks, tone: 'red' },
    { label: 'Units fulfilled (30d)', value: statistics?.units_fulfilled_30d || '0', icon: Droplet, tone: 'ai' },
    { label: 'Avg. match time', value: statistics?.avg_match_time || '--', icon: Clock, tone: 'ai' },
    { label: 'Fulfillment rate', value: statistics?.fulfillment_rate || '0%', icon: TrendingUp, tone: 'red' },
  ];

  const sortRequestsNewestFirst = (items) => [...items].sort((a, b) => {
    const aValue = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
    const bValue = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
    return bValue - aValue;
  });

  const recentRequests = sortRequestsNewestFirst(requests).slice(0, 5);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Hospital Dashboard" subtitle={`${hospitalName || 'Hospital'} · Emergency Care Unit`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    s.tone === 'ai' ? 'bg-cyan-200/40 text-cyan-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  <s.icon size={18} />
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="p-0">
          <div className="flex items-center justify-between border-b border-line p-6">
            <h3 className="font-display text-base font-bold text-ink">Recent requests</h3>
            <Link to="/hospital/requests" className="flex items-center gap-1 text-sm font-medium text-red-600">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-line">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted">Loading requests...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted">No requests found</div>
              </div>
            ) : (
              recentRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-display text-sm font-bold text-red-600">
                      {r.blood_group || '—'}
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">
                        {r.id} · {r.blood_group || '—'}
                      </p>
                      <p className="text-xs text-muted">{r.hospital || '—'} · {r.city || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={r.urgency === 'Critical' ? 'red' : r.urgency === 'Urgent' ? 'amber' : 'neutral'}>
                      {r.urgency || 'Normal'}
                    </Badge>
                    <Badge tone={STATUS_TONE[r.status] || 'neutral'} dot={r.status === 'ACTIVE'}>
                      {r.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-cyan-600" />
            <h3 className="font-display text-base font-bold text-ink">AI suggestions</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-xl bg-surface p-3 text-ink2">
              O- stock is trending low for this region — consider a donation drive this week.
            </li>
            <li className="rounded-xl bg-surface p-3 text-ink2">
              REQ-1042 has 4 high-reliability donors within 3 km — expect a match shortly.
            </li>
            <li className="rounded-xl bg-surface p-3 text-ink2">
              Friday evenings see 22% more critical requests in your area historically.
            </li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            View AI Insights
          </Button>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/hospital/create-request">
          <Button variant="emergency" icon={FilePlus2} iconPosition="left">
            Create Blood Request
          </Button>
        </Link>
        <Link to="/hospital/live-tracking">
          <Button variant="outline" icon={Navigation} iconPosition="left">
            Live Tracking
          </Button>
        </Link>
        <Link to="/hospital/analytics">
          <Button variant="outline" icon={BarChart3} iconPosition="left">
            View Analytics
          </Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
