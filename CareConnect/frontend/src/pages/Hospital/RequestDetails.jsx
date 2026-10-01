import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { hospitalService } from '../../services/hospitalService';

const STATUS_TONE = {
  ACTIVE: 'ai',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
};

export default function RequestDetails() {
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await hospitalService.getRequests();
        setRequests(response?.requests || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load requests:', err);
        setError('Unable to load requests. Please try again.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const owned = requests;

  const filtered = owned.filter((r) => {
    const haystack = `${r.id || ''} ${r.blood_group || ''} ${r.hospital || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const sortRequestsNewestFirst = (items) => [...items].sort((a, b) => {
    const aValue = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
    const bValue = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
    return bValue - aValue;
  });

  const sortedRequests = sortRequestsNewestFirst(filtered);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Active Requests" subtitle={`${requests.length} requests`}>
      <div className="mb-5 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by request ID or blood group" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-white p-8 text-sm text-muted">
          Loading requests...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-white p-8 text-sm text-red-600">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching requests" description="Try a different search term." />
      ) : (
        <Card padding="p-0">
          <div className="divide-y divide-line">
            {sortedRequests.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/hospital/requests/${r.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-surface/60"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-display text-sm font-bold text-red-600">
                      {r.blood_group || '—'}
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">
                        {r.id} · {r.blood_group || '—'}
                      </p>
                      <p className="text-xs text-muted">{r.hospital || '—'} · {r.city || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={r.urgency === 'Critical' ? 'red' : r.urgency === 'Urgent' ? 'amber' : 'neutral'}>
                      {r.urgency || 'Normal'}
                    </Badge>
                    <Badge tone={STATUS_TONE[r.status] || 'neutral'} dot={r.status === 'ACTIVE'}>
                      {r.status || 'ACTIVE'}
                    </Badge>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
