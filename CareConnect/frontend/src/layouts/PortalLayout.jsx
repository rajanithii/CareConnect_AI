import DashboardLayout from './DashboardLayout';
import { LayoutGrid, Bell, History, MapPin, User, Settings } from 'lucide-react';
import { ROUTES } from '../utils/constants';

const DONOR_NAV = [
  { to: ROUTES.DONOR_DASHBOARD, label: 'Dashboard', icon: LayoutGrid },
  { to: '/donor/notifications', label: 'Notifications', icon: Bell },
  { to: '/donor/history', label: 'Donation History', icon: History },
  { to: '/donor/nearby', label: 'Nearby Requests', icon: MapPin },
  { to: '/donor/profile', label: 'Profile', icon: User },
  { to: '/donor/settings', label: 'Settings', icon: Settings },
];

export default function PortalLayout({ children, title = 'Donor Portal', subtitle }) {
  return (
    <DashboardLayout navItems={DONOR_NAV} title={title} subtitle={subtitle}>
      {children}
    </DashboardLayout>
  );
}
