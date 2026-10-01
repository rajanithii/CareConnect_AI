import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Droplet, MapPin, FileText, Sparkles, Send } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { BLOOD_GROUPS } from '../../utils/constants';
import { cx } from '../../utils/helpers';
import { requestService } from '../../services/requestService';
import { useAuth } from '../../hooks/useAuth';

const URGENCY = [
  { id: 'critical', label: 'Critical', hint: 'Immediate — life at risk', tone: 'red' },
  { id: 'urgent', label: 'Urgent', hint: 'Within a few hours', tone: 'amber' },
  { id: 'standard', label: 'Standard', hint: 'Within 24–48 hours', tone: 'neutral' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urgency, setUrgency] = useState('critical');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { units: 1 } });

  const bloodGroup = watch('bloodGroup');

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      setMessage('');

      const payload = {
        patient_name: values.patientName || 'Emergency Patient',
        blood_group: values.bloodGroup,
        hospital: values.hospital || 'Meridian Hospital',
        phone: values.contact || '',
        city: values.city || 'Coimbatore',
        urgency: urgency.toUpperCase(),
      };
      // If logged in as hospital, include hospital_id for robust association
      if (user?.role === 'hospital' && user?.id) {
        payload.hospital_id = user.id;
      }

      const data = await requestService.createRequest(payload);
      const requestId = data?.request_id;

      if (requestId) {
        localStorage.setItem('bloodlink_last_request_id', String(requestId));
        localStorage.setItem('bloodlink_last_request_flow', 'true');
      }

      setMessage(data?.message || 'Blood request created successfully.');
      reset({ bloodGroup: '', units: 1, ward: '', contact: '', notes: '', patientName: '', hospital: '', city: '' });
      setUrgency('critical');
      navigate('/hospital/ai-processing');
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || 'Unable to create request. Please try again.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Create Blood Request" subtitle="AI matching begins the moment you submit.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2"
        >
          <Card className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <Droplet size={17} className="text-red-600" /> Blood requirement
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Patient name"
                  placeholder="Patient name"
                  error={errors.patientName && 'Required'}
                  {...register('patientName', { required: true })}
                />
                <Select
                  label="Blood group needed"
                  placeholder="Select group"
                  options={BLOOD_GROUPS}
                  error={errors.bloodGroup && 'Required'}
                  {...register('bloodGroup', { required: true })}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Units required"
                  type="number"
                  min={1}
                  max={20}
                  error={errors.units && 'Enter a valid number'}
                  {...register('units', { required: true, min: 1 })}
                />
                <Input
                  label="Hospital name"
                  placeholder="Hospital name"
                  error={errors.hospital && 'Required'}
                  {...register('hospital', { required: true })}
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-base font-bold text-ink">Urgency level</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {URGENCY.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setUrgency(u.id)}
                    className={cx(
                      'rounded-2xl border px-4 py-3 text-left transition-colors',
                      urgency === u.id
                        ? u.tone === 'red'
                          ? 'border-red-500 bg-red-50'
                          : u.tone === 'amber'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-ink bg-surface'
                        : 'border-line hover:bg-surface'
                    )}
                  >
                    <p className="font-display text-sm font-bold text-ink">{u.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{u.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <MapPin size={17} className="text-red-600" /> Pickup location
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input label="City" placeholder="City" error={errors.city && 'Required'} {...register('city', { required: true })} />
                <Input label="Contact number" placeholder="+91 98xxxxxx" error={errors.contact && 'Required'} {...register('contact', { required: true })} />
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <FileText size={17} className="text-red-600" /> Additional context
              </h3>
              <TextArea
                className="mt-4"
                placeholder="Describe the case — the AI reads this to refine urgency scoring."
                rows={4}
                {...register('notes')}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-green-600">{message}</p> : null}

            <Button type="submit" variant="emergency" size="lg" icon={Send} loading={submitting} className="w-full" disabled={submitting}>
              Submit &amp; Start AI Matching
            </Button>
          </Card>
        </motion.form>

        <Card className="h-fit">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-cyan-600" />
            <h3 className="font-display text-base font-bold text-ink">Live preview</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Blood group</span>
              <span className="font-semibold text-ink">{bloodGroup || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Urgency</span>
              <Badge tone={urgency === 'critical' ? 'red' : urgency === 'urgent' ? 'amber' : 'neutral'}>
                {URGENCY.find((u) => u.id === urgency)?.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Est. donors nearby</span>
              <span className="font-semibold text-ink">{bloodGroup ? '37' : '—'}</span>
            </div>
          </div>
          <p className="mt-5 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted">
            Once submitted, the AI will score urgency, filter compatible donors, and begin
            sending alerts — typically within seconds.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
