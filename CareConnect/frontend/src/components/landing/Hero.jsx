import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle, TriangleAlert, Activity } from 'lucide-react';
import Button from '../common/Button';
import HeroBackground from './HeroBackground';
import FloatingBloodCells from './FloatingBloodCells';
import { TAGLINE } from '../../utils/constants';

const stats = [
  { value: '4 min', label: 'avg. match time' },
  { value: '12,400+', label: 'active donors' },
  { value: '98.6%', label: 'match accuracy' },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-height)+56px)] pb-28">
      <HeroBackground />
      <FloatingBloodCells />

      <div className="container-page relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink2 backdrop-blur"
          >
            <Activity size={13} className="text-cyan-500" />
            AI-Matched · Real-time · Life-critical
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[44px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl"
          >
            Blood<span className="text-gradient-red">Link</span>{' '}
            <span className="text-gradient-ai">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            {TAGLINE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => navigate('/register')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" icon={PlayCircle} iconPosition="left">
              View Demo
            </Button>
            <Button variant="emergency" size="lg" icon={TriangleAlert} iconPosition="left">
              Emergency Request
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-16 grid w-full grid-cols-3 gap-4 border-t border-line pt-8"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-ink sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
