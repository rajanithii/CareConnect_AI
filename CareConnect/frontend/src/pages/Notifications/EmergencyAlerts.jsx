import { useEffect, useState } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import LiveAlert from '../../components/notifications/LiveAlert';
import NotificationCard from '../../components/notifications/NotificationCard';
import api from '../../api/axios';

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        // Try fetching recent critical notifications if backend supports it
        const { data } = await api.get('/notifications/recent');
        if (mounted) setAlerts(Array.isArray(data) ? data : data.notifications || []);
      } catch (err) {
        if (mounted) setAlerts([]);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <PortalLayout title="Emergency Alerts" subtitle="Critical, time-sensitive requests only">
      <div className="mb-6">
        <LiveAlert message={`${alerts.length} critical requests need a response right now`} />
      </div>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-sm text-muted">No active emergency alerts</div>
        ) : (
          alerts.map((a) => <NotificationCard key={a.id} notification={a} />)
        )}
      </div>
    </PortalLayout>
  );
}
