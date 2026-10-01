import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import MobileMenu from '../components/layout/MobileMenu';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children, navItems = [], title, subtitle, footer }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface/40">
      <Sidebar items={navItems} footer={footer} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-ink2">
            <Menu size={22} />
          </button>
          <span className="font-display text-sm font-bold text-ink">{title}</span>
        </div>
        <DashboardHeader title={title} subtitle={subtitle} />
        <main className="flex-1 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
