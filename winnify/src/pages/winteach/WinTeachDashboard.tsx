import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { allTopics, topicState, coursePct } from './winteachData';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Badge, StatusBadge, XpBar, Card, Btn, IconBtn } from './WinTeachUI';
import { IBell, IPlus, IArrow, ISpark, ICheck, INotes, IFile } from './WinTeachIcons';
import { useAuth } from '@/contexts/AuthContext';

export default function WinTeachDashboard() {
  const navigate = useNavigate();
  const { courses, institutes, coursesLoading } = useWinTeach();
  const { user } = useAuth();

  const ts = courses.flatMap(allTopics);
  const total = ts.length;
  const ready = ts.filter(x => topicState(x.topic) === 'ready').length;
  const generating = ts.filter(x => topicState(x.topic) === 'generating').length;
  const pending = ts.filter(x => topicState(x.topic) === 'pending').length;
  const activeCount = courses.filter(c => c.status === 'active').length;
  const draftCount = courses.filter(c => c.status === 'draft').length;
  const overall = total ? Math.round(ready / total * 100) : 0;
  const pct = (n: number) => total ? Math.round(n / total * 100) : 0;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (coursesLoading) {
    return (
      <>
        <WinTopbar title="Dashboard" actions={<IconBtn><IBell /></IconBtn>} />
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
            <IconBtn><IBell /></IconBtn>
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

  // Needs attention items
  const items: Array<{ bg: string; fg: string; at: string; ad: string; cta: string; act: () => void }> = [];
  courses.filter(c => c.status === 'draft').forEach(c => {
    const left = allTopics(c).filter(x => topicState(x.topic) !== 'ready').length;
    items.push({
      bg: W.orangeBg, fg: W.orangeFg,
      at: `${c.code} · ${c.name} is in draft`,
      ad: `${left} topic${left !== 1 ? 's' : ''} still need generation before it can go active`,
      cta: 'Open course', act: () => navigate(`/winteach/courses/${encodeURIComponent(c.code)}`),
    });
  });
  if (generating > 0) items.push({
    bg: W.infoBg, fg: W.infoFg,
    at: `${generating} topic${generating !== 1 ? 's' : ''} generating now`,
    ad: 'Live jobs in progress across your courses', cta: 'View jobs',
    act: () => navigate('/winteach/generation'),
  });
  if (pending > 0) items.push({
    bg: 'var(--tint-brand-bg)', fg: 'var(--brand)',
    at: `${pending} topic${pending !== 1 ? 's' : ''} not started`,
    ad: 'Queued sub-topics with no artifacts yet', cta: 'Go to generation',
    act: () => navigate('/winteach/generation'),
  });

  // CE hcard exact: border 1px var(--border), radius 14px, padding 15px 16px
  // hover: brand border, 0 6px 18px rgba(30,30,60,.07), translateY(-1px)
  const kpi = (path: string, icoBg: string, icoFg: string, icon: React.ReactNode, val: React.ReactNode, label: string, sub: string, barPct?: number) => (
    <button key={path + label} onClick={() => navigate(path)} style={{
      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '15px 16px', cursor: 'pointer', transition: '.15s',
      font: 'inherit', color: 'inherit', width: '100%',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--brand)'; el.style.boxShadow = '0 6px 18px rgba(30,30,60,.07)'; el.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = ''; el.style.transform = ''; }}
    >
      {/* ce-hcard__ico exact */}
      <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 8, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: icoFg, fontSize: '1.4rem' }}>
        <span style={{ width: 22, height: 22, display: 'flex' }}>{icon}</span>
      </div>
      {/* ce-hcard__body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '.94rem', color: 'var(--text)' }}>{label}</div>
        <span style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-2)', margin: '3px 0 9px', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginRight: 6 }}>{val}</span>
          {sub}
        </span>
        {/* ce-hcard__bar */}
        <XpBar value={barPct ?? 0} />
      </div>
      <span style={{ flex: 'none', color: 'var(--text-2)', fontSize: '1.1rem', alignSelf: 'center', width: 16, height: 16, display: 'flex' }}><IArrow /></span>
    </button>
  );

  const snapColor = (color: string, label: string, n: number) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 13, flex: '0 0 96px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
        {label}
      </span>
      <div style={{ flex: 1 }}><XpBar value={pct(n)} color={color} /></div>
      <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text2, flex: '0 0 26px', textAlign: 'right' }}>{n}</span>
    </div>
  );

  return (
    <>
      <WinTopbar title="Dashboard" actions={
        <>
          <IconBtn><IBell /></IconBtn>
          {/* ce-btn--big exact */}
          <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
            Create new course
          </Btn>
        </>
      } />
      <WinContent>

        {/* ── Page header ── */}
        <div className="ds-rise" style={{
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          margin: '4px 0 22px',
        }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 20, color: W.text, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
              {greet}, {user?.name?.split(' ')[0] ?? 'there'}
            </div>
            <div style={{ fontSize: 13.5, color: W.text2, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {ready} of {total} topics generated across {courses.length} course{courses.length !== 1 ? 's' : ''}
            </div>
          </div>
          {/* Overall readiness */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto', background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10, padding: '10px 16px', boxShadow: W.shadowCard }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(var(--brand) ${overall}%, var(--score-track) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card)' }} />
            </div>
            <div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color: W.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{overall}%</div>
              <div style={{ fontSize: 11.5, color: W.text2 }}>Pipeline ready</div>
            </div>
          </div>
        </div>

        {/* ── KPI hcards ── */}
        <div className="ds-rise" style={{ marginBottom: 6, animationDelay: '60ms' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: W.text3, marginBottom: 10 }}>Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            {/* ce-hcard__ico: bg var(--tint-brand-bg), color var(--brand) — default; done: bg var(--status-green-bg), color var(--status-green) */}
            {kpi('/winteach/courses',    'var(--tint-brand-bg)', 'var(--brand)', <INotes />, courses.length,      'Courses',      `${activeCount} active · ${draftCount} draft`,          Math.min(activeCount / Math.max(courses.length, 1) * 100, 100))}
            {kpi('/winteach/generation', 'var(--status-green-bg)', 'var(--status-green)', <ICheck />, `${ready}/${total}`, 'Topics ready', `${overall}% generated`,                              overall)}
            {kpi('/winteach/generation', 'var(--tint-orange-bg)', 'var(--tint-orange-fg)', <ISpark />, generating + pending, 'In the queue', `${generating} generating · ${pending} not started`, pct(generating))}
            {kpi('/winteach/institutes', 'var(--tint-blue-bg)', 'var(--tint-blue-fg)', <IFile />,  institutes.length,   'Institutes',   'PO / PSO frameworks',                               Math.min(institutes.length * 25, 100))}
          </div>
        </div>

        {/* ── Two-col: attention + snapshot ── */}
        <div className="ds-rise" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, margin: '16px 0', animationDelay: '120ms' }}>

          {/* Needs attention — ce-card + ce-topic rows */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 4 }}>Action required</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Needs attention</div>
              {items.length > 0 && <Badge variant="orange">{items.length}</Badge>}
            </div>
            <div style={{ display: 'grid', gap: 11 }}>
              {items.length ? items.slice(0, 4).map((it, i) => (
                /* ce-topic exact: 1.5px border, 14px radius, hover brand border + color-mix(in oklab, var(--brand) 12%, transparent) shadow */
                <button key={i} onClick={it.act} style={{
                  display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%',
                  background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                  cursor: 'pointer', transition: '.15s', font: 'inherit', color: 'inherit',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--brand)'; el.style.boxShadow = '0 6px 18px color-mix(in oklab, var(--brand) 12%, transparent)'; el.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = ''; el.style.transform = ''; }}
                >
                  {/* ce-topic__num circle (brand2 teal) */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-2)', color: '#fff', fontWeight: 700, flexShrink: 0, fontSize: 14 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '.98rem', fontFamily: W.fontDisplay }}>{it.at}</b>
                    <small style={{ display: 'block', color: 'var(--text-2)', fontSize: '.8rem', marginTop: 2 }}>{it.ad}</small>
                  </div>
                  <span style={{ color: 'var(--brand)', fontWeight: 700, flexShrink: 0, fontSize: 13 }}>{it.cta} →</span>
                </button>
              )) : (
                <button style={{ display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%', background: 'var(--status-green-bg)', border: '1.5px solid color-mix(in oklab, var(--status-green) 30%, transparent)', borderRadius: 10, padding: '14px 16px', cursor: 'default', font: 'inherit', color: 'inherit' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--status-green)', color: '#fff', fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <div>
                    <b style={{ fontSize: '.98rem', fontFamily: W.fontDisplay }}>All caught up</b>
                    <small style={{ display: 'block', color: 'var(--text-2)', fontSize: '.8rem', marginTop: 2 }}>Every topic across your courses is generated and ready.</small>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Pipeline snapshot — ce-card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 4 }}>Progress</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Pipeline snapshot</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(var(--brand) ${overall}%, var(--score-track) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <b style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 20, lineHeight: 1, color: 'var(--brand)' }}>{overall}%</b>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '.04em', textTransform: 'uppercase' }}>Ready</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginBottom: 4 }}>{ready} of {total} topics ready</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>{courses.length} courses · {activeCount} live</div>
              </div>
            </div>
            {snapColor('var(--brand-2)', 'Ready', ready)}
            {snapColor('var(--brand)', 'Generating', generating)}
            {snapColor('var(--status-orange)', 'Not started', pending)}
          </div>
        </div>

        {/* ── Recent courses (ce-card + table) ── */}
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
              {courses.slice(0, 4).map(c => {
                const tt = allTopics(c);
                const cpct = coursePct(c);
                return (
                  <tr key={c.id} onClick={() => navigate(`/winteach/courses/${c.id}`)} style={{ cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--brand)', marginBottom: 2 }}>{c.code}</div>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '.98rem', color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginTop: 1 }}>{c.institute || 'Winnify'} · Sem {c.sem}</div>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', minWidth: 170 }}>
                      <div style={{ marginBottom: 6 }}><XpBar value={cpct} /></div>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>{tt.filter(x => topicState(x.topic) === 'ready').length}/{tt.length} topics · {cpct}%</span>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WinContent>
    </>
  );
}
