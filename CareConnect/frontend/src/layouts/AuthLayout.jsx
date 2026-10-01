import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/25 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />

        <Link to="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Activity size={18} className="text-cyan-400" />
          </span>
          <span className="font-display text-lg font-extrabold">
            BloodLink<span className="text-red-500">AI</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-sm font-display text-3xl font-bold leading-tight">
            Every minute saved is a life given a better chance.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/50">
            Join thousands of hospitals and donors already using AI to close the gap between
            need and response.
          </p>
        </div>

        <p className="relative text-xs text-white/30">
          © {new Date().getFullYear()} BloodLink AI
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-bg px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
              <Activity size={18} className="text-cyan-400" />
            </span>
            <span className="font-display text-lg font-extrabold text-ink">
              BloodLink<span className="text-red-600">AI</span>
            </span>
          </Link>
          {title && <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>}
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
