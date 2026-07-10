// Student Studio topic page — one topic's subtopics (notes / slides / quiz)
// plus its published study aids (cheat-sheet, interview prep, assignment).
// All links stay inside /study so the studio experience is self-contained.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ChevronRight, ClipboardList, HelpCircle,
  Layers, Lock, MessageSquareText, ScrollText,
} from 'lucide-react';
import { studentApi, track, type StudentTopicDetail } from '@/api/student';

type Aid = { key: string; to: string; icon: typeof ScrollText; title: string; blurb: string };

export default function StudioTopic() {
  const navigate = useNavigate();
  const { id, topicId } = useParams();
  const [topic, setTopic] = useState<StudentTopicDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !topicId) return;
    studentApi.topic(id, topicId).then(setTopic).catch(() => setError('Could not load this topic.'));
    track('studio_topic_viewed', { topic_id: topicId });
  }, [id, topicId]);

  const base = `/study/courses/${id}/topic/${topicId}`;
  const aids: Aid[] = topic ? ([
    topic.artifacts.summary && {
      key: 'summary', to: `${base}/cheatsheet`, icon: ScrollText,
      title: 'Cheat-sheet', blurb: 'Every key point on one page',
    },
    topic.artifacts.flashcards && {
      key: 'flashcards', to: `${base}/artifact/flashcards`, icon: MessageSquareText,
      title: 'Interview Prep', blurb: 'Questions an interviewer would ask',
    },
    topic.artifacts.assignment && {
      key: 'assignment', to: `${base}/artifact/assignment`, icon: ClipboardList,
      title: 'Assignment', blurb: 'Apply this topic to new scenarios',
    },
  ].filter(Boolean) as Aid[]) : [];

  const published = topic?.subtopics.filter(s => s.published).length ?? 0;

  return (
    <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header: back to course + topic identity */}
      <div className="st-rise" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(`/study/courses/${id}`)} className="st-press" aria-label="Back to course"
          style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={19} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '700 19px/1.2 var(--st-display)', letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {topic?.title ?? '…'}
          </div>
          <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[topic?.code, topic?.course_name].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {error && <div style={{ font: '600 13.5px var(--st-sans)', color: 'var(--st-red)' }}>{error}</div>}

      {!topic && !error && (
        <>
          <div className="st-skeleton" style={{ height: 88 }} />
          <div className="st-skeleton" style={{ height: 240 }} />
        </>
      )}

      {/* Study aids */}
      {aids.length > 0 && (
        <div className="st-rise st-d1" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="st-eyebrow" style={{ padding: '0 2px' }}>Study aids</div>
          {aids.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.key} onClick={() => navigate(a.to)} className="st-card st-press"
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', textAlign: 'left', width: '100%', color: 'var(--st-text)' }}
              >
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                    background: 'rgba(94,234,212,.1)', border: '1px solid rgba(94,234,212,.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={19} color="var(--st-aqua)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '700 15px var(--st-display)', letterSpacing: '-0.01em' }}>{a.title}</div>
                  <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>{a.blurb}</div>
                </div>
                <ChevronRight size={17} color="var(--st-text-3)" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Subtopics */}
      {topic && (topic.subtopics.length === 0 ? (
        <div className="st-card st-rise st-d2" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ font: '700 16px var(--st-display)' }}>
            {aids.length > 0 ? 'No lessons published yet' : 'Nothing published yet'}
          </div>
          <div style={{ font: '500 13px var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4 }}>
            {aids.length > 0 ? 'The study aids above are ready — lessons are on the way.' : 'Check back soon.'}
          </div>
        </div>
      ) : (
        <div className="st-rise st-d2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="st-eyebrow" style={{ padding: '0 2px' }}>
            {published}/{topic.subtopics.length} lesson{topic.subtopics.length === 1 ? '' : 's'} available
          </div>
          <div className="st-card" style={{ overflow: 'hidden' }}>
            {topic.subtopics.map((s, si) => {
              const last = si === topic.subtopics.length - 1;
              const row = {
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left' as const,
                padding: '14px 16px', border: 'none', background: 'transparent',
                borderBottom: last ? 'none' : '1px solid var(--st-border)', color: 'var(--st-text)',
              };
              if (!s.published) {
                return (
                  <div key={s.concept_id} style={{ ...row, opacity: 0.45 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 11, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--st-glass-2)', border: '1px solid var(--st-border)', color: 'var(--st-text-3)',
                    }}><Lock size={13} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 14px/1.35 var(--st-sans)' }}>{s.title}</div>
                      <div style={{ font: '500 11.5px var(--st-sans)', color: 'var(--st-text-3)', marginTop: 2 }}>Not published yet</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={s.concept_id} style={row}>
                  <button
                    onClick={() => navigate(`${base}/notes/${s.concept_id}`)} className="st-press"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, background: 'transparent', border: 'none', textAlign: 'left', color: 'var(--st-text)', padding: 0 }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 11, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--st-glass-2)', border: '1px solid var(--st-border)',
                      font: '700 12.5px var(--st-display)', color: 'var(--st-text-2)',
                    }}>{si + 1}</div>
                    <div style={{ font: '600 14px/1.35 var(--st-sans)', flex: 1, minWidth: 0 }}>{s.title}</div>
                  </button>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <FormatChip icon={BookOpen} label="Notes" onClick={() => navigate(`${base}/notes/${s.concept_id}`)} />
                    {s.has_slides && <FormatChip icon={Layers} label="Slides" onClick={() => navigate(`${base}/slides/${s.concept_id}`)} />}
                    {s.has_quiz && <FormatChip icon={HelpCircle} label="Quiz" onClick={() => navigate(`${base}/quiz/${s.concept_id}`)} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FormatChip({ icon: Icon, label, onClick }: { icon: typeof BookOpen; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="st-chip st-press" style={{ padding: '7px 10px' }}>
      <Icon size={14} />
    </button>
  );
}
