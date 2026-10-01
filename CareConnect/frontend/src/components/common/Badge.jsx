import { cx } from '../../utils/helpers';

const TONES = {
  red: 'bg-red-50 text-red-700 border-red-100',
  cyan: 'bg-cyan-200/40 text-cyan-700 border-cyan-300/50',
  neutral: 'bg-surface text-ink2 border-line',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide',
        TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-blink" />}
      {children}
    </span>
  );
}
