import { useState, useEffect } from 'react';
import { User, MoreVertical } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { ADMIN_NAV } from '../../components/common/adminNav';

import { donorAPI } from '../../api/donorAPI';

export default function Donors() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await donorAPI.getAll();
        if (mounted) setDonors(Array.isArray(data) ? data : data.donors || []);
      } catch (err) {
        if (mounted) setDonors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  const filtered = donors.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Manage Donors" subtitle="12,400 registered donors">
      <div className="mb-5 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search donors" />
      </div>

      <Card padding="p-0">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Donor</span>
          <span>Group</span>
          <span>City</span>
          <span>Donations</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-line">
          {loading ? (
            <div className="flex items-center justify-center p-8">Loading donors...</div>
          ) : (
            filtered.map((d) => (
            <div key={d.id || d.name} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink2">
                  <User size={15} />
                </span>
                <span className="font-medium text-ink">{d.name}</span>
              </div>
              <span className="font-mono text-sm text-red-600">{d.blood_group || d.group}</span>
              <span className="text-sm text-muted">{d.city}</span>
              <span className="text-sm text-ink2">{d.donations || d.total_donations || '—'}</span>
              <div className="flex items-center gap-3">
                <Badge tone={d.status === 'Active' ? 'success' : 'neutral'}>{d.status}</Badge>
                <button className="text-muted hover:text-ink"><MoreVertical size={16} /></button>
              </div>
            </div>
            ))
          )}
        </div>
      </Card>

      <div className="mt-6">
        <Pagination page={page} totalPages={5} onChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
