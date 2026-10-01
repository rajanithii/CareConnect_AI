import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info };
const TONES = {
  success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-cyan-600 bg-cyan-200/30 border-cyan-300/50',
};

export default function Toast({ toasts = [], onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift ${TONES[toast.type] || TONES.info} bg-white`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-ink flex-1">{toast.message}</p>
              <button onClick={() => onDismiss(toast.id)} className="text-muted hover:text-ink">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
