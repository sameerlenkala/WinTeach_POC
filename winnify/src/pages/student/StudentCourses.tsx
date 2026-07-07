// Student "Courses" tab — published-content course catalog.
// Mobile-first, FotMob-style: sticky blurred header, horizontal filter chips,
// full-width tappable rows with leading icon, meta line and trailing badge.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { studentApi, type StudentCourse } from '@/api/student';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    studentApi.courses().then(setCourses).catch(() => setError('Could not load courses.'));
  }, []);

  // Filter chips: All · each semester present in the data · Published
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

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Sticky header — compact on mobile, FotMob-style blur */}
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
            Courses
          </h1>
          <p className="hidden md:block" style={{ fontSize: 'var(--fs-small)', color: 'var(--text-2)', margin: '2px 0 0' }}>
            Lessons your faculty has published — notes, slides, and quizzes.
          </p>

          {/* Horizontal filter chips */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-3 -mx-4 px-4 md:mx-0 md:px-0">
            {chips.map(ch => {
              const active = filter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setFilter(ch.id)}
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
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 md:px-9 md:py-6" style={{ maxWidth: 920, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
        {!courses && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 'var(--fs-body)', padding: '24px 0' }}>
            <Loader2 size={16} className="animate-spin" /> Loading courses…
          </div>
        )}

        {courses && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-2)' }}>
            {courses.length === 0 ? 'No courses available yet.' : 'No courses match this filter.'}
          </div>
        )}

        {/* FotMob-style grouped card: rows separated by hairlines */}
        {visible.length > 0 && (
          <div className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden' }}>
            {visible.map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate(`/home/courses/${c.id}`)}
                className="w-full"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
                  background: 'transparent', border: 'none', padding: '14px 16px', minHeight: 64,
                  borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {/* Leading icon tile */}
                <div style={{ width: 42, height: 42, borderRadius: 'var(--w-r4)', background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={19} color="var(--tint-brand-fg)" />
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[c.code, c.semester, `${c.unit_count} units`, `${c.topic_count} topics`].filter(Boolean).join(' · ')}
                  </div>
                </div>

                {/* Trailing badge + chevron */}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
