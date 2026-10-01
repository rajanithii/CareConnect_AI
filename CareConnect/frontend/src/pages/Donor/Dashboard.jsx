import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Award, MapPin, Bell, ChevronRight } from 'lucide-react';
import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { cx } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { donorService } from '../../services/donorService';
import { donorNotificationService } from '../../services/donorNotificationService';

export default function DonorDashboardPage() {
  const { user } = useAuth();
  const [available, setAvailable] = useState(true);
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileData, alertsData] = await Promise.all([
          donorService.getDonorById(user.id),
          donorNotificationService.getNotifications(user.id),
        ]);

        setProfile(profileData || null);
        setAlerts(alertsData || []);
        setAvailable(profileData?.availability ?? true);
      } catch (err) {
        console.error('Failed to load donor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const recentDonations = sortedAlerts.slice(0, 3);
  const nearbyRequests = sortedAlerts.slice(0, 2);
  const totalDonations = alerts.length;
  const nextEligible = profile?.last_donation_date ? 'Active' : 'Ready';

  return (
    <PortalLayout title="Donor Dashboard" subtitle="Welcome back — thank you for staying ready.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Your blood group</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-red-600">{profile?.blood_group || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Availability</p>
              <button
                onClick={() => setAvailable((a) => !a)}
                className={cx(
                  'mt-1 flex h-8 w-16 items-center rounded-full p-1 transition-colors',
                  available ? 'bg-emerald-500 justify-end' : 'bg-line justify-start'
                )}
              >
                <motion.span layout className="h-6 w-6 rounded-full bg-white shadow" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <p className="font-display text-xl font-bold text-ink">{loading ? '—' : totalDonations}</p>
              <p className="text-xs text-muted">Recent alerts</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">{loading ? '—' : nextEligible}</p>
              <p className="text-xs text-muted">Eligibility</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">{profile?.city || '—'}</p>
              <p className="text-xs text-muted">Current city</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-cyan-600" />
            <h3 className="font-display text-base font-bold text-ink">Achievements</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="red">First Donation</Badge>
            <Badge tone="cyan">5+ Donations</Badge>
            <Badge tone="success">Fast Responder</Badge>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="p-0">
          <div className="flex items-center justify-between border-b border-line p-6">
            <div className="flex items-center gap-2">
              <Bell size={17} className="text-red-600" />
              <h3 className="font-display text-base font-bold text-ink">Nearby requests</h3>
            </div>
            <span className="text-sm font-medium text-red-600">{nearbyRequests.length} matching</span>
          </div>
          <div className="divide-y divide-line">
            {nearbyRequests.length === 0 ? (
              <div className="p-5 text-sm text-muted">No active requests matched to your profile yet.</div>
            ) : (
              nearbyRequests.map((n) => (
                <div key={n.request_id || n.notification_id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-display text-sm font-bold text-red-600">
                      {n.blood_group || '—'}
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{n.hospital}</p>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <MapPin size={11} /> {n.city || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={n.urgency === 'Critical' ? 'red' : 'neutral'}>{n.urgency || 'Standard'}</Badge>
                    <Button size="sm" variant="primary">Respond</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card padding="p-0">
          <div className="flex items-center justify-between border-b border-line p-6">
            <div className="flex items-center gap-2">
              <Droplet size={17} className="text-red-600" />
              <h3 className="font-display text-base font-bold text-ink">Recent donations</h3>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <div className="divide-y divide-line">
            {recentDonations.length === 0 ? (
              <div className="p-5 text-sm text-muted">No recent donation activity to show yet.</div>
            ) : (
              recentDonations.map((h) => (
                <div key={h.notification_id || h.request_id} className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{h.hospital}</p>
                    <p className="text-xs text-muted">{h.city || '—'} · {h.blood_group || '—'}</p>
                  </div>
                  <span className="text-sm font-medium text-ink2">{h.status || 'Pending'}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
