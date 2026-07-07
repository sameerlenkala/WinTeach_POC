// Mastery Map (SCR-07) — per-topic mastery bars + weakest-topic CTAs for a
// course. Read-only progression view; deep-links into the weakest lessons.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { studentApi, type MasteryPayload } from '@/api/student';

const barColor = (pct: number) =>
  pct >= 70 ? 'var(--tint-teal-fg)' : pct >= 40 ? 'var(--brand)' : 'var(--text-3)';

export default function StudentMastery() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<MasteryPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    studentApi.mastery(id).then(setData).catch(() => setError('Could not load mastery.'));
  }, [id]);

  const openTopic = (topicId: string) => {
    // Jump to the course; the syllabus scrolls the student to the topic.
    navigate(`/home/courses/${id}#topic-${topicId}`);
  };

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
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)' }}>Mastery</div>
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
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', padding: '18px 20px', marginBottom: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Course mastery</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, color: barColor(data.mastery_pct), lineHeight: 1.1, marginTop: 4 }}>{data.mastery_pct}%</div>
            </div>

            {data.weak_topics.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Focus next</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.weak_topics.map(t => (
                    <button key={t.id} onClick={() => openTopic(t.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', width: '100%',
                      border: '1px solid var(--border)', borderLeft: '3px solid var(--text-3)', borderRadius: 10, padding: '12px 14px', background: 'var(--card)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.mastery_pct}% mastery</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-3)" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>All topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.topics.map(t => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{t.title}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>{t.mastery_pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-muted, var(--border))', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.mastery_pct}%`, borderRadius: 999, background: barColor(t.mastery_pct), transition: 'width .4s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{t.read}/{t.published_lessons} lessons read</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
