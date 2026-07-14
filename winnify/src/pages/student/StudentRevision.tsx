// Revision Hub (SCR-06) — spaced-repetition flashcards, formula sheet, and
// PYQ-style practice, assembled from a course's approved notes. Mobile-first.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw, Check } from 'lucide-react';
import { studentApi, track, type RevisionPayload } from '@/api/student';
import { RichText } from '@/pages/winteach/WinTeachConceptReader';

type Tab = 'cards' | 'formulas' | 'practice';

export default function StudentRevision() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<RevisionPayload | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('cards');

  useEffect(() => {
    if (!id) return;
    studentApi.revision(id).then(setData).catch(() => setError('Could not load revision.'));
    track('learn_revision_opened', { course_id: id });
  }, [id]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'cards', label: 'Flashcards', count: data?.due_cards.length ?? 0 },
    { id: 'formulas', label: 'Formulas', count: data?.formulas.length ?? 0 },
    { id: 'practice', label: 'Practice', count: data ? data.pyq.easy.length + data.pyq.medium.length + data.pyq.hard.length : 0 },
  ];

  return (
    <div style={{ minHeight: '100%' }}>
      <div className="sticky top-0 z-30 px-3 md:px-9" style={{
        background: 'color-mix(in oklab, var(--app-bg) 86%, transparent)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, minHeight: 52 }}>
          <button onClick={() => navigate(id ? `/home/courses/${id}` : '/home/courses')} aria-label="Back"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', borderRadius: 12, flexShrink: 0 }}>
            <ArrowLeft size={19} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>Revision</div>
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.name ?? ''}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-9 md:py-6" style={{ maxWidth: 720, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
        {!data && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', padding: '24px 0' }}>
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}

        {data && (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4">
              {tabs.map(t => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flexShrink: 0, cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 999,
                    fontSize: 'var(--fs-small)', fontWeight: 600, fontFamily: 'var(--font-sans)',
                    border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                    background: active ? 'var(--brand)' : 'var(--card)',
                    color: active ? 'var(--brand-fg)' : 'var(--text-2)',
                  }}>{t.label} · {t.count}</button>
                );
              })}
            </div>

            {tab === 'cards' && <FlashcardRunner data={data} courseId={id!} />}
            {tab === 'formulas' && <FormulaSheet data={data} />}
            {tab === 'practice' && <PracticeBank data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

function FlashcardRunner({ data, courseId }: { data: RevisionPayload; courseId: string }) {
  const navigate = useNavigate();
  const [queue] = useState(() => data.due_cards);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const card = queue[idx];

  const grade = (result: 'again' | 'got_it') => {
    if (!card) return;
    studentApi.reviewCard({ course_id: courseId, topic_id: card.topic_id, concept_id: card.concept_id, card_key: card.card_key, result }).catch(() => {});
    track('learn_card_reviewed', { result, bucket_before: card.bucket });
    setReviewed(r => r + 1);
    setFlipped(false);
    setIdx(i => i + 1);
  };

  if (!queue.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-2)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
        You're ahead of schedule — no cards due right now.
        <div style={{ marginTop: 14 }}>
          <button onClick={() => navigate(`/home/courses/${courseId}`)} style={btnGhost}>Back to course</button>
        </div>
      </div>
    );
  }

  if (idx >= queue.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-2)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        Session complete — <strong style={{ color: 'var(--text)' }}>{reviewed}</strong> card{reviewed === 1 ? '' : 's'} reviewed.
        <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => { setIdx(0); setReviewed(0); }} style={btnGhost}>Review again</button>
          <button onClick={() => navigate(`/home/courses/${courseId}`)} style={btnPrimary}>Back to course</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-3)', marginBottom: 10 }}>
        <span>{card.topic_title}</span>
        <span>{idx + 1} / {queue.length}</span>
      </div>
      <div onClick={() => setFlipped(f => !f)} style={{
        minHeight: 220, border: `1.5px solid ${flipped ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '28px 24px', cursor: 'pointer', background: flipped ? 'var(--tint-brand-bg)' : 'var(--card)',
      }}>
        {!flipped ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Question</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.4, color: 'var(--text)' }}><RichText inline text={card.front} /></div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>Tap to reveal</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tint-brand-fg)', marginBottom: 12 }}>Answer</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}><RichText text={card.back} /></div>
          </>
        )}
      </div>
      {flipped && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={() => grade('again')} style={{ ...btnGhost, flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RotateCcw size={15} /> Again
          </button>
          <button onClick={() => grade('got_it')} style={{ ...btnPrimary, flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Check size={15} /> Got it
          </button>
        </div>
      )}
    </div>
  );
}

function FormulaSheet({ data }: { data: RevisionPayload }) {
  const byTopic = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const f of data.formulas) (m[f.topic_title] ??= []).push(f.formula);
    return m;
  }, [data]);
  if (!data.formulas.length) {
    return <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-2)' }}>No formulas or syntax rules for this course.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byTopic).map(([topic, list]) => (
        <div key={topic}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{topic}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map((f, i) => (
              <div key={i} style={{ fontSize: 13.5, lineHeight: 1.6, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)' }}>
                <RichText inline text={f} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PracticeBank({ data }: { data: RevisionPayload }) {
  const bands: { key: 'easy' | 'medium' | 'hard'; label: string; color: string; bg: string }[] = [
    { key: 'easy', label: 'Easy', color: 'var(--tint-teal-fg)', bg: 'var(--tint-teal-bg)' },
    { key: 'medium', label: 'Medium', color: 'var(--tint-orange-fg, #b45309)', bg: 'var(--tint-orange-bg, #fef3c7)' },
    { key: 'hard', label: 'Hard', color: 'var(--tint-red-fg)', bg: 'var(--tint-red-bg, #fee2e2)' },
  ];
  const total = data.pyq.easy.length + data.pyq.medium.length + data.pyq.hard.length;
  if (!total) return <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-2)' }}>No practice questions yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bands.map(b => data.pyq[b.key].map((q, i) => (
        <PracticeCard key={`${b.key}${i}`} q={q} label={b.label} color={b.color} bg={b.bg} />
      )))}
    </div>
  );
}

function PracticeCard({ q, label, color, bg }: { q: { topic_title: string; question: string; answer: string; bloom_level?: string }; label: string; color: string; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', background: 'var(--card)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color }}>{label}</span>
        {q.bloom_level && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{q.bloom_level}</span>}
        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}>{q.topic_title}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}><RichText inline text={q.question} /></div>
      {q.answer && (
        <>
          <button onClick={() => { setOpen(o => !o); if (!open) track('learn_pyq_revealed', { level: label }); }} style={{ ...btnGhost, marginTop: 10, fontSize: 12.5, padding: '5px 12px' }}>
            {open ? 'Hide answer' : 'Show answer'}
          </button>
          {open && <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, color: 'var(--text-2)' }}><RichText text={q.answer} /></div>}
        </>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  cursor: 'pointer', border: 'none', borderRadius: 10, padding: '9px 18px',
  background: 'var(--brand)', color: 'var(--brand-fg)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)',
};
const btnGhost: React.CSSProperties = {
  cursor: 'pointer', borderRadius: 10, padding: '9px 18px',
  background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--text-2)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)',
};
