import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Card, Btn, Badge, Breadcrumb } from './WinTeachUI';
import { IBack, ISpark } from './WinTeachIcons';
import { useCourse, useTopic } from '@/api/hooks';
import {
  generationApi, CONCEPT_TYPES, TOPIC_ART_TYPES,
  type GenJob, type ArtifactType, type ConceptArtType, type TopicArtType,
  type ConceptArtifactState, type ArtStatus,
} from '@/api/generation';

/* ── constants ───────────────────────────────────────────────────────────── */

const ALL_TYPES: ArtifactType[] = [
  'topic_plan', 'student_notes', 'slides', 'quiz', 'summary', 'assignment', 'faculty_diagnostic', 'flashcards',
];

const CT_META: Record<string, { label: string; tone: 'blue' | 'pink' | 'orange' | 'info' | 'green' }> = {
  P1: { label: 'Conceptual', tone: 'blue' }, P2: { label: 'Code', tone: 'pink' },
  P3: { label: 'Proof', tone: 'orange' }, P4: { label: 'Systems', tone: 'info' }, P5: { label: 'Lab', tone: 'green' },
};
const CTS = ['P1', 'P2', 'P3', 'P4', 'P5'];
const FLAG_KEYS = ['requires_code', 'needs_execution_trace', 'needs_worked_example', 'needs_analysis', 'needs_comparison'];
const TIERS = ['simple', 'moderate', 'complex'];

const CONCEPT_LABEL: Record<ConceptArtType, string> = { student_notes: 'Notes', slides: 'Slides', quiz: 'Quiz' };
const TOPIC_LABEL: Record<TopicArtType, string> = {
  summary: 'Summary / Cheat-sheet', assignment: 'Assignment', faculty_diagnostic: 'Faculty Diagnostic', flashcards: 'Flashcards',
};

const usd = (n?: number | null) => `$${(n ?? 0).toFixed(2)}`;

/* ── small UI helpers ────────────────────────────────────────────────────── */

function CTBadge({ ct }: { ct: string }) {
  const m = CT_META[ct] ?? { label: ct, tone: 'muted' as const };
  return <Badge variant={m.tone as any}>{ct} · {m.label}</Badge>;
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12, cursor: 'pointer',
      borderRadius: 999, padding: '4px 11px', border: `1.5px solid ${on ? W.brand : W.border}`,
      background: on ? W.brand : '#fff', color: on ? '#fff' : W.text2, transition: 'all .12s',
    }}>{label}</button>
  );
}

function statusBadge(s?: ArtStatus, approved?: boolean) {
  if (approved) return <Badge variant="green" dot>Approved</Badge>;
  if (s === 'ready') return <Badge variant="info">Ready</Badge>;
  if (s === 'generating') return <Badge variant="orange">Generating…</Badge>;
  if (s === 'error') return <Badge variant="red">Error</Badge>;
  return <Badge variant="muted">Not generated</Badge>;
}

/* ── artifact content renderers ──────────────────────────────────────────── */

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: W.text3, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: W.text2 }}>{children}</div>
    </div>
  );
}

function NotesBody({ content }: { content: any }) {
  const core = content?.core ?? {};
  const closing = content?.closing ?? {};
  const def = core?.core_concept?.formal_definition;
  const mech = core?.deep_dive?.architecture_and_mechanism?.explanation;
  const code = core?.deep_dive?.code_or_formalization;
  const worked = core?.practical_understanding?.worked_example;
  const mistakes = closing?.sections?.common_mistakes ?? [];
  return (
    <>
      {def && <Field title="Definition">{def}</Field>}
      {mech && <Field title="Mechanism">{mech}</Field>}
      {code?.applicable && code?.content && (
        <Field title={`Code (${code.language_or_system ?? code.type ?? ''})`}>
          <pre style={{ background: '#1c2030', color: '#e7e9f5', borderRadius: 10, padding: 12, overflow: 'auto', fontSize: 12, lineHeight: 1.5, margin: '4px 0' }}>{code.content}</pre>
        </Field>
      )}
      {worked && <Field title="Worked example">{worked}</Field>}
      {mistakes.length > 0 && (
        <Field title="Common mistakes">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {mistakes.slice(0, 3).map((m: any, i: number) => <li key={i}><b>{m.wrong_way ?? m.mistake}</b> — {m.why_it_fails ?? m.correct_approach}</li>)}
          </ul>
        </Field>
      )}
    </>
  );
}

function SlidesBody({ content }: { content: any }) {
  const slides = content?.slides ?? [];
  return (
    <Field title={`${slides.length} slides`}>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {slides.map((s: any, i: number) => (
          <li key={i} style={{ marginBottom: 6 }}>
            <b>{s.title}</b>
            {(s.body_blocks ?? []).length > 0 && <div style={{ color: W.text3, fontSize: 12 }}>{(s.body_blocks).join(' · ')}</div>}
          </li>
        ))}
      </ol>
    </Field>
  );
}

function QuizBody({ content }: { content: any }) {
  const mcq = content?.mcq ?? [];
  const sa = content?.short_answer ?? [];
  return (
    <>
      {mcq.map((q: any, i: number) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: W.text }}>{i + 1}. {q.question}</div>
          <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
            {(q.options ?? []).map((o: string, oi: number) => (
              <li key={oi} style={{ color: oi === q.answer_index ? W.greenFg : W.text2, fontWeight: oi === q.answer_index ? 700 : 400, fontSize: 12.5 }}>{o}</li>
            ))}
          </ul>
          {q.explanation && <div style={{ fontSize: 12, color: W.text3 }}>{q.explanation}</div>}
        </div>
      ))}
      {sa.length > 0 && <Field title="Short answer">{sa.map((q: any, i: number) => <div key={i}>• {q.question}</div>)}</Field>}
    </>
  );
}

function TopicArtifactBody({ type, content }: { type: TopicArtType; content: any }) {
  if (!content) return null;
  if (type === 'flashcards') return (
    <Field title={`${(content.cards ?? []).length} cards`}>
      {(content.cards ?? []).slice(0, 6).map((c: any, i: number) => <div key={i}><b>{c.front}</b> → {c.back}</div>)}
    </Field>
  );
  if (type === 'summary') return (
    <>
      <Field title="Key concepts">{(content.key_concepts ?? []).map((k: any, i: number) => <div key={i}><b>{k.concept}</b>: {k.one_liner}</div>)}</Field>
      {(content.exam_pointers ?? []).length > 0 && <Field title="Exam pointers">{content.exam_pointers.join(' · ')}</Field>}
    </>
  );
  if (type === 'assignment') return (
    <>
      <Field title="Tasks">{(content.tasks ?? []).map((t: any, i: number) => <div key={i}><b>[{t.marks}m]</b> {t.prompt}</div>)}</Field>
      <Field title="Rubric">{(content.rubric ?? []).map((r: any, i: number) => <div key={i}>{r.criterion} ({r.points})</div>)}</Field>
    </>
  );
  return <Field title="Dimensions">{(content.dimensions ?? []).map((d: any, i: number) => <div key={i}><b>{d.name}</b>: {(d.items ?? []).length} items</div>)}</Field>;
}

/* ── concept card (editable plan + notes/slides/quiz tiles) ──────────────── */

function ConceptTile({ jobId, conceptId, type, state, onChanged }: {
  jobId: string; conceptId: string; type: ConceptArtType; state?: ConceptArtifactState; onChanged: () => void;
}) {
  const [content, setContent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const status = state?.status ?? 'not_generated';
  const approved = state?.approval_status === 'approved';
  const notesFirst = type !== 'student_notes';

  const loadContent = useCallback(async () => {
    try { setContent((await generationApi.getConcept(jobId, conceptId, type)).content); } catch { /* */ }
  }, [jobId, conceptId, type]);

  useEffect(() => { if (open && !content && status === 'ready') loadContent(); }, [open, status, content, loadContent]);

  const gen = async () => { await generationApi.genConcept(jobId, conceptId, type); setContent(null); onChanged(); };

  return (
    <div style={{ border: `1.5px solid ${approved ? W.greenBg : W.border}`, borderRadius: 12, padding: 12, background: approved ? 'rgba(21,160,106,.03)' : '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <b style={{ fontSize: 13 }}>{CONCEPT_LABEL[type]}</b>
        <div style={{ marginLeft: 'auto' }}>{statusBadge(status, approved)}</div>
      </div>
      {state?.error && <div style={{ fontSize: 11.5, color: W.redFg, marginTop: 6 }}>{state.error}</div>}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {status === 'not_generated' && <Btn sm variant="primary" onClick={gen} disabled={notesFirst && false}>Generate</Btn>}
        {status === 'ready' && <>
          <Btn sm variant="ghost" onClick={() => setOpen(o => !o)}>{open ? 'Hide' : 'View'}</Btn>
          <Btn sm variant="ghost" onClick={gen}>Regenerate</Btn>
          {!approved && <Btn sm variant="primary" onClick={async () => { await generationApi.approveConcept(jobId, conceptId, type); onChanged(); }}>Approve</Btn>}
        </>}
        {status === 'error' && <Btn sm variant="primary" onClick={gen}>Retry</Btn>}
        {status === 'generating' && <span style={{ fontSize: 12, color: W.text3 }}>~30–90s…</span>}
      </div>
      {open && content && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${W.border}` }}>
          {type === 'student_notes' ? <NotesBody content={content} /> : type === 'slides' ? <SlidesBody content={content} /> : <QuizBody content={content} />}
        </div>
      )}
    </div>
  );
}

function ConceptCard({ job, concept, edit, onEdit, stateFor, onChanged }: {
  job: GenJob; concept: any; edit: any; onEdit: (patch: any) => void;
  stateFor: (cid: string, t: ConceptArtType) => ConceptArtifactState | undefined; onChanged: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const merged = { ...concept, ...edit };
  const flags = merged.flags ?? {};
  const secondary: string[] = merged.secondary_blocks ?? [];
  const notesReady = stateFor(concept.concept_id, 'student_notes')?.status === 'ready';

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 14 }}>{concept.concept_id} · {concept.concept_name}</b>
        <CTBadge ct={merged.primary_content_type} />
        <Badge variant="muted">{merged.complexity_tier}</Badge>
        <button onClick={() => setShowEdit(s => !s)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: W.brand, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          {showEdit ? '▾ Hide plan' : '✎ Edit plan'}
        </button>
      </div>

      {showEdit && (
        <div style={{ marginTop: 12, padding: 12, background: W.surfaceMuted, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: W.text3, marginBottom: 6 }}>PRIMARY CONTENT TYPE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CTS.map(ct => <Toggle key={ct} on={merged.primary_content_type === ct} label={ct} onClick={() => onEdit({ primary_content_type: ct })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: W.text3, marginBottom: 6 }}>SECONDARY BLOCKS (multi)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CTS.map(ct => <Toggle key={ct} on={secondary.includes(ct)} label={ct}
                onClick={() => onEdit({ secondary_blocks: secondary.includes(ct) ? secondary.filter(x => x !== ct) : [...secondary, ct] })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: W.text3, marginBottom: 6 }}>GENERATION FLAGS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FLAG_KEYS.map(k => <Toggle key={k} on={!!flags[k]} label={k.replace('needs_', '').replace('requires_', '')}
                onClick={() => onEdit({ flags: { ...flags, [k]: !flags[k] } })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: W.text3, marginBottom: 6 }}>COMPLEXITY</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TIERS.map(t => <Toggle key={t} on={merged.complexity_tier === t} label={t} onClick={() => onEdit({ complexity_tier: t })} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
        {CONCEPT_TYPES.map(t => (
          <div key={t} style={{ opacity: t !== 'student_notes' && !notesReady ? 0.55 : 1, pointerEvents: t !== 'student_notes' && !notesReady ? 'none' : 'auto' }}>
            <ConceptTile jobId={job.id} conceptId={concept.concept_id} type={t} state={stateFor(concept.concept_id, t)} onChanged={onChanged} />
          </div>
        ))}
      </div>
      {!notesReady && <div style={{ fontSize: 11.5, color: W.text3, marginTop: 6 }}>Generate Notes first — Slides & Quiz derive from them.</div>}
    </Card>
  );
}

/* ── topic artifact card ─────────────────────────────────────────────────── */

function TopicArtCard({ jobId, type, artifact, onChanged }: {
  jobId: string; type: TopicArtType; artifact?: { review_status: string }; onChanged: () => void;
}) {
  const [content, setContent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const status = artifact?.review_status;
  const gen = async () => { await generationApi.genTopicArtifact(jobId, type); setContent(null); onChanged(); };
  const view = async () => {
    setOpen(o => !o);
    if (!content) { try { setContent((await generationApi.getArtifact(jobId, type as ArtifactType)).content); } catch { /* */ } }
  };
  return (
    <div style={{ border: `1.5px solid ${W.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <b style={{ fontSize: 13 }}>{TOPIC_LABEL[type]}</b>
        <div style={{ marginLeft: 'auto' }}>
          {status === 'ready' ? <Badge variant="info">Ready</Badge> : status === 'generating' ? <Badge variant="orange">Generating…</Badge> : status === 'error' ? <Badge variant="red">Error</Badge> : <Badge variant="muted">Not generated</Badge>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {(!status || status === 'error') && <Btn sm variant="primary" onClick={gen}>Generate</Btn>}
        {status === 'ready' && <><Btn sm variant="ghost" onClick={view}>{open ? 'Hide' : 'View'}</Btn><Btn sm variant="ghost" onClick={gen}>Regenerate</Btn></>}
        {status === 'generating' && <span style={{ fontSize: 12, color: W.text3 }}>~20–40s…</span>}
      </div>
      {open && content && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${W.border}` }}><TopicArtifactBody type={type} content={content} /></div>}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function WinTeachGenerate() {
  const navigate = useNavigate();
  const { id: courseId, topicId } = useParams();
  const { data: course } = useCourse(courseId ?? '');
  const { data: topic } = useTopic(courseId ?? '', topicId ?? '');

  const [job, setJob] = useState<GenJob | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [planStatus, setPlanStatus] = useState<{ ok: boolean; failures: any[] }>({ ok: true, failures: [] });
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [starting, setStarting] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [error, setError] = useState('');
  const [resumed, setResumed] = useState(false);
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topicTitle = (topic as any)?.title ?? 'Topic';
  const courseCode = (course as any)?.code ?? courseId ?? '';

  const refetch = useCallback(async () => {
    if (!topicId) return;
    try { setJob(await generationApi.getTopicJob(topicId)); } catch { /* no job */ }
  }, [topicId]);

  useEffect(() => { if (topicId) generationApi.getTopicJob(topicId).then(setJob).catch(() => {}).finally(() => setResumed(true)); }, [topicId]);

  // load the plan once it's ready
  useEffect(() => {
    if (job?.artifacts?.some(a => a.type === 'topic_plan') && !plan) {
      generationApi.getArtifact(job.id, 'topic_plan').then(p => {
        setPlan(p.content);
        setPlanStatus({ ok: p.status === 'validated' || !!p.validation?.all_pass, failures: p.validation?.failures ?? [] });
      }).catch(() => {});
    }
  }, [job, plan]);

  // poll while anything is generating
  useEffect(() => {
    if (!job) return;
    const planGenerating = job.phase === 'generating_topic_plan' || job.phase === 'topic_plan_validate';
    const anyGenerating = (job.concept_artifacts ?? []).some(c => c.status === 'generating')
      || (job.artifacts ?? []).some(a => a.review_status === 'generating');
    if (!planGenerating && !anyGenerating) return;
    poll.current = setTimeout(refetch, 2600);
    return () => { if (poll.current) clearTimeout(poll.current); };
  }, [job, refetch]);

  const start = async () => {
    if (!courseId || !topicId) return;
    setStarting(true); setError('');
    try { await generationApi.startJob({ course_id: courseId, topic_id: topicId, artifact_types: ALL_TYPES }); await refetch(); }
    catch (e: any) { setError(e?.message?.includes('409') ? 'A job already exists for this topic.' : 'Failed to start. Check the topic has an operative CO.'); }
    finally { setStarting(false); }
  };

  const editConcept = (cid: string, patch: any) => setEdits(e => ({ ...e, [cid]: { ...e[cid], ...patch } }));
  const dirty = Object.keys(edits).length > 0;
  const savePlan = async () => {
    if (!job) return;
    setSavingPlan(true);
    try {
      const concepts = Object.entries(edits).map(([concept_id, patch]) => ({ concept_id, ...patch }));
      const updated = await generationApi.savePlan(job.id, concepts);
      setPlan(updated); setEdits({});
    } catch { setError('Failed to save plan.'); }
    finally { setSavingPlan(false); }
  };

  const stateFor = (cid: string, t: ConceptArtType) => (job?.concept_artifacts ?? []).find(c => c.concept_id === cid && c.artifact_type === t);
  const topicArt = (t: TopicArtType) => (job?.artifacts ?? []).find(a => a.type === t);
  const concepts = plan?.concept_inventory ?? [];
  const anyNotesReady = (job?.concept_artifacts ?? []).some(c => c.artifact_type === 'student_notes' && c.status === 'ready');
  const planGenerating = job && (job.phase === 'generating_topic_plan' || job.phase === 'topic_plan_validate');

  // topic context (this page is the topic's home — no separate topic page)
  const tp = topic as any;
  const linkedCo = tp?.linked_co;
  const bloom = tp?.bloom_level ?? linkedCo?.bloom_level;
  const subtopics: string[] = (tp?.subtopics ?? []).map((s: any) => s.title ?? s);
  const hours = tp?.contact_hours ?? tp?.hours;

  return (
    <>
      <WinTopbar title="Generation Studio" actions={
        <Btn variant="ghost" onClick={() => navigate(`/winteach/courses/${courseId}`)}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back to {courseCode}
        </Btn>
      } />
      <WinContent>
        <Breadcrumb items={[
          { label: 'Courses', onClick: () => navigate('/winteach/courses') },
          { label: courseCode, onClick: () => navigate(`/winteach/courses/${courseId}`) },
          { label: topicTitle },
        ]} />

        <div style={{ maxWidth: 900 }}>
          {/* cost header */}
          {job && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: W.surfaceMuted, borderRadius: 12, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11.5, color: W.text3, fontWeight: 700 }}>ESTIMATED</div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, color: W.text }}>~{usd(job.est_cost_usd)}</div>
              </div>
              <div style={{ width: 1, height: 32, background: W.border }} />
              <div>
                <div style={{ fontSize: 11.5, color: W.text3, fontWeight: 700 }}>SPENT SO FAR</div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, color: W.brand }}>{usd(job.cost_usd)}</div>
              </div>
              <div style={{ width: 1, height: 32, background: W.border }} />
              <div>
                <div style={{ fontSize: 11.5, color: W.text3, fontWeight: 700 }}>TOKENS</div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, color: W.text2 }}>{(job.token_count ?? 0).toLocaleString()}</div>
              </div>
              {dirty && <Btn sm variant="primary" onClick={savePlan} disabled={savingPlan} style={{ marginLeft: 'auto' }}>{savingPlan ? 'Saving…' : 'Save plan changes'}</Btn>}
            </div>
          )}

          {/* topic header — this page is the topic's home */}
          <div style={{ margin: '4px 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 22 }}>{topicTitle}</div>
              {bloom && <Badge variant="blue">{bloom}</Badge>}
              {subtopics.length > 0 && <Badge variant="muted">{subtopics.length} subtopics</Badge>}
              {hours != null && <Badge variant="muted">{hours} hrs</Badge>}
            </div>
            {linkedCo?.description && (
              <div style={{ fontSize: 12.5, color: W.text2, marginTop: 6 }}>
                <b style={{ color: W.brand }}>Linked CO:</b> {linkedCo.description}
              </div>
            )}
          </div>

          {error && <div style={{ background: W.redBg, color: W.redFg, borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {/* empty state — show the syllabus subtopics so the page has context pre-plan */}
          {resumed && !job && (
            <Card>
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Ready to generate</div>
                <div style={{ color: W.text2, fontSize: 13.5, maxWidth: 560, marginBottom: 16, lineHeight: 1.6 }}>
                  We'll generate & validate the Topic Plan (which decomposes this topic into teachable concepts), then stop. You then edit the plan and generate each concept's Notes, Slides and Quiz on demand — plus topic-wide artifacts.
                </div>
                {subtopics.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: W.text3, marginBottom: 8 }}>SYLLABUS SUBTOPICS ({subtopics.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {subtopics.map((s, i) => (
                        <span key={i} style={{ fontSize: 12, color: W.text2, background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 8, padding: '4px 10px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Btn variant="primary" onClick={start} disabled={starting}>
                  <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>{starting ? 'Starting…' : 'Generate Topic Plan'}
                </Btn>
              </div>
            </Card>
          )}

          {planGenerating && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: W.text2, fontSize: 13.5 }}>
                <span className="wt-spin" style={{ width: 14, height: 14, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block' }} />
                Generating & validating the Topic Plan…
              </div>
            </Card>
          )}

          {job?.status === 'failed' && job.phase === 'error' && (
            <Card>
              <div style={{ color: W.redFg, fontSize: 13.5, marginBottom: 10 }}>{job.error_msg || 'Topic Plan generation failed.'}</div>
              {planStatus.failures.length > 0 && (
                <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 12.5, color: W.redFg }}>
                  {planStatus.failures.map((f: any, i: number) => <li key={i}>{f.name}: {f.detail}</li>)}
                </ul>
              )}
              <Btn variant="primary" onClick={start} disabled={starting}>Regenerate Topic Plan</Btn>
            </Card>
          )}

          {/* plan + concepts */}
          {plan && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16 }}>Subtopics ({concepts.length})</div>
                {planStatus.ok ? <Badge variant="green" dot>Plan validated</Badge> : <Badge variant="orange">Plan needs revision</Badge>}
                {plan.front_matter?.topic_plan_version && <Badge variant="muted">v{plan.front_matter.topic_plan_version}</Badge>}
              </div>
              {concepts.map((c: any) => (
                <ConceptCard key={c.concept_id} job={job!} concept={c} edit={edits[c.concept_id] ?? {}}
                  onEdit={(patch) => editConcept(c.concept_id, patch)} stateFor={stateFor} onChanged={refetch} />
              ))}

              {/* topic-level artifacts */}
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, margin: '20px 0 10px' }}>Topic-wide artifacts</div>
              {!anyNotesReady && <div style={{ fontSize: 12.5, color: W.text3, marginBottom: 10 }}>Generate at least one subtopic's Notes first.</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, opacity: anyNotesReady ? 1 : 0.55, pointerEvents: anyNotesReady ? 'auto' : 'none' }}>
                {TOPIC_ART_TYPES.map(t => <TopicArtCard key={t} jobId={job!.id} type={t} artifact={topicArt(t)} onChanged={refetch} />)}
              </div>
            </>
          )}
        </div>
      </WinContent>
      <style>{`@keyframes wt-spin { to { transform: rotate(360deg); } } .wt-spin { animation: wt-spin .8s linear infinite; }`}</style>
    </>
  );
}
