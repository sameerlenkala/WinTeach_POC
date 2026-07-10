// Public landing (/) — the Winnify hero, ported from the winnify_website_2
// design. Standalone full-screen hero; CTAs route into this app.
import { Link } from 'react-router-dom';
import './landing/landing.css';

const MARQUEE = [
  { n: '<46%', s: 'of Tier 2/3 graduates are employable' },
  { n: '83%', s: 'of 2025 engineering grads lack a job or internship' },
  { n: '91%', s: 'of employers say English matters more than ever' },
  { n: '87%', s: 'of HRs say AI raises the demand for English' },
  { n: 'NEP 2030', s: 'makes skill-readiness a national mandate' },
];

export default function Landing() {
  return (
    <div className="wl">
      <header className="wl-hero">
        {/* nav */}
        <nav className="wl-nav">
          <div className="wrap wl-nav-inner">
            <Link to="/" className="wl-logo">winnif<b>y</b></Link>
            <div className="wl-nav-links">
              <Link to="/signin">Sign in</Link>
              <Link to="/study/login">Course studio</Link>
              <Link to="/signup" className="cta">Get started</Link>
            </div>
            <Link to="/signin" className="wl-btn wl-btn-amber wl-btn-sm wl-nav-compact">Sign in</Link>
          </div>
        </nav>

        {/* watermark + orbs */}
        <div className="wl-bigW" aria-hidden>W<b>W</b></div>
        <div className="wl-orb wl-orb-1" aria-hidden />
        <div className="wl-orb wl-orb-2" aria-hidden />

        {/* copy */}
        <div className="wrap wl-hero-inner">
          <div className="wl-kicker">The Career Intelligence Layer for Talent</div>
          <h1>Where talent gets its <span className="amber">W.</span></h1>
          <p className="wl-lede">
            India produces over a million graduates a year — and fewer than half are considered
            employable. Winnify builds the bridge from awareness to readiness to opportunity,
            starting with the skill employers rank first: communication.
          </p>
          <div className="wl-cta-row">
            <Link to="/signup" className="wl-btn wl-btn-amber">Get started <span className="arrow">→</span></Link>
            <Link to="/signin" className="wl-btn wl-btn-ghost">Sign in</Link>
            <span className="wl-live-dot"><i />WinSpeak &amp; WinTeach are live</span>
          </div>
        </div>

        {/* bottom stat marquee (duplicated track for a seamless loop) */}
        <div className="wl-marquee" aria-hidden>
          <div className="wl-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}><b>{m.n}</b> {m.s}<i /></span>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
