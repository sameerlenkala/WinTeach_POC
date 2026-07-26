// Course picker behind the Revise / Progress tabs.
//
// Revision and Mastery are per-course routes, but the tabs are global. With a
// single published course — the common case — this redirects straight through
// so the tab feels like a direct destination; with several it lists them with
// the number that matters for that tab (cards due / mastery).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Layers, TrendingUp } from 'lucide-react';
import { studentApi, track, type LearnHome } from '@/api/student';
import StudioError from './StudioError';
import { useStudioTitle } from './useStudioTitle';

type Mode = 'revision' | 'mastery';

const COPY: Record<Mode, { title: string; blurb: string; Icon: typeof Layers }> = {
  revision: { title: 'Revise', blurb: 'Pick a course to review', Icon: Layers },
  mastery: { title: 'Progress', blurb: 'Pick a course to see your mastery', Icon: TrendingUp },
};

export default function StudioPicker({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [home, setHome] = useState<LearnHome | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { title, blurb, Icon } = COPY[mode];
  useStudioTitle(title);

  useEffect(() => {
    setError('');
    studentApi.home().then(setHome).catch(() => setError(`Could not load your courses.`));
    track('studio_picker_viewed', { mode });
  }, [mode, reloadKey]);

  const courses = home?.courses ?? [];

  // One course → skip the picker entirely.
  useEffect(() => {
    if (courses.length === 1) {
      navigate(`/study/courses/${courses[0].id}/${mode}`, { replace: true });
    }
  }, [courses, mode, navigate]);

  return (
    <div style={{ padding: 'calc(18px + env(safe-area-inset-top)) 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="st-rise">
        <div className="st-eyebrow">{blurb}</div>
        <div style={{ font: '700 26px/1.15 var(--st-display)', letterSpacing: '-0.02em', marginTop: 3 }}>{title}</div>
      </div>

      {error && <StudioError message={error} onRetry={() => setReloadKey(k => k + 1)} />}

      {!home && !error && (
        <>
          <div className="st-skeleton" style={{ height: 78 }} />
          <div className="st-skeleton" style={{ height: 78 }} />
        </>
      )}

      {home && courses.length === 0 && (
        <div className="st-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <BookOpen size={26} color="var(--st-text-3)" style={{ margin: '0 auto 10px' }} />
          <div style={{ font: '700 16px var(--st-display)' }}>No courses yet</div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
            Your published courses will show up here.
          </div>
        </div>
      )}

      {/* Only rendered while more than one course exists — a single course
          redirects above before this paints. */}
      {courses.length > 1 && (
        <div className="st-rise st-d1" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/study/courses/${c.id}/${mode}`)}
              className="st-card st-press"
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px', textAlign: 'left', width: '100%', color: 'var(--st-text)' }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                background: 'rgba(167,139,250,.14)', border: '1px solid rgba(167,139,250,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={19} color="var(--st-violet)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 15px/1.3 var(--st-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>
                <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 3 }}>
                  {mode === 'revision'
                    ? (c.due_cards > 0 ? `${c.due_cards} card${c.due_cards === 1 ? '' : 's'} due` : 'Nothing due')
                    : `${c.mastery_pct}% mastery`}
                </div>
              </div>
              <ChevronRight size={17} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
