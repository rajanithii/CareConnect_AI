import { cx } from '../../utils/helpers';

export default function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div
      className={cx(
        'animate-pulse bg-gradient-to-r from-surface via-surface2 to-surface bg-[length:200%_100%]',
        rounded,
        className
      )}
    />
  );
}
