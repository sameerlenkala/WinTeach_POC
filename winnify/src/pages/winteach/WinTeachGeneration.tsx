import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { useCourses, useUnits } from '@/api/hooks';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { TopicBadge, XpBar, Card, Btn, IconBtn } from './WinTeachUI';
import { IBell, ISpark, ICheck, INotes } from './WinTeachIcons';
import { allTopics, topicState, topicPct, newArtifacts } from './winteachData';
import type { Topic } from './winteachData';

// One loader per course — renders null, just loads units via hook
function CourseRowLoader({ course, onRows }: { course: any; onRows: (courseId: string, rows: any[]) => void }) {
  const { data: units = [] } = useUnits(course?.id ?? '');
  const rows = units.flatMap((u: any) =>
    (u.topics ?? []).map((t: any) => ({
      c: { id: course.id, code: course.code, name: course.name },
      u: { n: u.unit_number, title: u.title },
      t: {
        id: t.id,
        name: t.title ?? t.name,
        subs: (t.subtopics ?? []).map((s: any) => s.title ?? s),
        co: { text: '', bloom: t.bloom_level ?? '' },
        artifacts: newArtifacts(),
        _unit: u,
      } as Topic,
    }))
  );
  useEffect(() => { onRows(course.id, rows); }, [JSON.stringify(rows.map(r => r.t.id))]);
  return null;
}

function AllCoursesLoader({ onRows }: { onRows: (courseId: string, rows: any[]) => void }) {
  const { data: apiCourses = [] } = useCourses();
  return <>{apiCourses.map(c => <CourseRowLoader key={c.id} course={c} onRows={onRows} />)}</>;
}

function IChevronSvg() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}

// Tracks active jobs: topicId → jobId
const activeJobs: Record<string, string> = {};

export default function WinTeachGeneration() {
  const navigate = useNavigate();
  const { courses, setCurrentCourse, setCurrentTopic, runTopicFlow } = useWinTeach();
  const [, forceUpdate] = useState(0);
  const [dbRowMap, setDbRowMap] = useState<Record<string, any[]>>({});

  const handleRows = (courseId: string, rows: any[]) => {
    setDbRowMap(prev => ({ ...prev, [courseId]: rows }));
  };

  const dbRows = Object.values(dbRowMap).flat();
  // Local context rows fill in courses not yet in DB
  const dbCourseIds = new Set(dbRows.map((r: any) => r.c.id));
  const localRows = courses.flatMap(c => allTopics(c).map(x => ({ c, u: x.unit, t: x.topic })));
  const rows = [...dbRows, ...localRows.filter(r => !dbCourseIds.has((r.c as any).id))];

  const ready = rows.filter(r => topicState(r.t) === 'ready').length;
  const generating = rows.filter(r => topicState(r.t) === 'generating').length;
  const pend = rows.length - ready;
  const notStarted = pend - generating;

  // This board is a lightweight overview + preview animation. Real generation
  // (per-unit review, approvals, fan-out) runs in the topic's Generation Studio.
  const generateTopic = (courseId: string | undefined, t: Topic) => {
    if (courseId) { navigate(`/winteach/courses/${courseId}/topic/${t.id}/generate`); return; }
    runTopicFlow(t, () => forceUpdate(n => n + 1));
  };

  const generateAll = () => {
    rows.forEach((r, i) => {
      if (topicState(r.t) !== 'ready') {
        setTimeout(() => generateTopic(r.c.id, r.t), i * 300);
      }
    });
  };

  // Group by course
  const byCourse: Record<string, { c: any; rows: typeof rows }> = {};
  rows.forEach(r => {
    const key = r.c.id || r.c.code;
    if (!byCourse[key]) byCourse[key] = { c: r.c, rows: [] };
    byCourse[key].rows.push(r);
  });
  const groups = Object.values(byCourse);

  // Always render the loader so hooks fire regardless of rows.length
  const loader = <AllCoursesLoader onRows={handleRows} />;

  if (!rows.length) {
    return (
      <>
        {loader}
        <WinTopbar title="Content Generation" actions={<IconBtn><IBell /></IconBtn>} />
        <WinContent>
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: W.text2 }}>
              <div style={{ width: 44, height: 44, color: W.text3, margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <ISpark />
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Loading topics…</div>
              <div style={{ fontSize: 15, color: W.text2 }}>Fetching courses from the database.</div>
            </div>
          </Card>
        </WinContent>
      </>
    );
  }

  const stat = (icoBg: string, icoFg: string, icon: React.ReactNode, val: number | string, label: string, delay: number) => (
    <div key={label} className="ds-rise" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10,
      padding: '14px 16px', animationDelay: `${delay}ms`,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: icoBg, color: icoFg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ width: 19, height: 19, display: 'flex' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, color: W.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
        <div style={{ fontSize: 12, color: W.text2 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <>
      <WinTopbar title="Content Generation" actions={
        <>
          <IconBtn><IBell /></IconBtn>
          {pend > 0 && (
            <Btn variant="primary" onClick={generateAll}>
              <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
              Generate all pending
            </Btn>
          )}
        </>
      } />
      {loader}
      <WinContent>

        {/* ── Summary strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          {stat('var(--tint-brand-bg)', 'var(--tint-brand-fg)', <INotes />, rows.length, `Topics across ${groups.length} course${groups.length !== 1 ? 's' : ''}`, 0)}
          {stat('var(--status-green-bg)', 'var(--status-green)', <ICheck />, ready, 'Ready', 60)}
          {stat('var(--status-info-bg)', 'var(--status-info)', <ISpark />, generating, 'Generating now', 120)}
          {stat('var(--tint-orange-bg)', 'var(--tint-orange-fg)', <IChevronSvg />, notStarted, 'Not started', 180)}
        </div>

        {/* ── Per-course boards ── */}
        {groups.map((g, gi) => {
          const gReady = g.rows.filter(r => topicState(r.t) === 'ready').length;
          const gPct = g.rows.length ? Math.round(gReady / g.rows.length * 100) : 0;
          return (
            <div key={g.c.id || g.c.code} className="ds-rise" style={{
              background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 12,
              boxShadow: W.shadowCard, overflow: 'hidden', marginBottom: 16,
              animationDelay: `${240 + gi * 60}ms`,
            }}>
              {/* course header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', background: W.surfaceMuted, borderBottom: `1px solid ${W.border}`, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: W.brandTintFg, marginBottom: 2 }}>{g.c.code}</div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color: W.text }}>{g.c.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
                  <div style={{ width: 130 }}><XpBar value={gPct} /></div>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.text2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {gReady}/{g.rows.length} ready
                  </span>
                </div>
              </div>

              {/* topic rows */}
              {g.rows.map((r, i) => {
                const isLast = i === g.rows.length - 1;
                const isGenerating = topicState(r.t) === 'generating' || !!activeJobs[r.t.id];
                return (
                  <div
                    key={r.t.id}
                    onClick={() => {
                      r.t._unit = r.u;
                      if (r.c.units) { setCurrentCourse(r.c); setCurrentTopic(r.t); }
                      navigate(`/winteach/courses/${r.c.id || r.c.code}/topic/${r.t.id}`);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px',
                      borderBottom: isLast ? 'none' : `1px solid ${W.border}`,
                      cursor: 'pointer', transition: 'background .12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text }}>{(r.t as any).name ?? (r.t as any).title}</div>
                      <div style={{ fontSize: 12, color: W.text2, marginTop: 2 }}>Unit {r.u.n ?? r.u.unit_number} · {(r.t.subs ?? []).length} subtopics</div>
                    </div>
                    <div style={{ width: 120, flex: '0 0 auto' }} className="max-md:hidden">
                      <XpBar value={topicPct(r.t)} />
                    </div>
                    <TopicBadge topic={r.t} />
                    {/* Only the Generate button swallows the click — the chevron and
                        Running… states should still open the topic via the row. */}
                    <div style={{ flex: '0 0 auto', minWidth: 96, display: 'flex', justifyContent: 'flex-end' }}
                      onClick={e => { if (topicState(r.t) === 'pending' && !activeJobs[r.t.id]) e.stopPropagation(); }}>
                      {topicState(r.t) === 'pending' && !activeJobs[r.t.id] ? (
                        <Btn sm variant="primary" onClick={() => generateTopic(r.c.id, r.t)}>
                          <span style={{ width: 14, height: 14, display: 'inline-flex' }}><ISpark /></span>Generate
                        </Btn>
                      ) : isGenerating ? (
                        <span style={{ fontSize: 12, color: W.brandTintFg, fontFamily: W.fontDisplay, fontWeight: 600 }}>Running…</span>
                      ) : (
                        <span style={{ width: 18, height: 18, display: 'inline-flex', color: W.text3 }}><IChevronSvg /></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </WinContent>
    </>
  );
}
