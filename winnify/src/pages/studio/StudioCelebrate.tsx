// Celebration burst — a one-shot, CSS-only particle spray behind a completion
// moment (lesson finished, flawless quiz). Purely presentational; honors
// prefers-reduced-motion via studio.css's global reduce rule.
import { useMemo } from 'react';

const COLORS = ['var(--st-lime)', 'var(--st-aqua)', 'var(--st-violet)', '#fbbf24', '#fb7185'];

export default function StudioCelebrate({ count = 22 }: { count?: number }) {
  // Randomised once per mount — re-mounts (new completions) get a fresh spray.
  const parts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: 8 + Math.random() * 84,               // % across
      delay: Math.random() * 0.35,                // s
      dur: 1.1 + Math.random() * 0.9,             // s
      size: 5 + Math.random() * 7,                // px
      drift: -60 + Math.random() * 120,           // px sideways
      spin: Math.random() > 0.5 ? 360 : -360,     // deg
      round: Math.random() > 0.5,
      color: COLORS[i % COLORS.length],
    })), [count]);

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
      {parts.map((p, i) => (
        <span
          key={i}
          className="st-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.7,
            borderRadius: p.round ? '50%' : 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            // custom properties consumed by the keyframes
            ['--st-drift' as string]: `${p.drift}px`,
            ['--st-spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
