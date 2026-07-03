// LMS-style reader for per-concept generations (Student Notes, Slides, Quiz).
// Routes: /winteach/courses/:id/topic/:topicId/{notes|slides|quiz}/:conceptId
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Btn, Badge } from './WinTeachUI';
import { IBack, ICheck, INotes } from './WinTeachIcons';
import { useCourse, useTopic } from '@/api/hooks';
import { generationApi, CONCEPT_TYPES, type GenJob, type ConceptArtifactState, type ConceptArtType } from '@/api/generation';

/* ── per-type metadata ───────────────────────────────────────────────────── */

const READER_META: Record<ConceptArtType, { label: string; tab: string; segment: string; emptyHint: string }> = {
  student_notes: { label: 'Student notes', tab: 'Notes', segment: 'notes', emptyHint: 'Generate this lesson from the studio.' },
  slides: { label: 'Slides', tab: 'Slides', segment: 'slides', emptyHint: 'Slides derive from approved notes — generate them from the studio.' },
  quiz: { label: 'Quiz', tab: 'Quiz', segment: 'quiz', emptyHint: 'The quiz derives from approved notes — generate it from the studio.' },
};

/* ── status helpers ──────────────────────────────────────────────────────── */

function artState(job: GenJob | null, cid: string, type: ConceptArtType): ConceptArtifactState | undefined {
  return (job?.concept_artifacts ?? []).find(c => c.concept_id === cid && c.artifact_type === type);
}

function StateIcon({ s }: { s?: ConceptArtifactState }) {
  const approved = s?.approval_status === 'approved';
  const status = s?.status;
  if (approved || status === 'ready') {
    return (
      <span style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: approved ? 'var(--status-green)' : 'var(--tint-brand-bg)',
        color: approved ? '#fff' : 'var(--tint-brand-fg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700,
      }}>✓</span>
    );
  }
  if (status === 'generating') {
    return <span className="wt-spin" style={{ width: 12, height: 12, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />;
  }
  return <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${W.borderStrong}`, flexShrink: 0, display: 'inline-block', background: status === 'error' ? W.redBg : 'transparent' }} />;
}

/* ── article building blocks ─────────────────────────────────────────────── */

function Section({ n, title, children }: { n?: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, color: W.text,
        letterSpacing: '-0.01em', margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${W.border}`,
      }}>
        {n != null && <span style={{ fontFamily: W.fontDisplay, fontSize: 12, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</span>}
        {title}
      </h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: W.text2 }}>{children}</div>
    </section>
  );
}

function NotesArticle({ content }: { content: any }) {
  const core = content?.core ?? {};
  const opening = content?.opening ?? {};
  const closing = content?.closing ?? {};
  const def = core?.core_concept?.formal_definition;
  const intuition = core?.core_concept?.mental_model_analogy ?? core?.core_concept?.intuition ?? opening?.hook;
  const mech = core?.deep_dive?.architecture_and_mechanism?.explanation;
  const code = core?.deep_dive?.code_or_formalization;
  const worked = core?.practical_understanding?.worked_example;
  const applications = core?.practical_understanding?.applications ?? core?.practical_understanding?.real_world_applications;
  const hasApplications = Array.isArray(applications) ? applications.length > 0 : Boolean(applications);
  const mistakes = closing?.sections?.common_mistakes ?? [];
  const revision = closing?.sections?.revision_section;
  const hasRevision = (revision?.key_takeaways?.length ?? 0) > 0
    || (revision?.important_definitions?.length ?? 0) > 0
    || (revision?.active_recall_prompts?.length ?? 0) > 0;
  let n = 0;

  return (
    <>
      {def && (
        <Section n={++n} title="Definition">
          <p style={{ margin: 0, fontSize: 15, color: W.text, lineHeight: 1.75 }}>{def}</p>
          {intuition && <p style={{ margin: '12px 0 0' }}>{intuition}</p>}
        </Section>
      )}
      {mech && <Section n={++n} title="Architecture & mechanism"><p style={{ margin: 0 }}>{mech}</p></Section>}
      {code?.applicable && code?.content && (
        <Section n={++n} title={`Code${code.language_or_system ? ` — ${code.language_or_system}` : ''}`}>
          <pre style={{
            background: '#0f1117', color: '#e2e6f0', borderRadius: 8, padding: '16px 18px',
            overflow: 'auto', fontSize: 12.5, lineHeight: 1.6, margin: 0,
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
          }}>{code.content}</pre>
        </Section>
      )}
      {worked && <Section n={++n} title="Worked example"><p style={{ margin: 0 }}>{worked}</p></Section>}
      {hasApplications && (
        <Section n={++n} title="Real-world applications">
          {Array.isArray(applications)
            ? <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>{applications.map((a: any, i: number) => <li key={i} style={{ marginBottom: 6 }}>{typeof a === 'string' ? a : a?.text ?? JSON.stringify(a)}</li>)}</ul>
            : <p style={{ margin: 0 }}>{applications}</p>}
        </Section>
      )}
      {mistakes.length > 0 && (
        <Section n={++n} title="Common mistakes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mistakes.map((m: any, i: number) => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderLeft: `3px solid ${W.orangeFg}`, borderRadius: 8, padding: '12px 16px', background: W.card }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text, marginBottom: 3 }}>{m.wrong_way ?? m.mistake}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{m.why_it_fails ?? m.correct_approach}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {hasRevision && (
        <Section n={++n} title="Summary & revision">
          {(revision.key_takeaways?.length ?? 0) > 0 && (
            <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
              {revision.key_takeaways.map((t: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
            </ul>
          )}
          {(revision.important_definitions?.length ?? 0) > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {revision.important_definitions.map((d: any, i: number) => (
                <div key={i} style={{ fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600, color: W.text }}>{d.term}</span> — {d.definition}
                </div>
              ))}
            </div>
          )}
          {(revision.active_recall_prompts?.length ?? 0) > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {revision.active_recall_prompts.map((p: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 8, padding: '12px 16px', background: W.card }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text, marginBottom: 3 }}>{p.prompt}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>{p.answer_explanation}</div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </>
  );
}

function SlidesArticle({ content }: { content: any }) {
  const slides: any[] = content?.slides ?? [];
  if (!slides.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
      {slides.map((s: any, i: number) => (
        <section key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: `1px solid ${W.border}`, background: W.surfaceMuted }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{String(s.slide_no ?? i + 1).padStart(2, '0')}</span>
            <b style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text, flex: 1, minWidth: 0 }}>{s.title}</b>
            {s.role && <Badge variant="muted">{s.role}</Badge>}
          </header>
          <div style={{ padding: '14px 18px' }}>
            {(s.body_blocks ?? []).length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: W.text }}>
                {s.body_blocks.map((b: string, bi: number) => <li key={bi} style={{ marginBottom: 4 }}>{b}</li>)}
              </ul>
            )}
            {s.speaker_notes && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${W.border}`, fontSize: 12.5, lineHeight: 1.65, color: W.text2 }}>
                <span style={{ fontWeight: 600, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, display: 'block', marginBottom: 4 }}>Speaker notes</span>
                {s.speaker_notes}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function QuizArticle({ content }: { content: any }) {
  const mcq: any[] = content?.mcq ?? [];
  const sa: any[] = content?.short_answer ?? [];
  if (!mcq.length && !sa.length) return null;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  let n = 0;
  return (
    <>
      {mcq.length > 0 && (
        <Section n={++n} title="Multiple choice">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mcq.map((q: any, i: number) => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 18px', background: W.card }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>Q{i + 1}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5, flex: 1 }}>{q.question}</div>
                  {q.bloom_level && <Badge variant="muted">{q.bloom_level}</Badge>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 28 }}>
                  {(q.options ?? []).map((o: string, oi: number) => {
                    const correct = oi === q.answer_index;
                    return (
                      <div key={oi} style={{
                        display: 'flex', gap: 8, alignItems: 'baseline', padding: '5px 10px', borderRadius: 7, fontSize: 13.5, lineHeight: 1.5,
                        background: correct ? 'color-mix(in oklab, var(--status-green) 8%, transparent)' : 'transparent',
                        color: correct ? W.greenFg : W.text2, fontWeight: correct ? 600 : 400,
                      }}>
                        <span style={{ fontWeight: 600, flexShrink: 0 }}>{LETTERS[oi] ?? oi + 1}.</span>
                        <span>{o}</span>
                        {correct && <span style={{ fontSize: 11, marginLeft: 'auto', flexShrink: 0 }}>✓ correct</span>}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && <div style={{ marginLeft: 28, marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: W.text3 }}>{q.explanation}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {sa.length > 0 && (
        <Section n={++n} title="Short answer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sa.map((q: any, i: number) => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 18px', background: W.card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5, marginBottom: 6 }}>{q.question}</div>
                {q.model_answer && (
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: W.text2 }}>
                    <span style={{ fontWeight: 600, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, display: 'block', marginBottom: 4 }}>Model answer</span>
                    {q.model_answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

const CT_LABEL: Record<string, string> = { P1: 'Conceptual', P2: 'Code', P3: 'Proof', P4: 'Systems', P5: 'Lab' };

export default function WinTeachConceptReader({ type }: { type: ConceptArtType }) {
  const navigate = useNavigate();
  const { id: courseId, topicId, conceptId } = useParams();
  const { data: course } = useCourse(courseId ?? '');
  const { data: topic } = useTopic(courseId ?? '', topicId ?? '');
  const meta = READER_META[type];

  const [job, setJob] = useState<GenJob | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  const courseCode = (course as any)?.code ?? courseId ?? '';
  const topicTitle = (topic as any)?.title ?? 'Topic';
  const concepts: any[] = plan?.concept_inventory ?? [];
  const idx = concepts.findIndex(c => c.concept_id === conceptId);
  const concept = idx >= 0 ? concepts[idx] : null;
  const nState = job && conceptId ? artState(job, conceptId, type) : undefined;
  const approved = nState?.approval_status === 'approved';
  const studioPath = `/winteach/courses/${courseId}/topic/${topicId}`;
  const readerPath = (t: ConceptArtType, cid: string) =>
    `/winteach/courses/${courseId}/topic/${topicId}/${READER_META[t].segment}/${cid}`;

  // job + plan
  useEffect(() => {
    if (!topicId) return;
    generationApi.getTopicJob(topicId).then(async j => {
      setJob(j);
      try { setPlan((await generationApi.getArtifact(j.id, 'topic_plan')).content); } catch { /* */ }
    }).catch(() => setLoading(false));
  }, [topicId]);

  // Poll while any artifact of this type is generating so status icons,
  // progress, and the Approve button unfreeze once the backend finishes.
  const generatingAny = (job?.concept_artifacts ?? []).some(a => a.artifact_type === type && a.status === 'generating');
  useEffect(() => {
    if (!topicId || !generatingAny) return;
    const t = setInterval(() => generationApi.getTopicJob(topicId).then(setJob).catch(() => {}), 2600);
    return () => clearInterval(t);
  }, [topicId, generatingAny]);

  // Active concept content. Keyed on job.id + artifact status (not the job
  // object) so poll/approve refreshes don't clear the article, while a
  // generating→ready flip fetches the finished content.
  const jobId = job?.id;
  const nStatus = nState?.status;
  useEffect(() => {
    if (!jobId || !conceptId) return;
    setLoading(true); setContent(null);
    generationApi.getConcept(jobId, conceptId, type)
      .then(r => setContent(r.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId, conceptId, type, nStatus]);

  const goto = useCallback((cid: string) => navigate(readerPath(type, cid)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, courseId, topicId, type]);

  const approve = async () => {
    if (!job || !conceptId) return;
    setApproving(true);
    try {
      await generationApi.approveConcept(job.id, conceptId, type);
      setJob(await generationApi.getTopicJob(topicId!));
    } catch { /* */ }
    finally { setApproving(false); }
  };

  const prev = idx > 0 ? concepts[idx - 1] : null;
  const next = idx >= 0 && idx < concepts.length - 1 ? concepts[idx + 1] : null;
  const readyCount = concepts.filter(c => {
    const s = artState(job, c.concept_id, type);
    return s?.status === 'ready' || s?.approval_status === 'approved';
  }).length;

  return (
    <>
      <WinTopbar title={meta.tab} actions={
        <Btn variant="ghost" onClick={() => navigate(studioPath)}>
          <span style={{ width: 15, height: 15, display: 'inline-flex' }}><IBack /></span>Back to studio
        </Btn>
      } />
      <WinContent>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', maxWidth: 1120, margin: '0 auto' }}>

          {/* ── Contents rail ── */}
          <aside className="max-lg:hidden" style={{
            width: 264, flexShrink: 0, position: 'sticky', top: 16,
            background: W.card, border: `1px solid ${W.border}`, borderRadius: 12,
            boxShadow: W.shadowCard, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${W.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: W.text3, marginBottom: 5 }}>{courseCode} · {meta.label}</div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14.5, color: W.text, lineHeight: 1.35 }}>{topicTitle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--score-track)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${concepts.length ? Math.round(readyCount / concepts.length * 100) : 0}%`, background: 'var(--brand)', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, color: W.text2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{readyCount}/{concepts.length}</span>
              </div>
            </div>
            <nav style={{ padding: 8 }}>
              {concepts.map((c, i) => {
                const active = c.concept_id === conceptId;
                const s = artState(job, c.concept_id, type);
                return (
                  <button key={c.concept_id} onClick={() => goto(c.concept_id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                    padding: '9px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: active ? 'var(--tint-brand-bg)' : 'transparent',
                    color: active ? 'var(--tint-brand-fg)' : W.text2,
                    fontFamily: W.fontSans, fontSize: 13, fontWeight: active ? 600 : 500,
                    transition: 'background .12s',
                  }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <span style={{ fontSize: 11.5, color: active ? 'var(--tint-brand-fg)' : W.text3, fontVariantNumeric: 'tabular-nums', width: 18, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.concept_name}</span>
                    <StateIcon s={s} />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Reading pane ── */}
          <article style={{
            flex: 1, minWidth: 0, background: W.card, border: `1px solid ${W.border}`,
            borderRadius: 12, boxShadow: W.shadowCard,
          }}>
            {/* article header */}
            <header style={{ padding: '26px 40px 18px', borderBottom: `1px solid ${W.border}` }}>
              <div style={{ fontSize: 11.5, color: W.text3, marginBottom: 8 }}>
                <span style={{ cursor: 'pointer', color: W.text2 }} onClick={() => navigate(`/winteach/courses/${courseId}`)}>{courseCode}</span>
                {' / '}
                <span style={{ cursor: 'pointer', color: W.text2 }} onClick={() => navigate(studioPath)}>{topicTitle}</span>
                {' / '}{meta.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <h1 style={{ flex: '1 1 300px', minWidth: 0, fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: W.text, margin: 0, lineHeight: 1.25 }}>
                  {concept?.concept_name ?? meta.tab}
                </h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {nState?.status === 'ready' && !approved && (
                    <Btn variant="primary" sm onClick={approve} disabled={approving}>
                      <span style={{ width: 13, height: 13, display: 'inline-flex' }}><ICheck /></span>
                      {approving ? 'Approving…' : 'Approve'}
                    </Btn>
                  )}
                  {approved && <Badge variant="green" dot>Approved</Badge>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {concept?.primary_content_type && <Badge variant="blue">{concept.primary_content_type} · {CT_LABEL[concept.primary_content_type] ?? ''}</Badge>}
                {concept?.complexity_tier && <Badge variant="muted">{concept.complexity_tier}</Badge>}
                {idx >= 0 && <Badge variant="muted">Lesson {idx + 1} of {concepts.length}</Badge>}
              </div>
              {/* artifact tabs: same concept, other generations */}
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                {CONCEPT_TYPES.map(t => {
                  const active = t === type;
                  const s = job && conceptId ? artState(job, conceptId, t) : undefined;
                  const done = s?.status === 'ready' || s?.approval_status === 'approved';
                  return (
                    <button key={t} disabled={active}
                      onClick={() => conceptId && navigate(readerPath(t, conceptId))}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7,
                        border: `1px solid ${active ? 'transparent' : W.border}`,
                        background: active ? 'var(--tint-brand-bg)' : 'transparent',
                        color: active ? 'var(--tint-brand-fg)' : W.text2,
                        fontFamily: W.fontDisplay, fontSize: 12.5, fontWeight: 600,
                        cursor: active ? 'default' : 'pointer',
                      }}>
                      {READER_META[t].tab}
                      {done && <span style={{ fontSize: 10 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </header>

            {/* article body */}
            <div style={{ padding: '30px 40px 8px', maxWidth: 760 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: W.text2, fontSize: 13.5, padding: '30px 0 60px' }}>
                  <span className="wt-spin" style={{ width: 14, height: 14, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block' }} />
                  Loading {meta.tab.toLowerCase()}…
                </div>
              ) : content ? (
                type === 'student_notes' ? <NotesArticle content={content} />
                  : type === 'slides' ? <SlidesArticle content={content} />
                    : <QuizArticle content={content} />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 0 72px', color: W.text2 }}>
                  <div style={{ width: 40, height: 40, color: W.text3, margin: '0 auto 14px', display: 'flex', justifyContent: 'center' }}><INotes /></div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, color: W.text, marginBottom: 6 }}>
                    {nState?.status === 'generating' ? `${meta.tab} are generating…` : `No ${meta.tab.toLowerCase()} yet`}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 18 }}>
                    {nState?.status === 'generating' ? 'This usually takes 30–90 seconds. Check back shortly.' : meta.emptyHint}
                  </div>
                  <Btn onClick={() => navigate(studioPath)}>Open Generation Studio</Btn>
                </div>
              )}
            </div>

            {/* prev / next footer */}
            <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 40px 20px', borderTop: `1px solid ${W.border}` }}>
              {prev ? (
                <button onClick={() => goto(prev.concept_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, maxWidth: '45%' }}>
                  <div style={{ fontSize: 11, color: W.text3, marginBottom: 2 }}>← Previous</div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prev.concept_name}</div>
                </button>
              ) : <span />}
              {next ? (
                <button onClick={() => goto(next.concept_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', padding: 0, maxWidth: '45%' }}>
                  <div style={{ fontSize: 11, color: W.text3, marginBottom: 2 }}>Next →</div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.concept_name}</div>
                </button>
              ) : (
                <Btn variant="primary" sm onClick={() => navigate(studioPath)}>Finish — back to studio</Btn>
              )}
            </footer>
          </article>
        </div>
      </WinContent>
      <style>{`@keyframes wt-spin { to { transform: rotate(360deg); } } .wt-spin { animation: wt-spin .8s linear infinite; }`}</style>
    </>
  );
}
