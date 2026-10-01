import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
