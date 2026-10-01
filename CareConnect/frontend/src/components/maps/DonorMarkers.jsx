import { motion } from 'framer-motion';

export default function DonorMarkers({ donors = [] }) {
  return (
    <>
      {donors.map((d, i) => (
        <motion.div
          key={d.id ?? i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: d.top, left: d.left }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-4 w-4 animate-ping rounded-full bg-red-500/40" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
          </span>
        </motion.div>
      ))}
    </>
  );
}
