import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { allTopics, topicState, coursePct } from './winteachData';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Badge, StatusBadge, ProgressBar, Card, Btn, IconBtn } from './WinTeachUI';
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
    bg: W.collegePill, fg: W.brand,
    at: `${pending} topic${pending !== 1 ? 's' : ''} not started`,
    ad: 'Queued sub-topics with no artifacts yet', cta: 'Go to generation',
    act: () => navigate('/winteach/generation'),
  });

  const kpi = (path: string, bg: string, fg: string, icon: React.ReactNode, val: React.ReactNode, label: string, sub: string) => (
    <button key={path + label} className="wt-kpi" onClick={() => navigate(path)} style={{
      background: W.card, border: `1px solid ${W.border}`, borderRadius: W.r5,
      padding: 20, boxShadow: W.shadowCard, display: 'flex', flexDirection: 'column',
      gap: 12, textAlign: 'left', width: '100%', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: fg }}>
          <span style={{ width: 20, height: 20, display: 'flex' }}>{icon}</span>
        </div>
        <span style={{ color: W.text3, width: 16, height: 16, display: 'flex' }}><IArrow /></span>
      </div>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 30, lineHeight: 1 }}>{val}</div>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, color: W.text, marginTop: -4 }}>{label}</div>
      <div style={{ fontSize: 12, color: W.text3, marginTop: -6 }}>{sub}</div>
    </button>
  );

  const snapColor = (color: string, label: string, n: number) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 13, flex: '0 0 92px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
      </span>
      <div style={{ flex: 1 }}><ProgressBar value={pct(n)} color={color} /></div>
      <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text2, flex: '0 0 26px', textAlign: 'right' }}>{n}</span>
    </div>
  );

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
        <div style={{ fontSize: 14.5, color: W.text2, margin: '-2px 0 22px' }}>
          {greet}, {user?.name?.split(' ')[0] ?? 'there'} — here's where your content pipeline stands.
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
          {kpi('/winteach/courses', W.collegePill, W.brand, <INotes />, courses.length, 'Courses', `${activeCount} active · ${draftCount} draft`)}
          {kpi('/winteach/generation', W.greenBg, W.greenFg, <ICheck />, `${ready}/${total}`, 'Topics ready', `${overall}% generated`)}
          {kpi('/winteach/generation', W.orangeBg, W.orangeFg, <ISpark />, generating + pending, 'In the queue', `${generating} generating · ${pending} not started`)}
          {kpi('/winteach/institutes', W.infoBg, W.infoFg, <IFile />, institutes.length, 'Institutes', 'PO / PSO frameworks')}
        </div>

        {/* Two-col: attention + snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Needs attention */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17 }}>Needs attention</div>
              {items.length > 0 && <Badge variant="orange">{items.length}</Badge>}
            </div>
            {items.length ? items.slice(0, 4).map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px', borderTop: i > 0 ? `1px solid ${W.border}` : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flex: '0 0 38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: it.bg, color: it.fg }}>
                  <span style={{ width: 18, height: 18, display: 'flex' }}><ISpark /></span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>{it.at}</div>
                  <div style={{ fontSize: 12.5, color: W.text2, marginTop: 1 }}>{it.ad}</div>
                </div>
                <Btn sm onClick={it.act}>{it.cta}</Btn>
              </div>
            )) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flex: '0 0 38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: W.greenBg, color: W.greenFg }}>
                  <span style={{ width: 18, height: 18, display: 'flex' }}><ICheck /></span>
                </div>
                <div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>All caught up</div>
                  <div style={{ fontSize: 12.5, color: W.text2 }}>Every topic across your courses is generated and ready.</div>
                </div>
              </div>
            )}
          </Card>

          {/* Pipeline snapshot */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17 }}>Pipeline snapshot</div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              {/* Ring */}
              <div style={{
                width: 96, height: 96, borderRadius: '50%', flex: '0 0 96px',
                background: `conic-gradient(${W.brandBright} ${overall}%, ${W.surfaceMuted} 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: W.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <b style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 22, lineHeight: 1 }}>{overall}%</b>
                  <span style={{ fontSize: 10, color: W.text3, letterSpacing: '.04em', textTransform: 'uppercase' }}>Ready</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: W.text2, marginBottom: 8 }}>{ready} of {total} sub-topics fully generated</div>
                <div style={{ fontSize: 13.5, color: W.text2 }}>across {courses.length} courses · {activeCount} live for delivery</div>
              </div>
            </div>
            {snapColor(W.greenFg, 'Ready', ready)}
            {snapColor(W.infoFg, 'Generating', generating)}
            {snapColor(W.orangeFg, 'Not started', pending)}
          </Card>
        </div>

        {/* Recent courses */}
        <Card style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 8px 6px' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Recent courses</div>
            <Btn variant="ghost" sm onClick={() => navigate('/winteach/courses')}>
              View all <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IArrow /></span>
            </Btn>
          </div>
          <table className="wt-tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Course', 'Generation', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '0 16px 12px', borderBottom: `1px solid ${W.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 4).map(c => {
                const tt = allTopics(c);
                return (
                  <tr key={c.id} className="wt-row" onClick={() => navigate(`/winteach/courses/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: 16, borderBottom: `1px solid ${W.border}`, verticalAlign: 'middle' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>{c.code}</div>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: W.text2 }}>{c.institute || 'Winnify'} · {c.major || 'CSE'} · Sem {c.sem}</div>
                    </td>
                    <td style={{ padding: 16, borderBottom: `1px solid ${W.border}`, verticalAlign: 'middle', minWidth: 170 }}>
                      <div style={{ marginBottom: 8 }}><ProgressBar value={coursePct(c)} /></div>
                      <span style={{ fontSize: 12.5, color: W.text2 }}>{tt.filter(x => topicState(x.topic) === 'ready').length}/{tt.length} topics ready</span>
                    </td>
                    <td style={{ padding: 16, borderBottom: `1px solid ${W.border}`, verticalAlign: 'middle' }}>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </WinContent>
    </>
  );
}
