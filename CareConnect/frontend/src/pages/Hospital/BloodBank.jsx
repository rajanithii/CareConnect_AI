import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Droplet,
  PackagePlus,
  AlertTriangle,
  Boxes,
  ScanLine,
  ChevronRight,
  Warehouse,
  BarChart3,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { BLOOD_GROUPS } from '../../utils/constants';
import { bloodBankService } from '../../services/bloodBankService';
import { useAuth } from '../../hooks/useAuth';

const STATUS_TONE = {
  AVAILABLE: 'success',
  RESERVED: 'amber',
  ISSUED: 'ai',
  EXPIRED: 'red',
  DISCARDED: 'neutral',
  IN_TRANSIT: 'cyan',
};

const COMPONENT_TYPES = [
  { value: 'WHOLE_BLOOD', label: 'Whole Blood' },
  { value: 'PLASMA', label: 'Plasma' },
  { value: 'PLATELETS', label: 'Platelets' },
  { value: 'RBC', label: 'RBC' },
  { value: 'CRYOPRECIPITATE', label: 'Cryoprecipitate' },
];

const STATUS_OPTIONS = Object.keys(STATUS_TONE).map((s) => ({ value: s, label: s.replace('_', ' ') }));

export default function BloodBank() {
  const { user } = useAuth();
  const hospitalId = user?.id;

  const [summary, setSummary] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [componentType, setComponentType] = useState('');
  const [status, setStatus] = useState('');

  const [scanCode, setScanCode] = useState('');
  const [scanError, setScanError] = useState('');

  const [locationsOpen, setLocationsOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', location_type: 'REFRIGERATOR', temperature_range: '', capacity: '' });
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const loadData = useCallback(async () => {
    if (!hospitalId) return;
    try {
      setLoading(true);
      setError('');
      const [summaryData, unitsData] = await Promise.all([
        bloodBankService.getSummary(hospitalId),
        bloodBankService.getUnits(hospitalId, {
          blood_group: bloodGroup || undefined,
          component_type: componentType || undefined,
          status: status || undefined,
        }),
      ]);
      setSummary(summaryData);
      setUnits(unitsData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load blood bank data.');
      setSummary(null);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [hospitalId, bloodGroup, componentType, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = units.filter((u) => {
    const haystack = `${u.unit_code} ${u.blood_group}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const handleScan = async (e) => {
    e.preventDefault();
    setScanError('');
    if (!scanCode.trim()) return;
    try {
      const unit = await bloodBankService.getUnitByCode(scanCode.trim());
      window.location.assign(`/hospital/blood-bank/units/${unit.id}`);
    } catch (err) {
      setScanError(err?.response?.data?.detail || 'No unit found for that code.');
    }
  };

  const openLocations = async () => {
    setLocationsOpen(true);
    setLocationError('');
    try {
      setLocationsLoading(true);
      const data = await bloodBankService.getLocations(hospitalId);
      setLocations(data || []);
    } catch (err) {
      setLocationError(err?.response?.data?.detail || 'Unable to load storage locations.');
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name.trim()) return;
    try {
      setCreatingLocation(true);
      setLocationError('');
      const created = await bloodBankService.createLocation({
        hospital_id: hospitalId,
        name: newLocation.name.trim(),
        location_type: newLocation.location_type,
        temperature_range: newLocation.temperature_range || undefined,
        capacity: newLocation.capacity ? Number(newLocation.capacity) : undefined,
      });
      setLocations((prev) => [...prev, created]);
      setNewLocation({ name: '', location_type: 'REFRIGERATOR', temperature_range: '', capacity: '' });
    } catch (err) {
      setLocationError(err?.response?.data?.detail || 'Unable to create storage location.');
    } finally {
      setCreatingLocation(false);
    }
  };

  const STATS = [
    { label: 'Total units', value: summary?.total_units ?? '—', icon: Boxes, tone: 'ai' },
    { label: 'Available', value: summary?.by_status?.AVAILABLE ?? 0, icon: Droplet, tone: 'red' },
    { label: 'Reserved', value: summary?.by_status?.RESERVED ?? 0, icon: PackagePlus, tone: 'ai' },
    { label: 'Expiring in 7 days', value: summary?.expiring_within_7_days ?? 0, icon: AlertTriangle, tone: 'red' },
  ];

  return (
    <DashboardLayout
      navItems={HOSPITAL_NAV}
      title="Smart Blood Bank"
      subtitle="Live inventory across every unit in your bank"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  s.tone === 'ai' ? 'bg-cyan-200/40 text-cyan-700' : 'bg-red-50 text-red-600'
                }`}
              >
                <s.icon size={18} />
              </span>
              <p className="mt-4 font-display text-2xl font-bold text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6">
        <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                label="Scan / enter unit code"
                icon={ScanLine}
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="e.g. BU-14-A1B2C3D4"
                error={scanError || undefined}
              />
              <Button type="submit" variant="outline" className="mt-7 h-fit shrink-0">
                Look up
              </Button>
            </div>
          </div>
          <Button type="button" variant="outline" icon={Warehouse} iconPosition="left" onClick={openLocations} className="w-full sm:w-auto">
            Storage Locations
          </Button>
          <Link to="/hospital/blood-bank/analytics">
            <Button type="button" variant="outline" icon={BarChart3} iconPosition="left" className="w-full sm:w-auto">
              Analytics
            </Button>
          </Link>
          <Link to="/hospital/blood-bank/add">
            <Button variant="emergency" icon={PackagePlus} iconPosition="left" className="w-full sm:w-auto">
              Receive New Unit
            </Button>
          </Link>
        </form>
      </Card>

      <Modal open={locationsOpen} onClose={() => setLocationsOpen(false)} title="Storage Locations" size="md">
        {locationsLoading ? (
          <Loader label="Loading locations..." />
        ) : (
          <div className="space-y-4">
            {locationError && <p className="text-sm text-red-600">{locationError}</p>}

            {locations.length === 0 ? (
              <p className="text-sm text-muted">No storage locations set up yet.</p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink2">{loc.name}</p>
                      <p className="text-xs text-muted">
                        {loc.location_type.replace('_', ' ')}
                        {loc.temperature_range ? ` · ${loc.temperature_range}` : ''}
                        {loc.capacity ? ` · capacity ${loc.capacity}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateLocation} className="space-y-3 border-t border-line pt-4">
              <p className="text-xs font-medium text-muted">Add a new location</p>
              <Input
                placeholder="e.g. Fridge B - Shelf 2"
                value={newLocation.name}
                onChange={(e) => setNewLocation((s) => ({ ...s, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  options={[
                    { value: 'REFRIGERATOR', label: 'Refrigerator' },
                    { value: 'FREEZER', label: 'Freezer' },
                    { value: 'ROOM_TEMP', label: 'Room temperature' },
                  ]}
                  onChange={(e) => setNewLocation((s) => ({ ...s, location_type: e.target.value }))}
                />
                <Input
                  placeholder="Capacity (optional)"
                  type="number"
                  value={newLocation.capacity}
                  onChange={(e) => setNewLocation((s) => ({ ...s, capacity: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Temperature range, e.g. 2-6°C (optional)"
                value={newLocation.temperature_range}
                onChange={(e) => setNewLocation((s) => ({ ...s, temperature_range: e.target.value }))}
              />
              <Button type="submit" variant="primary" size="sm" loading={creatingLocation} className="w-full">
                Add Location
              </Button>
            </form>
          </div>
        )}
      </Modal>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Search by unit code or blood group" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            placeholder="Blood group"
            options={BLOOD_GROUPS}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <Select
            placeholder="Component"
            options={COMPONENT_TYPES}
            onChange={(e) => setComponentType(e.target.value)}
          />
          <Select
            placeholder="Status"
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-line bg-white p-8">
            <Loader label="Loading inventory..." />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center rounded-2xl border border-line bg-white p-8 text-sm text-red-600">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No units found"
            description="Try adjusting your filters, or receive a new unit into inventory."
          />
        ) : (
          <Card padding="p-0">
            <div className="divide-y divide-line">
              {filtered.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <Link
                    to={`/hospital/blood-bank/units/${u.id}`}
                    className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-surface/60"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-display text-sm font-bold text-red-600">
                        {u.blood_group}
                      </span>
                      <div>
                        <p className="font-display text-sm font-semibold text-ink">{u.unit_code}</p>
                        <p className="text-xs text-muted">
                          {u.component_type.replace('_', ' ')} · Expires {u.expiry_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONE[u.status] || 'neutral'} dot={u.status === 'AVAILABLE'}>
                        {u.status}
                      </Badge>
                      <ChevronRight size={16} className="text-muted" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
