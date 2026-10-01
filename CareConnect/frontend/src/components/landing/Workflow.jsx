import { motion } from 'framer-motion';
import {
  FileHeart,
  BrainCircuit,
  ListOrdered,
  BellRing,
  CircleCheck,
  Navigation,
  Droplet,
  PartyPopper,
} from 'lucide-react';

const STEPS = [
  { icon: FileHeart, title: 'Hospital creates request', desc: 'Blood group, units, and urgency are logged in under a minute.' },
  { icon: BrainCircuit, title: 'AI processes the request', desc: 'NLP reads the request and scores it for urgency and complexity.' },
  { icon: ListOrdered, title: 'Donor ranking', desc: 'Compatible donors are ranked by distance, reliability, and readiness.' },
  { icon: BellRing, title: 'Notifications sent', desc: 'Top-ranked donors get instant alerts with request details.' },
  { icon: CircleCheck, title: 'Donor accepts', desc: 'First to confirm is locked in; others are notified automatically.' },
  { icon: Navigation, title: 'Live tracking', desc: 'Hospital watches the donor\u2019s ETA on a live map.' },
  { icon: Droplet, title: 'Donation completed', desc: 'Staff confirm the donation and update the donor\u2019s record.' },
  { icon: PartyPopper, title: 'Request closed', desc: 'Outcome and response time are logged for future matching.' },
];

export default function Workflow() {
  return (
    <section id="how-it-works" className="relative bg-surface/60 py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            The path from request to donation
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            How BloodLink AI works
          </h2>
        </div>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-line md:left-1/2" />

          <div className="space-y-10">
            {STEPS.map((step, i) => {
              const isRight = i % 2 === 1;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isRight ? 24 : -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-start gap-5 md:w-1/2 ${
                    isRight ? 'md:ml-auto md:flex-row md:pl-10' : 'md:pr-10 md:text-right md:flex-row-reverse'
                  }`}
                >
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-white font-display text-sm font-bold text-red-600 shadow-soft">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
