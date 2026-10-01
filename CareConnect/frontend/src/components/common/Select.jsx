import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utils/helpers';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select', className = '', ...props },
  ref
) {
  return (
    <label className="block w-full">
      {label && <span className="mb-2 block text-sm font-medium text-ink2">{label}</span>}
      <span className="relative block">
        <select
          ref={ref}
          className={cx(
            'w-full appearance-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-500',
            error ? 'border-red-500' : 'border-line',
            className
          )}
          defaultValue=""
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
        />
      </span>
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
});

export default Select;
