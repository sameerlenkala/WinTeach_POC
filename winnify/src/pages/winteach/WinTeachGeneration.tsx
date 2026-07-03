import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { useCourses, useUnits } from '@/api/hooks';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { TopicBadge, XpBar, Card, Btn, IconBtn, DeltaBanner } from './WinTeachUI';
import { IBell, ISpark } from './WinTeachIcons';
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
  const pend = rows.filter(r => topicState(r.t) !== 'ready').length;

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

  // Group by course for better UX when many courses exist
  const byCourse: Record<string, typeof rows> = {};
  rows.forEach(r => {
    const key = r.c.id || r.c.code;
    if (!byCourse[key]) byCourse[key] = [];
    byCourse[key].push(r);
  });

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
        <DeltaBanner>
          Topics from finalized course plans land here. Each topic runs one flow — Teacher Notes first, then Pre-Assessment, Quiz &amp; Flash Cards in parallel.{' '}
          <b>{pend} topic{pend !== 1 ? 's' : ''} pending</b> across {courses.length} course{courses.length !== 1 ? 's' : ''}.
        </DeltaBanner>

        {/* ce-card full-bleed table */}
        <div style={{ background: '#fff', border: '1px solid #e9eaf2', borderRadius: 18, boxShadow: '0 2px 10px rgba(28,32,48,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '22px 28px 0' }}>
            <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.14em', color: '#5b4bff', marginBottom: 3 }}>Generation</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1c2030' }}>
              All topics <span style={{ fontSize: '.92rem', fontWeight: 500, color: '#6b7080', marginLeft: 6 }}>{pend} pending</span>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                {['Topic', 'Course', 'Status', 'Progress', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(28,32,48,.45)', padding: '0 24px 12px', borderBottom: '1px solid #e9eaf2' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isLast = i === rows.length - 1;
                const isGenerating = topicState(r.t) === 'generating' || !!activeJobs[r.t.id];
                return (
                  <tr
                    key={r.t.id}
                    className="wt-row"
                    onClick={() => {
                      r.t._unit = r.u;
                      if (r.c.units) { setCurrentCourse(r.c); setCurrentTopic(r.t); }
                      navigate(`/winteach/courses/${r.c.id || r.c.code}/topic/${r.t.id}`);
                    }}
                    style={{ cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f4ff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid #e9eaf2', verticalAlign: 'middle' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '.98rem', color: '#1c2030' }}>{(r.t as any).name ?? (r.t as any).title}</div>
                      <div style={{ fontSize: '.8rem', color: '#6b7080', marginTop: 2 }}>Unit {r.u.n ?? r.u.unit_number} · {(r.t.subs ?? []).length} subtopics</div>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid #e9eaf2', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5b4bff', marginBottom: 2 }}>{r.c.code}</div>
                      <div style={{ fontSize: '.8rem', color: '#6b7080' }}>{r.c.name}</div>
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid #e9eaf2', verticalAlign: 'middle' }}>
                      <TopicBadge topic={r.t} />
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid #e9eaf2', verticalAlign: 'middle', minWidth: 150 }}>
                      <XpBar value={topicPct(r.t)} />
                    </td>
                    <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid #e9eaf2', verticalAlign: 'middle', textAlign: 'right' }}>
                      {topicState(r.t) === 'pending' && !activeJobs[r.t.id] ? (
                        <Btn sm variant="primary" onClick={() => generateTopic(r.c.id, r.t)}>
                          <span style={{ width: 14, height: 14, display: 'inline-flex' }}><ISpark /></span>Generate
                        </Btn>
                      ) : isGenerating ? (
                        <span style={{ fontSize: 12, color: '#5b4bff', fontFamily: W.fontDisplay, fontWeight: 600 }}>Running…</span>
                      ) : (
                        <span style={{ width: 18, height: 18, display: 'inline-flex', color: 'rgba(28,32,48,.45)' }}><IChevronSvg /></span>
                      )}
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
