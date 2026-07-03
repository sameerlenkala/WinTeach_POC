import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flame, Clock } from 'lucide-react';

/* ── tones — the CE tint family, one hue per module surface ─────────────── */
export type Tone = 'brand' | 'violet' | 'teal' | 'blue' | 'red' | 'orange' | 'pink';
export const tone = (t: Tone) => ({
  bg: `var(--tint-${t}-bg)`,
  fg: `var(--tint-${t}-fg)`,
});

/* ── StreakChip — daily-streak flame, adult-calm (no confetti) ──────────── */
export function StreakChip({ days, pulse = false }: { days: number; pulse?: boolean }) {
  return (
    <span
      aria-label={`${days} day streak`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--streak-bg)', color: 'var(--tint-orange-fg)',
        borderRadius: 999, padding: '5px 12px',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)',
      }}
    >
      <Flame size={14} style={pulse ? { animation: 'ds-flame 1.6s var(--ease-out) infinite' } : undefined} />
      {days}d streak
    </span>
  );
}

/* ── ChallengeCard — daily challenge entry point ────────────────────────── */
export function ChallengeCard({
  icon: Icon, title, desc, timeLeft, to, toneName = 'brand',
}: {
  icon: LucideIcon; title: string; desc: string; timeLeft?: string; to: string; toneName?: Tone;
}) {
  const t = tone(toneName);
  return (
    <Link to={to} style={{ textDecoration: 'none' }} className="group">
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--w-r5)', padding: '14px 16px', boxShadow: 'var(--shadow-card)',
          transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        }}
        className="group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-pop)]"
      >
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--w-r4)', background: t.bg, color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>{title}</span>
            {timeLeft && (
              <span style={{
                fontSize: 'var(--fs-caption)', color: 'var(--tint-orange-fg)', background: 'var(--tint-orange-bg)',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-sans)', fontWeight: 600, padding: '3px 9px', borderRadius: 999,
              }}>
                <Clock size={11} /> {timeLeft}
              </span>
            )}
          </div>
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-sans)' }}>{desc}</p>
        </div>
      </div>
    </Link>
  );
}

/* ── LeaderboardRow — rank + name + score, medal tint for top 3 ─────────── */
const MEDALS = ['var(--tint-orange-fg)', 'var(--text-2)', 'var(--tint-violet-fg)'];
export function LeaderboardRow({
  rank, name, sub, score, delta, highlight = false, divider = true,
}: {
  rank: number; name: string; sub?: string; score: number | string;
  delta?: number; highlight?: boolean; divider?: boolean;
}) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : undefined;
  const up = (delta ?? 0) >= 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
      background: highlight ? 'var(--tint-brand-bg)' : 'transparent',
      borderBottom: divider ? '1px solid var(--border)' : 'none',
    }}>
      <span style={{
        width: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 'var(--fs-body)', color: medal ?? 'var(--text-3)', fontVariantNumeric: 'tabular-nums',
      }}>{rank}</span>
      <span aria-hidden style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--tint-brand-bg)',
        color: 'var(--tint-brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>{name.charAt(0).toUpperCase()}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}{highlight && <span style={{ marginLeft: 6, fontSize: 'var(--fs-caption)', color: 'var(--tint-brand-fg)', fontWeight: 700 }}>You</span>}
        </p>
        {sub && <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{sub}</p>}
      </div>
      {delta != null && (
        <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, fontFamily: 'var(--font-sans)', color: up ? 'var(--tint-teal-fg)' : 'var(--tint-red-fg)' }}>
          {up ? '↑' : '↓'}{Math.abs(delta)}
        </span>
      )}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
    </div>
  );
}

/* ── SectionHeader ──────────────────────────────────────────────────────── */
export function SectionHeader({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>{label}</span>
      {action}
    </div>
  );
}
