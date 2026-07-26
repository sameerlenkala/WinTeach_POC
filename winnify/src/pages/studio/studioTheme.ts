// Studio theme: manual System / Light / Dark switch, JS-driven so it can
// override the OS setting per-app. The stored *preference* resolves to a
// concrete `data-st-theme="light|dark"` on <html>; studio.css keys its light
// overrides off that attribute (dark is the base). A matching no-flash inline
// script in index.html applies the same resolution before first paint.
import { useCallback, useEffect, useState } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';
const KEY = 'winnify_studio_theme';

export function getStoredPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* storage unavailable */ }
  // Default to dark until the student picks otherwise (mirrored by the
  // no-flash script in index.html).
  return 'dark';
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  if (pref === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return pref;
}

// Stamp the resolved theme on <html> so CSS (and the browser chrome via
// color-scheme) picks it up. Kept idempotent — safe to call repeatedly.
export function applyResolvedTheme(pref: ThemePref) {
  try {
    document.documentElement.setAttribute('data-st-theme', resolveTheme(pref));
  } catch { /* SSR / no document */ }
}

export function setStoredPref(pref: ThemePref) {
  try { localStorage.setItem(KEY, pref); } catch { /* ignore */ }
  applyResolvedTheme(pref);
}

/* ── Text size ──────────────────────────────────────────────────────────────
   Reading a full lesson on a phone is the studio's core activity, and the one
   place a fixed type scale actually costs people. Scales the reader's prose
   only (via --st-font-scale, consumed in studio.css) so chrome and controls
   keep their tap targets. */
const SIZE_KEY = 'winnify_studio_text_scale';
export const TEXT_SCALES = [0.92, 1, 1.12] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export function getStoredScale(): TextScale {
  try {
    const v = Number(localStorage.getItem(SIZE_KEY));
    if (TEXT_SCALES.includes(v as TextScale)) return v as TextScale;
  } catch { /* storage unavailable */ }
  return 1;
}

export function applyScale(scale: TextScale) {
  try { document.documentElement.style.setProperty('--st-font-scale', String(scale)); } catch { /* SSR */ }
}

export function useStudioTextScale(): [TextScale, (s: TextScale) => void] {
  const [scale, setScale] = useState<TextScale>(getStoredScale);
  useEffect(() => { applyScale(scale); }, [scale]);
  const update = useCallback((s: TextScale) => {
    try { localStorage.setItem(SIZE_KEY, String(s)); } catch { /* ignore */ }
    setScale(s);
  }, []);
  return [scale, update];
}

// React hook for the switcher: returns the current preference + a setter, and
// keeps `data-st-theme` in sync with the OS while the preference is "system".
export function useStudioTheme(): [ThemePref, (p: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(getStoredPref);

  // Re-apply on mount so a stored preference wins even if the inline script
  // never ran (e.g. first dev load), and whenever the preference changes.
  useEffect(() => { applyResolvedTheme(pref); }, [pref]);

  // Follow live OS changes only while tracking the system setting.
  useEffect(() => {
    if (pref !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyResolvedTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const update = useCallback((p: ThemePref) => { setStoredPref(p); setPref(p); }, []);
  return [pref, update];
}
