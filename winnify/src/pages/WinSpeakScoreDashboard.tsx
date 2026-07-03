import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { ScoreDial, RubricBar, LeaderboardRow, SectionHeader, StreakChip } from '@/components/ds';

const dims = [
  { name: 'Clarity',    score: 84, change: 8  },
  { name: 'Fluency',    score: 81, change: 6  },
  { name: 'Grammar',    score: 74, change: -2 },
  { name: 'Structure',  score: 73, change: 14 },
  { name: 'Vocabulary', score: 77, change: 4  },
  { name: 'Relevance',  score: 79, change: 3  },
];

const weeks = [
  { label: 'W10', h: 44 },
  { label: 'W11', h: 55 },
  { label: 'W12', h: 62 },
  { label: 'W13', h: 76 },
  { label: 'W14', h: 91, highlight: true },
];

const cohort = [
  { rank: 10, name: 'Ananya Rao',   sub: 'CSE · 3rd yr', score: 78, delta: 1 },
  { rank: 11, name: 'Rahul Verma',  sub: 'ECE · 3rd yr', score: 76, delta: -2 },
  { rank: 12, name: 'Priya Sharma', sub: 'CSE · 3rd yr', score: 74, delta: 2, you: true },
  { rank: 13, name: 'Karthik N',    sub: 'IT · 3rd yr',  score: 73, delta: 0 },
];

export default function WinSpeakScoreDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)' }}>
      {/* ── Hero: score reveal ──────────────────────────────── */}
      <div style={{ background: 'var(--app-bg-grad)' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: 38, height: 38, borderRadius: 'var(--w-r4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-h3)', color: '#fff', margin: 0, flex: 1 }}>
            WinSpeak Score
          </h1>
          <StreakChip days={12} pulse />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', padding: '4px 24px 26px', flexWrap: 'wrap' }}>
          <div className="ds-pop">
            <ScoreDial value={74} label="Overall" sublabel="Top 5% cohort" color="#fff" />
          </div>

          {/* 5-week trend */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', marginBottom: 10,
            }}>
              Last 5 challenges
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 84 }}>
              {weeks.map((w) => (
                <div key={w.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%', height: `${w.h}%`, borderRadius: 6,
                      background: w.highlight ? '#fff' : 'rgba(255,255,255,0.35)',
                      transition: 'height var(--dur-slow) var(--ease-out)',
                    }} />
                  </div>
                  <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-sans)', color: w.highlight ? '#fff' : 'rgba(255,255,255,0.65)', fontWeight: w.highlight ? 700 : 400 }}>
                    {w.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 700,
                color: '#fff', background: 'rgba(255,255,255,0.16)', padding: '3px 10px', borderRadius: 999,
              }}>↑ 2 this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', maxWidth: 760, margin: '0 auto' }}>

        {/* Rubric breakdown */}
        <section className="ds-rise">
          <SectionHeader label="Dimension Breakdown" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dims.map(d => (
              <RubricBar
                key={d.name}
                label={d.name}
                value={d.score}
                delta={d.change}
                onClick={() => navigate(`/home/winspeak/dimension/${d.name.toLowerCase()}`)}
              />
            ))}
          </div>
        </section>

        {/* Ranking stats */}
        <section className="ds-rise" style={{ animationDelay: '80ms' }}>
          <SectionHeader label="Your Ranking" />
          <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {([['#12', 'var(--tint-orange-fg)', 'This week'], ['#9', 'var(--text)', 'Best ever'], ['Top 5%', 'var(--tint-teal-fg)', 'Cohort']] as const).map(([val, col, lbl], i) => (
              <div key={lbl} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h2)', color: col }}>{val}</div>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cohort leaderboard slice — you in context */}
        <section className="ds-rise" style={{ animationDelay: '160ms' }}>
          <SectionHeader
            label="Cohort Leaderboard"
            action={
              <button
                onClick={() => navigate('/home/winspeak/leaderboard')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'var(--fs-small)' }}
              >
                Full board <ArrowRight size={12} />
              </button>
            }
          />
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {cohort.map((r, i) => (
              <LeaderboardRow
                key={r.rank}
                rank={r.rank} name={r.name} sub={r.sub} score={r.score} delta={r.delta}
                highlight={!!r.you} divider={i < cohort.length - 1}
              />
            ))}
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={() => navigate('/home/winspeak/challenge')}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--w-r4)', border: 'none', cursor: 'pointer',
            background: 'var(--brand)', color: 'var(--brand-fg)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)',
            transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
            boxShadow: 'var(--shadow-card)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; }}
        >
          View Challenge History
        </button>
      </div>
    </div>
  );
}
