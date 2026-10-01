import { Download, FileText } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ResponseTimeChart from '../../components/charts/ResponseTimeChart';
import { ADMIN_NAV } from '../../components/common/adminNav';

const REPORTS = [
  { name: 'Monthly fulfillment report', period: 'July 2026', size: '482 KB' },
  { name: 'Donor growth report', period: 'Q2 2026', size: '310 KB' },
  { name: 'Response time audit', period: 'June 2026', size: '265 KB' },
];

export default function Reports() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Reports" subtitle="Export platform-wide performance reports">
      <Card>
        <h3 className="font-display text-base font-bold text-ink">Platform response time</h3>
        <div className="mt-4">
          <ResponseTimeChart />
        </div>
      </Card>

      <Card className="mt-6" padding="p-0">
        <div className="divide-y divide-line">
          {REPORTS.map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink2">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.period} · {r.size}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" icon={Download} iconPosition="left">
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
