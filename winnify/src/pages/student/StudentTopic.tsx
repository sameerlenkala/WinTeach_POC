// Student topic landing page: the subtopics of one topic (notes / slides /
// quiz) plus the topic-level artifacts published for it — Cheat-sheet,
// Interview Prep, and a student-safe Assignment. Sits between the course
// syllabus (StudentCourseTopics) and the concept reader, mirroring the faculty
// studio but gated to approved content. Mobile-first, FotMob-style.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ChevronRight, FileText, Layers, HelpCircle,
  Loader2, Lock, ScrollText, MessageSquareText, ClipboardList,
} from 'lucide-react';
import { studentApi, type StudentTopicDetail } from '@/api/student';

type ArtCard = {
  key: 'summary' | 'flashcards' | 'assignment';
  to: string;
  icon: typeof ScrollText;
  title: string;
  blurb: string;
};

export default function StudentTopic() {
  const navigate = useNavigate();
  const { id, topicId } = useParams();
  const [topic, setTopic] = useState<StudentTopicDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !topicId) return;
    studentApi.topic(id, topicId).then(setTopic).catch(() => setError('Could not load this topic.'));
  }, [id, topicId]);

  const base = `/home/courses/${id}/topic/${topicId}`;
  const artCards: ArtCard[] = topic ? ([
    topic.artifacts.summary && {
      key: 'summary', to: `${base}/cheatsheet`, icon: ScrollText,
      title: 'Cheat-sheet', blurb: 'Last-minute exam revision — every key point on one page',
    },
    topic.artifacts.flashcards && {
      key: 'flashcards', to: `${base}/artifact/flashcards`, icon: MessageSquareText,
      title: 'Interview Prep', blurb: 'The questions an interviewer would actually ask',
    },
    topic.artifacts.assignment && {
      key: 'assignment', to: `${base}/artifact/assignment`, icon: ClipboardList,
      title: 'Assignment', blurb: 'Apply this topic to novel scenarios',
    },
  ].filter(Boolean) as ArtCard[]) : [];

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Sticky compact header — back to course + topic name */}
      <div
        className="sticky top-0 z-30 px-3 md:px-9"
        style={{
          background: 'color-mix(in oklab, var(--app-bg) 86%, transparent)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, minHeight: 52 }}>
          <button
            onClick={() => navigate(`/home/courses/${id}`)}
            aria-label="Back to course"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', borderRadius: 12, flexShrink: 0,
            }}
          >
            <ArrowLeft size={19} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {topic?.title ?? 'Topic'}
            </div>
            {topic && (
              <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {[topic.code, topic.course_name].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-9 md:py-6" style={{ maxWidth: 920, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--tint-red-fg)', fontSize: 'var(--fs-small)' }}>{error}</div>}
        {!topic && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', padding: '24px 0' }}>
            <Loader2 size={16} className="animate-spin" /> Loading topic…
          </div>
        )}

        {topic && (
          <>
            {/* Topic artifacts — study aids for the whole topic */}
            {artCards.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 10 }}>
                  Study aids
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {artCards.map(c => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.key}
                        onClick={() => navigate(c.to)}
                        className="ds-rise"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%',
                          background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)',
                          padding: '14px 16px', cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--w-r4)', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--tint-brand-bg)',
                        }}>
                          <Icon size={19} color="var(--tint-brand-fg)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-body)', color: 'var(--text)' }}>{c.title}</div>
                          <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{c.blurb}</div>
                        </div>
                        <ChevronRight size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subtopics — each opens the notes reader; slides/quiz are direct chips.
                The count label only shows when there are lessons; an empty topic
                falls through to a single, unambiguous empty state below. */}
            {topic.subtopics.length === 0 ? (
              <div className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', padding: '32px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                  {artCards.length > 0 ? 'No lessons published yet' : 'Nothing published yet'}
                </div>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)' }}>
                  {artCards.length > 0
                    ? 'The study aids above are ready — lessons are on the way.'
                    : 'This topic’s lessons haven’t been published. Check back soon.'}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 10 }}>
                  {topic.subtopics.length} subtopic{topic.subtopics.length === 1 ? '' : 's'}
                </div>
                <div className="ds-rise" style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--w-r5)', overflow: 'hidden' }}>
                {topic.subtopics.map((s, si) => {
                  const openNotes = () => navigate(`${base}/notes/${s.concept_id}`);
                  const last = si === topic.subtopics.length - 1;
                  // Locked: on the roadmap but not yet faculty-approved — shown
                  // greyed and non-interactive, matching the course page.
                  if (!s.published) {
                    return (
                      <div
                        key={s.concept_id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', minHeight: 60,
                          borderBottom: last ? 'none' : '1px solid var(--border)', opacity: 0.55,
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 'var(--w-r4)', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--surface-muted, var(--border))', color: 'var(--text-3)',
                          fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        }}>{si + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text-2)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11, color: 'var(--text-3)' }}>
                            <Lock size={11} /> Not published yet
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={s.concept_id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', minHeight: 60,
                        borderBottom: last ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <div
                        role="button" tabIndex={0}
                        onClick={openNotes}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNotes(); } }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 'var(--w-r4)', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--surface-muted, var(--border))', color: 'var(--text-3)',
                          fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        }}>{si + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--fs-body)', color: 'var(--text)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                        </div>
                      </div>

                      {/* Format chips — notes always, slides/quiz when published */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Chip label="Notes" icon={BookOpen} onClick={openNotes} />
                        {s.has_slides && <Chip label="Slides" icon={Layers} onClick={() => navigate(`${base}/slides/${s.concept_id}`)} />}
                        {s.has_quiz && <Chip label="Quiz" icon={HelpCircle} onClick={() => navigate(`${base}/quiz/${s.concept_id}`)} />}
                      </div>
                    </div>
                  );
                })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ label, icon: Icon, onClick }: { label: string; icon: typeof FileText; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer',
        fontSize: 11, fontWeight: 600, padding: '5px 9px', borderRadius: 999,
        border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text-2)',
      }}
    >
      <Icon size={13} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
