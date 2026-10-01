import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import interHospitalService from '../../services/interHospitalService';
import { useAuth } from '../../contexts/AuthContext';

export default function InterHospitalExchange() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', incoming: [], outgoing: [] });

  useEffect(() => {
    if (!user?.hospital_id) return;
    interHospitalService.getPendingTransfers(user.hospital_id).then((result) => {
      setState({ loading: false, error: result.success ? '' : result.error, incoming: result.incoming || [], outgoing: result.outgoing || [] });
    });
  }, [user?.hospital_id]);

  const transfers = [...state.incoming, ...state.outgoing];
  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Blood Exchange" subtitle="Inter-hospital transfer requests">
      {state.loading && <p className="text-ink2">Loading transfer requests...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      {!state.loading && !state.error && (
        <div className="space-y-3">
          {transfers.length === 0 ? <p className="text-ink2">No pending transfer requests.</p> : transfers.map((transfer) => (
            <article key={transfer.id} className="rounded-lg border border-line bg-white p-4">
              <h2 className="font-semibold text-ink">{transfer.blood_group} · {transfer.quantity_requested} units</h2>
              <p className="mt-1 text-sm text-ink2">Status: {transfer.status || 'PENDING'} · Urgency: {transfer.urgency || 'MEDIUM'}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
