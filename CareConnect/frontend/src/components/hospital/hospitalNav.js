import {
  LayoutGrid,
  FilePlus2,
  ListChecks,
  BrainCircuit,
  Navigation,
  Warehouse,
  BarChart3,
  Settings,
  User,
  AlertTriangle,
  Lightbulb,
  Share2,
  Clock,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export const HOSPITAL_NAV = [
  { to: ROUTES.HOSPITAL_DASHBOARD, label: 'Dashboard', icon: LayoutGrid },
  { to: '/hospital/create-request', label: 'Create Request', icon: FilePlus2 },
  { to: '/hospital/requests', label: 'Active Requests', icon: ListChecks },
  { to: ROUTES.HOSPITAL_BLOOD_BANK, label: 'Blood Bank', icon: Warehouse },
  { to: '/hospital/ai-processing', label: 'AI Processing', icon: BrainCircuit },
  { to: '/hospital/live-tracking', label: 'Live Tracking', icon: Navigation },
  { to: '/hospital/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/hospital/forecasting', label: 'Forecasting', icon: BarChart3 },
  { to: '/hospital/shortage-prediction', label: 'Shortage Prediction', icon: AlertTriangle },
  { to: '/hospital/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/hospital/inter-hospital-exchange', label: 'Blood Exchange', icon: Share2 },
  { to: '/hospital/blood-expiry', label: 'Expiry Management', icon: Clock },
  { to: '/hospital/profile', label: 'Profile', icon: User },
  { to: '/hospital/settings', label: 'Settings', icon: Settings },
];
