import { motion } from 'framer-motion';
import { MessageSquareText, Gauge, GitCompareArrows, Route, TrendingUp } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: MessageSquareText,
    title: 'Natural Language Processing',
    desc: 'Reads free-text hospital requests and extracts blood group, unit count, and urgency automatically.',
  },
  {
    icon: Gauge,
    title: 'Priority Scoring',
    desc: 'Every request gets a live urgency score based on condition severity and time sensitivity.',
  },
  {
    icon: GitCompareArrows,
    title: 'Blood Matching',
    desc: 'Cross-references donor and recipient compatibility instantly against the full donor pool.',
  },
  {
    icon: Route,
    title: 'Distance Analysis',
    desc: 'Calculates real travel time, not just straight-line distance, to rank realistic responders.',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Intelligence',
    desc: 'Anticipates shortages by blood group and region before they become emergencies.',
  },
];

export default function AISection() {
  return (
    <section id="ai" className="relative overflow-hidden bg-ink py-28 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container-page relative grid gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            The engine underneath
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            AI that understands <span className="text-gradient-ai">emergencies</span>
          </h2>
          <p className="mt-4 max-w-md text-white/60">
            BloodLink AI doesn&rsquo;t just search a database &mdash; it reasons about urgency,
            compatibility, and distance the way an experienced coordinator would, at machine speed.
          </p>

          <div className="mt-10 space-y-6">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                  <cap.icon size={18} />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-white">{cap.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="glass-dark relative rounded-card p-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs text-cyan-300">live_matching.ai</span>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink" />
              analyzing
            </span>
          </div>

          <div className="mt-5 space-y-3 font-mono text-xs text-white/70">
            <p><span className="text-cyan-300">request</span> &rarr; O- negative, 3 units, critical</p>
            <p><span className="text-cyan-300">nlp_score</span> &rarr; urgency: 0.94</p>
            <p><span className="text-cyan-300">candidates_scanned</span> &rarr; 1,204 donors</p>
            <p><span className="text-cyan-300">compatible_matches</span> &rarr; 37 donors</p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { name: 'Donor #A214', score: 96 },
              { name: 'Donor #B778', score: 91 },
              { name: 'Donor #C305', score: 87 },
            ].map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-white/50">{d.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                  />
                </div>
                <span className="w-9 text-right font-mono text-xs text-cyan-300">{d.score}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
