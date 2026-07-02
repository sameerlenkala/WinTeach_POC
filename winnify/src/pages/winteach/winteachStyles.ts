// Shared inline style helpers for WinTeach Console
// All --w-* CSS variables are injected via the <style> block in WinTeachLayout.
import React from 'react';

export const W = {
  brand: '#5b4bff',
  brandBright: '#7b3bff',
  brand2: '#00b39a',
  wordmark: '#F6A623',
  bg: '#f6f7fb',
  card: '#ffffff',
  sidebar: '#ffffff',
  surfaceMuted: '#f6f7fb',
  collegePill: '#eef3ff',
  border: '#e9eaf2',
  borderStrong: '#d8d9e8',
  navHover: '#f0eeff',
  rowHover: '#f5f4ff',
  navFg: '#6b7080',
  text: '#1c2030',
  text2: '#6b7080',
  text3: 'rgba(28,32,48,.45)',
  greenFg: '#15a06a',
  greenBg: '#e7fbf5',
  orangeFg: '#E4853B',
  orangeBg: 'rgba(228,133,59,.14)',
  infoFg: '#49A9BE',
  infoBg: 'rgba(73,169,190,.14)',
  redFg: '#DC2133',
  redBg: 'rgba(220,33,51,.12)',
  pinkFg: '#c0357f',
  pinkBg: 'rgba(192,53,127,.14)',
  blueFg: '#2b54c9',
  blueBg: 'rgba(43,84,201,.10)',
  shadowCard: '0 1px 3px rgba(28,32,48,.06),0 4px 16px rgba(28,32,48,.06)',
  shadowPop: '0 8px 28px rgba(91,75,255,.18)',
  fontDisplay: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  r4: '12px',
  r5: '18px',
  r6: '48px',
  gradient: 'linear-gradient(135deg,#5b4bff,#7b3bff 58%,#00b39a)',
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
    // Strip leading or trailing count e.g. "2 Apply" or "Apply 3" → "apply"
    ...(map[bloom.toLowerCase().replace(/^\d+\s*/, '').replace(/\s*\d+$/, '')] || map.understand),
  } as React.CSSProperties;
}
