export const APP_NAME = 'BloodLink AI';

export const TAGLINE =
  'Connecting hospitals with the right blood donors in minutes through intelligent matching, real-time location tracking, and instant emergency alerts.';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  MATCHED: 'matched',
  NOTIFIED: 'notified',
  ACCEPTED: 'accepted',
  EN_ROUTE: 'en_route',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const URGENCY_LEVELS = {
  CRITICAL: { label: 'Critical', color: 'red' },
  URGENT: { label: 'Urgent', color: 'amber' },
  STANDARD: { label: 'Standard', color: 'cyan' },
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'AI', href: '/#ai' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  HOSPITAL_DASHBOARD: '/hospital/dashboard',
  HOSPITAL_BLOOD_BANK: '/hospital/blood-bank',
  HOSPITAL_BLOOD_BANK_ADD: '/hospital/blood-bank/add',
  HOSPITAL_BLOOD_BANK_UNIT_DETAIL: '/hospital/blood-bank/units/:id',
  HOSPITAL_BLOOD_BANK_ANALYTICS: '/hospital/blood-bank/analytics',
  DONOR_DASHBOARD: '/donor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  NOTIFICATIONS: '/notifications',
};
