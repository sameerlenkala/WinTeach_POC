// Student Studio Mastery Map — one course's mastery at a glance: overall
// ring, weakest-topics call-to-action, then per-topic mastery bars. Every
// topic deep-links back into the studio topic page.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Crosshair, Layers } from 'lucide-react';
import { studentApi, track, type MasteryPayload } from '@/api/student';

// Large animated mastery ring (sweeps in on mount).
function BigRing({ pct }: { pct: number }) {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);
  const size = 148, r = (size - 14) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle className="st-ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={9} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={9} strokeLinecap="round"
          stroke={pct >= 70 ? 'var(--st-lime)' : pct >= 40 ? 'var(--st-aqua)' : 'var(--st-violet)'}
          strokeDasharray={c} strokeDashoffset={c * (1 - drawn / 100)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ font: '700 34px var(--st-display)', letterSpacing: '-0.02em' }}>{pct}%</span>
        <span className="st-eyebrow">Mastery</span>
      </div>
    </div>
  );
}

export default function StudioMastery() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [data, setData] = useState<MasteryPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    studentApi.mastery(courseId).then(setData).catch(() => setError('Could not load mastery.'));
    track('studio_mastery_viewed', { course_id: courseId });
  }, [courseId]);

  const barColor = (pct: number) =>
    pct >= 70 ? 'var(--st-lime)' : pct >= 40 ? 'var(--st-aqua)' : '#fb7185';

  return (
    <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div className="st-rise" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(`/study/courses/${courseId}`)} className="st-press" aria-label="Back to course"
          style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={19} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '700 19px/1.2 var(--st-display)', letterSpacing: '-0.015em' }}>Mastery</div>
          <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data?.name ?? '…'}
          </div>
        </div>
      </div>

      {error && <div style={{ font: '600 13.5px var(--st-sans)', color: 'var(--st-red)' }}>{error}</div>}
      {!data && !error && (
        <>
          <div className="st-skeleton" style={{ height: 200 }} />
          <div className="st-skeleton" style={{ height: 240 }} />
        </>
      )}

      {data && (
        <>
          {/* Hero ring */}
          <div className="st-card st-rise st-d1" style={{ padding: '26px 20px 22px', textAlign: 'center' }}>
            <BigRing pct={data.mastery_pct} />
            <div style={{ font: '500 13px/1.5 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 14 }}>
              {data.mastery_pct >= 70 ? 'Strong — keep the streak going.'
                : data.mastery_pct >= 40 ? 'Solid base — push the weak spots below.'
                  : 'Early days — the weak spots below are the fastest wins.'}
            </div>
            {/* An unexplained score invites students to distrust it. Name its
                inputs, in the order they carry weight. */}
            <div style={{ font: '500 11.5px/1.5 var(--st-sans)', color: 'var(--st-text-3)', marginTop: 10 }}>
              Based on your quiz results, lessons read, and lessons finished.
            </div>
          </div>

          {/* Revision is a sibling route under the same course, but nothing
              linked the two — a student looking at weak topics had no way to
              act on them from here. */}
          <button
            onClick={() => navigate(`/study/courses/${courseId}/revision`)}
            className="st-card st-press st-rise st-d2"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '15px 16px',
              textAlign: 'left', color: 'var(--st-text)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: 'rgba(167,139,250,.14)', border: '1px solid rgba(167,139,250,.26)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={18} color="var(--st-violet)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '700 14.5px var(--st-display)', letterSpacing: '-0.01em' }}>Revise this course</div>
              <div style={{ font: '500 11.5px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>
                Flashcards, formulas and past questions
              </div>
            </div>
            <ChevronRight size={16} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
          </button>

          {/* Weakest topics */}
          {data.weak_topics.length > 0 && (
            <div className="st-rise st-d3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="st-eyebrow" style={{ padding: '0 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crosshair size={12} color="#fb7185" /> Focus here first
              </div>
              {data.weak_topics.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/study/courses/${courseId}/topic/${t.id}`)}
                  className="st-card st-press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px',
                    textAlign: 'left', color: 'var(--st-text)', borderLeft: '3px solid rgba(251,113,133,.6)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 14px/1.35 var(--st-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ font: '500 11.5px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>{t.mastery_pct}% mastered</div>
                  </div>
                  <ChevronRight size={16} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}

          {/* Per-topic bars */}
          <div className="st-rise st-d4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="st-eyebrow" style={{ padding: '0 2px' }}>All topics</div>
            <div className="st-card" style={{ overflow: 'hidden' }}>
              {data.topics.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/study/courses/${courseId}/topic/${t.id}`)}
                  className="st-press"
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 8, width: '100%', textAlign: 'left',
                    padding: '13px 16px', border: 'none', background: 'transparent', color: 'var(--st-text)',
                    borderBottom: i < data.topics.length - 1 ? '1px solid var(--st-border)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ font: '600 13.5px/1.35 var(--st-sans)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>
                    <span style={{ font: '700 12px var(--st-display)', color: barColor(t.mastery_pct), fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {t.mastery_pct}%
                    </span>
                  </div>
                  <div className="st-bar">
                    <i style={{ width: `${t.mastery_pct}%`, background: barColor(t.mastery_pct) }} />
                  </div>
                  <div style={{ font: '500 11px var(--st-sans)', color: 'var(--st-text-3)' }}>
                    {t.read}/{t.published_lessons} lesson{t.published_lessons === 1 ? '' : 's'} read
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
