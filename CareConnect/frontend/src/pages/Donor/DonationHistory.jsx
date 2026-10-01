import { Droplet, Award, Download } from 'lucide-react';
import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { donorAPI } from '../../api/donorAPI';

export default function DonationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, units: 0, hospitals: 0, years: 0 });

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!user?.id) return;
      try {
        const { data } = await donorAPI.getDonationHistory(user.id);
        if (!mounted) return;
        setHistory(Array.isArray(data) ? data : data.history || []);
        setStats({
          total: data?.summary?.total_donations || (Array.isArray(data) ? data.length : 0),
          units: data?.summary?.units || 0,
          hospitals: data?.summary?.hospitals || 0,
          years: data?.summary?.years_active || 0,
        });
      } catch (err) {
        if (!mounted) return;
        setHistory([]);
      }
    };
    fetch();
    return () => (mounted = false);
  }, [user]);

  return (
    <PortalLayout title="Donation History" subtitle={`${stats.total || '—'} donations · ${stats.units || '—'} units`}>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total donations', value: stats.total || '—' },
          { label: 'Total units', value: stats.units || '—' },
          { label: 'Hospitals helped', value: stats.hospitals || '—' },
          { label: 'Years active', value: stats.years || '—' },
        ].map((s) => (
          <Card key={s.label}>
            <p className="font-display text-xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="p-0">
        <div className="divide-y divide-line">
          {history.length === 0 ? (
            <div className="p-5 text-sm text-muted">No donation history to show yet.</div>
          ) : (
            history.map((h) => (
              <div key={h.date} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Droplet size={18} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">{h.hospital}</p>
                    <p className="text-xs text-muted">{h.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink2">{h.units} unit · {h.group}</span>
                  <Button size="sm" variant="outline" icon={Download} iconPosition="left">
                    Certificate
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="mt-6 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-200/40 text-cyan-700">
          <Award size={22} />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-ink">You&rsquo;re 2 donations from your next badge</p>
          <p className="text-xs text-muted">Keep going — every donation gets logged automatically.</p>
        </div>
      </Card>
    </PortalLayout>
  );
}
