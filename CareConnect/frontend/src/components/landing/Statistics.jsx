import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const STATS = [
  { value: 340, suffix: '+', label: 'Partner hospitals' },
  { value: 12400, suffix: '+', label: 'Registered donors' },
  { value: 5218, suffix: '', label: 'Lives saved' },
  { value: 2100, suffix: '+', label: 'Emergency requests' },
  { value: 98, suffix: '%', label: 'Success rate' },
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export default function Statistics() {
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 rounded-card border border-line bg-white p-10 shadow-soft sm:grid-cols-3 lg:grid-cols-5 lg:p-14">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <Counter value={s.value} suffix={s.suffix} />
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
