// Shared chrome for the Student Studio: mobile-first canvas that renders
// full-bleed on phones and as a centered phone-format stage on desktop,
// with the aurora ambience behind all content.
// The scroll container is a <main> element on purpose — the shared concept
// reader's scroll/dwell telemetry targets document.querySelector('main').
import type { ReactNode } from 'react';
import './studio.css';

// `tabs` renders as a sibling of <main>, never inside it — see the note above
// about the telemetry selector. `withTabs` goes on <main> itself rather than on
// a wrapper, so studio.css's `.studio-scroll:has(> .st-player)` rule (which
// gives the lesson player its full-height layout) keeps matching.
export default function StudioFrame({ children, tabs, withTabs }: {
  children: ReactNode; tabs?: ReactNode; withTabs?: boolean;
}) {
  return (
    <div className="studio studio-viewport">
      <div className="studio-canvas">
        <div className="studio-aurora" />
        <main className={`studio-scroll${withTabs ? ' has-tabbar' : ''}`}>{children}</main>
        {tabs}
      </div>
    </div>
  );
}
