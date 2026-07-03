import { useEffect, useRef, useState } from 'react';

/** Score band → semantic color token (0–49 low · 50–69 mid · 70–84 good · 85+ top) */
export function scoreBand(v: number): string {
  if (v < 50) return 'var(--score-low)';
  if (v < 70) return 'var(--score-mid)';
  if (v < 85) return 'var(--score-good)';
  return 'var(--score-top)';
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animated SVG score dial — the WinSpeak "score reveal" moment.
 * Ring sweeps in over --dur-reveal while the numeral counts up in sync.
 * Respects prefers-reduced-motion (renders final state instantly).
 */
export function ScoreDial({
  value, size = 168, stroke = 13, label, sublabel, color, onWhite = false,
}: {
  value: number; size?: number; stroke?: number;
  label?: string; sublabel?: string;
  /** override band color (e.g. white-on-brand hero) */ color?: string;
  /** track/text colors tuned for light card vs. brand hero */ onWhite?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const [display, setDisplay] = useState(reducedMotion() ? clamped : 0);
  const [sweep, setSweep] = useState(reducedMotion() ? clamped : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (reducedMotion()) { setDisplay(clamped); setSweep(clamped); return; }
    setSweep(clamped); // CSS transition handles the ring
    const t0 = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay(Math.round(eased * clamped));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [clamped]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ringColor = color ?? scoreBand(clamped);
  const track = onWhite ? 'var(--score-track)' : 'rgba(255,255,255,0.18)';
  const ink = onWhite ? 'var(--text)' : '#fff';
  const mut = onWhite ? 'var(--text-muted)' : 'rgba(255,255,255,0.72)';

  return (
    <div
      role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}
      aria-label={label ? `${label}: ${clamped} out of 100` : `Score ${clamped} out of 100`}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={ringColor} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (sweep / 100) * c}
          style={{ transition: 'stroke-dashoffset var(--dur-reveal) var(--ease-out)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, color: ink,
          fontSize: size * 0.27, lineHeight: 1,
        }}>{display}</span>
        {label && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', letterSpacing: '0.06em', textTransform: 'uppercase', color: mut, fontWeight: 600 }}>{label}</span>}
        {sublabel && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: mut }}>{sublabel}</span>}
      </div>
    </div>
  );
}
