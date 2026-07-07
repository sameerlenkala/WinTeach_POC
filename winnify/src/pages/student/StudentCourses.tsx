// Learn Home (SCR-01) — the student's self-learning landing.
// Resume card + this-week strip + revision-due card above the FotMob-style
// course list; each course row carries a mastery ring. Progression metrics
// only — no gamification.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2, Play, Layers } from 'lucide-react';
import { studentApi, track, type StudentCourse, type LearnHome } from '@/api/student';

// Small SVG progress ring for a course's mastery %.
function MasteryRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const col = pct >= 70 ? 'var(--tint-teal-fg)' : pct >= 40 ? 'var(--brand)' : 'var(--text-3)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-muted, var(--border))" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={3}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>
        {pct}
      </span>
    </div>
  );
}

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [home, setHome] = useState<LearnHome | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    studentApi.courses().then(setCourses).catch(() => setError('Could not load courses.'));
    studentApi.home().then(setHome).catch(() => {});
    track('learn_home_viewed');
  }, []);

  const masteryById = useMemo(() => {
    const m: Record<string, { mastery: number; read: number; total: number }> = {};
    for (const c of home?.courses ?? []) m[c.id] = { mastery: c.mastery_pct, read: c.read_lessons, total: c.published_lessons };
    return m;
  }, [home]);

  const semesters = useMemo(() => {
    const s = new Set<string>();
    for (const c of courses ?? []) if (c.semester) s.add(c.semester);
    return [...s].sort();
  }, [courses]);

  const visible = useMemo(() => {
    if (!courses) return [];
    if (filter === 'all') return courses;
    if (filter === 'published') return courses.filter(c => c.published_lessons > 0);
    return courses.filter(c => c.semester === filter);
  }, [courses, filter]);

  const chips = [
    { id: 'all', label: 'All' },
    ...semesters.map(s => ({ id: s, label: /^\d+$/.test(s) ? `Sem ${s}` : s })),
    { id: 'published', label: 'Has lessons' },
  ];

  const resume = home?.resume;
  // The Revision chip opens ONE course and shows THAT course's due count, so the
  // number always matches the deck the tap lands on (server picks the target).
  const revisionTarget = home?.revision?.course_id ?? home?.courses[0]?.id;
  const revisionDue = home?.revision?.due_cards ?? 0;

  return (
    <div style={{ minHeight: '100%' }}>
      <div
        className="sticky top-0 z-30 px-4 pt-4 pb-0 md:px-9 md:pt-6"
        style={{
          background: 'color-mix(in oklab, var(--app-bg) 86%, transparent)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h1 className="text-[22px] md:text-[28px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            Learn
          </h1>
          <p className="hidden md:block" style={{ fontSize: 'var(--fs-small)', color: 'var(--text-2)', margin: '2px 0 0' }}>
            Pick up where you left off, revise, and track your mastery.
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-3 -mx-4 px-4 md:mx-0 md:px-0">
            {chips.map(ch => {
              const active = filter === ch.id;
              return (
                <button key={ch.id} onClick={() => setFilter(ch.id)} style={{
                  flexShrink: 0, cursor: 'pointer', whiteSpace: 'nowrap',
                  padding: '7px 15px', borderRadius: 999,
                  fontSize: 'var(--fs-small)', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand)' : 'var(--card)',
                  color: active ? 'var(--brand-fg)' : 'var(--text-2)',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                }}>{ch.label}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-9 md:py-6" style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Continue — resume card */}
        {resume && (
          <button
            onClick={() => { track('learn_resume_tapped'); navigate(`/home/courses/${resume.course_id}/topic/${resume.topic_id}/notes/${resume.concept_id}`); }}
            className="ds-rise" style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer', width: '100%',
              background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))',
              border: 'none', borderRadius: 'var(--w-r5)', padding: '16px 18px',
            }}>
            <div style={{ width: 46, height: 46, borderRadius: 'var(--w-r4)', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Play size={20} color="#fff" fill="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' }}>Continue learning</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.topic_title}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {resume.course_name}{resume.scroll_pct > 5 ? ` · ${resume.scroll_pct}% read` : ''}
              </div>
            </div>
            <ChevronRight size={20} color="rgba(255,255,255,.9)" style={{ flexShrink: 0 }} />
          </button>
        )}

        {/* This week + revision-due */}
        {home && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', padding: '14px 18px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>This week</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text)' }}>{home.week.lessons_completed}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>lesson{home.week.lessons_completed === 1 ? '' : 's'} done · {home.week.active_days} active day{home.week.active_days === 1 ? '' : 's'}</span>
              </div>
            </div>
            {revisionTarget && (
              <button
                onClick={() => { track('learn_revision_tapped'); navigate(`/home/courses/${revisionTarget}/revision`); }}
                style={{ flex: '1 1 150px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', padding: '14px 18px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--w-r4)', background: 'var(--tint-violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Layers size={18} color="var(--tint-violet-fg)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Revision</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{revisionDue > 0 ? `${revisionDue} card${revisionDue === 1 ? '' : 's'} to review` : 'Flashcards, formulas & PYQs'}</div>
                </div>
                <ChevronRight size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />
              </button>
            )}
          </div>
        )}

        {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
        {!courses && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 'var(--fs-body)', padding: '24px 0' }}>
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}
        {courses && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-2)' }}>
            {courses.length === 0 ? 'No courses available yet.' : 'No courses match this filter.'}
          </div>
        )}

        {visible.length > 0 && (
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '2px 2px 8px' }}>Your courses</div>
            <div className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden' }}>
              {visible.map((c, i) => {
                const m = masteryById[c.id];
                return (
                  <button key={c.id} onClick={() => navigate(`/home/courses/${c.id}`)} className="w-full" style={{
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
                    background: 'transparent', border: 'none', padding: '14px 16px', minHeight: 64,
                    borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    {m && m.total > 0
                      ? <MasteryRing pct={m.mastery} />
                      : <div style={{ width: 42, height: 42, borderRadius: 'var(--w-r4)', background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={19} color="var(--tint-brand-fg)" /></div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[c.code, m && m.total > 0 ? `${m.read}/${m.total} read` : `${c.published_lessons} lesson${c.published_lessons === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 999, fontWeight: 600, fontSize: 'var(--fs-caption)',
                      background: c.published_lessons > 0 ? 'var(--tint-teal-bg)' : 'var(--surface-muted, var(--border))',
                      color: c.published_lessons > 0 ? 'var(--tint-teal-fg)' : 'var(--text-3)',
                    }}>
                      {c.published_lessons > 0 ? `${c.published_lessons} lesson${c.published_lessons === 1 ? '' : 's'}` : 'None yet'}
                    </span>
                    <ChevronRight size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
