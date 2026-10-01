import { motion } from 'framer-motion';

export default function MatchingEngine({ matches = [] }) {
  return (
    <div className="space-y-3">
      {matches.map((m, i) => (
        <div key={m.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-ink2">{m.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${m.score}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
            />
          </div>
          <span className="w-9 text-right text-xs font-mono text-red-600">{m.score}</span>
        </div>
      ))}
    </div>
  );
}
