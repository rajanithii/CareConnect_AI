import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/helpers';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink2 disabled:opacity-40 hover:bg-surface"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
          <button
            onClick={() => onChange(p)}
            className={cx(
              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium',
              p === page ? 'bg-ink text-white' : 'text-ink2 hover:bg-surface'
            )}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink2 disabled:opacity-40 hover:bg-surface"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
