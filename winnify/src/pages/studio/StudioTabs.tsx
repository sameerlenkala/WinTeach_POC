// Bottom tab bar: Learn / Revise / Progress.
//
// Revision and Mastery are per-course routes, so they used to sit two levels
// deep — a student had to remember they existed and drill through a course to
// reach them. The /study/revise and /study/progress routes resolve to the
// right course (or offer a picker), which lets the loop the product is built
// around be one tap from anywhere.
//
// Mounted as a sibling of <main className="studio-scroll">, never inside it:
// the shared reader's scroll/dwell telemetry targets document.querySelector('main').
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Layers, TrendingUp } from 'lucide-react';

const TABS = [
  { key: 'learn', to: '/study', label: 'Learn', Icon: GraduationCap },
  { key: 'revise', to: '/study/revise', label: 'Revise', Icon: Layers },
  { key: 'progress', to: '/study/progress', label: 'Progress', Icon: TrendingUp },
] as const;

// Which tab a path belongs to. Drilling from a picker into a course's own
// revision/mastery route keeps the originating tab lit.
function activeKey(path: string): string {
  if (path.startsWith('/study/revise') || path.includes('/revision')) return 'revise';
  if (path.startsWith('/study/progress') || path.includes('/mastery')) return 'progress';
  return 'learn';
}

// Immersive routes own the whole canvas — the lesson player, the slide deck,
// the quiz and the shared artifact readers all have their own bottom action
// bar, and a nav bar under it would both crowd the thumb and break the
// player's full-height layout.
export function isImmersive(path: string): boolean {
  return /\/(notes|slides|quiz|cheatsheet|artifact)\//.test(path) || path.endsWith('/cheatsheet');
}

export default function StudioTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (isImmersive(pathname)) return null;
  const active = activeKey(pathname);

  return (
    <nav className="st-tabbar" aria-label="Studio sections">
      {TABS.map(({ key, to, label, Icon }) => {
        const on = key === active;
        return (
          <button
            key={key}
            onClick={() => navigate(to)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '9px 4px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
              color: on ? 'var(--st-lime)' : 'var(--st-text-3)',
              font: '700 10px var(--st-display)', letterSpacing: '0.04em',
              transition: 'color .15s',
            }}
          >
            <Icon size={19} strokeWidth={on ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
