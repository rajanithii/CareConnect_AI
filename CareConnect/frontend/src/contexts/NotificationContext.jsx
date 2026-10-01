import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = useCallback((notification) => {
    setNotifications((prev) => [{ id: Date.now(), read: false, ...notification }, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = { notifications, pushNotification, markRead, unreadCount };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}
