import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Briefcase, Mic, Zap, Users, User, Map, BookOpen, FileText, Flame } from 'lucide-react';
import { ChallengeCard, SectionHeader, StreakChip, tone, type Tone } from '@/components/ds';

/* ── data ─────────────────────────────────────────────────────── */
const driveResults: { id: number; tag: string; tone: Tone; title: string; sub: string }[] = [
  { id: 1, tag: 'Result', tone: 'brand', title: 'You cleared Google OA Round!', sub: 'Online Assessment — Round 1 Cleared' },
  { id: 2, tag: 'Score',  tone: 'blue',  title: 'TCS NQT Aptitude — 82%',      sub: 'National Qualifier Test — Above Cutoff' },
  { id: 3, tag: 'Passed', tone: 'teal',  title: 'Infosys InfyTQ Cleared',       sub: 'Certification Exam — Qualified' },
];

const essentials: { id: number; title: string; sub: string; icon: typeof Zap; tone: Tone; link: string }[] = [
  { id: 1, title: 'Mocktest Hub',  sub: 'Practice · Identify gaps · Improve', icon: Zap,   tone: 'orange', link: '/home/mocktest' },
  { id: 2, title: 'Career Radar', sub: 'See how they made it.',               icon: Users, tone: 'blue',   link: '/home/drives' },
];

const quickAccess: { id: number; label: string; icon: typeof User; tone: Tone; link: string }[] = [
  { id: 1, label: 'My Profile',     icon: User,     tone: 'brand',  link: '/home/profile' },
  { id: 2, label: 'ACTIVA Roadmap', icon: Map,      tone: 'blue',   link: '/home/journey' },
  { id: 3, label: 'Course Library', icon: BookOpen, tone: 'teal',   link: '/home/courses' },
  { id: 4, label: 'Resume Builder', icon: FileText, tone: 'orange', link: '/home/resume' },
  { id: 5, label: 'Mocktest Hub',   icon: Zap,      tone: 'violet', link: '/home/mocktest' },
];

const upcomingDrives: { id: number; company: string; role: string; date: string; status: string; tone: Tone }[] = [
  { id: 1, company: 'Google',    role: 'SDE Intern', date: 'May 2, 2026',  status: 'Eligible',     tone: 'teal' },
  { id: 2, company: 'Microsoft', role: 'SWE Intern', date: 'May 5, 2026',  status: 'Eligible',     tone: 'teal' },
  { id: 3, company: 'Amazon',    role: 'SDE-1',      date: 'May 8, 2026',  status: 'Apply Now',    tone: 'orange' },
  { id: 4, company: 'TCS',       role: 'Digital',    date: 'May 10, 2026', status: 'Closing Soon', tone: 'red' },
];

/* ── component ────────────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || 'W';

  return (
    <div style={{ padding: '0 36px 36px', display: 'flex', flexDirection: 'column', gap: 26 }}>

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{ background: 'var(--app-bg-grad)', padding: '24px 28px' }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', border: '1.5px solid rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h2)', color: '#fff', margin: 0, lineHeight: 'var(--lh-h2)' }}>
                Hey, {user?.name || 'Champion'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                <p style={{ fontSize: 'var(--fs-small)', color: 'rgba(255,255,255,0.72)', margin: 0, fontFamily: 'var(--font-sans)' }}>Ready to win today?</p>
                <StreakChip days={12} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Stat label="Open Drives" value="12" />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.20)' }} />
            <Stat label="Closing <24h" value="1" valueColor="#FCA5A5" />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.20)' }} />
            <Stat label="Eligible" value="4" />
          </div>
        </div>
      </div>

      {/* ── Recent Results ──────────────────────────────────── */}
      <section>
        <SectionHeader label="Recent Results" action={<SeeAll to="/home/drives" label="View All" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {driveResults.map(r => {
            const t = tone(r.tone);
            return (
              <Link key={r.id} to={`/home/drives/${r.id}`} style={{ textDecoration: 'none' }}>
                <div className="h-card h-card--compact h-card--hover" style={{ borderLeft: `3px solid ${t.fg}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.fg, display: 'inline-block' }} />
                    <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-sans)', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.tag}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', margin: '0 0 3px', lineHeight: 1.3 }}>{r.title}</p>
                  <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{r.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Daily Challenges + Essentials ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionHeader label="Daily Challenges" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ChallengeCard icon={Briefcase} title="Daily Business Challenge" desc="Test your business acumen with today's scenario" timeLeft="14h left" to="/home/mocktest" toneName="brand" />
            <ChallengeCard icon={Mic} title="WinSpeak Challenge" desc="Improve your communication skills daily" timeLeft="14h left" to="/home/winspeak/challenge" toneName="pink" />
          </div>
        </section>

        <section>
          <SectionHeader label="Essentials" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {essentials.map(e => (
              <ChallengeCard key={e.id} icon={e.icon} title={e.title} desc={e.sub} to={e.link} toneName={e.tone} />
            ))}
          </div>
        </section>
      </div>

      {/* ── Career Journey CTA ──────────────────────────────── */}
      <div className="h-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: 'var(--text)', margin: '0 0 4px' }}>Your Career Journey</h3>
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', margin: '0 0 16px', fontFamily: 'var(--font-sans)' }}>Discover your personalized roadmap to success</p>
          <Link to="/home/journey" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 22px', borderRadius: 'var(--w-r4)', background: 'var(--brand)', color: 'var(--brand-fg)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, textDecoration: 'none', transition: 'background var(--dur-fast) var(--ease-out)' }}>
            Explore Journey <ArrowRight size={15} />
          </Link>
        </div>
        <Flame size={48} style={{ color: 'color-mix(in oklab, var(--brand) 20%, transparent)', flexShrink: 0 }} className="hidden sm:block" />
      </div>

      {/* ── Quick Access ─────────────────────────────────────── */}
      <section>
        <SectionHeader label="Quick Access" />
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {quickAccess.map(q => {
            const t = tone(q.tone);
            return (
              <Link key={q.id} to={q.link} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72, textDecoration: 'none' }} className="group">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)' }} className="group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <q.icon size={22} />
                </div>
                <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'center' }}>{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Upcoming Drives ──────────────────────────────────── */}
      <section>
        <SectionHeader label="Upcoming Drives" action={<SeeAll to="/home/drives" label="See All" />} />
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          {upcomingDrives.map((d, i) => {
            const t = tone(d.tone);
            return (
              <Link key={d.id} to={`/home/drives/${d.id}`} className="block group" style={{ textDecoration: 'none' }}>
                <div
                  className="flex items-center justify-between px-6 py-4 transition-colors group-hover:bg-[var(--row-hover)]"
                  style={i < upcomingDrives.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                      {d.company.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', margin: 0 }}>{d.company}</p>
                      <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{d.role}</p>
                    </div>
                  </div>
                  <span className="hidden sm:block" style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{d.date}</span>
                  <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, fontFamily: 'var(--font-display)', color: t.fg, background: t.bg, padding: '4px 12px', borderRadius: 999 }}>
                    {d.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */
function Stat({ label, value, valueColor = '#FFFFFF' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: valueColor, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.65)', marginTop: 3, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} style={{ fontSize: 'var(--fs-small)', color: 'var(--brand)', fontFamily: 'var(--font-sans)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
      {label} <ArrowRight size={12} />
    </Link>
  );
}
