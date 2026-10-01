import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse } from 'lucide-react';
import Button from '../common/Button';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-card bg-ink px-8 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-red-600/25 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-[90px]" />

          <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-red-400">
            <HeartPulse size={26} />
          </span>

          <h2 className="relative mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Save lives together
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/60">
            Join the network of hospitals and donors who no longer race against time alone.
          </p>

          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button variant="emergency" size="lg" icon={ArrowRight} onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
            <Button variant="glass" size="lg" className="text-white border-white/20" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
