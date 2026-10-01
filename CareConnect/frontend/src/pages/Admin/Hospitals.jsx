import { useState, useEffect } from 'react';
import { Building2, MoreVertical } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { ADMIN_NAV } from '../../components/common/adminNav';

import api from '../../api/axios';

export default function Hospitals() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/hospitals');
        if (mounted) setHospitals(Array.isArray(data) ? data : data.hospitals || []);
      } catch (err) {
        console.error('Failed to load hospitals', err);
        if (mounted) setHospitals([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHospitals();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = hospitals.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Manage Hospitals" subtitle={`${hospitals.length} partner hospitals`}>
      <div className="mb-5 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search hospitals" />
      </div>

      <Card padding="p-0">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Hospital</span>
          <span>City</span>
          <span>Requests</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-line">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted">Loading hospitals...</div>
            </div>
          ) : (
            <>
              {filtered.map((h) => (
                <div key={h.name} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <Building2 size={15} />
                    </span>
                    <span className="font-medium text-ink">{h.name}</span>
                  </div>
                  <span className="text-sm text-muted">{h.city}</span>
                  <span className="text-sm text-ink2">{h.requests}</span>
                  <div className="flex items-center gap-3">
                    <Badge tone={h.status === 'Active' ? 'success' : 'amber'}>{h.status}</Badge>
                    <button className="text-muted hover:text-ink"><MoreVertical size={16} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <Pagination page={page} totalPages={3} onChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
