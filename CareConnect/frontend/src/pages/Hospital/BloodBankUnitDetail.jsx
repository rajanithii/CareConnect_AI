import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PackageCheck, PackageX, Undo2, ArrowLeftRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { bloodBankService } from '../../services/bloodBankService';

const STATUS_TONE = {
  AVAILABLE: 'success',
  RESERVED: 'amber',
  ISSUED: 'ai',
  EXPIRED: 'red',
  DISCARDED: 'neutral',
  IN_TRANSIT: 'cyan',
};

export default function BloodBankUnitDetail() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const [moveOpen, setMoveOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [moving, setMoving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [unitData, logsData] = await Promise.all([
        bloodBankService.getUnitById(id),
        bloodBankService.getUnitLogs(id),
      ]);
      setUnit(unitData);
      setLogs(logsData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load this unit.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const runAction = async (action, fn) => {
    try {
      setActionLoading(action);
      setActionError('');
      await fn();
      await load();
    } catch (err) {
      setActionError(err?.response?.data?.detail || `Unable to ${action.toLowerCase()} this unit.`);
    } finally {
      setActionLoading('');
    }
  };

  const openMoveModal = async () => {
    setMoveOpen(true);
    setSelectedLocationId('');
    try {
      setLocationsLoading(true);
      const data = await bloodBankService.getLocations(unit.hospital_id);
      setLocations(data || []);
    } catch (err) {
      setActionError(err?.response?.data?.detail || 'Unable to load storage locations.');
    } finally {
      setLocationsLoading(false);
    }
  };

  const confirmMove = async () => {
    if (!selectedLocationId) return;
    try {
      setMoving(true);
      await bloodBankService.moveUnit(unit.id, Number(selectedLocationId));
      setMoveOpen(false);
      await load();
    } catch (err) {
      setActionError(err?.response?.data?.detail || 'Unable to move this unit.');
    } finally {
      setMoving(false);
    }
  };

  return (
    <DashboardLayout
      navItems={HOSPITAL_NAV}
      title={unit ? unit.unit_code : 'Blood Unit'}
      subtitle={unit ? `${unit.blood_group} · ${unit.component_type.replace('_', ' ')}` : ''}
    >
      {loading ? (
        <Card className="flex items-center justify-center p-8">
          <Loader label="Loading unit..." />
        </Card>
      ) : error ? (
        <Card className="flex items-center justify-center p-8 text-sm text-red-600">{error}</Card>
      ) : !unit ? (
        <EmptyState title="Unit not found" description="This blood unit may have been removed." />
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 font-display text-lg font-bold text-red-600">
                  {unit.blood_group}
                </span>
                <div>
                  <p className="font-mono text-xs text-muted">{unit.unit_code}</p>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {unit.component_type.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-muted">
                    {unit.volume_ml ? `${unit.volume_ml} ml · ` : ''}Expires {unit.expiry_date}
                  </p>
                </div>
              </div>
              <Badge tone={STATUS_TONE[unit.status] || 'neutral'} dot={unit.status === 'AVAILABLE'}>
                {unit.status}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted">Source</p>
                <p className="font-medium text-ink2">{unit.source.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Collected</p>
                <p className="font-medium text-ink2">{unit.collection_date || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Reserved for request</p>
                <p className="font-medium text-ink2">
                  {unit.reserved_for_request_id ? `#${unit.reserved_for_request_id}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Notes</p>
                <p className="font-medium text-ink2">{unit.notes || '—'}</p>
              </div>
            </div>

            {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              {unit.status === 'AVAILABLE' && (
                <Button
                  variant="outline"
                  icon={PackageCheck}
                  iconPosition="left"
                  loading={actionLoading === 'Issue'}
                  onClick={() => runAction('Issue', () => bloodBankService.issueUnit(unit.id))}
                >
                  Issue Unit
                </Button>
              )}

              {unit.status === 'RESERVED' && (
                <Button
                  variant="outline"
                  icon={Undo2}
                  iconPosition="left"
                  loading={actionLoading === 'Unreserve'}
                  onClick={() => runAction('Unreserve', () => bloodBankService.unreserveUnit(unit.id))}
                >
                  Release Reservation
                </Button>
              )}

              {(unit.status === 'AVAILABLE' || unit.status === 'RESERVED') && (
                <Button
                  variant="outline"
                  icon={PackageX}
                  iconPosition="left"
                  loading={actionLoading === 'Discard'}
                  onClick={() =>
                    runAction('Discard', () =>
                      bloodBankService.discardUnit(unit.id, 'Discarded from unit detail view')
                    )
                  }
                >
                  Discard Unit
                </Button>
              )}

              <Button
                variant="outline"
                icon={ArrowLeftRight}
                iconPosition="left"
                onClick={openMoveModal}
              >
                Move Location
              </Button>
            </div>
          </Card>

          <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Move to Storage Location" size="sm">
            {locationsLoading ? (
              <Loader label="Loading locations..." />
            ) : locations.length === 0 ? (
              <p className="text-sm text-muted">
                No storage locations set up for this hospital yet. Add one from the Blood Bank
                inventory page first.
              </p>
            ) : (
              <div className="space-y-4">
                <Select
                  placeholder="Choose a location"
                  options={locations.map((l) => ({ value: l.id, label: l.name }))}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                />
                <Button
                  variant="primary"
                  className="w-full"
                  loading={moving}
                  disabled={!selectedLocationId || moving}
                  onClick={confirmMove}
                >
                  Confirm Move
                </Button>
              </div>
            )}
          </Modal>

          <Card>
            <h4 className="mb-4 font-display text-sm font-bold text-ink">Audit trail</h4>
            {logs.length === 0 ? (
              <p className="text-sm text-muted">No history recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink2">
                        {l.action}
                        {l.previous_status && l.new_status ? ` · ${l.previous_status} → ${l.new_status}` : ''}
                      </p>
                      {l.notes && <p className="text-xs text-muted">{l.notes}</p>}
                    </div>
                    <p className="text-xs text-muted">{new Date(l.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Link to="/hospital/blood-bank">
            <Button variant="outline">Back to inventory</Button>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
