import { motion } from 'framer-motion';

export default function Loader({ size = 40, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <svg width={size} height={size} viewBox="0 0 50 50" className="text-red-600">
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ transformOrigin: '50% 50%' }}
        />
      </svg>
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
