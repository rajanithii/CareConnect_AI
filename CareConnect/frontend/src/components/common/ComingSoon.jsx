import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComingSoon({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[50vh] flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/60 px-6 py-20 text-center"
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-red-500">
        <Construction size={24} />
      </span>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
    </motion.div>
  );
}
