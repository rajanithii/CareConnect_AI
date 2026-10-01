import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cx } from '../../utils/helpers';

const VARIANTS = {
  primary:
    'bg-ink text-bg hover:bg-red-700 shadow-soft hover:shadow-lift',
  emergency:
    'bg-red-600 text-white hover:bg-red-700 shadow-lift animate-none',
  ai: 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-glow',
  outline:
    'bg-transparent text-ink border border-line hover:border-ink',
  ghost: 'bg-transparent text-ink hover:bg-surface',
  glass: 'glass text-ink hover:bg-white/80',
};

const SIZES = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-[15px] px-5 py-3 gap-2',
  lg: 'text-base px-7 py-4 gap-2.5',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'right',
    loading = false,
    className = '',
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={loading || props.disabled}
      className={cx(
        'inline-flex items-center justify-center rounded-full font-display font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={17} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={17} />}
    </motion.button>
  );
});

export default Button;
