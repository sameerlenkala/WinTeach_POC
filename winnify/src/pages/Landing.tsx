import { Link } from 'react-router-dom';
import {
  CalendarDays, Mic, ClipboardList, FileText, Building2, BarChart3,
  CheckCircle2, ArrowRight, Users, BookOpen, Zap, Target, TrendingUp,
  Flame, Sparkles,
} from 'lucide-react';
import { ScoreDial } from '@/components/ds';

/* ── content ─────────────────────────────────────────────────────────────── */

const features = [
  { icon: CalendarDays,  tone: 'brand',  title: 'Slog Overs Plan',             description: 'AI-generated personalized roadmap from revision to placement readiness. Track milestones, scores, and progress daily.' },
  { icon: Mic,           tone: 'pink',   title: 'WinSpeak Communication',      description: 'Practice speaking skills with AI-powered recording, scoring across 6 dimensions, and personalized coaching feedback.' },
  { icon: ClipboardList, tone: 'orange', title: 'Mock Assessments',            description: 'Aptitude, technical, and company-specific OA practice with timed tests, instant results, and weak-area analysis.' },
  { icon: FileText,      tone: 'teal',   title: 'Resume Builder & ATS Review', description: 'Build your resume with templates, get AI-powered ATS compatibility scores, and track improvement across attempts.' },
  { icon: Building2,     tone: 'blue',   title: 'Campus Drive Portal',         description: 'Track open drives, eligibility, deadlines, and application status. Never miss a placement opportunity.' },
  { icon: BarChart3,     tone: 'violet', title: 'Performance Analytics',       description: 'Score dashboards, trend charts, dimension breakdowns, and AI-generated focus areas to improve faster.' },
] as const;

const howItWorks = [
  { step: '01', title: 'Choose Your Track',           description: 'Select IT, Core, or Hybrid path and pick your specialization domain.' },
  { step: '02', title: 'Follow Your Slog Overs Plan', description: 'Complete daily tasks across revision, assessments, communication, and interviews.' },
  { step: '03', title: 'Practice & Improve',          description: 'Take mock tests, record WinSpeak sessions, and build your resume with AI feedback.' },
  { step: '04', title: 'Get Placement Ready',         description: 'Hit all milestone targets, earn your readiness seal, and apply to campus drives.' },
];

const heroPoints = [
  'Personalized Slog Overs plan from day one',
  'AI feedback on speech, code, and resumes',
  'Company-specific OA practice built in',
];

const whyItems = [
  { icon: Target,     text: 'Personalized Slog Overs plans based on your branch, domain, and target companies' },
  { icon: Mic,        text: 'WinSpeak AI scores your communication across fluency, clarity, structure, and more' },
  { icon: Zap,        text: 'Company-specific OA practice for TCS, Infosys, Wipro, Google, Microsoft, Amazon' },
  { icon: TrendingUp, text: 'Track your readiness score and see exactly where you need to improve' },
  { icon: Users,      text: 'Leaderboards and weekly challenges to stay motivated with your peers' },
  { icon: BookOpen,   text: 'Educative-style course viewer for structured revision with AI-powered Q&A' },
];

/* ── shared styles (all DS v4 tokens — dark-mode aware) ──────────────────── */

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 var(--sp-7)' };

const sectionLabel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 'var(--fs-caption)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--tint-brand-fg)', fontFamily: 'var(--font-display)',
  padding: '4px 12px', borderRadius: 999, background: 'var(--tint-brand-bg)', marginBottom: 12,
};

const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 3.4vw, var(--fs-h1))',
  color: 'var(--text)', margin: '0 0 10px', lineHeight: 'var(--lh-h1)',
};

const card: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 'var(--w-r5)', padding: 'var(--sp-5) var(--sp-6)', boxShadow: 'var(--shadow-card)',
};

const rise = (i: number): React.CSSProperties => ({ animationDelay: `${i * 80}ms` });

/* ── hero dashboard mockup ───────────────────────────────────────────────── */

function HeroMockup() {
  return (
    <div className="ds-rise" style={{
      ...card, padding: 0, overflow: 'hidden',
      boxShadow: 'var(--shadow-pop)', ...rise(3),
    }}>
      {/* browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
        {['var(--score-low)', 'var(--score-mid)', 'var(--score-good)'].map(c => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.75 }} />
        ))}
        <span style={{ marginLeft: 10, fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>app.winnify.com/home</span>
      </div>

      <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {/* greeting band */}
        <div style={{ borderRadius: 'var(--w-r4)', background: 'var(--app-bg-grad)', padding: '14px 16px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Hey, Priya 👋</div>
            <div style={{ fontSize: 11, opacity: 0.78, marginTop: 2 }}>Day 45 of 90 · 62% complete</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.16)', borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            <Flame size={12} /> 12-day streak
          </div>
        </div>

        {/* score dial + rubric rows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
          <ScoreDial value={74} size={104} stroke={10} label="WinSpeak" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Fluency',   value: 82 },
              { label: 'Clarity',   value: 85 },
              { label: 'Structure', value: 70 },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', width: 56, fontFamily: 'var(--font-sans)' }}>{d.label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--score-track)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: d.value >= 85 ? 'var(--score-top)' : 'var(--score-good)', width: `${d.value}%`, transition: 'width var(--dur-reveal) var(--ease-out)' }} />
                </div>
                <span style={{ fontSize: 'var(--fs-small)', fontWeight: 700, width: 28, textAlign: 'right', fontFamily: 'var(--font-display)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* milestone rows */}
        {[
          { title: 'Revision Course',     score: '78%', done: true },
          { title: 'Company Assessments', score: '65%', done: false },
        ].map(m => (
          <div key={m.title} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--w-r4)', border: '1px solid var(--border)', padding: '10px 12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--w-r3)', background: m.done ? 'var(--tint-teal-bg)' : 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.done ? <CheckCircle2 size={14} color="var(--tint-teal-fg)" /> : <Target size={14} color="var(--tint-brand-fg)" />}
            </div>
            <span style={{ flex: 1, fontSize: 'var(--fs-small)', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{m.title}</span>
            <span style={{ fontSize: 'var(--fs-small)', fontWeight: 700, fontFamily: 'var(--font-display)', color: m.done ? 'var(--tint-teal-fg)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div style={{ background: 'var(--app-bg)', overflowX: 'clip' }}>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 88px) 0 64px', position: 'relative' }}>
        {/* ambient tint washes — pure CSS, no images */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(560px 320px at 12% 0%, color-mix(in oklab, var(--brand) 7%, transparent), transparent 70%), radial-gradient(480px 300px at 92% 18%, color-mix(in oklab, var(--brand-2) 6%, transparent), transparent 70%)' }} />
        <div style={{ ...wrap, position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center' }}>
            <div>
              <span className="ds-rise" style={{ ...sectionLabel, ...rise(0) }}>
                <Sparkles size={11} /> For Engineering Students
              </span>
              <h1 className="ds-rise" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(34px, 5vw, 48px)', color: 'var(--text)', margin: '0 0 16px', lineHeight: 1.08, letterSpacing: '-0.01em', ...rise(1) }}>
                Your Path from{' '}
                <span style={{ background: 'var(--app-bg-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  Campus to Career
                </span>
              </h1>
              <p className="ds-rise" style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 480, margin: '0 0 28px', fontFamily: 'var(--font-sans)', ...rise(2) }}>
                Winnify is the career intelligence platform that prepares engineering students for placements with personalized plans, mock assessments, communication training, and AI-powered resume building.
              </p>
              <div className="ds-rise" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, ...rise(3) }}>
                {heroPoints.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="var(--tint-teal-fg)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14.5, color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>{p}</span>
                  </div>
                ))}
              </div>
              <div className="ds-rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, ...rise(4) }}>
                <Link to="/signup" className="w-btn-primary lift" style={{ textDecoration: 'none' }}>
                  Start Free — Slog Overs Plan <ArrowRight size={16} />
                </Link>
                <Link to="/signin" className="w-btn-ghost" style={{ textDecoration: 'none' }}>
                  Log In
                </Link>
              </div>
            </div>

            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '76px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <span style={sectionLabel}>Platform Features</span>
            <h2 style={h2}>Everything You Need to Get Placed</h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
              From day one of preparation to your offer letter — Winnify covers every step of the placement journey.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
            {features.map((f, i) => (
              <div key={f.title} className="lift ds-rise" style={{ ...card, ...rise(i) }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--w-r4)', background: `var(--tint-${f.tone}-bg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon size={18} color={`var(--tint-${f.tone}-fg)`} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: 'var(--text)', margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-2)', lineHeight: 'var(--lh-small)', margin: 0, fontFamily: 'var(--font-sans)' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '76px 0', background: 'color-mix(in oklab, var(--brand) 4%, var(--app-bg))' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <span style={sectionLabel}>How It Works</span>
            <h2 style={h2}>4 Steps to Placement Readiness</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--sp-6)' }}>
            {howItWorks.map((step, i) => (
              <div key={step.step} className="ds-rise" style={{ position: 'relative', ...rise(i) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--w-r4)', background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {step.step}
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div aria-hidden className="hidden lg:block" style={{ flex: 1, height: 2, borderRadius: 2, background: 'color-mix(in oklab, var(--brand) 16%, transparent)' }} />
                  )}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: 'var(--text)', margin: '0 0 6px' }}>{step.title}</h3>
                <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-2)', lineHeight: 'var(--lh-small)', margin: 0, fontFamily: 'var(--font-sans)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WINNIFY ── */}
      <section style={{ padding: '76px 0' }}>
        <div style={wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center' }}>
            <div>
              <span style={sectionLabel}>Why Winnify</span>
              <h2 style={h2}>Built for Indian Engineering Students</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-6)' }}>
                {whyItems.map((item, i) => (
                  <div key={i} className="ds-rise" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, ...rise(i) }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--w-r3)', background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <item.icon size={14} color="var(--tint-brand-fg)" />
                    </div>
                    <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', lineHeight: 'var(--lh-body)', margin: 0, fontFamily: 'var(--font-sans)' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WinSpeak preview */}
            <div className="ds-rise" style={{ ...card, padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-pop)', ...rise(2) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                {['var(--score-low)', 'var(--score-mid)', 'var(--score-good)'].map(c => (
                  <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.75 }} />
                ))}
                <span style={{ marginLeft: 10, fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>app.winnify.com/winspeak</span>
              </div>
              <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 'var(--w-r3)', background: 'var(--tint-pink-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mic size={15} color="var(--tint-pink-fg)" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>WinSpeak Score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                  <ScoreDial value={74} size={96} stroke={9} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Fluency',   value: 82 },
                      { label: 'Clarity',   value: 85 },
                      { label: 'Structure', value: 70 },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', width: 54, fontFamily: 'var(--font-sans)' }}>{d.label}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--score-track)' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: d.value >= 85 ? 'var(--score-top)' : 'var(--score-good)', width: `${d.value}%` }} />
                        </div>
                        <span style={{ fontSize: 'var(--fs-small)', fontWeight: 700, width: 28, textAlign: 'right', fontFamily: 'var(--font-display)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['Free Practice', 'Tech Interview', 'Elevator Pitch', 'Debate'].map(mode => (
                    <div key={mode} style={{ borderRadius: 'var(--w-r3)', background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '8px 10px', textAlign: 'center', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-sans)', color: 'var(--text-2)', fontWeight: 500 }}>{mode}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0 96px' }}>
        <div style={wrap}>
          <div className="ds-rise" style={{
            borderRadius: 'var(--w-r5)', background: 'var(--app-bg-grad)',
            padding: 'clamp(40px, 6vw, 64px) clamp(24px, 5vw, 56px)', textAlign: 'center',
            boxShadow: 'var(--shadow-pop)', position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative rings */}
            <div aria-hidden style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.14)', top: -120, right: -80 }} />
            <div aria-hidden style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.10)', bottom: -70, left: -40 }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 36px)', color: '#fff', margin: '0 0 14px', lineHeight: 1.15, position: 'relative' }}>
              Your Placement Journey Starts Here
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', maxWidth: 460, margin: '0 auto 32px', fontFamily: 'var(--font-sans)', lineHeight: 1.65, position: 'relative' }}>
              Build your personalized Slog Overs plan and track every step from revision to offer letter. Start today — it's free.
            </p>
            <Link to="/signup" className="lift" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, height: 52, padding: '0 30px',
              borderRadius: 999, background: '#fff', color: '#5b4bff',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, textDecoration: 'none', position: 'relative',
            }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
