import { Link } from 'react-router-dom';
import {
  CalendarDays, Mic, ClipboardList, FileText, Building2, BarChart3,
  CheckCircle, ArrowRight, Star, Users, BookOpen, Zap, Target, TrendingUp,
} from 'lucide-react';

const features = [
  { icon: CalendarDays,  title: 'Slog Overs Plan',          description: 'AI-generated personalized roadmap from revision to placement readiness. Track milestones, scores, and progress daily.',                                                  color: '#6C5CE7' },
  { icon: Mic,           title: 'WinSpeak Communication',    description: 'Practice speaking skills with AI-powered recording, scoring across 6 dimensions, and personalized coaching feedback.',                                                      color: '#EA446B' },
  { icon: ClipboardList, title: 'Mock Assessments',          description: 'Aptitude, technical, and company-specific OA practice with timed tests, instant results, and weak-area analysis.',                                                          color: '#F59E0B' },
  { icon: FileText,      title: 'Resume Builder & ATS Review', description: 'Build your resume with templates, get AI-powered ATS compatibility scores, and track improvement across attempts.',                                                       color: '#49A9BE' },
  { icon: Building2,     title: 'Campus Drive Portal',       description: 'Track open drives, eligibility, deadlines, and application status. Never miss a placement opportunity.',                                                                    color: '#3DA35D' },
  { icon: BarChart3,     title: 'Performance Analytics',     description: 'Score dashboards, trend charts, dimension breakdowns, and AI-generated focus areas to improve faster.',                                                                     color: '#ED9035' },
];

const howItWorks = [
  { step: '01', title: 'Choose Your Track',           description: 'Select IT, Core, or Hybrid path and pick your specialization domain.' },
  { step: '02', title: 'Follow Your Slog Overs Plan', description: 'Complete daily tasks across revision, assessments, communication, and interviews.' },
  { step: '03', title: 'Practice & Improve',          description: 'Take mock tests, record WinSpeak sessions, and build your resume with AI feedback.' },
  { step: '04', title: 'Get Placement Ready',         description: 'Hit all milestone targets, earn your readiness seal, and apply to campus drives.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Placed at Microsoft', text: 'The Slog Overs plan kept me on track. WinSpeak improved my interview confidence dramatically.', rating: 5 },
  { name: 'Rahul Verma',  role: 'Placed at Google',    text: 'Mock assessments were spot-on. The company OA practice matched real questions perfectly.',   rating: 5 },
  { name: 'Ananya Gupta', role: 'Placed at Amazon',    text: 'Resume ATS review helped me get shortlisted. The AI suggestions were incredibly specific.',   rating: 5 },
];

const stats = [
  { value: '50K+', label: 'Students Placed' },
  { value: '200+', label: 'Partner Companies' },
  { value: '92%',  label: 'Placement Rate' },
  { value: '4.8★', label: 'Student Rating' },
];

const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Razorpay', 'Zepto', 'Flipkart', 'Adobe'];

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 28px' };
const sectionLabel: React.CSSProperties = { display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand)', fontFamily: 'var(--font-display)', marginBottom: 10, padding: '3px 10px', borderRadius: 20, background: 'color-mix(in oklab, var(--brand) 10%, transparent)' };
const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--text)', margin: '0 0 10px', lineHeight: 1.2 };
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 22px', boxShadow: 'var(--shadow-card)' };

export default function Landing() {
  return (
    <div style={{ background: 'var(--app-bg)' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '72px 0 60px' }}>
        <div style={wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <span style={sectionLabel}>For Engineering Students</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 46, color: 'var(--text)', margin: '0 0 18px', lineHeight: 1.1 }}>
                Your Path from{' '}
                <span style={{ color: 'var(--brand)' }}>Campus to Career</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 480, margin: '0 0 28px', fontFamily: 'var(--font-sans)' }}>
                Winnify is the career intelligence platform that prepares engineering students for placements with personalized plans, mock assessments, communication training, and AI-powered resume building.
              </p>
              <div style={{ display: 'flex', gap: 28, marginBottom: 32 }}>
                {stats.map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 24px', borderRadius: 13, background: 'var(--brand)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                  Start Free — Slog Overs Plan <ArrowRight size={16} />
                </Link>
                <Link to="/signin" style={{ display: 'inline-flex', alignItems: 'center', height: 46, padding: '0 20px', borderRadius: 13, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, textDecoration: 'none' }}>
                  Log In
                </Link>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(60,50,140,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FC6058', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEC02F', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2ACA3E', display: 'inline-block' }} />
                <span style={{ marginLeft: 10, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>app.winnify.com/home</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderRadius: 14, background: 'linear-gradient(135deg, #6C5CE7 0%, #4C44AF 100%)', padding: '14px 16px', color: '#fff' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Hey, Priya 👋</div>
                  <div style={{ fontSize: 11, opacity: 0.72, marginTop: 2 }}>Day 45 of 90 · 62% complete</div>
                </div>
                {[
                  { title: 'Revision Course', score: '78%', done: true },
                  { title: 'Resume Validation', score: '72%', done: false },
                  { title: 'Company Assessments', score: '65%', done: false },
                ].map(m => (
                  <div key={m.title} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, border: '1px solid var(--border)', padding: '10px 12px' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: m.done ? 'rgba(61,163,93,0.12)' : 'rgba(108,92,231,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.done ? <CheckCircle size={14} color="#3DA35D" /> : <Target size={14} color="#6C5CE7" />}
                    </div>
                    <span style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{m.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: m.done ? '#3DA35D' : 'var(--text)' }}>{m.score}</span>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'WinSpeak', value: '74', color: '#6C5CE7' },
                    { label: 'Mock Tests', value: '23', color: '#49A9BE' },
                    { label: 'Streak', value: '12d', color: '#ED9035' },
                  ].map(s => (
                    <div key={s.label} style={{ borderRadius: 12, background: 'var(--surface-muted)', padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0' }}>
        <div style={wrap}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.10em', textAlign: 'center', marginBottom: 12, fontFamily: 'var(--font-sans)' }}>Students placed at</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 28px' }}>
            {companies.map(c => (
              <span key={c} style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-3)' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '72px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={sectionLabel}>Platform Features</span>
            <h2 style={h2}>Everything You Need to Get Placed</h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
              From day one of preparation to your offer letter — Winnify covers every step of the placement journey.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {features.map(f => (
              <div key={f.title} style={{ ...card, transition: 'transform 120ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon size={18} color={f.color} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text)', margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-sans)' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '72px 0', background: 'color-mix(in oklab, var(--brand) 4%, var(--app-bg))' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={sectionLabel}>How It Works</span>
            <h2 style={h2}>4 Steps to Placement Readiness</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {howItWorks.map(step => (
              <div key={step.step}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'color-mix(in oklab, var(--brand) 25%, transparent)', lineHeight: 1 }}>{step.step}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text)', margin: '10px 0 6px' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-sans)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '72px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={sectionLabel}>Student Stories</span>
            <h2 style={h2}>Placed at Top Companies</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {testimonials.map(t => (
              <div key={t.name} style={card}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} fill="#F6A623" color="#F6A623" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, margin: '0 0 16px', fontFamily: 'var(--font-sans)' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'color-mix(in oklab, var(--brand) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--brand)', flexShrink: 0 }}>
                    {t.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WINNIFY ── */}
      <section style={{ padding: '72px 0', background: 'color-mix(in oklab, var(--brand) 4%, var(--app-bg))' }}>
        <div style={wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <span style={sectionLabel}>Why Winnify</span>
              <h2 style={h2}>Built for Indian Engineering Students</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                {[
                  { icon: Target,     text: 'Personalized Slog Overs plans based on your branch, domain, and target companies' },
                  { icon: Mic,        text: 'WinSpeak AI scores your communication across fluency, clarity, structure, and more' },
                  { icon: Zap,        text: 'Company-specific OA practice for TCS, Infosys, Wipro, Google, Microsoft, Amazon' },
                  { icon: TrendingUp, text: 'Track your readiness score and see exactly where you need to improve' },
                  { icon: Users,      text: 'Leaderboards and weekly challenges to stay motivated with your peers' },
                  { icon: BookOpen,   text: 'Educative-style course viewer for structured revision with AI-powered Q&A' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'color-mix(in oklab, var(--brand) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <item.icon size={14} color="var(--brand)" />
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-sans)' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WinSpeak preview */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(60,50,140,0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FC6058', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEC02F', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2ACA3E', display: 'inline-block' }} />
                <span style={{ marginLeft: 10, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>app.winnify.com/winspeak</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={16} color="var(--brand)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>WinSpeak Score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#6C5CE7" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * 0.26}`} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>74</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Fluency',   value: 82, color: '#6C5CE7' },
                      { label: 'Clarity',   value: 85, color: '#49A9BE' },
                      { label: 'Structure', value: 70, color: '#3DA35D' },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-3)', width: 52, fontFamily: 'var(--font-sans)' }}>{d.label}</span>
                        <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: d.color, width: `${d.value}%` }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, width: 30, textAlign: 'right', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['Free Practice', 'Tech Interview', 'Elevator Pitch', 'Debate'].map(mode => (
                    <div key={mode} style={{ borderRadius: 10, background: 'var(--surface-muted)', padding: '8px 10px', textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--text-2)', fontWeight: 500 }}>{mode}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <h2 style={{ ...h2, fontSize: 34, marginBottom: 14 }}>Your Placement Journey Starts Here</h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 460, margin: '0 auto 32px', fontFamily: 'var(--font-sans)', lineHeight: 1.65 }}>
            Join thousands of engineering students who used Winnify to land their dream jobs. Start your Slog Overs plan today — it's free.
          </p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 50, padding: '0 28px', borderRadius: 14, background: 'var(--brand)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
