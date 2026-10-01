import NotificationCard from './NotificationCard';
import EmptyState from '../common/EmptyState';
import { BellOff } from 'lucide-react';

export default function NotificationList({ notifications = [], onAccept, onReject }) {
  if (notifications.length === 0) {
    return <EmptyState icon={BellOff} title="No alerts right now" description="You'll be notified the moment a compatible request comes in." />;
  }

  return (
    <div className="space-y-4">
      {notifications.map((n) => {
        const nid = n.notification_id ?? n.id;
        return (
          <NotificationCard
            key={nid}
            notification={n}
            onAccept={() => onAccept?.(nid)}
            onReject={() => onReject?.(nid)}
          />
        );
      })}
    </div>
  );
}
