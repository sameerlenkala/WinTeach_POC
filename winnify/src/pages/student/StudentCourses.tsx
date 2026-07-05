// Student "Courses" tab — published-content course catalog.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { studentApi, type StudentCourse } from '@/api/student';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    studentApi.courses().then(setCourses).catch(() => setError('Could not load courses.'));
  }, []);

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1080, margin: '0 auto' }}>
      <div className="ds-rise" style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text)', margin: '0 0 4px' }}>Courses</h1>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', margin: 0 }}>
          Lessons your faculty has published — notes, slides, and quizzes.
        </p>
      </div>

      {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
      {!courses && !error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 'var(--fs-body)' }}>
          <Loader2 size={16} className="animate-spin" /> Loading courses…
        </div>
      )}

      {courses && courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-2)' }}>
          No courses available yet.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {(courses ?? []).map((c, i) => (
          <button key={c.id} onClick={() => navigate(`/home/courses/${c.id}`)} className="lift ds-rise" style={{
            animationDelay: `${i * 60}ms`,
            textAlign: 'left', cursor: 'pointer', background: 'var(--card)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--w-r4)', background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={18} color="var(--tint-brand-fg)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h3)', color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)' }}>
                  {[c.code, c.semester].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-caption)', color: 'var(--text-2)' }}>
              <span>{c.unit_count} units</span>
              <span>·</span>
              <span>{c.topic_count} topics</span>
              <span style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 999, fontWeight: 600,
                background: c.published_lessons > 0 ? 'var(--tint-teal-bg)' : 'var(--surface-muted, var(--border))',
                color: c.published_lessons > 0 ? 'var(--tint-teal-fg)' : 'var(--text-3)',
              }}>
                {c.published_lessons > 0 ? `${c.published_lessons} lessons` : 'Nothing published yet'}
                <ChevronRight size={12} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
