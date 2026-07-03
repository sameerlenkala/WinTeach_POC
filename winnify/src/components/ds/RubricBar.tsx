import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { scoreBand } from './ScoreDial';

/**
 * One rubric dimension row — label, delta chip, animated band-colored bar.
 * Dense-data safe: fixed 44px+ hit target, single-line, tabular score.
 */
export function RubricBar({
  label, value, delta, onClick,
}: {
  label: string; value: number; delta?: number; onClick?: () => void;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.max(0, Math.min(100, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const up = (delta ?? 0) >= 0;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      aria-label={`${label} score ${value} out of 100${delta != null ? `, ${up ? 'up' : 'down'} ${Math.abs(delta)} since last` : ''}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', width: '100%',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--w-r5)', padding: '13px 16px', textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--text)' }}>{label}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            {delta != null && (
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 700,
                color: up ? 'var(--tint-teal-fg)' : 'var(--tint-red-fg)',
                background: up ? 'var(--tint-teal-bg)' : 'var(--tint-red-bg)',
                padding: '2px 8px', borderRadius: 999,
              }}>{up ? '↑' : '↓'} {Math.abs(delta)}</span>
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--score-track)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${w}%`, background: scoreBand(value), borderRadius: 999,
            transition: 'width 700ms var(--ease-out)',
          }} />
        </div>
      </div>
      {onClick && <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
    </Tag>
  );
}
