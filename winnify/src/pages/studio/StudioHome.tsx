// Student Studio home — courses only. Greeting + resume hero + week pulse,
// then the course rack: large tappable cards with animated mastery rings.
// Data comes from the same published-content endpoints as /home/courses.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Flame, Layers, LogOut, Monitor, Moon, Play, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi, track, type LearnHome, type StudentCourse } from '@/api/student';
import { SESSION_CARDS } from './constants';
import StudioError from './StudioError';
import { useStudioTextScale, useStudioTheme, type TextScale, type ThemePref } from './studioTheme';
import { useStudioTitle } from './useStudioTitle';

// System / Light / Dark segmented switcher for the profile menu.
function ThemeSwitch() {
  const [pref, setPref] = useStudioTheme();
  const opts: { id: ThemePref; label: string; Icon: typeof Sun }[] = [
    { id: 'system', label: 'Auto', Icon: Monitor },
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
  ];
  return (
    <div style={{ marginTop: 12 }}>
      <div className="st-eyebrow" style={{ marginBottom: 7 }}>Appearance</div>
      <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 12, background: 'var(--st-glass)', border: '1px solid var(--st-border)' }}>
        {opts.map(({ id, label, Icon }) => {
          const on = pref === id;
          return (
            <button
              key={id} onClick={() => setPref(id)} className="st-press"
              aria-pressed={on} aria-label={`${label} theme`}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '7px 4px', borderRadius: 9, cursor: 'pointer', border: 'none',
                background: on ? 'var(--st-lime)' : 'transparent',
                color: on ? 'var(--st-ink-on-lime)' : 'var(--st-text-2)',
                font: '700 10.5px var(--st-display)', transition: 'background .15s, color .15s',
              }}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Reader text size. Scoped to lesson prose, so a student who finds the default
// tight can enlarge it without breaking the chrome's layout.
function TextSizeSwitch() {
  const [scale, setScale] = useStudioTextScale();
  const opts: { v: TextScale; label: string; px: number }[] = [
    { v: 0.92, label: 'Small', px: 11 },
    { v: 1, label: 'Default', px: 13 },
    { v: 1.12, label: 'Large', px: 15 },
  ];
  return (
    <div style={{ marginTop: 12 }}>
      <div className="st-eyebrow" style={{ marginBottom: 7 }}>Reading size</div>
      <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 12, background: 'var(--st-glass)', border: '1px solid var(--st-border)' }}>
        {opts.map(({ v, label, px }) => {
          const on = scale === v;
          return (
            <button
              key={label} onClick={() => setScale(v)} className="st-press"
              aria-pressed={on} aria-label={`${label} text`}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 9, cursor: 'pointer', border: 'none',
                background: on ? 'var(--st-lime)' : 'transparent',
                color: on ? 'var(--st-ink-on-lime)' : 'var(--st-text-2)',
                font: `700 ${px}px var(--st-display)`, transition: 'background .15s, color .15s',
              }}
            >
              A
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Animated mastery ring: sweeps from 0 to pct on mount.
function Ring({ pct, size = 48 }: { pct: number; size?: number }) {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle className="st-ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} strokeLinecap="round"
          stroke={pct >= 70 ? 'var(--st-lime-text)' : pct >= 40 ? 'var(--st-aqua)' : 'var(--st-violet)'}
          strokeDasharray={c} strokeDashoffset={c * (1 - drawn / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'center',
          paddingTop: size / 2 - 7, font: '700 12px var(--st-display)', color: 'var(--st-text)',
        }}
      >
        {pct}<span style={{ font: '700 7.5px var(--st-display)', color: 'var(--st-text-3)' }}>%</span>
      </span>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StudioHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [home, setHome] = useState<LearnHome | null>(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useStudioTitle(null);

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    setError('');
    studentApi.courses().then(setCourses).catch(() => setError('Could not load your courses.'));
    studentApi.home().then(setHome).catch(() => {});
    track('studio_home_viewed');
  }, [reloadKey]);

  // Close the profile menu on outside tap.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const masteryById = useMemo(() => {
    const m: Record<string, { mastery: number; read: number; total: number }> = {};
    for (const c of home?.courses ?? []) m[c.id] = { mastery: c.mastery_pct, read: c.read_lessons, total: c.published_lessons };
    return m;
  }, [home]);

  const resume = home?.resume;
  const firstName = (user?.name ?? 'there').split(' ')[0];

  // Only courses with at least one approved (published) lesson are shown —
  // an enrolled-but-empty course is noise a student can do nothing with.
  const visibleCourses = useMemo(
    () => courses?.filter(c => c.published_lessons > 0) ?? null,
    [courses],
  );

  return (
    <div style={{ padding: 'calc(18px + env(safe-area-inset-top)) 20px 12px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Top bar: greeting + avatar. position+z-index lifts this row's stacking
          context above the later sibling cards so the profile popover (nested
          here) can overlay them — st-rise's transform would otherwise trap it. */}
      <div className="st-rise" style={{ position: 'relative', zIndex: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="st-eyebrow">{greeting()}</div>
          <div style={{ font: '700 26px/1.15 var(--st-display)', letterSpacing: '-0.02em', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName}
          </div>
        </div>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)} className="st-press" aria-label="Profile menu"
            style={{
              width: 44, height: 44, borderRadius: 16, border: '1px solid var(--st-border-2)',
              background: 'linear-gradient(135deg, rgba(167,139,250,.3), rgba(94,234,212,.22))',
              color: 'var(--st-text)', font: '700 16px var(--st-display)',
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            // Solid popover — deliberately NOT .st-card: a menu must be opaque,
            // and the glass backdrop-filter both reads wrong here and renders
            // flaky in some engines.
            <div
              className="st-rise"
              style={{
                position: 'absolute', right: 0, top: 52, width: 220, padding: 14, zIndex: 20,
                background: 'var(--st-menu)', border: '1px solid var(--st-border-2)',
                borderRadius: 18, boxShadow: '0 18px 44px rgba(0,0,0,.4)',
              }}
            >
              <div style={{ font: '700 14px var(--st-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              <ThemeSwitch />
              <TextSizeSwitch />
              <button
                onClick={async () => { await signOut(); navigate('/study/login', { replace: true }); }}
                className="st-press"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 12,
                  padding: '10px 12px', borderRadius: 12, border: '1px solid var(--st-border)',
                  background: 'var(--st-glass)', color: 'var(--st-red)', font: '700 13px var(--st-sans)',
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resume hero */}
      {resume && (
        <button
          onClick={() => {
            track('studio_resume_tapped');
            navigate(`/study/courses/${resume.course_id}/topic/${resume.topic_id}/notes/${resume.concept_id}`);
          }}
          className="st-press st-rise st-d1"
          style={{
            position: 'relative', overflow: 'hidden', textAlign: 'left', width: '100%',
            border: '1px solid rgba(205,244,99,.35)', borderRadius: 28, padding: '20px 20px 18px',
            background: 'linear-gradient(135deg, rgba(205,244,99,.16), rgba(94,234,212,.1) 55%, rgba(167,139,250,.12))',
          }}
        >
          <div className="st-eyebrow" style={{ color: 'var(--st-lime-text)' }}>Continue learning</div>
          {/* right padding keeps text clear of the floating play button */}
          <div style={{ font: '700 20px/1.25 var(--st-display)', letterSpacing: '-0.015em', margin: '8px 0 4px', color: 'var(--st-text)', paddingRight: 56 }}>
            {resume.topic_title}
          </div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', paddingRight: 56 }}>
            {resume.course_name}{resume.scroll_pct > 5 ? ` · ${resume.scroll_pct}% read` : ''}
          </div>
          <div
            style={{
              position: 'absolute', right: 16, bottom: 16, width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--st-lime), var(--st-lime-deep))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(205,244,99,.3)',
            }}
          >
            <Play size={19} color="var(--st-ink-on-lime)" fill="var(--st-ink-on-lime)" style={{ marginLeft: 2 }} />
          </div>
        </button>
      )}

      {/* Week pulse + revision */}
      {home && (
        <div className="st-rise st-d2" style={{ display: 'flex', gap: 12 }}>
          <div className="st-card" style={{ flex: 1, padding: '14px 16px' }}>
            {/* Streak when there is one to show, this week's count otherwise —
                "0-day streak" is a worse opening line than a lesson count. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={13} color={home.week.streak_days > 0 ? 'var(--st-lime-text)' : 'var(--st-text-3)'} />
              <span className="st-eyebrow">{home.week.streak_days > 0 ? 'Streak' : 'This week'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              {home.week.streak_days > 0 ? (
                <>
                  <span style={{ font: '700 26px var(--st-display)' }}>{home.week.streak_days}</span>
                  <span style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-2)' }}>
                    day{home.week.streak_days === 1 ? '' : 's'} running
                  </span>
                </>
              ) : (
                <>
                  <span style={{ font: '700 26px var(--st-display)' }}>{home.week.lessons_completed}</span>
                  <span style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-2)' }}>
                    lesson{home.week.lessons_completed === 1 ? '' : 's'} done
                  </span>
                </>
              )}
            </div>
            {/* 7-day strip: filled dots = active days this week */}
            <div style={{ display: 'flex', gap: 5, marginTop: 9 }} aria-label={`${home.week.active_days} active days this week`}>
              {Array.from({ length: 7 }).map((_, i) => {
                const on = i < home.week.active_days;
                return (
                  <span key={i} style={{
                    width: 14, height: 5, borderRadius: 99,
                    background: on ? 'var(--st-lime)' : 'var(--st-glass-2)',
                    border: on ? 'none' : '1px solid var(--st-border)',
                  }} />
                );
              })}
            </div>
          </div>
          {home.revision && (
            <button
              onClick={() => { track('studio_revision_tapped'); navigate(`/study/courses/${home.revision!.course_id}/revision`); }}
              className="st-card st-press"
              style={{ flex: 1, padding: '14px 16px', textAlign: 'left', color: 'var(--st-text)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={13} color="var(--st-violet)" />
                <span className="st-eyebrow">Revision</span>
              </div>
              {/* A raw "126 cards due" reads as a debt no one starts paying.
                  Show the session the tap actually opens, and keep the backlog
                  as a quiet second line. */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span style={{ font: '700 26px var(--st-display)' }}>
                  {Math.min(home.revision.due_cards, SESSION_CARDS)}
                </span>
                <span style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-2)' }}>
                  card{Math.min(home.revision.due_cards, SESSION_CARDS) === 1 ? '' : 's'} to review
                </span>
              </div>
              {home.revision.due_cards > SESSION_CARDS && (
                <div style={{ font: '500 11px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 3 }}>
                  +{home.revision.due_cards - SESSION_CARDS} more waiting
                </div>
              )}
            </button>
          )}
        </div>
      )}

      {/* Course rack */}
      <div className="st-rise st-d3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="st-eyebrow" style={{ padding: '0 2px' }}>Your courses</div>

        {error && <StudioError message={error} onRetry={() => setReloadKey(k => k + 1)} />}

        {!courses && !error && (
          <>
            <div className="st-skeleton" style={{ height: 96 }} />
            <div className="st-skeleton" style={{ height: 96 }} />
            <div className="st-skeleton" style={{ height: 96 }} />
          </>
        )}

        {visibleCourses?.length === 0 && (
          <div className="st-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <BookOpen size={26} color="var(--st-text-3)" style={{ margin: '0 auto 10px' }} />
            <div style={{ font: '700 16px var(--st-display)' }}>No courses yet</div>
            <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
              Your published courses will show up here.
            </div>
          </div>
        )}

        {visibleCourses?.map(c => {
          const m = masteryById[c.id];
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/study/courses/${c.id}`)}
              className="st-card st-press"
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px', textAlign: 'left', width: '100%', color: 'var(--st-text)' }}
            >
              {m && m.total > 0 ? (
                <Ring pct={m.mastery} />
              ) : (
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                    background: 'rgba(167,139,250,.14)', border: '1px solid rgba(167,139,250,.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <BookOpen size={20} color="var(--st-violet)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 15.5px/1.3 var(--st-display)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>
                <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[c.code, c.semester && /^\d+$/.test(c.semester) ? `Sem ${c.semester}` : c.semester,
                    `${c.published_lessons} lesson${c.published_lessons === 1 ? '' : 's'}`]
                    .filter(Boolean).join(' · ')}
                </div>
                {m && m.total > 0 && (
                  <div className="st-bar" style={{ marginTop: 9 }}>
                    <i style={{ width: `${Math.min(100, Math.round((m.read / m.total) * 100))}%` }} />
                  </div>
                )}
              </div>
              <ChevronRight size={18} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
