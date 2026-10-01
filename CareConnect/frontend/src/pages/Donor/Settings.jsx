import { useState } from 'react';
import { Bell, Eye, Save } from 'lucide-react';
import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { cx } from '../../utils/helpers';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cx('flex h-7 items-center rounded-full p-1 transition-colors', checked ? 'bg-red-600 justify-end' : 'bg-line justify-start')}
      style={{ width: 48 }}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState({
    available: true,
    critical: true,
    urgent: true,
    standard: false,
    shareLocation: true,
  });

  const update = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <PortalLayout title="Settings" subtitle="Control your availability and privacy">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Notifications</h3>
          </div>
          <div className="mt-4 space-y-4">
            {[
              ['available', 'Available for donation requests'],
              ['critical', 'Critical alerts'],
              ['urgent', 'Urgent alerts'],
              ['standard', 'Standard alerts'],
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
            <Eye size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Privacy</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink2">Share live location after accepting a request</span>
              <Toggle checked={prefs.shareLocation} onChange={update('shareLocation')} />
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Your precise location is never visible to hospitals until you accept a specific
              request. You can revoke sharing at any time.
            </p>
          </div>
        </Card>
      </div>

      <Button variant="primary" icon={Save} iconPosition="left" className="mt-6">
        Save Preferences
      </Button>
    </PortalLayout>
  );
}
