import { useState, useEffect } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import NotificationList from '../../components/notifications/NotificationList';
import { donorNotificationService } from '../../services/donorNotificationService';
import { useAuth } from '../../hooks/useAuth';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await donorNotificationService.getNotifications(user.id);
        setNotifications(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Unable to load notifications. Please try again.');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const respond = async (id, status) => {
    try {
      if (status === 'accepted') {
        await donorNotificationService.acceptNotification(id);
      } else if (status === 'rejected') {
        await donorNotificationService.rejectNotification(id);
      }
      setNotifications((prev) => prev.map((n) => {
        const notificationId = n.notification_id ?? n.id;
        return notificationId === id ? { ...n, status: status.toUpperCase() } : n;
      }));
      setMessage({ type: 'success', text: `You ${status === 'accepted' ? 'accepted' : 'rejected'} the request.` });
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      console.error('Failed to respond to notification:', err);
      setError('Failed to process your response. Please try again.');
      setMessage({ type: 'error', text: 'Failed to process response.' });
      setTimeout(() => setMessage(null), 3500);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Notifications" subtitle="Requests matched to your blood group and location">
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted">Loading notifications...</div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout title="Notifications" subtitle="Requests matched to your blood group and location">
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Notifications" subtitle="Requests matched to your blood group and location">
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <NotificationList
        notifications={notifications}
        onAccept={(id) => respond(id, 'accepted')}
        onReject={(id) => respond(id, 'rejected')}
      />
    </PortalLayout>
  );
}
