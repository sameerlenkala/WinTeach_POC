import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Badge, StatusBadge, XpBar, Card, Btn } from './WinTeachUI';
import { IPlus, IArrow, ISpark, ICheck, INotes, IFile } from './WinTeachIcons';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/api/hooks';
import type { DashboardSummary } from '@/api/generation';

export default function WinTeachDashboard() {
  const navigate = useNavigate();
  const { courses, coursesLoading } = useWinTeach();
  const { user } = useAuth();
  const { data: d, isLoading: dashLoading } = useDashboard();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (coursesLoading || (dashLoading && !d)) {
    return (
      <>
        <WinTopbar title="Dashboard" />
        <WinContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: W.text3, fontFamily: W.fontDisplay, fontSize: 15 }}>
            Loading…
          </div>
        </WinContent>
      </>
    );
  }

  if (!courses.length) {
    return (
      <>
        <WinTopbar title="Dashboard" actions={
          <>
            <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
              <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
              Create new course
            </Btn>
          </>
        } />
        <WinContent>
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: W.text2 }}>
              <div style={{ width: 48, height: 48, color: W.text3, margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Welcome to WinTeach</div>
              <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>Upload a syllabus to generate your first course plan.</div>
              <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
                <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
                Create new course
              </Btn>
            </div>
          </Card>
        </WinContent>
      </>
    );
  }

  // Real aggregates (fall back to zeros while the first fetch lands).
  const sum: DashboardSummary = d ?? {
    courses: { total: courses.length, active: 0, draft: 0 },
    topics: { total: 0, complete: 0, in_progress: 0, not_started: 0 },
    artifacts: { ready: 0, total: 0, pct: 0 },
    pending_approval: 0, running: 0, failed: 0, cost_usd: 0,
    targets: { failed: null, approval: null, draft: null },
    students: { published_lessons: 0, learners: 0, lessons_read: 0, quiz_attempts: 0, avg_quiz_pct: 0 },
    recent_courses: [],
  };
  const overall = sum.artifacts.pct;
  const st = sum.students;

  // Needs attention — real signals, most-actionable first. Retry + approve both
  // live in the topic studio, so those deep-link straight to the topic.
  const tgt = sum.targets;
  const topicPath = (t: { course_id: string; topic_id: string } | null) =>
    t ? `/winteach/courses/${t.course_id}/topic/${t.topic_id}` : '/winteach/generation';
  const items: Array<{ at: string; ad: string; cta: string; act: () => void; tone: 'orange' | 'info' | 'brand' | 'red' }> = [];
  if (sum.failed > 0) items.push({
    tone: 'red', at: `${sum.failed} topic${sum.failed !== 1 ? 's' : ''} failed to generate`,
    ad: 'A plan or artifact errored — open the topic to retry', cta: 'Fix now',
    act: () => navigate(topicPath(tgt.failed)),
  });
  if (sum.pending_approval > 0) items.push({
    tone: 'orange', at: `${sum.pending_approval} artifact${sum.pending_approval !== 1 ? 's' : ''} awaiting approval`,
    ad: 'Generated but not published — students can’t see these until you approve',
    cta: 'Review', act: () => navigate(topicPath(tgt.approval)),
  });
  if (sum.running > 0) items.push({
    tone: 'info', at: `${sum.running} topic${sum.running !== 1 ? 's' : ''} generating now`,
    ad: 'Live jobs in progress across your courses', cta: 'View jobs',
    act: () => navigate('/winteach/generation'),
  });
  if (sum.courses.draft > 0) items.push({
    tone: 'brand', at: `${sum.courses.draft} course${sum.courses.draft !== 1 ? 's' : ''} in draft`,
    ad: 'Publish once their topics are generated and approved', cta: 'Open course',
    act: () => navigate(tgt.draft ? `/winteach/courses/${tgt.draft.course_id}` : '/winteach/courses'),
  });

  const kpi = (path: string, icoBg: string, icoFg: string, icon: React.ReactNode, val: React.ReactNode, label: string, sub: string, barPct?: number) => (
    <button key={path + label} onClick={() => navigate(path)} style={{
      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '15px 16px',
      cursor: 'pointer', transition: '.15s', font: 'inherit', color: 'inherit',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--brand)'; el.style.boxShadow = '0 6px 18px rgba(30,30,60,.07)'; el.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = ''; el.style.transform = ''; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: icoBg, color: icoFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 19, height: 19, display: 'flex' }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 20, color: W.text, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: W.text, marginTop: 1 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: W.text3, marginTop: 1 }}>{sub}</div>
        {barPct != null && <div style={{ marginTop: 6 }}><XpBar value={barPct} /></div>}
      </div>
    </button>
  );

  const snapColor = (color: string, label: string, n: number) => {
    const t = sum.topics.total || 1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: '.82rem', color: 'var(--text-2)', flex: 1 }}>{label}</span>
        <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
        <div style={{ width: 60, height: 5, borderRadius: 99, background: 'var(--score-track)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${Math.round(n / t * 100)}%`, background: color, borderRadius: 99 }} />
        </div>
      </div>
    );
  };

  const engStat = (val: React.ReactNode, label: string) => (
    <div>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 19, color: W.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
      <div style={{ fontSize: 11, color: W.text3, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <>
      <WinTopbar title="Dashboard" actions={
        <>
          <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
            Create new course
          </Btn>
        </>
      } />
      <WinContent>

        {/* ── Page header ── */}
        <div className="ds-rise" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', margin: '4px 0 22px' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 20, color: W.text, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
              {greet}, {user?.name?.split(' ')[0] ?? 'there'}
            </div>
            <div style={{ fontSize: 13.5, color: W.text2, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {sum.artifacts.ready} of {sum.artifacts.total} artifacts generated across {sum.courses.total} course{sum.courses.total !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto', background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10, padding: '10px 16px', boxShadow: W.shadowCard }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(var(--brand) ${overall}%, var(--score-track) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card)' }} />
            </div>
            <div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color: W.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{overall}%</div>
              <div style={{ fontSize: 11.5, color: W.text2 }}>Artifacts generated</div>
            </div>
          </div>
        </div>

        {/* ── KPI hcards ── */}
        <div className="ds-rise" style={{ marginBottom: 6, animationDelay: '60ms' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: W.text3, marginBottom: 10 }}>Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            {kpi('/winteach/courses', 'var(--tint-brand-bg)', 'var(--brand)', <INotes />, sum.courses.total, 'Courses', `${sum.courses.active} active · ${sum.courses.draft} draft`, sum.courses.total ? Math.round(sum.courses.active / sum.courses.total * 100) : 0)}
            {kpi('/winteach/generation', 'var(--status-green-bg)', 'var(--status-green)', <ICheck />, `${overall}%`, 'Artifacts generated', `${sum.artifacts.ready} of ${sum.artifacts.total} · ${sum.topics.complete} topics done`, overall)}
            {kpi(topicPath(tgt.approval), 'var(--tint-orange-bg)', 'var(--tint-orange-fg)', <ISpark />, sum.pending_approval, 'Awaiting approval', sum.running > 0 ? `${sum.running} generating now` : 'Approve to publish to students', undefined)}
            {kpi('/winteach/courses', 'var(--tint-blue-bg)', 'var(--tint-blue-fg)', <IFile />, `$${sum.cost_usd.toFixed(2)}`, 'Generation spend', `across ${sum.courses.total} course${sum.courses.total !== 1 ? 's' : ''}`, undefined)}
          </div>
        </div>

        {/* ── Two-col: attention + snapshot ── */}
        <div className="ds-rise" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, margin: '16px 0', animationDelay: '120ms' }}>

          {/* Needs attention */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 4 }}>Action required</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Needs attention</div>
              {items.length > 0 && <Badge variant="orange">{items.length}</Badge>}
            </div>
            <div style={{ display: 'grid', gap: 11 }}>
              {items.length ? items.slice(0, 4).map((it, i) => {
                const toneMap = { orange: ['var(--tint-orange-bg)', 'var(--tint-orange-fg)'], info: [W.infoBg, W.infoFg], brand: ['var(--tint-brand-bg)', 'var(--brand)'], red: [W.redBg, W.redFg] } as const;
                const [bg, fg] = toneMap[it.tone];
                return (
                  <button key={i} onClick={it.act} style={{
                    display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%',
                    background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                    cursor: 'pointer', transition: '.15s', font: 'inherit', color: 'inherit',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--brand)'; el.style.boxShadow = '0 6px 18px color-mix(in oklab, var(--brand) 12%, transparent)'; el.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = ''; el.style.transform = ''; }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, background: bg, color: fg, fontWeight: 700, flexShrink: 0, fontSize: 14 }}>!</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '.98rem', fontFamily: W.fontDisplay }}>{it.at}</b>
                      <small style={{ display: 'block', color: 'var(--text-2)', fontSize: '.8rem', marginTop: 2 }}>{it.ad}</small>
                    </div>
                    <span style={{ color: 'var(--brand)', fontWeight: 700, flexShrink: 0, fontSize: 13 }}>{it.cta} →</span>
                  </button>
                );
              }) : (
                <button style={{ display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%', background: 'var(--status-green-bg)', border: '1.5px solid color-mix(in oklab, var(--status-green) 30%, transparent)', borderRadius: 10, padding: '14px 16px', cursor: 'default', font: 'inherit', color: 'inherit' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--status-green)', color: '#fff', fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <div>
                    <b style={{ fontSize: '.98rem', fontFamily: W.fontDisplay }}>All caught up</b>
                    <small style={{ display: 'block', color: 'var(--text-2)', fontSize: '.8rem', marginTop: 2 }}>Nothing failed, pending approval, or running right now.</small>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Pipeline snapshot */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 4 }}>Progress</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Pipeline snapshot</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(var(--brand) ${overall}%, var(--score-track) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <b style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 20, lineHeight: 1, color: 'var(--brand)' }}>{overall}%</b>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Artifacts</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginBottom: 4 }}>{sum.artifacts.ready} of {sum.artifacts.total} artifacts</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>{sum.courses.total} courses · {sum.courses.active} live</div>
              </div>
            </div>
            {snapColor('var(--status-green)', 'Topics complete', sum.topics.complete)}
            {snapColor('var(--brand)', 'In progress', sum.topics.in_progress)}
            {snapColor('var(--status-orange)', 'Not started', sum.topics.not_started)}
          </div>
        </div>

        {/* ── Student engagement (real, from published content) ── */}
        <div className="ds-rise" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 32px', boxShadow: 'var(--shadow-card)', marginBottom: 16, animationDelay: '150ms' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 3 }}>Reach</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Student engagement</div>
            </div>
            {st.published_lessons === 0 && <span style={{ marginLeft: 'auto', fontSize: 12, color: W.text3 }}>Approve lessons to publish them to students</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20 }}>
            {engStat(st.published_lessons, 'Lessons published')}
            {engStat(st.learners, 'Active learners')}
            {engStat(st.lessons_read, 'Lessons read')}
            {engStat(st.quiz_attempts, 'Quiz attempts')}
            {engStat(st.quiz_attempts > 0 ? `${st.avg_quiz_pct}%` : '—', 'Avg quiz score')}
          </div>
        </div>

        {/* ── Recent courses ── */}
        <div className="ds-rise" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-card)', overflow: 'hidden', animationDelay: '180ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 0' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 3 }}>Content</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Recent courses</div>
            </div>
            <Btn variant="ghost" sm onClick={() => navigate('/winteach/courses')}>
              View all <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IArrow /></span>
            </Btn>
          </div>
          <table className="wt-tbl" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                {['Course', 'Generation', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0 24px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sum.recent_courses.slice(0, 4).map(c => (
                <tr key={c.id} onClick={() => navigate(`/winteach/courses/${c.id}`)} style={{ cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--brand)', marginBottom: 2 }}>{c.code}</div>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '.98rem', color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginTop: 1 }}>{c.semester ? `Sem ${c.semester}` : '—'}</div>
                  </td>
                  <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', minWidth: 170 }}>
                    <div style={{ marginBottom: 6 }}><XpBar value={c.pct} /></div>
                    <span title={`${c.artifact_ready}/${c.artifact_total} artifacts generated`} style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                      {c.topics_complete}/{c.topics_total} topics · {c.pct}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                    <StatusBadge status={c.status ?? 'draft'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WinContent>
    </>
  );
}
