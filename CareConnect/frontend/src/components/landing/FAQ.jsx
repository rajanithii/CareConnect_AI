import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'How does BloodLink AI match donors to a request?',
    a: 'The AI reads the hospital\u2019s request, scores its urgency, filters donors by blood compatibility, then ranks the remaining pool by distance and reliability history before sending alerts.',
  },
  {
    q: 'How fast do donors get notified?',
    a: 'Notifications are sent within seconds of a request being processed, through push, SMS, and call depending on urgency level.',
  },
  {
    q: 'Is my location shared with hospitals at all times?',
    a: 'No. Donors control an availability toggle, and precise location is only shared once a donor accepts a specific request.',
  },
  {
    q: 'Can hospitals track a donor after acceptance?',
    a: 'Yes, hospitals get live ETA tracking on a map from the moment a donor accepts until they arrive.',
  },
  {
    q: 'What blood banks and networks does BloodLink AI integrate with?',
    a: 'BloodLink AI is designed to integrate with hospital blood bank systems and regional donor registries through its API layer.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-28">
      <div className="container-page mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            Questions, answered
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Frequently asked
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line rounded-card border border-line bg-white">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-6">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-[15px] font-semibold text-ink">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink2"
                  >
                    <Plus size={15} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
