import { Bell, Search, TriangleAlert } from 'lucide-react';
import Button from '../common/Button';

export default function DashboardHeader({ title, subtitle, onEmergency }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line bg-white/70 px-6 py-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-8">
      <div>
        <h1 className="font-display text-xl font-bold text-ink md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink2 hover:bg-surface">
          <Search size={17} />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink2 hover:bg-surface">
          <Bell size={17} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-600" />
        </button>
        <Button size="sm" variant="emergency" icon={TriangleAlert} iconPosition="left" onClick={onEmergency}>
          Emergency
        </Button>
      </div>
    </div>
  );
}
