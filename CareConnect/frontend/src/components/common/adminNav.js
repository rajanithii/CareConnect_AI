import { LayoutGrid, Building2, HeartHandshake, ListChecks, FileBarChart, Settings, BarChart2 } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export const ADMIN_NAV = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Admin Dashboard', icon: BarChart2 },
  { to: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
  { to: '/admin/donors', label: 'Donors', icon: HeartHandshake },
  { to: '/admin/requests', label: 'Requests', icon: ListChecks },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];
