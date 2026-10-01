import { motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';

export default function LiveAlert({ message = 'New emergency request nearby' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
        <TriangleAlert size={15} />
      </span>
      <p className="text-sm font-semibold text-red-700">{message}</p>
    </motion.div>
  );
}
