// Student course page: units → topics with published-lesson counts and this
// student's own progress; opens the reader on the first published lesson.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { studentApi, type StudentCourseDetail } from '@/api/student';

export default function StudentCourseTopics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    studentApi.course(id).then(setCourse).catch(() => setError('Could not load this course.'));
  }, [id]);

  // topic_id -> { viewed, completed, bestScore }
  const progressByTopic = useMemo(() => {
    const out: Record<string, { viewed: number; completed: number; score?: string }> = {};
    for (const p of course?.progress ?? []) {
      const slot = (out[p.topic_id] ??= { viewed: 0, completed: 0 });
      if (p.artifact_type === 'student_notes') {
        slot.viewed += 1;
        if (p.status === 'completed') slot.completed += 1;
      }
      if (p.artifact_type === 'quiz' && p.quiz_score != null && p.quiz_total != null) {
        slot.score = `${p.quiz_score}/${p.quiz_total}`;
      }
    }
    return out;
  }, [course]);

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 920, margin: '0 auto' }}>
      <button onClick={() => navigate('/home/courses')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text-2)', fontSize: 'var(--fs-small)', padding: 0, marginBottom: 16,
      }}>
        <ArrowLeft size={14} /> All courses
      </button>

      {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
      {!course && !error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)' }}>
          <Loader2 size={16} className="animate-spin" /> Loading course…
        </div>
      )}

      {course && (
        <>
          <div className="ds-rise" style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text)', margin: '0 0 4px' }}>{course.name}</h1>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', margin: 0 }}>
              {[course.code, course.semester].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {course.units.map(u => (
              <div key={u.id} className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden' }}>
                <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>
                  {u.unit_number != null ? `Unit ${u.unit_number} — ` : ''}{u.title}
                </div>
                {u.topics.map((t, ti) => {
                  const prog = progressByTopic[t.id];
                  const published = t.published_lessons > 0;
                  return (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px',
                      borderBottom: ti < u.topics.length - 1 ? '1px solid var(--border)' : 'none',
                      opacity: published ? 1 : 0.55,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>{t.title}</div>
                        <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', marginTop: 2 }}>
                          {published
                            ? [`${t.published_lessons} lessons`,
                               t.published_slides ? `${t.published_slides} slide decks` : null,
                               t.published_quizzes ? `${t.published_quizzes} quizzes` : null,
                              ].filter(Boolean).join(' · ')
                            : 'Not published yet'}
                        </div>
                      </div>
                      {prog && prog.viewed > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--fs-caption)', color: 'var(--tint-teal-fg)', background: 'var(--tint-teal-bg)', borderRadius: 999, padding: '3px 10px', fontWeight: 600 }}>
                          <CheckCircle2 size={12} /> {prog.viewed}/{t.published_lessons} read{prog.score ? ` · quiz ${prog.score}` : ''}
                        </span>
                      )}
                      {published && t.first_concept_id && (
                        <button className="w-btn-primary" style={{ height: 34, padding: '0 16px', fontSize: 'var(--fs-small)' }}
                          onClick={() => navigate(`/home/courses/${course.id}/topic/${t.id}/notes/${t.first_concept_id}`)}>
                          <BookOpen size={13} /> Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
