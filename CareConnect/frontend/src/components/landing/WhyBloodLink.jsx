import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const TRADITIONAL = [
  'Phone calls and word-of-mouth to find donors',
  'No visibility into donor availability',
  'Manual compatibility checks, prone to error',
  'Hours lost before the right donor is found',
  'No record of response times or outcomes',
];

const BLOODLINK = [
  'AI ranks and alerts compatible donors instantly',
  'Live availability and location for every donor',
  'Automated, error-free compatibility matching',
  'Average match time under 4 minutes',
  'Full analytics on every request and response',
];

export default function WhyBloodLink() {
  return (
    <section className="py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            The difference speed makes
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Why hospitals switch to BloodLink AI
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-card border border-line bg-surface/70 p-8"
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Traditional system
            </h3>
            <ul className="mt-6 space-y-4">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-muted">
                    <X size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-card border border-red-100 bg-white p-8 shadow-lift"
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-red-600">
              BloodLink AI
            </h3>
            <ul className="mt-6 space-y-4">
              {BLOODLINK.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-ink">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Check size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
