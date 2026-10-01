import { motion } from 'framer-motion';
import { Target, HeartPulse, Users } from 'lucide-react';
import LandingLayout from '../../layouts/LandingLayout';
import Card from '../../components/common/Card';

const VALUES = [
  { icon: Target, title: 'Precision', desc: 'Every match is grounded in real compatibility and distance data — never guesswork.' },
  { icon: HeartPulse, title: 'Urgency', desc: 'We treat every minute as it deserves to be treated: like it matters.' },
  { icon: Users, title: 'Trust', desc: 'Hospitals and donors both need confidence in the system — we design for both.' },
];

export default function About() {
  return (
    <LandingLayout>
      <section className="pt-32 pb-20">
        <div className="container-page mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-widest text-red-600"
          >
            Our mission
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Closing the gap between need and response
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-lg text-muted"
          >
            BloodLink AI started as a final-year AI project with a simple premise: the hardest
            part of an emergency blood request isn&rsquo;t finding a donor — it&rsquo;s finding
            the right one, fast enough. We built an AI layer to close that gap.
          </motion.p>
        </div>
      </section>

      <section className="pb-28">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <v.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}
