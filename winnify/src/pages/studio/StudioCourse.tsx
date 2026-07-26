// Student Studio course page — the course's units and topics as a vertical
// roadmap. Tapping a topic hands off to the existing student reader flow
// (/home/courses/…), which owns notes/slides/quiz rendering.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { studentApi, track, type StudentCourseDetail } from '@/api/student';
import StudioError from './StudioError';
import { useStudioTitle } from './useStudioTitle';

export default function StudioCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [error, setError] = useState('');
  useStudioTitle(course?.name);

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!id) return;
    setError('');
    studentApi.course(id).then(setCourse).catch(() => setError('Could not load this course.'));
    track('studio_course_viewed', { course_id: id });
  }, [id, reloadKey]);

  // topic_id -> lessons viewed / completed (same interpretation as /home/courses/:id).
  const progressByTopic = useMemo(() => {
    const out: Record<string, { viewed: number; completed: number }> = {};
    for (const p of course?.progress ?? []) {
      const slot = (out[p.topic_id] ??= { viewed: 0, completed: 0 });
      if (p.artifact_type === 'student_notes') {
        slot.viewed += 1;
        if (p.status === 'completed') slot.completed += 1;
      }
    }
    return out;
  }, [course]);

  // Only topics with at least one approved (published) lesson are shown; units
  // whose topics are all unpublished disappear with them.
  const visibleUnits = useMemo(
    () => (course?.units ?? [])
      .map(u => ({ ...u, topics: u.topics.filter(t => t.published_lessons > 0) }))
      .filter(u => u.topics.length > 0),
    [course],
  );

  const overall = useMemo(() => {
    let total = 0, read = 0;
    for (const u of course?.units ?? []) {
      for (const t of u.topics) {
        total += t.published_lessons;
        read += Math.min(progressByTopic[t.id]?.viewed ?? 0, t.published_lessons);
      }
    }
    return { total, read, pct: total > 0 ? Math.round((read / total) * 100) : 0 };
  }, [course, progressByTopic]);

  return (
    <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header: back + course identity */}
      <div className="st-rise" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/study')} className="st-press" aria-label="Back to courses"
          style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={19} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '700 19px/1.2 var(--st-display)', letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {course?.name ?? '…'}
          </div>
          <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>
            {[course?.code, course?.semester && /^\d+$/.test(course.semester) ? `Sem ${course.semester}` : course?.semester]
              .filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {error && <StudioError message={error} onRetry={() => setReloadKey(k => k + 1)} />}

      {!course && !error && (
        <>
          <div className="st-skeleton" style={{ height: 84 }} />
          <div className="st-skeleton" style={{ height: 220 }} />
        </>
      )}

      {/* Progress hero — taps through to the Mastery Map */}
      {course && overall.total > 0 && (
        <button
          onClick={() => navigate(`/study/courses/${id}/mastery`)}
          className="st-card st-press st-rise st-d1"
          style={{ padding: '16px 18px', textAlign: 'left', width: '100%', color: 'var(--st-text)' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span className="st-eyebrow">Your progress</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '700 14px var(--st-display)', color: 'var(--st-lime)' }}>
              {overall.pct}% <ChevronRight size={14} color="var(--st-text-3)" />
            </span>
          </div>
          <div className="st-bar" style={{ marginTop: 10 }}>
            <i style={{ width: `${overall.pct}%` }} />
          </div>
          <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 8 }}>
            {overall.read} of {overall.total} lessons read · tap for your mastery map
          </div>
        </button>
      )}

      {/* Units → topics roadmap */}
      {visibleUnits.map((u, ui) => (
        <div key={u.id} className="st-rise" style={{ animationDelay: `${0.12 + ui * 0.06}s` }}>
          <div className="st-eyebrow" style={{ padding: '0 2px', marginBottom: 10 }}>
            {u.unit_number != null ? `Unit ${u.unit_number}` : 'Unit'}{u.title ? ` — ${u.title}` : ''}
          </div>
          <div className="st-card" style={{ overflow: 'hidden' }}>
            {u.topics.map((t, ti) => {
              const prog = progressByTopic[t.id];
              const done = (prog?.viewed ?? 0) >= t.published_lessons;
              return (
                <button
                  key={t.id}
                  onClick={() => { track('studio_topic_tapped', { topic_id: t.id }); navigate(`/study/courses/${id}/topic/${t.id}`); }}
                  className="st-press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
                    padding: '15px 16px', border: 'none', background: 'transparent',
                    borderBottom: ti < u.topics.length - 1 ? '1px solid var(--st-border)' : 'none',
                    color: 'var(--st-text)',
                  }}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'rgba(205,244,99,.14)' : 'var(--st-glass-2)',
                      border: `1px solid ${done ? 'rgba(205,244,99,.4)' : 'var(--st-border)'}`,
                      font: '700 13px var(--st-display)',
                      color: done ? 'var(--st-lime)' : 'var(--st-text-2)',
                    }}
                  >
                    {done ? <CheckCircle2 size={17} /> : ti + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 14.5px/1.35 var(--st-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    <div style={{ font: '500 11.5px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>
                      {[
                        `${Math.min(prog?.viewed ?? 0, t.published_lessons)}/${t.published_lessons} read`,
                        t.published_quizzes > 0 ? `${t.published_quizzes} quiz${t.published_quizzes === 1 ? '' : 'zes'}` : null,
                        t.est_minutes ? `~${t.est_minutes} min` : null,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <ChevronRight size={17} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {course && visibleUnits.length === 0 && (
        <div className="st-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ font: '700 16px var(--st-display)' }}>Nothing here yet</div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
            Topics will appear once your faculty publishes them.
          </div>
        </div>
      )}
    </div>
  );
}
