import { forwardRef } from 'react';
import { cx } from '../../utils/helpers';

const TextArea = forwardRef(function TextArea(
  { label, error, rows = 4, className = '', ...props },
  ref
) {
  return (
    <label className="block w-full">
      {label && <span className="mb-2 block text-sm font-medium text-ink2">{label}</span>}
      <textarea
        ref={ref}
        rows={rows}
        className={cx(
          'w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-500',
          error ? 'border-red-500' : 'border-line',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
});

export default TextArea;
