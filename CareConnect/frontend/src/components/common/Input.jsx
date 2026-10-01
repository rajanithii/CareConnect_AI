import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from '../../utils/helpers';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, type = 'text', className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <label className="block w-full">
      {label && (
        <span className="mb-2 block text-sm font-medium text-ink2">{label}</span>
      )}
      <span className="relative flex items-center">
        {Icon && (
          <Icon size={17} className="pointer-events-none absolute left-4 text-muted" />
        )}
        <input
          ref={ref}
          type={resolvedType}
          className={cx(
            'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-500',
            Icon && 'pl-11',
            isPassword && 'pr-11',
            error ? 'border-red-500' : 'border-line',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </span>
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
});

export default Input;
