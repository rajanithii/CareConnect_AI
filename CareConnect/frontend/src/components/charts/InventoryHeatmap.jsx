import { Fragment } from 'react';
import { cx } from '../../utils/helpers';

/**
 * Blood group x status inventory heatmap. recharts has no heatmap
 * primitive, so this is a plain CSS grid colored by intensity — kept
 * visually consistent with the rest of the chart set (same font,
 * muted axis labels, red/cyan palette, rounded tooltip-style cells).
 *
 * Props match the shape returned by GET /blood-bank/analytics/status-heatmap:
 *   { blood_groups: string[], statuses: string[], matrix: number[][] }
 */
export default function InventoryHeatmap({ data }) {
  if (!data || !data.matrix?.length) {
    return <p className="py-10 text-center text-sm text-muted">No inventory data yet.</p>;
  }

  const { blood_groups: bloodGroups, statuses, matrix } = data;
  const max = Math.max(1, ...matrix.flat());

  const cellColor = (value) => {
    if (value === 0) return 'transparent';
    const intensity = value / max;
    return `rgba(196, 22, 56, ${0.12 + intensity * 0.68})`; // red-600 scale
  };

  const textColor = (value) => (value / max > 0.55 ? '#FDFBF9' : '#3A332E');

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `72px repeat(${statuses.length}, minmax(64px, 1fr))` }}
      >
        <div />
        {statuses.map((s) => (
          <div key={s} className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
            {s.replace('_', ' ')}
          </div>
        ))}

        {bloodGroups.map((bg, rowIndex) => (
          <Fragment key={bg}>
            <div className="flex items-center text-xs font-semibold text-ink2">
              {bg}
            </div>
            {statuses.map((s, colIndex) => {
              const value = matrix[rowIndex][colIndex];
              return (
                <div
                  key={`${bg}-${s}`}
                  className={cx(
                    'flex h-11 items-center justify-center rounded-lg text-xs font-semibold transition-transform hover:scale-105'
                  )}
                  style={{ backgroundColor: cellColor(value), color: textColor(value) }}
                  title={`${bg} · ${s.replace('_', ' ')}: ${value}`}
                >
                  {value > 0 ? value : ''}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
