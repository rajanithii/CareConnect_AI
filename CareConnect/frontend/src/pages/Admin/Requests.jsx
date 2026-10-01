import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { ADMIN_NAV } from '../../components/common/adminNav';

import api from '../../api/axios';

const STATUS_TONE = { Matching: 'ai', Notified: 'amber', Accepted: 'cyan', Completed: 'success' };

export default function Requests() {
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/requests');
        if (mounted) setRequests(Array.isArray(data) ? data : data.requests || []);
      } catch (err) {
        console.error('Failed to load admin requests', err);
        if (mounted) setRequests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequests();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = requests.filter(
    (r) => r.id.toLowerCase().includes(query.toLowerCase()) || (r.hospital || '').toLowerCase().includes(query.toLowerCase())
  );

 

  return (
    <DashboardLayout navItems={ADMIN_NAV} title="All Requests" subtitle="Every request across the platform">
      <div className="mb-5 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by request ID or hospital" />
      </div>

      <Card padding="p-0">
        <div className="divide-y divide-line">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted">Loading requests...</div>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-display text-sm font-bold text-red-600">
                    {r.group}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">{r.id}</p>
                    <p className="text-xs text-muted">{r.hospital}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={r.urgency === 'Critical' ? 'red' : r.urgency === 'Urgent' ? 'amber' : 'neutral'}>
                    {r.urgency}
                  </Badge>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
