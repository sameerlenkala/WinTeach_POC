import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Briefcase, Mic, Zap, Users, User, Map, BookOpen, FileText, Flame, Clock } from 'lucide-react';

/* ── data ─────────────────────────────────────────────────────── */
const driveResults = [
  { id: 1, tag: 'Result', color: '#5B4BDB', bg: 'rgba(91,75,219,0.10)', title: 'You cleared Google OA Round!',  sub: 'Online Assessment — Round 1 Cleared' },
  { id: 2, tag: 'Score',  color: '#49A9BE', bg: 'rgba(73,169,190,0.10)', title: 'TCS NQT Aptitude — 82%',       sub: 'National Qualifier Test — Above Cutoff' },
  { id: 3, tag: 'Passed', color: '#3DA35D', bg: 'rgba(61,163,93,0.10)',  title: 'Infosys InfyTQ Cleared',        sub: 'Certification Exam — Qualified' },
];

const dailyChallenges = [
  { id: 1, title: 'Daily Business Challenge', desc: "Test your business acumen with today's scenario", icon: Briefcase, color: '#5B4BDB', bg: 'rgba(91,75,219,0.10)',  time: '14h left', link: '/home/mocktest' },
  { id: 2, title: 'WinSpeak Challenge',        desc: 'Improve your communication skills daily',        icon: Mic,      color: '#D9446C', bg: 'rgba(217,68,108,0.10)', time: '14h left', link: '/home/winspeak/challenge' },
];

const essentials = [
  { id: 1, title: 'Mocktest Hub',  sub: 'Practice · Identify gaps · Improve', icon: Zap,   color: '#E4853B', bg: 'rgba(228,133,59,0.10)',  link: '/home/mocktest' },
  { id: 2, title: 'Career Radar', sub: 'See how they made it.',               icon: Users, color: '#49A9BE', bg: 'rgba(73,169,190,0.10)', link: '/home/drives' },
];

const quickAccess = [
  { id: 1, label: 'My Profile',     icon: User,     color: '#5B4BDB', bg: 'rgba(91,75,219,0.10)',  link: '/home/profile' },
  { id: 2, label: 'ACTIVA Roadmap', icon: Map,      color: '#49A9BE', bg: 'rgba(73,169,190,0.10)', link: '/home/journey' },
  { id: 3, label: 'Course Library', icon: BookOpen, color: '#3DA35D', bg: 'rgba(61,163,93,0.10)',  link: '/home/courses' },
  { id: 4, label: 'Resume Builder', icon: FileText, color: '#E4853B', bg: 'rgba(228,133,59,0.10)', link: '/home/resume' },
  { id: 5, label: 'Mocktest Hub',   icon: Zap,      color: '#2563EB', bg: 'rgba(37,99,235,0.10)',  link: '/home/mocktest' },
];

const upcomingDrives = [
  { id: 1, company: 'Google',    role: 'SDE Intern', date: 'May 2, 2026',  status: 'Eligible',     sc: '#3DA35D', sb: '#E5F4E9' },
  { id: 2, company: 'Microsoft', role: 'SWE Intern', date: 'May 5, 2026',  status: 'Eligible',     sc: '#3DA35D', sb: '#E5F4E9' },
  { id: 3, company: 'Amazon',    role: 'SDE-1',      date: 'May 8, 2026',  status: 'Apply Now',    sc: '#E4853B', sb: 'rgba(228,133,59,0.14)' },
  { id: 4, company: 'TCS',       role: 'Digital',    date: 'May 10, 2026', status: 'Closing Soon', sc: '#DC2133', sb: 'rgba(220,33,51,0.12)' },
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
        style={{ background: 'linear-gradient(135deg, #6E5EE6 0%, #5B4BDB 100%)', padding: '24px 28px', marginTop: 0 }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="flex items-center gap-3">
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', border: '1.5px solid rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                Hey, {user?.name || 'Champion'}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '3px 0 0', fontFamily: 'var(--font-sans)' }}>Ready to win today?</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Stat label="Open Drives" value="12" />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.20)' }} />
            <Stat label="Closing &lt;24h" value="1" valueColor="#FCA5A5" />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.20)' }} />
            <Stat label="Eligible" value="4" />
          </div>
        </div>
      </div>

      {/* ── Recent Results ──────────────────────────────────── */}
      <section>
        <SectionLabel label="Recent Results" link="/home/drives" linkLabel="View All" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {driveResults.map(r => (
            <Link key={r.id} to={`/home/drives/${r.id}`} style={{ textDecoration: 'none' }}>
              <div className="h-card h-card--compact h-card--hover" style={{ borderLeft: `3px solid ${r.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.tag}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: '0 0 3px', lineHeight: 1.3 }}>{r.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{r.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Daily Challenges + Essentials ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <SectionLabel label="Daily Challenges" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {dailyChallenges.map(ch => (
              <Link key={ch.id} to={ch.link} style={{ textDecoration: 'none' }}>
                <div className="h-card h-card--compact h-card--hover" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: ch.bg, color: ch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ch.icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{ch.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
                        <Clock size={11} /> {ch.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-sans)' }}>{ch.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel label="Essentials" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {essentials.map(e => (
              <Link key={e.id} to={e.link} style={{ textDecoration: 'none' }}>
                <div className="h-card h-card--compact h-card--hover" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: e.bg, color: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <e.icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: 0 }}>{e.title}</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-sans)' }}>{e.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Career Journey CTA ──────────────────────────────── */}
      <div className="h-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text)', margin: '0 0 4px' }}>Your Career Journey</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', fontFamily: 'var(--font-sans)' }}>Discover your personalized roadmap to success</p>
          <Link to="/home/journey" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 22px', borderRadius: 12, background: 'var(--brand)', color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, textDecoration: 'none', transition: 'background 120ms ease' }}>
            Explore Journey <ArrowRight size={15} />
          </Link>
        </div>
        <Flame size={48} style={{ color: 'color-mix(in oklab, var(--brand) 20%, transparent)', flexShrink: 0 }} className="hidden sm:block" />
      </div>

      {/* ── Quick Access ─────────────────────────────────────── */}
      <section>
        <SectionLabel label="Quick Access" />
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 4, marginTop: 12 }}>
          {quickAccess.map(q => (
            <Link key={q.id} to={q.link} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72, textDecoration: 'none' }} className="group">
              <div style={{ width: 52, height: 52, borderRadius: 16, background: q.bg, color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 120ms ease, box-shadow 120ms ease' }} className="group-hover:-translate-y-0.5 group-hover:shadow-md">
                <q.icon size={22} />
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'center' }}>{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Upcoming Drives ──────────────────────────────────── */}
      <section>
        <SectionLabel label="Upcoming Drives" link="/home/drives" linkLabel="See All" />
        <div className="rounded-[20px] overflow-hidden mt-3" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          {upcomingDrives.map((d, i) => (
            <Link key={d.id} to={`/home/drives/${d.id}`} className="block group" style={{ textDecoration: 'none' }}>
              <div
                className="flex items-center justify-between px-6 py-4 transition-colors group-hover:bg-[var(--row-hover)]"
                style={i < upcomingDrives.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.10)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    {d.company.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: 0 }}>{d.company}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' }}>{d.role}</p>
                  </div>
                </div>
                <span className="hidden sm:block" style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{d.date}</span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: d.sc, background: d.sb, padding: '4px 12px', borderRadius: 999 }}>
                  {d.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */
function Stat({ label, value, valueColor = '#FFFFFF' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: valueColor, lineHeight: 1 }} dangerouslySetInnerHTML={{ __html: value }} />
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{ __html: label }} />
    </div>
  );
}

function SectionLabel({ label, link, linkLabel }: { label: string; link?: string; linkLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)' }}>{label}</span>
      {link && (
        <Link to={link} style={{ fontSize: 12.5, color: 'var(--brand)', fontFamily: 'var(--font-sans)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
          {linkLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
