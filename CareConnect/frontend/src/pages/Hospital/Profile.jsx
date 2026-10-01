import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, MapPin, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import api from '../../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/hospital/profile');
        if (mounted) setProfile(data || {});
      } catch (err) {
        console.error('Failed to load profile', err);
        if (mounted) setProfile({});
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Hospital Profile" subtitle="Keep your details accurate — donors see this before accepting.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Building2 size={28} />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">{profile?.name || 'Hospital Name'}</h3>
          <p className="text-sm text-muted">{profile?.unit || 'Emergency Care Unit'}</p>
          <Button variant="outline" size="sm" className="mt-4">
            Change Logo
          </Button>
        </Card>

        <Card className="lg:col-span-2 space-y-4">
          <Input label="Hospital name" icon={Building2} defaultValue={profile?.name || ''} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact email" icon={Mail} defaultValue={profile?.email || ''} />
            <Input label="Phone number" icon={Phone} defaultValue={profile?.phone || ''} />
          </div>
          <Input label="Address" icon={MapPin} defaultValue={profile?.address || ''} />
          <TextArea label="About" defaultValue={profile?.about || ''} rows={4} />
          <Button variant="primary" icon={Save} iconPosition="left">
            Save Changes
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
