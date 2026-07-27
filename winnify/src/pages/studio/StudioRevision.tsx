// Student Studio Revision Hub — spaced-repetition flashcards, formula sheet
// and PYQ practice for one course, in the studio's player chrome. Mirrors
// the legacy StudentRevision feature-for-feature on the same endpoints
// (studentApi.revision + reviewCard SRS buckets).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronLeft, Layers, RotateCcw, Sigma, Sparkles, X,
} from 'lucide-react';
import { studentApi, track, type RevisionPayload } from '@/api/student';
import { SESSION_CARDS } from './constants';
import { StudioRichText } from './StudioLesson';

type Tab = 'cards' | 'formulas' | 'practice';
type Band = 'easy' | 'medium' | 'hard';

const BAND_COLOR: Record<Band, string> = { easy: '#4ade80', medium: '#fbbf24', hard: '#fb7185' };

function Segs({ total, done }: { total: number; done: number }) {
  return (
    <div className="st-segs">
      {Array.from({ length: total }).map((_, i) => <i key={i} className={i < done ? 'on' : ''} />)}
    </div>
  );
}

/* ── Cards: SRS deck ─────────────────────────────────────────────────────── */

function CardsDeck({ data, courseId, onExit, onTab, onTopic }: {
  data: RevisionPayload; courseId: string; onExit: () => void; onTab: (t: Tab) => void;
  onTopic: (topicId: string) => void;
}) {
  // Snapshot the due queue once — grading must not reshuffle mid-run.
  const [all] = useState(() => data.due_cards);
  // A hundred-odd due cards is a backlog, not a session. Deal a fixed sitting
  // at a time so there is always a visible finish line, and let the student
  // choose to keep going.
  const [chunk, setChunk] = useState(0);
  const queue = useMemo(
    () => all.slice(chunk * SESSION_CARDS, chunk * SESSION_CARDS + SESSION_CARDS),
    [all, chunk],
  );
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reviewed = useRef(0);

  const card = queue[idx];
  const remaining = Math.max(all.length - (chunk * SESSION_CARDS + queue.length), 0);

  const grade = (result: 'again' | 'hard' | 'got_it') => {
    if (!card) return;
    reviewed.current += 1;
    try { navigator.vibrate?.(result === 'again' ? [30, 40, 30] : 10); } catch { /* unsupported */ }
    studentApi.reviewCard({
      course_id: courseId, topic_id: card.topic_id, concept_id: card.concept_id,
      card_key: card.card_key, result,
    }).catch(() => {});
    track('studio_card_reviewed', { card_key: card.card_key, result });
    setFlipped(false);
    setIdx(i => i + 1);
  };

  if (!queue.length) {
    // Nothing due is good news, but it used to be a dead end — offer the other
    // two ways to revise, and the weakest topic to go re-read.
    const weakest = data.weak_topics?.[0];
    return (
      <div className="st-player-body" style={{ display: 'flex' }}>
        <div className="st-page-in" style={{ margin: 'auto', textAlign: 'center', width: '100%' }}>
          <Sparkles size={30} color="var(--st-lime)" style={{ margin: '0 auto 12px' }} />
          <div style={{ font: '700 20px var(--st-display)', letterSpacing: '-0.02em' }}>You're ahead of schedule</div>
          <div style={{ font: '500 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)', margin: '6px auto 0', maxWidth: 250 }}>
            No cards due right now. New cards appear as you complete lessons.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            <button className="st-chip st-press" onClick={() => onTab('formulas')}><Sigma size={13} /> Formulas</button>
            <button className="st-chip st-press" onClick={() => onTab('practice')}><Layers size={13} /> Practice</button>
          </div>
          {weakest && (
            <button
              className="st-card st-press"
              onClick={() => onTopic(weakest.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%', marginTop: 20,
                padding: '13px 15px', textAlign: 'left', color: 'var(--st-text)',
                borderLeft: '3px solid rgba(251,113,133,.6)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="st-eyebrow" style={{ marginBottom: 3 }}>Weakest topic</div>
                <div style={{ font: '600 13.5px/1.35 var(--st-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {weakest.title}
                </div>
              </div>
              <ArrowRight size={16} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Done state
  if (idx >= queue.length) {
    return (
      <>
        <div className="st-player-body" style={{ display: 'flex' }}>
          <div className="st-page-in" style={{ margin: 'auto', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
              background: 'linear-gradient(135deg, var(--st-lime), var(--st-aqua))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 44px rgba(205,244,99,.3)',
            }}>
              <Check size={34} color="var(--st-ink-on-lime)" strokeWidth={3} />
            </div>
            <div style={{ font: '700 24px var(--st-display)', letterSpacing: '-0.02em' }}>
              {remaining > 0 ? 'Session done' : 'Deck cleared'}
            </div>
            <div style={{ font: '500 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)', margin: '6px auto 0', maxWidth: 264 }}>
              {remaining > 0
                ? `${reviewed.current} reviewed. ${remaining} card${remaining === 1 ? '' : 's'} still due — carry on, or come back later.`
                : `${reviewed.current} card${reviewed.current === 1 ? '' : 's'} reviewed — spaced repetition will bring the tricky ones back sooner.`}
            </div>
          </div>
        </div>
        <div className="st-player-foot">
          {remaining > 0 ? (
            <>
              <button
                className="st-press"
                onClick={onExit}
                style={{
                  flex: 1, minHeight: 56, borderRadius: 999, cursor: 'pointer',
                  border: '1px solid var(--st-border-2)', background: 'var(--st-glass)',
                  color: 'var(--st-text-2)', font: '700 15px var(--st-display)',
                }}
              >
                Done for now
              </button>
              <button
                className="st-cta" style={{ flex: 1 }}
                onClick={() => { setChunk(c => c + 1); setIdx(0); setFlipped(false); }}
              >
                Keep going
              </button>
            </>
          ) : (
            <>
              <FootIcon onClick={() => { setChunk(0); setIdx(0); reviewed.current = 0; }} label="Review again"><RotateCcw size={20} /></FootIcon>
              <button className="st-cta" style={{ flex: 1 }} onClick={onExit}>Done</button>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 22px 10px' }}>
        <Segs total={queue.length} done={idx} />
        <span style={{ font: '700 11px var(--st-display)', color: 'var(--st-text-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {idx + 1}/{queue.length}{remaining > 0 ? ` · +${remaining}` : ''}
        </span>
      </div>
      <div className="st-player-body" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="st-eyebrow" style={{ color: 'var(--st-aqua)', marginBottom: 10 }}>{card.topic_title}</div>
        <div
          className={`st-flip ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped(f => !f)}
          style={{ cursor: 'pointer', flex: 1, minHeight: 280, position: 'relative' }}
        >
          <div className="st-flip-inner" style={{ height: '100%', minHeight: 280 }}>
            <div className="st-flip-face st-flip-front">
              <div style={{ font: '700 20px/1.4 var(--st-display)', color: 'var(--st-text)' }}><StudioRichText text={card.front} /></div>
            </div>
            <div className="st-flip-face st-flip-back">
              <div style={{ font: '450 15.5px/1.7 var(--st-sans)', color: 'var(--st-text)' }}><StudioRichText text={card.back} /></div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', font: '600 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 12 }}>
          {flipped ? 'How did you do?' : 'Tap the card to reveal'}
        </div>
      </div>
      <div className="st-player-foot">
        {flipped ? (
          // Three grades, not two: "Again" and "Got it" force a student who
          // recalled a card slowly to either wipe its interval or claim mastery
          // of it. "Hard" keeps the interval, which is the honest answer most
          // of the time and gives the scheduler a usable middle signal.
          <>
            <button
              onClick={() => grade('again')} className="st-press"
              style={{
                flex: 1, minHeight: 56, borderRadius: 999, cursor: 'pointer',
                border: '1.5px solid rgba(251,113,133,.5)', background: 'rgba(251,113,133,.1)',
                color: '#fb7185', font: '700 15px var(--st-display)',
              }}
            >
              Again
            </button>
            <button
              onClick={() => grade('hard')} className="st-press"
              style={{
                flex: 1, minHeight: 56, borderRadius: 999, cursor: 'pointer',
                border: '1.5px solid rgba(251,191,36,.45)', background: 'rgba(251,191,36,.1)',
                color: '#fbbf24', font: '700 15px var(--st-display)',
              }}
            >
              Hard
            </button>
            <button onClick={() => grade('got_it')} className="st-cta" style={{ flex: 1 }}>Got it</button>
          </>
        ) : (
          <button className="st-cta" style={{ flex: 1 }} onClick={() => setFlipped(true)}>Reveal</button>
        )}
      </div>
    </>
  );
}

/* ── Formulas ────────────────────────────────────────────────────────────── */

function Formulas({ data }: { data: RevisionPayload }) {
  // A full course's formula sheet runs to dozens of entries across every
  // topic; scrolling for one is the wrong interaction on a phone.
  const [q, setQ] = useState('');
  const byTopic = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const m = new Map<string, string[]>();
    for (const f of data.formulas) {
      if (!f.formula) continue;
      if (needle && !`${f.topic_title} ${f.formula}`.toLowerCase().includes(needle)) continue;
      const list = m.get(f.topic_title) ?? [];
      list.push(f.formula);
      m.set(f.topic_title, list);
    }
    return [...m.entries()];
  }, [data, q]);

  const filter = (
    <div style={{ padding: '0 22px 10px' }}>
      <input
        value={q} onChange={e => setQ(e.target.value)}
        placeholder="Filter formulas" aria-label="Filter formulas"
        style={{
          width: '100%', minHeight: 42, padding: '0 16px', borderRadius: 999,
          border: '1px solid var(--st-border)', background: 'var(--st-glass)',
          color: 'var(--st-text)', outline: 'none',
          font: '500 15px var(--st-sans)', caretColor: 'var(--st-lime-text)',
        }}
      />
    </div>
  );

  if (!byTopic.length && q.trim()) {
    return (
      <>
        {filter}
        <div className="st-player-body" style={{ display: 'flex' }}>
          <div style={{ margin: 'auto', textAlign: 'center', font: '500 13.5px var(--st-sans)', color: 'var(--st-text-2)' }}>
            Nothing matches “{q.trim()}”.
          </div>
        </div>
      </>
    );
  }

  if (!byTopic.length) {
    return (
      <div className="st-player-body" style={{ display: 'flex' }}>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <Sigma size={26} color="var(--st-text-3)" style={{ margin: '0 auto 10px' }} />
          <div style={{ font: '700 16px var(--st-display)' }}>No formulas yet</div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
            Formulas from your lessons collect here.
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
    {data.formulas.length > 6 && filter}
    <div className="st-player-body">
      <div className="st-page-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {byTopic.map(([topic, formulas]) => (
          <div key={topic}>
            <div className="st-eyebrow" style={{ color: 'var(--st-aqua)', marginBottom: 8 }}>{topic}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {formulas.map((f, i) => (
                <div key={i} className="st-code" style={{ whiteSpace: 'pre-wrap' }}><StudioRichText text={f} /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

/* ── Practice: PYQ bank ──────────────────────────────────────────────────── */

function Practice({ data }: { data: RevisionPayload }) {
  const [band, setBand] = useState<Band>('easy');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  useEffect(() => setRevealed(new Set()), [band]);
  const qs = data.pyq[band] ?? [];

  return (
    <div className="st-player-body">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['easy', 'medium', 'hard'] as Band[]).map(b => {
          const on = band === b;
          const n = (data.pyq[b] ?? []).length;
          return (
            <button
              key={b} onClick={() => setBand(b)} className="st-chip st-press"
              style={on ? { borderColor: BAND_COLOR[b], color: BAND_COLOR[b], fontWeight: 700, background: 'var(--st-glass-2)' } : undefined}
            >
              {b[0].toUpperCase() + b.slice(1)} · {n}
            </button>
          );
        })}
      </div>
      {qs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--st-text-2)', font: '500 13.5px var(--st-sans)' }}>
          No {band} questions yet.
        </div>
      ) : (
        <div key={band} className="st-page-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {qs.map((q, i) => {
            const open = revealed.has(i);
            return (
              <div key={i} className="st-card" style={{ padding: '15px 16px' }}>
                <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <span style={{
                    font: '700 11px var(--st-display)', color: BAND_COLOR[band], flexShrink: 0,
                    marginTop: 3, fontVariantNumeric: 'tabular-nums',
                  }}>Q{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '600 14.5px/1.55 var(--st-sans)', color: 'var(--st-text)' }}><StudioRichText text={q.question} /></div>
                    <div style={{ font: '500 11.5px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 4 }}>
                      {[q.topic_title, q.bloom_level].filter(Boolean).join(' · ')}
                    </div>
                    {open ? (
                      <div style={{ font: '450 13.5px/1.65 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 10, borderLeft: '3px solid var(--st-border-2)', paddingLeft: 12 }}>
                        <StudioRichText text={q.answer} />
                      </div>
                    ) : (
                      <button
                        onClick={() => { setRevealed(s => new Set(s).add(i)); track('studio_pyq_revealed', { band, index: i }); }}
                        className="st-chip st-press" style={{ marginTop: 10, color: 'var(--st-lime-text)', borderColor: 'rgba(205,244,99,.35)' }}
                      >
                        Reveal answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

function FootIcon({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick} aria-label={label} className="st-press"
      style={{
        width: 56, minHeight: 56, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
        border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

export default function StudioRevision() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [data, setData] = useState<RevisionPayload | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('cards');

  useEffect(() => {
    if (!courseId) return;
    studentApi.revision(courseId).then(setData).catch(() => setError('Could not load revision.'));
    track('studio_revision_viewed', { course_id: courseId });
  }, [courseId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'cards', label: 'Cards' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'practice', label: 'Practice' },
  ];

  return (
    <div className="st-player">
      <div className="st-player-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/study')} aria-label="Close revision" className="st-press"
            style={{
              width: 38, height: 38, borderRadius: 13, flexShrink: 0,
              border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={17} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 14px/1.25 var(--st-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Revision{data ? ` · ${data.name}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(t => {
            const on = tab === t.id;
            const count = t.id === 'cards' ? data?.due_cards.length : undefined;
            return (
              <button
                key={t.id} onClick={() => setTab(t.id)} className="st-chip st-press"
                style={on ? { background: 'var(--st-lime)', color: 'var(--st-ink-on-lime)', borderColor: 'var(--st-lime)', fontWeight: 700 } : undefined}
              >
                {t.id === 'cards' && <Layers size={13} />}{t.label}{count != null && count > 0 ? ` · ${count}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {!data && !error && (
        <div className="st-player-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16 }}>
          <div className="st-skeleton" style={{ height: 260 }} />
          <div className="st-skeleton" style={{ height: 56 }} />
        </div>
      )}
      {error && (
        <div className="st-player-body" style={{ display: 'flex' }}>
          <div style={{ margin: 'auto', textAlign: 'center' }}>
            <div style={{ font: '700 16px var(--st-display)' }}>Something went wrong</div>
            <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>{error}</div>
            <button onClick={() => navigate('/study')} className="st-chip st-press" style={{ marginTop: 14 }}>
              <ChevronLeft size={13} /> Back home
            </button>
          </div>
        </div>
      )}

      {data && tab === 'cards' && (
        <CardsDeck
          key={courseId} data={data} courseId={courseId!}
          onExit={() => navigate('/study')} onTab={setTab}
          onTopic={tid => navigate(`/study/courses/${courseId}/topic/${tid}`)}
        />
      )}
      {data && tab === 'formulas' && <Formulas data={data} />}
      {data && tab === 'practice' && <Practice data={data} />}

      {/* Weak-topic nudge under practice/formulas when relevant */}
      {data && tab !== 'cards' && data.weak_topics.length > 0 && (
        <div style={{ padding: '0 18px 12px' }}>
          <button
            onClick={() => navigate(`/study/courses/${courseId}/topic/${data.weak_topics[0].id}`)}
            className="st-card st-press"
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', textAlign: 'left', color: 'var(--st-text)' }}
          >
            <span style={{ font: '600 12.5px var(--st-sans)', color: 'var(--st-text-2)', flex: 1 }}>
              Weakest topic: <b style={{ color: 'var(--st-text)' }}>{data.weak_topics[0].title}</b>
            </span>
            <ArrowRight size={15} color="var(--st-text-3)" />
          </button>
        </div>
      )}
    </div>
  );
}
