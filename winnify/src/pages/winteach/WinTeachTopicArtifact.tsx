// Full studio page for the topic-level artifacts that used to open in a modal:
// Assignment, Faculty Diagnostic, and Interview Prep (flashcards). The Summary
// cheat sheet has its own richer page (WinTeachCheatSheet); everything else
// renders here so no artifact opens in a modal.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Btn, Badge } from './WinTeachUI';
import { IBack, IAssess, IFile, IFlash } from './WinTeachIcons';
import { useCourse, useTopic } from '@/api/hooks';
import { generationApi, type ArtifactType } from '@/api/generation';
import { studentApi } from '@/api/student';
import { MathText } from './WinTeachConceptReader';

type Kind = 'assignment' | 'faculty_diagnostic' | 'flashcards';
const KINDS: Kind[] = ['assignment', 'faculty_diagnostic', 'flashcards'];

const META: Record<Kind, { eyebrow: string; icon: React.FC; blurb: string }> = {
  assignment: { eyebrow: 'Assignment', icon: IAssess, blurb: 'apply the topic to novel scenarios' },
  faculty_diagnostic: { eyebrow: 'Faculty Diagnostic · Private', icon: IFile, blurb: 'a pre-teaching self-check — nothing reported upward' },
  flashcards: { eyebrow: 'Interview Prep', icon: IFlash, blurb: 'the questions an interviewer would actually ask' },
};

/* ── inline text: **bold** + $math$ ──────────────────────────────────────── */
function Rich({ text }: { text: any }) {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2
    ? <b key={i} style={{ fontWeight: 700, color: W.text }}><MathText text={p} /></b>
    : <MathText key={i} text={p} />))}</>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: W.brandTintFg, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function SubtopicChip({ label }: { label?: string }) {
  if (!label) return null;
  return <span style={{ fontSize: 10.5, fontWeight: 600, color: W.text3, background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 99, padding: '2px 9px', whiteSpace: 'nowrap' }}>{label}</span>;
}

const DIFF_BADGE: Record<string, 'green' | 'orange' | 'red'> = { basic: 'green', intermediate: 'orange', advanced: 'red' };

/* ── Interview Prep (flashcards) ─────────────────────────────────────────── */
function InterviewBody({ content }: { content: any }) {
  const cards: any[] = content.cards ?? [];
  if (!cards.length) return null;
  if (!cards[0]?.question) return (   // legacy front/back deck
    <Section title={`${cards.length} cards`}>
      {cards.map((c: any, i: number) => (
        <div key={i} style={{ padding: '8px 12px', background: W.surfaceMuted, borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
          <b>{c.front}</b> <span style={{ color: W.text3 }}>→</span> {c.back}
        </div>
      ))}
    </Section>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cards.map((c: any, i: number) => (
        <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 12, padding: '14px 18px', background: W.card, boxShadow: W.shadowCard }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>Q{c.id ?? i + 1}</span>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: W.text, lineHeight: 1.45, flex: 1, fontFamily: W.fontDisplay }}><Rich text={c.question} /></div>
            {c.difficulty && <Badge variant={DIFF_BADGE[c.difficulty] ?? 'muted'}>{c.difficulty}</Badge>}
          </div>
          <div style={{ marginLeft: 27 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.65, color: W.text }}><Rich text={c.answer} /></div>
            {(c.key_points ?? []).length > 0 && (
              <div style={{ marginTop: 10, background: W.surfaceMuted, borderRadius: 8, padding: '9px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: W.brandTintFg, marginBottom: 5, fontFamily: W.fontDisplay }}>What they listen for</div>
                {c.key_points.map((k: string, ki: number) => (
                  <div key={ki} style={{ display: 'flex', gap: 7, fontSize: 12.5, lineHeight: 1.55, color: W.text, marginBottom: 2 }}>
                    <span style={{ color: W.brandTintFg, flexShrink: 0 }}>•</span><span><Rich text={k} /></span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 9, flexWrap: 'wrap' }}>
              {c.follow_up && <span style={{ fontSize: 12.5, fontStyle: 'italic', color: W.text3 }}>↳ Likely follow-up: <Rich text={c.follow_up} /></span>}
              <span style={{ marginLeft: 'auto' }}><SubtopicChip label={c.subtopic} /></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Assignment ──────────────────────────────────────────────────────────── */
function AssignmentBody({ content }: { content: any }) {
  const tasks: any[] = content.tasks ?? [];
  return (
    <>
      <Section title="Tasks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((t: any, i: number) => (
            <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 12, padding: '14px 18px', background: W.card, boxShadow: W.shadowCard }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 7, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: W.text, fontFamily: W.fontDisplay }}>{t.id ?? i + 1}. {t.title ?? ''}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {t.marks != null && <Badge variant="blue">{t.marks}m</Badge>}
                  {t.bloom_level && <Badge variant="muted">{t.bloom_level}</Badge>}
                </span>
              </div>
              {t.scenario && <div style={{ fontSize: 13, lineHeight: 1.6, color: W.text2, fontStyle: 'italic', borderLeft: `2px solid ${W.borderStrong}`, paddingLeft: 11, marginBottom: 8 }}><Rich text={t.scenario} /></div>}
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: W.text }}><Rich text={t.prompt} /></div>
              {t.deliverable && <div style={{ fontSize: 12.5, color: W.text2, marginTop: 7 }}><b style={{ color: W.text }}>Deliverable:</b> <Rich text={t.deliverable} /></div>}
              {(t.subtopics ?? []).length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                  {t.subtopics.map((s: string, si: number) => <SubtopicChip key={si} label={s} />)}
                </div>
              )}
              {(t.model_answer_outline ?? []).length > 0 && (
                <details style={{ marginTop: 9 }}>
                  <summary style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: W.brandTintFg, cursor: 'pointer' }}>Model answer outline (instructor copy)</summary>
                  <div style={{ marginTop: 6 }}>
                    {t.model_answer_outline.map((m: string, mi: number) => <div key={mi} style={{ fontSize: 12.5, lineHeight: 1.6, color: W.text2 }}>• <Rich text={m} /></div>)}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Rubric">
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
          <thead><tr>
            {['Criterion', 'Points', 'Descriptor'].map(h => <th key={h} style={{ textAlign: 'left', padding: '5px 9px', borderBottom: `1px solid ${W.borderStrong}`, color: W.text2, fontWeight: 600 }}>{h}</th>)}
          </tr></thead>
          <tbody>{(content.rubric ?? []).map((r: any, i: number) => (
            <tr key={i}>
              <td style={{ padding: '6px 9px', borderBottom: `1px solid ${W.border}`, fontWeight: 600, color: W.text, verticalAlign: 'top' }}><Rich text={r.criterion} /></td>
              <td style={{ padding: '6px 9px', borderBottom: `1px solid ${W.border}`, color: W.text, verticalAlign: 'top', fontVariantNumeric: 'tabular-nums' }}>{r.points}</td>
              <td style={{ padding: '6px 9px', borderBottom: `1px solid ${W.border}`, color: W.text2, verticalAlign: 'top' }}><Rich text={r.descriptor} /></td>
            </tr>
          ))}</tbody>
        </table>
      </Section>
      {content.model_solution && (   // legacy single blob
        <details style={{ marginBottom: 18 }}>
          <summary style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: W.brandTintFg, cursor: 'pointer' }}>Model solution (instructor copy)</summary>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: W.text, marginTop: 6 }}>{content.model_solution}</div>
        </details>
      )}
      {content.integrity_policy && (
        <Section title="Integrity policy"><div style={{ fontSize: 13, lineHeight: 1.6, color: W.text }}><Rich text={content.integrity_policy} /></div></Section>
      )}
    </>
  );
}

/* ── Faculty Diagnostic ──────────────────────────────────────────────────── */
const DIM_LABEL: Record<string, string> = {
  content_mastery: 'Content mastery', misconception_awareness: 'Misconception awareness',
  pedagogical_readiness: 'Pedagogical readiness', connection_depth: 'Connection & depth',
};
function DiagnosticBody({ content }: { content: any }) {
  return (
    <>
      {(content.dimensions ?? []).map((d: any, i: number) => (
        <Section key={i} title={DIM_LABEL[d.name] ?? String(d.name ?? '').replace(/_/g, ' ')}>
          {(d.items ?? []).map((it: any, j: number) => (
            <div key={j} style={{ border: `1px solid ${W.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 9, background: W.card, boxShadow: W.shadowCard }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: W.text, lineHeight: 1.45, flex: 1, fontFamily: W.fontDisplay }}>{it.probe ?? it.prompt}</div>
                <SubtopicChip label={it.subtopic} />
              </div>
              {it.what_good_looks_like && <div style={{ fontSize: 12.5, lineHeight: 1.55, color: W.greenFg, marginBottom: 3 }}>✓ {it.what_good_looks_like}</div>}
              {it.red_flags && <div style={{ fontSize: 12.5, lineHeight: 1.55, color: W.redFg, marginBottom: 3 }}>⚑ {it.red_flags}</div>}
              {it.remediation && <div style={{ fontSize: 12.5, lineHeight: 1.55, color: W.text2 }}><b style={{ color: W.text }}>Fix:</b> {it.remediation}</div>}
            </div>
          ))}
        </Section>
      ))}
      {(content.gap_map ?? []).length > 0 && (
        <Section title="Gap map">
          {content.gap_map.map((g: any, i: number) => typeof g === 'string'
            ? <div key={i} style={{ marginBottom: 3, fontSize: 13 }}>• {g}</div>   // legacy strings
            : (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 12, padding: '10px 15px', marginBottom: 8, background: W.card }}>
                <div style={{ marginBottom: 5 }}><SubtopicChip label={g.subtopic} /></div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: W.text }}><b>Likely struggle:</b> {g.likely_student_struggle}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: W.text2 }}><b style={{ color: W.text }}>Countermeasure:</b> {g.classroom_countermeasure}</div>
              </div>
            ))}
        </Section>
      )}
    </>
  );
}

function hasBody(kind: Kind, c: any): boolean {
  if (!c) return false;
  if (kind === 'assignment') return (c.tasks ?? []).length > 0;
  if (kind === 'flashcards') return (c.cards ?? []).length > 0;
  return (c.dimensions ?? []).length > 0;
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function WinTeachTopicArtifact({ student }: { student?: boolean } = {}) {
  const navigate = useNavigate();
  const { id: courseId, topicId, type } = useParams();
  const kind = (KINDS.includes(type as Kind) ? type : 'assignment') as Kind;
  // Faculty hooks 403 for students — skip them and read the published payload.
  const { data: course } = useCourse(student ? '' : courseId ?? '');
  const { data: topic } = useTopic(student ? '' : courseId ?? '', topicId ?? '');
  const [content, setContent] = useState<any>(null);
  const [meta2, setMeta2] = useState<{ topic_title?: string; code?: string }>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');

  useEffect(() => {
    if (!topicId || !courseId) return;
    setStatus('loading'); setContent(null);
    if (student) {
      // Only assignment + flashcards are student-facing here; the private
      // Faculty Diagnostic is never served.
      if (kind !== 'assignment' && kind !== 'flashcards') { setStatus('empty'); return; }
      studentApi.topicArtifact(courseId, topicId, kind)
        .then(r => {
          setMeta2({ topic_title: r.topic_title, code: r.code });
          setContent(r.content); setStatus(hasBody(kind, r.content) ? 'ready' : 'empty');
        })
        .catch(() => setStatus('empty'));
    } else {
      generationApi.getTopicJob(topicId)
        .then(j => generationApi.getArtifact(j.id, kind as ArtifactType))
        .then(r => { setContent(r.content); setStatus(hasBody(kind, r.content) ? 'ready' : 'empty'); })
        .catch(() => setStatus('empty'));
    }
  }, [topicId, courseId, kind, student]);

  const meta = META[kind];
  const Icon = meta.icon;
  const courseCode = student ? (meta2.code ?? '') : ((course as any)?.code ?? courseId ?? '');
  const topicTitle = student
    ? (meta2.topic_title ?? content?.title ?? 'Topic')
    : ((topic as any)?.title ?? content?.title ?? 'Topic');
  const heroTitle = kind === 'assignment' ? (content?.title ?? topicTitle) : topicTitle;
  // Student-studio mounts (/study/*) keep the back link inside /study.
  const inStudioApp = useLocation().pathname.startsWith('/study');
  const studioPath = inStudioApp
    ? `/study/courses/${courseId}/topic/${topicId}`
    : student
      ? `/home/courses/${courseId}/topic/${topicId}`
      : `/winteach/courses/${courseId}/topic/${topicId}`;
  const backLabel = student ? 'Back to topic' : 'Back to studio';

  const count = kind === 'assignment' ? (content?.tasks ?? []).length
    : kind === 'flashcards' ? (content?.cards ?? []).length
      : (content?.dimensions ?? []).reduce((n: number, d: any) => n + (d.items ?? []).length, 0);
  const countLabel = kind === 'assignment' ? 'task' : kind === 'flashcards' ? 'question' : 'self-check';

  return (
    <>
      <WinTopbar title={meta.eyebrow} actions={
        <Btn variant="ghost" onClick={() => navigate(studioPath)}>
          <span style={{ width: 15, height: 15, display: 'inline-flex' }}><IBack /></span>{backLabel}
        </Btn>
      } />
      <WinContent>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* hero */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, border: `1px solid ${W.border}`, background: W.card, boxShadow: W.shadowCard, padding: '22px 26px', marginBottom: 22 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--app-bg-grad)', opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: W.brandTintBg, color: W.brandTintFg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: 14, height: 14, display: 'flex' }}><Icon /></span>
                </span>
                <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: W.brandTintFg }}>{meta.eyebrow}</span>
                {courseCode && <span style={{ fontSize: 11.5, color: W.text3, fontWeight: 600 }}>{courseCode}</span>}
              </div>
              <h1 style={{ fontFamily: W.fontDisplay, fontWeight: 800, fontSize: 25, lineHeight: 1.2, color: W.text, margin: 0 }}>{heroTitle}</h1>
              <div style={{ fontSize: 12.5, color: W.text2, marginTop: 9 }}>
                {status === 'ready' && `${count} ${countLabel}${count !== 1 ? 's' : ''} · `}{meta.blurb}
                {kind === 'assignment' && content?.total_marks != null && ` · ${content.total_marks} marks`}
                {kind === 'assignment' && content?.estimated_time_minutes != null && ` · ~${content.estimated_time_minutes} min`}
              </div>
            </div>
          </div>

          {status === 'loading' && <div style={{ textAlign: 'center', color: W.text2, fontSize: 13.5, padding: '60px 0' }}>Loading…</div>}

          {status === 'empty' && (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: W.text, marginBottom: 6 }}>
                {content?.error ? 'Not ready yet' : 'Nothing generated yet'}
              </div>
              <div style={{ fontSize: 13, color: W.text2, marginBottom: 16 }}>
                {student
                  ? `This topic doesn’t have ${kind === 'assignment' ? 'an assignment' : 'interview prep'} yet.`
                  : (content?.error ?? `Generate this ${meta.eyebrow.split(' ')[0].toLowerCase()} from the studio.`)}
              </div>
              <Btn variant="primary" onClick={() => navigate(studioPath)}>{backLabel}</Btn>
            </div>
          )}

          {status === 'ready' && kind === 'flashcards' && <InterviewBody content={content} />}
          {status === 'ready' && kind === 'assignment' && <AssignmentBody content={content} />}
          {status === 'ready' && kind === 'faculty_diagnostic' && <DiagnosticBody content={content} />}
        </div>
      </WinContent>
    </>
  );
}
