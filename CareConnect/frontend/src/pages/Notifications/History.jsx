import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TONE = { Accepted: 'success', Declined: 'neutral', Expired: 'amber' };

export default function History() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { data } = await api.get('/notifications/history');
        if (mounted) setHistory(Array.isArray(data) ? data : data.history || []);
      } catch (err) {
        if (mounted) setHistory([]);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  const filtered = history.filter((h) => (h.hospital || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <PortalLayout title="Notification History" subtitle="A full archive of past alerts">
      <div className="mb-5 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by hospital" />
      </div>
      <Card padding="p-0">
        <div className="divide-y divide-line">
          {filtered.length === 0 ? (
            <div className="p-5 text-sm text-muted">No notification history available.</div>
          ) : (
            filtered.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-semibold text-ink">{h.hospital}</p>
                  <p className="text-xs text-muted">{h.date} · {h.group}</p>
                </div>
                <Badge tone={TONE[h.outcome] || 'neutral'}>{h.outcome}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </PortalLayout>
  );
}
