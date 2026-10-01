import { Save, Globe, Bell, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ADMIN_NAV } from '../../components/common/adminNav';

export default function Settings() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Platform Settings" subtitle="Global configuration for the BloodLink AI network">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Globe size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">General</h3>
          </div>
          <div className="mt-4 space-y-4">
            <Input label="Platform name" defaultValue="BloodLink AI" />
            <Select label="Default search radius" options={['5 km', '10 km', '25 km', '50 km']} defaultValue="10 km" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Alert thresholds</h3>
          </div>
          <div className="mt-4 space-y-4">
            <Input label="Critical response SLA (minutes)" type="number" defaultValue="10" />
            <Input label="Urgent response SLA (minutes)" type="number" defaultValue="60" />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-red-600" />
            <h3 className="font-display text-base font-bold text-ink">Admin team</h3>
          </div>
          <p className="mt-2 text-sm text-muted">Manage who has access to the admin panel.</p>
          <Button variant="outline" size="sm" className="mt-4">
            Invite Team Member
          </Button>
        </Card>
      </div>

      <Button variant="primary" icon={Save} iconPosition="left" className="mt-6">
        Save Settings
      </Button>
    </DashboardLayout>
  );
}
