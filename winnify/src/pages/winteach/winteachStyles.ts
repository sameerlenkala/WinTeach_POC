// Shared inline style helpers for WinTeach Console
// All --w-* CSS variables are injected via the <style> block in WinTeachLayout.
import React from 'react';

export const W = {
  brand: '#5B4BDB',
  brandBright: '#6C5CE7',
  wordmark: '#F6A623',
  bg: '#EFEEFC',
  card: '#FFFFFF',
  sidebar: '#FFFFFF',
  surfaceMuted: '#F1F2F7',
  collegePill: '#E5E2FB',
  border: '#E6E5F0',
  borderStrong: '#D8D7E6',
  navHover: '#F2F1FC',
  rowHover: '#F4F3FD',
  navFg: '#4B4B57',
  text: '#1A1A22',
  text2: 'rgba(26,26,34,.66)',
  text3: 'rgba(26,26,34,.45)',
  greenFg: '#3DA35D',
  greenBg: '#E5F4E9',
  orangeFg: '#E4853B',
  orangeBg: 'rgba(228,133,59,.14)',
  infoFg: '#49A9BE',
  infoBg: 'rgba(73,169,190,.14)',
  redFg: '#DC2133',
  redBg: 'rgba(220,33,51,.12)',
  pinkFg: '#D9446C',
  pinkBg: 'rgba(217,68,108,.14)',
  blueFg: '#2563EB',
  blueBg: 'rgba(37,99,235,.12)',
  shadowCard: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)',
  shadowPop: '0 12px 32px -8px rgba(60,50,140,.22)',
  fontDisplay: "'Fredoka', system-ui, sans-serif",
  fontSans: "'DM Sans', system-ui, sans-serif",
  r4: '12px',
  r5: '20px',
  r6: '48px',
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
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13,
    borderRadius: W.r6, padding: '3px 11px', whiteSpace: 'nowrap',
    ...map[variant],
  } as React.CSSProperties;
}

export function bloomStyle(bloom: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    remember: { background: '#EEF2FF', color: '#4F5BD5' },
    understand: { background: '#E5F4E9', color: '#3DA35D' },
    apply: { background: '#FFF3E2', color: '#E4853B' },
    analyze: { background: '#E7F6F9', color: '#3895AD' },
    evaluate: { background: '#FCE8EF', color: '#D9446C' },
    create: { background: '#F0EBFF', color: '#6C5CE7' },
  };
  return {
    display: 'inline-block', fontFamily: W.fontSans, fontWeight: 600,
    fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase',
    borderRadius: 6, padding: '2px 7px',
    // Strip leading count prefix e.g. "2 Apply" → "apply"
    ...(map[bloom.toLowerCase().replace(/^\d+\s*/, '')] || map.understand),
  } as React.CSSProperties;
}
