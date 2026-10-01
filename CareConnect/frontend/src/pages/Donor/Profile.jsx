import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Droplet, Save } from 'lucide-react';
import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { BLOOD_GROUPS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { donorAPI } from '../../api/donorAPI';

export default function Profile() {
  const { user } = useAuth();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchDonor = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data } = await donorAPI.getById(user.id);
        if (mounted) setDonor(data);
      } catch (err) {
        if (mounted) setError('Unable to load your profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDonor();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = (key) => (e) => {
    setDonor((current) => ({ ...current, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user?.id || !donor) return;
    setError('');
    setSaving(true);
    try {
      await donorAPI.updateProfile(user.id, donor);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout title="Donor Profile" subtitle="Keep your details current so hospitals can trust every match.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
            <User size={28} />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">{donor?.name || 'Your name'}</h3>
          <Badge tone="red" className="mt-2">{donor?.blood_group ? `${donor.blood_group} Donor` : 'Donor'}</Badge>
          <p className="mt-3 text-sm text-muted">
            {donor ? `${donor.total_donations || 0} donations · Member since ${new Date(donor.created_at).getFullYear()}` : 'Loading donor details...'}
          </p>
          <Button variant="outline" size="sm" className="mt-4">
            Change Photo
          </Button>
        </Card>

        <Card className="lg:col-span-2 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Input label="Full name" icon={User} value={donor?.name || ''} onChange={handleChange('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email address" icon={Mail} value={donor?.email || ''} onChange={handleChange('email')} />
            <Input label="Phone number" icon={Phone} value={donor?.phone || ''} onChange={handleChange('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Blood group"
              icon={Droplet}
              options={BLOOD_GROUPS}
              value={donor?.blood_group || ''}
              onChange={handleChange('blood_group')}
            />
            <Input label="City" icon={MapPin} value={donor?.city || ''} onChange={handleChange('city')} />
          </div>
          <Button variant="primary" icon={Save} iconPosition="left" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
          {loading && <div className="text-sm text-muted">Loading your profile...</div>}
        </Card>
      </div>
    </PortalLayout>
  );
}
