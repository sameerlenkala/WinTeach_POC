// Shared style tokens for WinTeach Console.
// Every value resolves to a DS v4 CSS variable (src/index.css) so the console
// follows the global theme — including dark mode — automatically.
import React from 'react';

export const W = {
  brand: 'var(--brand)',
  brandBright: 'var(--tint-violet-fg)',
  brand2: 'var(--brand-2)',
  wordmark: 'var(--wordmark)',
  bg: 'var(--app-bg)',
  card: 'var(--card)',
  sidebar: 'var(--sidebar-bg)',
  surfaceMuted: 'var(--surface-muted)',
  collegePill: 'var(--college-pill)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  navHover: 'var(--nav-hover)',
  rowHover: 'var(--row-hover)',
  navFg: 'var(--nav-fg)',
  text: 'var(--text)',
  text2: 'var(--text-2)',
  text3: 'var(--text-3)',
  greenFg: 'var(--status-green)',
  greenBg: 'var(--status-green-bg)',
  orangeFg: 'var(--tint-orange-fg)',
  orangeBg: 'var(--tint-orange-bg)',
  infoFg: 'var(--status-info)',
  infoBg: 'var(--status-info-bg)',
  redFg: 'var(--tint-red-fg)',
  redBg: 'var(--tint-red-bg)',
  pinkFg: 'var(--tint-pink-fg)',
  pinkBg: 'var(--tint-pink-bg)',
  blueFg: 'var(--tint-blue-fg)',
  blueBg: 'var(--tint-blue-bg)',
  brandTintBg: 'var(--tint-brand-bg)',
  brandTintFg: 'var(--tint-brand-fg)',
  shadowCard: 'var(--shadow-card)',
  shadowPop: 'var(--shadow-pop)',
  fontDisplay: 'var(--font-display)',
  fontSans: 'var(--font-sans)',
  r4: '8px',
  r5: '12px',
  r6: '6px',
  gradient: 'var(--app-bg-grad)',
};

export function badgeStyle(variant: 'green' | 'orange' | 'info' | 'red' | 'blue' | 'pink' | 'muted'): React.CSSProperties {
  const map = {
    green: { background: W.greenBg, color: W.greenFg },
    orange: { background: W.orangeBg, color: W.orangeFg },
    info: { background: W.infoBg, color: W.infoFg },
    red: { background: W.redBg, color: W.redFg },
    blue: { background: W.blueBg, color: W.blueFg },
    pink: { background: W.pinkBg, color: W.pinkFg },
    muted: { background: W.surfaceMuted, color: W.text2 },
  };
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 12,
    borderRadius: W.r6, padding: '2px 8px', whiteSpace: 'nowrap',
    ...map[variant],
  } as React.CSSProperties;
}

export function bloomStyle(bloom: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    remember: { background: 'var(--tint-blue-bg)', color: 'var(--tint-blue-fg)' },
    understand: { background: 'var(--tint-teal-bg)', color: 'var(--tint-teal-fg)' },
    apply: { background: 'var(--tint-orange-bg)', color: 'var(--tint-orange-fg)' },
    analyze: { background: 'var(--status-info-bg)', color: 'var(--status-info)' },
    evaluate: { background: 'var(--tint-pink-bg)', color: 'var(--tint-pink-fg)' },
    create: { background: 'var(--tint-violet-bg)', color: 'var(--tint-violet-fg)' },
  };
  return {
    display: 'inline-block', fontFamily: W.fontSans, fontWeight: 600,
    fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase',
    borderRadius: 6, padding: '2px 7px',
    // Strip leading or trailing count e.g. "2 Apply" or "Apply 3" → "apply"
    ...(map[bloom.toLowerCase().replace(/^\d+\s*/, '').replace(/\s*\d+$/, '')] || map.understand),
  } as React.CSSProperties;
}
