// Shared chrome for the Student Studio: mobile-first canvas that renders
// full-bleed on phones and as a centered phone-format stage on desktop,
// with the aurora ambience behind all content.
// The scroll container is a <main> element on purpose — the shared concept
// reader's scroll/dwell telemetry targets document.querySelector('main').
import type { ReactNode } from 'react';
import './studio.css';

export default function StudioFrame({ children }: { children: ReactNode }) {
  return (
    <div className="studio studio-viewport">
      <div className="studio-canvas">
        <div className="studio-aurora" />
        <main className="studio-scroll">{children}</main>
      </div>
    </div>
  );
}
