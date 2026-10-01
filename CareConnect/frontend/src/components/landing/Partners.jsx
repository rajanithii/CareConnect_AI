import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Partners() {
  const [partners, setPartners] = useState([]);
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { data } = await api.get('/partners');
        if (mounted) setPartners(Array.isArray(data) ? data : data.partners || []);
      } catch (err) {
        // no partners endpoint — fall back to empty list
        if (mounted) setPartners([]);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  if (!partners || partners.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface/60 py-10">
      <div className="container-page">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Trusted by hospitals &amp; response networks
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {partners.map((name) => (
            <span
              key={name}
              className="font-display text-[15px] font-semibold text-ink2/60 transition-colors hover:text-ink"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
