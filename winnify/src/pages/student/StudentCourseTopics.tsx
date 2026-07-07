// Student course page: units → topics with published-lesson counts and this
// student's own progress; opens the reader on the first published lesson.
// Mobile-first, FotMob-style: sticky compact header with back, progress hero
// card, unit filter chips, unit sections as grouped tappable rows.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { studentApi, type StudentCourseDetail } from '@/api/student';

export default function StudentCourseTopics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [error, setError] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');

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

  // Overall course progress: lessons read vs. published, across topics.
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

  const visibleUnits = useMemo(
    () => (course?.units ?? []).filter(u => unitFilter === 'all' || u.id === unitFilter),
    [course, unitFilter],
  );

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Sticky compact header — back + course name */}
      <div
        className="sticky top-0 z-30 px-3 md:px-9"
        style={{
          background: 'color-mix(in oklab, var(--app-bg) 86%, transparent)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, minHeight: 52 }}>
          <button
            onClick={() => navigate('/home/courses')}
            aria-label="All courses"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', borderRadius: 12, flexShrink: 0,
            }}
          >
            <ArrowLeft size={19} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {course?.name ?? 'Course'}
            </div>
            {course && (
              <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {[course.code, course.semester].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-9 md:py-6" style={{ maxWidth: 920, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
        {!course && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', padding: '24px 0' }}>
            <Loader2 size={16} className="animate-spin" /> Loading course…
          </div>
        )}

        {course && (
          <>
            {/* Progress hero — FotMob match-header style */}
            {overall.total > 0 && (
              <div className="ds-rise" style={{
                background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)',
                padding: '16px 18px', marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>
                    Your progress
                  </span>
                  <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-2)' }}>
                    {overall.read}/{overall.total} lessons · {overall.pct}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-muted, var(--border))', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${overall.pct}%`, borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--brand), var(--brand-2))',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Unit filter chips */}
            {course.units.length > 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0">
                {[{ id: 'all', label: 'All units' },
                  ...course.units.map(u => ({ id: u.id, label: u.unit_number != null ? `Unit ${u.unit_number}` : (u.title ?? 'Unit') }))].map(ch => {
                  const active = unitFilter === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setUnitFilter(ch.id)}
                      style={{
                        flexShrink: 0, cursor: 'pointer', whiteSpace: 'nowrap',
                        padding: '7px 15px', borderRadius: 999,
                        fontSize: 'var(--fs-small)', fontWeight: 600, fontFamily: 'var(--font-sans)',
                        border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                        background: active ? 'var(--brand)' : 'var(--card)',
                        color: active ? 'var(--brand-fg)' : 'var(--text-2)',
                        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                      }}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Unit sections — grouped rows, whole row tappable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {visibleUnits.map(u => (
                <div key={u.id} className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>
                    {u.unit_number != null ? `Unit ${u.unit_number} — ` : ''}{u.title}
                  </div>
                  {u.topics.map((t, ti) => {
                    const prog = progressByTopic[t.id];
                    const published = t.published_lessons > 0;
                    const done = prog != null && prog.viewed >= t.published_lessons && published;
                    const openReader = () => {
                      if (published && t.first_concept_id) {
                        navigate(`/home/courses/${course.id}/topic/${t.id}/notes/${t.first_concept_id}`);
                      }
                    };
                    return (
                      <div
                        key={t.id}
                        role={published && t.first_concept_id ? 'button' : undefined}
                        tabIndex={published && t.first_concept_id ? 0 : undefined}
                        onClick={openReader}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReader(); } }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', minHeight: 60,
                          borderBottom: ti < u.topics.length - 1 ? '1px solid var(--border)' : 'none',
                          opacity: published ? 1 : 0.55,
                          cursor: published && t.first_concept_id ? 'pointer' : 'default',
                        }}
                      >
                        {/* Leading status tile */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 'var(--w-r4)', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: done ? 'var(--tint-teal-bg)' : 'var(--tint-brand-bg)',
                        }}>
                          {done
                            ? <CheckCircle2 size={17} color="var(--tint-teal-fg)" />
                            : <BookOpen size={16} color="var(--tint-brand-fg)" />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', lineHeight: 1.35 }}>{t.title}</div>
                          {published ? (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                              {([
                                ['📖', `${t.published_lessons} note${t.published_lessons === 1 ? '' : 's'}`],
                                t.published_slides ? ['🖥️', 'slides'] : null,
                                t.published_quizzes ? ['❓', 'quiz'] : null,
                              ].filter(Boolean) as [string, string][]).map(([glyph, label], ci) => (
                                <span key={ci} style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                  background: 'var(--surface-muted, var(--border))', color: 'var(--text-2)',
                                }}>{glyph} {label}</span>
                              ))}
                              {prog && prog.viewed > 0 && (
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)' }}>
                                  {prog.viewed}/{t.published_lessons} read
                                </span>
                              )}
                              {prog?.score && (
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--tint-teal-bg)', color: 'var(--tint-teal-fg)' }}>
                                  ✓ quiz {prog.score}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', marginTop: 2 }}>Not published yet</div>
                          )}
                        </div>

                        {published && t.first_concept_id && (
                          <ChevronRight size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />
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
    </div>
  );
}
