import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, TriangleAlert, Building2 } from 'lucide-react';
import Button from '../common/Button';
import { NAV_LINKS, APP_NAME } from '../../utils/constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-line shadow-sm`}
    >
      <nav className="container-page flex h-[76px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <Activity size={18} className="text-cyan-400" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink antialiased transform-gpu">
            {APP_NAME.replace(' AI', '')}
            <span className="text-red-600">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-ink2 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button size="sm" variant="primary" icon={Building2} iconPosition="left" onClick={() => navigate('/hospital/login')}>
            Hospital Login
          </Button>
          <span className="h-5 w-px bg-line" />
          <Button size="sm" variant="primary" onClick={() => navigate('/login')}>
            Donor Login
          </Button>
          <Button size="sm" variant="emergency" icon={TriangleAlert} iconPosition="left">
            Emergency Request
          </Button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-bg lg:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink2 hover:bg-surface"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <Button variant="outline" icon={Building2} iconPosition="left" onClick={() => navigate('/hospital/login')}>
                  Hospital Login
                </Button>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Donor Login
                </Button>
                <Button variant="emergency" icon={TriangleAlert} iconPosition="left">
                  Emergency Request
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
