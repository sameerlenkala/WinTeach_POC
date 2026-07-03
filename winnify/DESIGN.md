# Winnify Design System — v4

One system, many surfaces. Tokens live in `src/index.css` (§ *DS v4*), components in
`src/components/ds/`. This document is the rationale trail.

## 1. Color

Palette anchored on the CE reference file — everything else derived for accessibility.

| Token | Value | Role | Contrast on white |
|---|---|---|---|
| `--brand` | `#5b4bff` | Primary actions, active nav, 85+ score band | 5.0:1 (AA text) |
| `--brand-2` | `#00b39a` | Accent graphics only — never small text | 2.9:1 (≥3:1 non-text) |
| `--text` | `#1c2030` | Ink | 15.4:1 |
| `--text-2` | `#6b7080` | Muted text | 4.9:1 (AA) |
| `--border` / `--app-bg` | `#e9eaf2` / `#f6f7fb` | Hairlines / canvas | — |
| `--score-low/mid/good/top` | `#e23b5a · #c9622b · #15a06a · #5b4bff` | Score bands (graphics ≥3:1) | 4.2 · 4.0 · 3.2 · 5.0 |
| `--tint-*-bg/fg` pairs | e.g. `#e7fbf5` / `#0e7a50` | Chips, icon tiles | every `fg` ≥4.5:1 on its `bg` |

**Why tints, not saturated fills:** dense data (rubrics, leaderboards, TPO tables) stays
readable when color is a *whisper* (pastel tile + ink-safe foreground) rather than a shout.
Saturated brand is reserved for the one primary action per screen and the score bands —
which is what makes score moments feel special. Institutional buyers read the same palette
as "calm SaaS"; students read the tints + motion as "game". One palette, two audiences.

**Dark mode** swaps ink↔surface and lifts every band/tint ~20% lightness so 3:1 holds on
`#252830` cards. Brand flips to `#F6A623` (existing identity decision, retained).

## 2. Typography

Fredoka (display) + DM Sans (body) — geometric-friendly display keeps the gamified
personality without cartoonish weight; DM Sans holds up at 12.5px data density.

Scale (1.25 modular, tokens `--fs-*`): 40 display (score reveals) · 28 h1 · 22 h2 ·
17 h3 · 14 body · 12.5 small · 11 caption (uppercase, +0.06em). Numerals in scores and
leaderboards use `font-variant-numeric: tabular-nums` so columns don't jitter.

## 3. Spacing, radius, elevation

- **4px grid** (`--sp-1…8`: 4→48). Cards pad `--sp-4`, page gutters `--sp-7`.
- **Radius** `--w-r2…r6` (4/8/12/20/48). 20px cards is the signature curvature; pills 999.
- **Elevation**: two tiers only — `--shadow-card` (rest) and `--shadow-pop` (hover/overlay).
  Flat-by-default keeps low-end Android GPUs happy.

## 4. Components (`src/components/ds`)

| Component | Purpose |
|---|---|
| `ScoreDial` | Animated SVG donut; ring sweep + numeral count-up in sync (`role="meter"`) |
| `RubricBar` | Dimension row: band-colored bar, delta chip, 44px+ hit target |
| `LeaderboardRow` | Rank/avatar/name/score; medal tints top-3; `highlight` marks "You" |
| `ChallengeCard` | Daily-challenge entry: tint tile, time-left chip, hover lift |
| `StreakChip` | Flame + day count; optional gentle pulse (no confetti — college, not kids) |
| `Skeleton/SkeletonCard` | Shimmer placeholders for slow networks |
| `EmptyState / ErrorState` | Dashed-border first-run; retry-forward failure |
| `SectionHeader`, `tone()` | Consistent section rhythm; tint access by name |

## 5. Gamification stance

Progress-forward, not reward-noisy. Streaks, deltas (↑8), cohort percentile, and medal
tints communicate momentum; we deliberately avoid XP bursts, confetti and mascots. The
emotional peak is the **score reveal** (dial sweep + count-up) — earned, once per session.

## 6. Motion

Tokens: `--dur-fast 120ms` (hover) · `--dur-med 200` · `--dur-slow 360` (entrances) ·
`--dur-reveal 900` (score) with `--ease-out` and `--ease-spring` (pop only).

- Score reveal: ring `stroke-dashoffset` transition + rAF count-up, same duration.
- Section entrances: `ds-rise` staggered 80ms — settle, don't parade.
- Streak: 1.6s scale pulse on the flame only.
- **`prefers-reduced-motion`**: all animation collapses to final state (media query kills
  keyframes; `ScoreDial` checks it in JS and renders the end value instantly).

## 7. Accessibility & India-market constraints

- WCAG AA: all text tokens ≥4.5:1; graphics ≥3:1; visible `:focus-visible` ring (`--ring`).
- ARIA: dial is `role="meter"` with value text; empty/error states are `status`/`alert`.
- Hit targets ≥44px on interactive rows; thumb-reachable primary CTA at content bottom.
- Low bandwidth: system-hosted where possible, two font families total, zero image
  dependencies in the DS (SVG + CSS only), skeletons for perceived speed.
- Low-end Android: no backdrop-filter/parallax; shadows two-tier; animations are
  transform/opacity-only (compositor-friendly).

## 8. Scaling across modules

Each module claims one tone from the tint family (WinSpeak pink, Campus Drive blue,
Mocktest orange, Courses teal, Journey brand) — surfaces stay distinct while the shell,
type, spacing and components never change. New module = new tone + existing components.
