import { Link } from 'react-router-dom';
import { Activity, AtSign, Briefcase, Code2, Mail } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'How It Works', 'AI Engine', 'Hospital Portal', 'Donor Portal'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Partners'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Support', 'FAQ'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Compliance'],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink text-white/80">
      <div className="container-page grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Activity size={18} className="text-cyan-400" />
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              BloodLink<span className="text-red-500">AI</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Intelligent emergency blood donor network connecting hospitals with compatible
            donors in minutes.
          </p>
          <div className="mt-6 flex gap-3">
            {[AtSign, Briefcase, Code2, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-cyan-400/50 hover:text-cyan-400"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 transition-colors hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 md:flex-row">
          <p>© {new Date().getFullYear()} BloodLink AI. All rights reserved.</p>
          <p>Built to save lives, minute by minute.</p>
        </div>
      </div>
    </footer>
  );
}
