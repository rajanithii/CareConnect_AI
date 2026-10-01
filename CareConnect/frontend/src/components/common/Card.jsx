import { cx } from '../../utils/helpers';

export default function Card({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'p-6',
  as: Tag = 'div',
}) {
  return (
    <Tag
      className={cx(
        'rounded-card border border-line',
        glass ? 'glass' : 'bg-white',
        hover &&
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-red-100',
        !hover && 'shadow-soft',
        padding,
        className
      )}
    >
      {children}
    </Tag>
  );
}
