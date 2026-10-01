import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { data } = await api.get('/testimonials');
        if (mounted) setTestimonials(Array.isArray(data) ? data : data.testimonials || []);
      } catch (err) {
        if (mounted) setTestimonials([]);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-surface/60 py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">From the people who use it</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Trusted where minutes matter</h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex h-full flex-col rounded-card border border-line bg-white p-7 shadow-soft"
            >
              <Quote size={22} className="text-red-200" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink2">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <p className="font-display text-sm font-bold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
