import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Droplet, Warehouse, FileText, Send } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { BLOOD_GROUPS } from '../../utils/constants';
import { bloodBankService } from '../../services/bloodBankService';
import { useAuth } from '../../hooks/useAuth';

const COMPONENT_TYPES = [
  { value: 'WHOLE_BLOOD', label: 'Whole Blood' },
  { value: 'PLASMA', label: 'Plasma' },
  { value: 'PLATELETS', label: 'Platelets' },
  { value: 'RBC', label: 'RBC' },
  { value: 'CRYOPRECIPITATE', label: 'Cryoprecipitate' },
];

const SOURCES = [
  { value: 'DONATION', label: 'Donation' },
  { value: 'TRANSFER_IN', label: 'Inter-hospital transfer' },
  { value: 'PURCHASE', label: 'Purchase' },
];

export default function BloodBankAddUnit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      componentType: 'WHOLE_BLOOD',
      source: 'DONATION',
      volumeMl: 450,
    },
  });

  const bloodGroup = watch('bloodGroup');

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');

      const payload = {
        hospital_id: user?.id,
        blood_group: values.bloodGroup,
        component_type: values.componentType,
        volume_ml: values.volumeMl ? Number(values.volumeMl) : undefined,
        collection_date: values.collectionDate || undefined,
        expiry_date: values.expiryDate,
        source: values.source,
        notes: values.notes || undefined,
      };

      const unit = await bloodBankService.createUnit(payload);
      navigate(`/hospital/blood-bank/units/${unit.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to add this unit. Please check the details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      navItems={HOSPITAL_NAV}
      title="Receive Blood Unit"
      subtitle="Adds a new trackable unit to your blood bank inventory"
    >
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
                <Droplet size={17} className="text-red-600" /> Unit details
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Select
                  label="Blood group"
                  placeholder="Select group"
                  options={BLOOD_GROUPS}
                  error={errors.bloodGroup && 'Required'}
                  {...register('bloodGroup', { required: true })}
                />
                <Select
                  label="Component type"
                  options={COMPONENT_TYPES}
                  error={errors.componentType && 'Required'}
                  {...register('componentType', { required: true })}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Volume (ml)"
                  type="number"
                  min={1}
                  error={errors.volumeMl && 'Enter a valid volume'}
                  {...register('volumeMl', { min: 1 })}
                />
                <Select
                  label="Source"
                  options={SOURCES}
                  error={errors.source && 'Required'}
                  {...register('source', { required: true })}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Collection date"
                  type="date"
                  {...register('collectionDate')}
                />
                <Input
                  label="Expiry date"
                  type="date"
                  error={errors.expiryDate && 'Required — must be a future date'}
                  {...register('expiryDate', { required: true })}
                />
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <FileText size={17} className="text-red-600" /> Notes
              </h3>
              <TextArea
                className="mt-4"
                placeholder="Any handling notes, donor reference, or batch information."
                rows={3}
                {...register('notes')}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button
              type="submit"
              variant="emergency"
              size="lg"
              icon={Send}
              loading={submitting}
              disabled={submitting}
              className="w-full"
            >
              Add to Inventory
            </Button>
          </Card>
        </motion.form>

        <Card className="h-fit">
          <div className="flex items-center gap-2">
            <Warehouse size={17} className="text-cyan-600" />
            <h3 className="font-display text-base font-bold text-ink">What happens next</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-ink2">
            <p>
              A unique unit code (QR/barcode) is generated automatically —{' '}
              <span className="font-mono text-xs text-muted">BU-&lt;hospital&gt;-&lt;code&gt;</span>.
            </p>
            <p>The unit starts as <span className="font-semibold text-emerald-600">AVAILABLE</span> and is immediately visible in inventory.</p>
            <p>Every status change from here is logged for a full audit trail.</p>
          </div>
          {bloodGroup && (
            <div className="mt-5 rounded-xl bg-surface p-3 text-sm">
              <span className="text-muted">Adding:</span>{' '}
              <span className="font-semibold text-ink">{bloodGroup}</span>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
