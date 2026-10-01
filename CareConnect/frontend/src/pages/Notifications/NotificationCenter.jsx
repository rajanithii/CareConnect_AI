import { useState } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import NotificationList from '../../components/notifications/NotificationList';
import { cx } from '../../utils/helpers';

const ALL = [
  { id: 1, hospital: 'Sahyadri Health', group: 'B+', units: 2, distance: '1.8 km', urgency: 'Critical', time: '2 min ago', status: 'pending' },
  { id: 2, hospital: 'RedCross Kerala', group: 'B+', units: 1, distance: '3.4 km', urgency: 'Standard', time: '1 hr ago', status: 'pending' },
  { id: 3, hospital: 'CityMed Group', group: 'B+', units: 1, distance: '2.1 km', urgency: 'Urgent', time: 'Yesterday', status: 'accepted' },
  { id: 4, hospital: 'Apollo Care Network', group: 'B+', units: 1, distance: '5.0 km', urgency: 'Standard', time: '2 days ago', status: 'rejected' },
];

const TABS = ['All', 'Pending', 'Accepted', 'Declined'];

export default function NotificationCenter() {
  const [tab, setTab] = useState('All');
  const [notifications, setNotifications] = useState(ALL);

  const filtered = notifications.filter((n) => {
    if (tab === 'All') return true;
    if (tab === 'Pending') return n.status === 'pending';
    if (tab === 'Accepted') return n.status === 'accepted';
    return n.status === 'rejected';
  });

  const respond = (id, status) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)));

  return (
    <PortalLayout title="Notification Center" subtitle="Every alert, in one place">
      <div className="mb-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
              tab === t ? 'border-red-600 text-ink' : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <NotificationList
        notifications={filtered}
        onAccept={(id) => respond(id, 'accepted')}
        onReject={(id) => respond(id, 'rejected')}
      />
    </PortalLayout>
  );
}
