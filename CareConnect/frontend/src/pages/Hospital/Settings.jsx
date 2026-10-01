import { useState } from 'react';
import { Bell, Shield, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { cx } from '../../utils/helpers';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cx(
        'flex h-7 w-13 items-center rounded-full p-1 transition-colors',
        checked ? 'bg-red-600 justify-end' : 'bg-line justify-start'
      )}
      style={{ width: 48 }}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState({
    critical: true,
    urgent: true,
    standard: false,
    sms: true,
    weeklyReport: true,
  });

  const update = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Settings" subtitle="Notification and account preferences">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Notification preferences</h3>
          </div>
          <div className="mt-4 space-y-4">
            {[
              ['critical', 'Critical request alerts'],
              ['urgent', 'Urgent request alerts'],
              ['standard', 'Standard request alerts'],
              ['sms', 'SMS backup notifications'],
              ['weeklyReport', 'Weekly analytics email'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-ink2">{label}</span>
                <Toggle checked={prefs[key]} onChange={update(key)} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Shield size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Security</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <button className="w-full rounded-xl border border-line px-4 py-3 text-left text-ink2 hover:bg-surface">
              Change password
            </button>
            <button className="w-full rounded-xl border border-line px-4 py-3 text-left text-ink2 hover:bg-surface">
              Enable two-factor authentication
            </button>
            <button className="w-full rounded-xl border border-line px-4 py-3 text-left text-ink2 hover:bg-surface">
              Manage team access
            </button>
          </div>
        </Card>
      </div>

      <Button variant="primary" icon={Save} iconPosition="left" className="mt-6">
        Save Preferences
      </Button>
    </DashboardLayout>
  );
}
