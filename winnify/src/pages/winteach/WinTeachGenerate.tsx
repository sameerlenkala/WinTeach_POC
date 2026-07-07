import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Card, Btn, Badge, Breadcrumb, Modal, Skeleton } from './WinTeachUI';
import { TopicPlanPanel } from './WinTeachPlanPanel';
import { IBack, ISpark, INotes, IImage, IQuiz, IText, IAssess, IFile, IFlash, ICheck, ILessonPlan } from './WinTeachIcons';
import { useCourse, useTopic } from '@/api/hooks';
import {
  generationApi, CONCEPT_TYPES, TOPIC_ART_TYPES,
  type GenJob, type ArtifactType, type ConceptArtType, type TopicArtType,
  type ConceptArtifactState, type ArtStatus,
} from '@/api/generation';
import { ReferenceMaterials } from './WinTeachMaterials';
import { materialsApi } from '@/api/materials';
import { useWinTeach } from './WinTeachContext';

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
const CONCEPT_ICON: Record<ConceptArtType, React.ReactNode> = {
  student_notes: <INotes />, slides: <IImage />, quiz: <IQuiz />,
};
const TOPIC_LABEL: Record<TopicArtType, string> = {
  summary: 'Summary / Cheat-sheet', assignment: 'Assignment', faculty_diagnostic: 'Faculty Diagnostic', flashcards: 'Interview Prep',
};
const TOPIC_ICON: Record<TopicArtType, React.ReactNode> = {
  summary: <IText />, assignment: <IAssess />, faculty_diagnostic: <IFile />, flashcards: <IFlash />,
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
      background: on ? W.brand : 'var(--card)', color: on ? '#fff' : W.text2, transition: 'all .12s',
    }}>{label}</button>
  );
}

function Spin() {
  return <span className="wt-spin" style={{ width: 13, height: 13, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />;
}

type DotState = 'approved' | 'ready' | 'generating' | 'error' | 'pending';

const DOT_META: Record<DotState, { bg: string; fg: string; label: string }> = {
  approved:   { bg: 'var(--status-green)', fg: '#fff', label: 'Approved' },
  ready:      { bg: 'var(--tint-blue-fg)', fg: '#fff', label: 'Ready — awaiting approval' },
  generating: { bg: 'var(--tint-orange-fg)', fg: '#fff', label: 'Generating' },
  error:      { bg: 'var(--tint-red-fg)', fg: '#fff', label: 'Error' },
  pending:    { bg: 'var(--score-track)', fg: 'var(--text-3)', label: 'Not generated' },
};

function StatusDot({ state, title }: { state: DotState; title?: string }) {
  const m = DOT_META[state];
  if (state === 'generating') return <span title={title ?? m.label} style={{ display: 'inline-flex' }}><Spin /></span>;
  return (
    <span title={title ?? m.label} style={{
      width: 16, height: 16, borderRadius: '50%', background: m.bg, color: m.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0,
    }}>
      {state === 'approved' ? '✓' : state === 'ready' ? '•' : state === 'error' ? '!' : ''}
    </span>
  );
}

function dotFor(status?: ArtStatus, approved?: boolean): DotState {
  if (approved) return 'approved';
  if (status === 'ready') return 'ready';
  if (status === 'generating') return 'generating';
  if (status === 'error') return 'error';
  return 'pending';
}

function statusBadge(s?: ArtStatus, approved?: boolean) {
  if (approved) return <Badge variant="green" dot>Approved</Badge>;
  if (s === 'ready') return <Badge variant="info">Ready</Badge>;
  if (s === 'generating') return <Badge variant="orange">Generating…</Badge>;
  if (s === 'error') return <Badge variant="red">Error</Badge>;
  return <Badge variant="muted">Not generated</Badge>;
}

/* ── plain-language names for code-validator checks ──────────────────────── */

const CHECK_FRIENDLY: Record<string, string> = {
  'coverage:tlo_parent_co': 'Some learning outcomes aren’t linked to a valid course outcome',
  'coverage:co_has_tlo': 'A mapped course outcome has no learning outcome tracing to it',
  'coverage:concept_serves_tlo': 'Some subtopics don’t serve any learning outcome',
  'coverage:tlo_served_by_concept': 'Some learning outcomes aren’t covered by any subtopic',
  'coverage:concept_in_session': 'Some subtopics aren’t scheduled into any session',
  'bloom:tlo_le_co': 'A learning outcome exceeds its course outcome’s Bloom level',
  'bloom:concept_ceiling': 'A subtopic’s Bloom ceiling doesn’t match the outcomes it serves',
  'content_type:exactly_one_primary': 'A subtopic is missing a valid primary content type',
  'content_type:flag_conformance': 'Generation flags deviate from the content type without a recorded override',
  'weight:co_sum_100': 'Course-outcome weights don’t add up to 100%',
  'weight:concept_sum_100': 'Subtopic weights don’t add up to 100%',
  'time:session_sum_duration': 'Session minutes don’t add up to the topic’s duration',
  'verb:tlo_bank': 'Some outcomes use verbs outside the approved Bloom verb bank',
};

const friendlyCheck = (name: string) => CHECK_FRIENDLY[name] ?? name;

/* ── pipeline tracker ────────────────────────────────────────────────────── */

function PipelineStage({ icon, label, count, state, last }: {
  icon: React.ReactNode; label: string; count?: string; state: 'done' | 'active' | 'pending'; last?: boolean;
}) {
  const tileStyle: React.CSSProperties = state === 'done'
    ? { background: W.greenBg, color: W.greenFg }
    : state === 'active'
      ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-2))', color: '#fff', boxShadow: '0 4px 12px -4px color-mix(in oklab, var(--brand) 55%, transparent)' }
      : { background: W.surfaceMuted, color: W.text3 };
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...tileStyle }}>
          <span style={{ width: 17, height: 17, display: 'flex' }}>{state === 'done' ? <ICheck /> : icon}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: state === 'pending' ? W.text3 : W.text, whiteSpace: 'nowrap' }}>{label}</div>
          {count && <div style={{ fontSize: 11, color: W.text2, fontVariantNumeric: 'tabular-nums' }}>{count}</div>}
        </div>
      </div>
      {!last && <div style={{ flex: 1, height: 2, borderRadius: 2, background: state === 'done' ? 'color-mix(in oklab, var(--status-green) 40%, transparent)' : W.border, minWidth: 16, margin: '0 10px' }} />}
    </>
  );
}

/* ── concept artifact tile ───────────────────────────────────────────────── */

function GroundingModal({ chunkIds, onClose }: { chunkIds: string[]; onClose: () => void }) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof materialsApi.chunks>> | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    materialsApi.chunks(chunkIds).then(setRows).catch(() => setFailed(true));
  }, [chunkIds]);
  return (
    <Modal onClose={onClose} title="Grounding excerpts" subtitle="Reference-material passages injected into this artifact's prompt" maxWidth={560}>
      {failed ? <div style={{ color: W.redFg, fontSize: 13, padding: '12px 0' }}>Could not load excerpt details.</div>
        : !rows ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: W.text2, fontSize: 13, padding: '12px 0' }}><Spin /> Loading…</div>
          : rows.length === 0 ? <div style={{ color: W.text2, fontSize: 13, padding: '12px 0' }}>The excerpts are no longer available (the material was deleted or re-uploaded).</div>
            : rows.map(r => {
              // Open the source PDF at the excerpt's page (viewer honours #page=N).
              const openSource = () => r.material_id && r.filename &&
                materialsApi.view(r.material_id, r.filename, r.page_start ?? undefined).catch(() => {});
              return (
                <button key={r.id} onClick={openSource} title="Open the source at this page"
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: `1px solid ${W.border}`, cursor: 'pointer', padding: '9px 12px', background: W.surfaceMuted, borderRadius: 8, marginBottom: 6, fontSize: 12.5, color: W.text }}>
                  <b style={{ color: 'var(--brand)' }}>{r.filename ?? 'material'}</b>
                  {r.page_start ? ` · p.${r.page_start}${r.page_end && r.page_end !== r.page_start ? `–${r.page_end}` : ''}` : ''}
                  {r.heading ? <span style={{ color: W.text2 }}> — {r.heading}</span> : ''}
                </button>
              );
            })}
    </Modal>
  );
}

function ConceptTile({ jobId, conceptId, type, state, locked, onChanged, onView }: {
  jobId: string; conceptId: string; type: ConceptArtType;
  state?: ConceptArtifactState; locked: boolean; onChanged: () => void; onView: () => void;
}) {
  const status = state?.status ?? 'not_generated';
  // Optimistic approve: flip the tile immediately, roll back if the call fails.
  const [optimisticApproved, setOptimisticApproved] = useState(false);
  const approved = state?.approval_status === 'approved' || optimisticApproved;
  const [showGrounding, setShowGrounding] = useState(false);

  // Clear the optimistic flag once the server state actually changes — so a
  // later regenerate (which resets approval to pending) doesn't stay "approved".
  useEffect(() => {
    if (state?.approval_status && state.approval_status !== 'approved') setOptimisticApproved(false);
  }, [state?.approval_status, state?.status]);

  const gen = async () => { await generationApi.genConcept(jobId, conceptId, type); onChanged(); };
  const approve = async () => {
    setOptimisticApproved(true);
    try { await generationApi.approveConcept(jobId, conceptId, type); onChanged(); }
    catch { setOptimisticApproved(false); }
  };

  return (
    <div style={{
      border: `1.5px solid ${approved ? 'color-mix(in oklab, var(--status-green) 35%, transparent)' : W.border}`,
      borderRadius: 10, padding: '13px 14px',
      background: approved ? 'color-mix(in oklab, var(--status-green) 4%, var(--card))' : 'var(--card)',
      opacity: locked ? 0.55 : 1, pointerEvents: locked ? 'none' : 'auto',
      transition: 'border-color .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: approved ? W.greenBg : W.brandTintBg,
          color: approved ? W.greenFg : W.brandTintFg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ width: 15, height: 15, display: 'flex' }}>{CONCEPT_ICON[type]}</span>
        </div>
        <b style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text }}>{CONCEPT_LABEL[type]}</b>
        <div style={{ marginLeft: 'auto' }}>{statusBadge(status, approved)}</div>
      </div>
      {state?.error && <div style={{ fontSize: 11.5, color: W.redFg, marginTop: 6 }}>{state.error}</div>}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {status === 'not_generated' && <Btn sm variant="primary" onClick={gen}>Generate</Btn>}
        {status === 'ready' && <>
          <Btn sm onClick={onView}>View</Btn>
          {!approved && <Btn sm variant="primary" onClick={approve}>Approve</Btn>}
          <Btn sm variant="ghost" onClick={gen}>Regenerate</Btn>
        </>}
        {status === 'error' && <Btn sm variant="primary" onClick={gen}>Retry</Btn>}
        {status === 'generating' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: W.text2 }}><Spin /> ~30–90s</span>}
        {(state?.grounded_in?.length ?? 0) > 0 && (() => {
          const chunkIds = state!.grounded_in!.flatMap(g => g.chunk_ids ?? []);
          return (
            <button
              title="Generated with faculty reference material — click to see which excerpts"
              onClick={() => chunkIds.length > 0 && setShowGrounding(true)}
              style={{ fontSize: 11, color: W.greenFg, background: W.greenBg, borderRadius: 6,
                       padding: '2px 8px', border: 'none', cursor: chunkIds.length ? 'pointer' : 'default' }}>
              Grounded{chunkIds.length > 0 ? ` · ${chunkIds.length} excerpt${chunkIds.length > 1 ? 's' : ''}` : ''}
            </button>
          );
        })()}
        {(state?.cost_usd ?? 0) > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{usd(state?.cost_usd)}</span>}
      </div>
      {showGrounding && (
        <GroundingModal
          chunkIds={(state?.grounded_in ?? []).flatMap(g => g.chunk_ids ?? [])}
          onClose={() => setShowGrounding(false)}
        />
      )}
    </div>
  );
}

/* ── sticky concept rail — persistent index for long topics ──────────────── */

function ConceptRail({ concepts, stateFor, onJump }: {
  concepts: any[];
  stateFor: (cid: string, t: ConceptArtType) => ConceptArtifactState | undefined;
  onJump: (cid: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  // Scroll-spy: highlight whichever concept card is nearest the top.
  useEffect(() => {
    const els = concepts
      .map(c => document.getElementById(`concept-${c.concept_id}`))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace('concept-', ''));
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    els.forEach(e => obs.observe(e));
    return () => obs.disconnect();
  }, [concepts]);

  return (
    <aside className="max-lg:hidden" style={{
      width: 236, flexShrink: 0, position: 'sticky', top: 68, alignSelf: 'flex-start',
      background: W.card, border: `1px solid ${W.border}`, borderRadius: 10,
      boxShadow: W.shadowCard, overflow: 'hidden', maxHeight: 'calc(100vh - 96px)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `1px solid ${W.border}`, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12, color: W.text2 }}>
        Subtopics
      </div>
      <nav style={{ padding: 6, overflowY: 'auto' }}>
        {concepts.map((c, i) => {
          const on = active === c.concept_id;
          return (
            <button key={c.concept_id} onClick={() => onJump(c.concept_id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
              padding: '7px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: on ? 'var(--tint-brand-bg)' : 'transparent',
              color: on ? 'var(--tint-brand-fg)' : W.text2,
              fontFamily: W.fontSans, fontSize: 12.5, fontWeight: on ? 600 : 500, transition: 'background .12s',
            }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover)'; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <span style={{ fontSize: 10.5, color: on ? 'var(--tint-brand-fg)' : W.text3, width: 16, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.concept_name}</span>
              <span style={{ display: 'inline-flex', gap: 3, flexShrink: 0 }}>
                {CONCEPT_TYPES.map(t => {
                  const s = stateFor(c.concept_id, t);
                  const st = dotFor(s?.status, s?.approval_status === 'approved');
                  return <span key={t} title={`${CONCEPT_LABEL[t]}: ${DOT_META[st].label}`} style={{ width: 7, height: 7, borderRadius: '50%', background: DOT_META[st].bg }} />;
                })}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── concept card (editable plan + notes/slides/quiz tiles) ──────────────── */

function ConceptCard({ index, job, concept, edit, onEdit, stateFor, onChanged, onViewArtifact, onEditingChange }: {
  index: number; job: GenJob; concept: any; edit: any; onEdit: (patch: any) => void;
  stateFor: (cid: string, t: ConceptArtType) => ConceptArtifactState | undefined; onChanged: () => void;
  onViewArtifact: (cid: string, t: ConceptArtType) => void;
  onEditingChange?: (cid: string | null) => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const merged = { ...concept, ...edit };
  const flags = merged.flags ?? {};
  const secondary: string[] = merged.secondary_blocks ?? [];
  const notesReady = stateFor(concept.concept_id, 'student_notes')?.status === 'ready';
  const toggleEdit = () => setShowEdit(s => {
    const next = !s;
    onEditingChange?.(next ? concept.concept_id : null);
    return next;
  });
  useEffect(() => () => { if (showEdit) onEditingChange?.(null); }, []); // eslint-disable-line

  return (
    <Card compact id={`concept-${concept.concept_id}`} className="ds-rise" style={{ marginBottom: 12, scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--brand), var(--brand-2))', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 13,
        }}>{index + 1}</div>
        <b style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14.5, color: W.text }}>{concept.concept_name}</b>
        <CTBadge ct={merged.primary_content_type} />
        <Badge variant="muted">{merged.complexity_tier}</Badge>
        <button onClick={toggleEdit} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: W.brandTintFg, fontFamily: W.fontDisplay, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          {showEdit ? '▾ Hide plan' : '✎ Edit plan'}
        </button>
      </div>

      {/* coverage checklist: the atomic concepts this subtopic's note must teach */}
      {(merged.concepts_covered?.length ?? 0) > 1 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginTop: 9 }}>
          <span style={{ fontSize: 11, color: W.text3 }}>Covers:</span>
          {merged.concepts_covered.map((c: string) => (
            <span key={c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: W.surfaceMuted, border: `1px solid ${W.border}`, color: W.text2 }}>{c}</span>
          ))}
        </div>
      )}

      {showEdit && (
        <div style={{ marginTop: 12, padding: 14, background: W.surfaceMuted, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: W.text3, marginBottom: 6 }}>PRIMARY CONTENT TYPE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CTS.map(ct => <Toggle key={ct} on={merged.primary_content_type === ct} label={ct} onClick={() => onEdit({ primary_content_type: ct })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: W.text3, marginBottom: 6 }}>SECONDARY BLOCKS (multi)</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CTS.map(ct => <Toggle key={ct} on={secondary.includes(ct)} label={ct}
                onClick={() => onEdit({ secondary_blocks: secondary.includes(ct) ? secondary.filter(x => x !== ct) : [...secondary, ct] })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: W.text3, marginBottom: 6 }}>GENERATION FLAGS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FLAG_KEYS.map(k => <Toggle key={k} on={!!flags[k]} label={k.replace('needs_', '').replace('requires_', '')}
                onClick={() => onEdit({ flags: { ...flags, [k]: !flags[k] } })} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: W.text3, marginBottom: 6 }}>COMPLEXITY</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TIERS.map(t => <Toggle key={t} on={merged.complexity_tier === t} label={t} onClick={() => onEdit({ complexity_tier: t })} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 12 }}>
        {CONCEPT_TYPES.map(t => (
          <ConceptTile key={t} jobId={job.id} conceptId={concept.concept_id}
            type={t} state={stateFor(concept.concept_id, t)} locked={t !== 'student_notes' && !notesReady} onChanged={onChanged}
            onView={() => onViewArtifact(concept.concept_id, t)} />
        ))}
      </div>
      {!notesReady && <div style={{ fontSize: 11.5, color: W.text3, marginTop: 8 }}>Generate Notes first — Slides & Quiz derive from them.</div>}
    </Card>
  );
}

/* ── topic artifact card ─────────────────────────────────────────────────── */

function TopicArtCard({ jobId, type, artifact, onChanged, onOpenPage }: {
  jobId: string; type: TopicArtType; artifact?: { review_status: string; cost_usd?: number; error?: string | null }; onChanged: () => void; onOpenPage: () => void;
}) {
  const status = artifact?.review_status;
  const gen = async () => { await generationApi.genTopicArtifact(jobId, type); onChanged(); };
  return (
    <div style={{ border: `1.5px solid ${W.border}`, borderRadius: 10, padding: '13px 14px', background: 'var(--card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: W.brandTintBg, color: W.brandTintFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 15, height: 15, display: 'flex' }}>{TOPIC_ICON[type]}</span>
        </div>
        <b style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text }}>{TOPIC_LABEL[type]}</b>
        <div style={{ marginLeft: 'auto' }}>
          {status === 'ready' ? <Badge variant="info">Ready</Badge> : status === 'generating' ? <Badge variant="orange">Generating…</Badge> : status === 'error' ? <Badge variant="red">Error</Badge> : <Badge variant="muted">Not generated</Badge>}
        </div>
      </div>
      {status === 'error' && artifact?.error && (
        <div style={{ fontSize: 11.5, color: W.redFg, marginTop: 6 }}>{artifact.error}</div>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
        {(!status || status === 'error') && <Btn sm variant="primary" onClick={gen}>Generate</Btn>}
        {status === 'ready' && <><Btn sm onClick={onOpenPage}>View</Btn><Btn sm variant="ghost" onClick={gen}>Regenerate</Btn></>}
        {status === 'generating' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: W.text2 }}><Spin /> ~20–40s</span>}
        {(artifact?.cost_usd ?? 0) > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{usd(artifact?.cost_usd)}</span>}
      </div>
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
  // Which concept's plan-edit panel is open — polling pauses while it is, so the
  // board doesn't reflow/scroll-jump under the faculty member as they edit.
  const [editingConcept, setEditingConcept] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [error, setError] = useState('');

  // ── Concept generation queue (sequential, visible, editable; one artifact type at a time) ──
  const [queue, setQueue] = useState<string[]>([]);            // waiting concept ids, in order
  const [queueType, setQueueType] = useState<ConceptArtType>('student_notes'); // artifact type this queue generates
  const [queueRun, setQueueRun] = useState<string | null>(null); // currently generating via queue
  const [queueDone, setQueueDone] = useState<Record<string, 'done' | 'failed'>>({});
  const [queuePaused, setQueuePaused] = useState(false);
  const [resumed, setResumed] = useState(false);
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topicTitle = (topic as any)?.title ?? 'Topic';
  const courseCode = (course as any)?.code ?? courseId ?? '';

  // Grounding indicator: ready reference materials attached to this topic
  // (count reported by the ReferenceMaterials card below the header).
  const { toast } = useWinTeach();
  const [groundedCount, setGroundedCount] = useState(0);

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

  // poll while anything is generating (or the queue has an item in flight)
  useEffect(() => {
    if (!job) return;
    const planGenerating = job.phase === 'generating_topic_plan' || job.phase === 'topic_plan_validate';
    const anyGenerating = (job.concept_artifacts ?? []).some(c => c.status === 'generating')
      || (job.artifacts ?? []).some(a => a.review_status === 'generating')
      || queueRun !== null;
    if (!planGenerating && !anyGenerating) return;
    if (editingConcept) return;  // don't reflow the board mid-edit
    poll.current = setTimeout(refetch, 2600);
    return () => { if (poll.current) clearTimeout(poll.current); };
  }, [job, refetch, queueRun, editingConcept]);

  const start = async () => {
    if (!courseId || !topicId) return;
    setStarting(true); setError('');
    try { await generationApi.startJob({ course_id: courseId, topic_id: topicId, artifact_types: ALL_TYPES }); await refetch(); }
    catch (e: any) { setError(e?.status === 409 ? 'A job already exists for this topic.' : 'Failed to start. Check the topic has an operative CO.'); }
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

  // pipeline + board rollups
  const conceptCount = concepts.length;
  const countBy = (t: ConceptArtType, pred: (s?: ConceptArtifactState) => boolean) =>
    concepts.filter((c: any) => pred(stateFor(c.concept_id, t))).length;
  const isDone = (s?: ConceptArtifactState) => s?.status === 'ready' || s?.approval_status === 'approved';
  const notesDone = countBy('student_notes', isDone);
  const slidesDone = countBy('slides', isDone);
  const quizDone = countBy('quiz', isDone);
  const derivedDone = slidesDone + quizDone;
  const topicArtsDone = TOPIC_ART_TYPES.filter(t => topicArt(t)?.review_status === 'ready').length;
  const planDone = !!plan;

  // Concepts still needing artifact `t`. Slides/quiz derive from notes, so
  // they're only pending once the concept's notes are ready or approved.
  const pendingFor = (t: ConceptArtType) => concepts.filter((c: any) => {
    const s = stateFor(c.concept_id, t);
    const missing = !s || s.status === 'not_generated' || s.status === 'error';
    if (t === 'student_notes') return missing;
    const ns = stateFor(c.concept_id, 'student_notes');
    return missing && (ns?.status === 'ready' || ns?.approval_status === 'approved');
  });
  const pendingNotes = pendingFor('student_notes');
  const pendingSlides = pendingFor('slides');
  const pendingQuiz = pendingFor('quiz');

  const conceptName = (cid: string) => concepts.find((c: any) => c.concept_id === cid)?.concept_name ?? cid;

  // ── Batch approval + next-step guidance ──
  const approvables = (job?.concept_artifacts ?? []).filter(
    c => c.status === 'ready' && c.approval_status !== 'approved');
  const [approvingAll, setApprovingAll] = useState(false);
  const approveAll = async () => {
    if (!job || approvables.length === 0) return;
    setApprovingAll(true);
    let ok = 0;
    for (const c of approvables) {
      try { await generationApi.approveConcept(job.id, c.concept_id, c.artifact_type); ok++; }
      catch { /* keep going; the board shows what's left */ }
    }
    toast(ok === approvables.length ? `Approved ${ok} artifacts` : `Approved ${ok}, ${approvables.length - ok} failed`);
    await refetch();
    setApprovingAll(false);
  };

  // Failed concept artifacts, grouped by type — surfaced persistently (not just
  // as a toast) with a one-click retry that re-enqueues them.
  const failedByType: Record<ConceptArtType, string[]> = {
    student_notes: [], slides: [], quiz: [],
  };
  for (const c of job?.concept_artifacts ?? []) {
    if (c.status === 'error' && c.artifact_type in failedByType) failedByType[c.artifact_type].push(c.concept_id);
  }
  const failedTotal = Object.values(failedByType).reduce((n, a) => n + a.length, 0);
  const failedTypes = (Object.keys(failedByType) as ConceptArtType[]).filter(t => failedByType[t].length > 0);

  const nextStep = (() => {
    if (!job || job.status === 'failed' || !plan) return null;
    if (notesDone === 0 && pendingNotes.length > 0)
      return `Plan validated — next, generate Notes for the ${conceptCount} subtopics ("Generate all Notes" runs them one by one).`;
    if (approvables.length > 0)
      return `${approvables.length} generated artifact${approvables.length > 1 ? 's are' : ' is'} awaiting your review — open with View, then Approve (or use "Approve all ready").`;
    if (pendingNotes.length > 0)
      return `${pendingNotes.length} subtopic${pendingNotes.length > 1 ? 's' : ''} still need${pendingNotes.length > 1 ? '' : 's'} Notes.`;
    if (pendingSlides.length + pendingQuiz.length > 0)
      return 'Notes are in — generate the remaining Slides and Quizzes (they derive from the approved Notes).';
    if (topicArtsDone < TOPIC_ART_TYPES.length)
      return 'Concept artifacts are done — generate the topic-wide artifacts at the bottom (summary, assignment, diagnostic, flashcards).';
    return null; // everything generated & approved — no nagging
  })();

  // Queue engine: watch the running item until it settles, then dispatch the next.
  // queueWaiting guards the window between dispatch and the post-dispatch refetch:
  // until it clears, `job` is a stale snapshot and a previous 'error'/'ready'
  // status would settle the item instantly while the backend is still running it.
  const queueWaiting = useRef(false);
  useEffect(() => {
    if (!job) return;
    if (queueRun) {
      if (queueWaiting.current) return;
      const st = stateFor(queueRun, queueType)?.status;
      if (st === 'ready') { setQueueDone(d => ({ ...d, [queueRun]: 'done' })); setQueueRun(null); }
      else if (st === 'error') { setQueueDone(d => ({ ...d, [queueRun]: 'failed' })); setQueueRun(null); }
      return;
    }
    if (queuePaused || queue.length === 0) return;
    const nextId = queue[0];
    setQueue(q => q.slice(1));
    queueWaiting.current = true;
    setQueueRun(nextId);
    generationApi.genConcept(job.id, nextId, queueType)
      .then(refetch)
      .then(() => { queueWaiting.current = false; })
      .catch(() => { queueWaiting.current = false; setQueueDone(d => ({ ...d, [nextId]: 'failed' })); setQueueRun(null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, queue, queueRun, queuePaused, queueType]);

  const queueBusy = queueRun !== null || queue.length > 0;
  const enqueueAll = (t: ConceptArtType) => {
    if (queueBusy && queueType !== t) return; // one artifact type per queue run
    setQueueType(t);
    const ids = pendingFor(t).map((c: any) => c.concept_id).filter((id: string) => id !== queueRun && !queue.includes(id));
    setQueueDone({});
    setQueuePaused(false);
    setQueue(q => [...q, ...ids]);
  };
  const queueMove = (i: number, dir: -1 | 1) => setQueue(q => {
    const j = i + dir;
    if (j < 0 || j >= q.length) return q;
    const next = [...q];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const queueRemove = (i: number) => setQueue(q => q.filter((_, x) => x !== i));
  const queueVisible = queueRun !== null || queue.length > 0 || Object.keys(queueDone).length > 0;

  // Persist the queue per topic so navigating away (e.g. View → notes reader)
  // doesn't silently abandon a running batch; restore it on mount.
  const queueKey = `wt-notes-queue:${topicId}`;
  const [queueRestored, setQueueRestored] = useState(false);
  useEffect(() => {
    if (!topicId) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(queueKey) ?? 'null');
      if (saved) {
        setQueue(saved.queue ?? []);
        setQueueType(saved.queueType ?? 'student_notes');
        setQueueRun(saved.queueRun ?? null);
        setQueueDone(saved.queueDone ?? {});
        setQueuePaused(saved.queuePaused ?? false);
      }
    } catch { /* */ }
    setQueueRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);
  useEffect(() => {
    if (!topicId || !queueRestored) return;
    if (queueVisible) sessionStorage.setItem(queueKey, JSON.stringify({ queue, queueType, queueRun, queueDone, queuePaused }));
    else sessionStorage.removeItem(queueKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, queueRestored, queue, queueType, queueRun, queueDone, queuePaused, queueVisible]);

  // topic context (this page is the topic's home — no separate topic page)
  const tp = topic as any;
  const linkedCo = tp?.linked_co;
  const bloom = tp?.bloom_level ?? linkedCo?.bloom_level;
  const subtopics: string[] = (tp?.subtopics ?? []).map((s: any) => s.title ?? s);
  const hours = tp?.contact_hours ?? tp?.hours;

  const scrollToConcept = (cid: string) =>
    document.getElementById(`concept-${cid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Keyboard shortcuts (studio): j/k move between subtopics, g generates all
  // pending Notes, a approves everything ready. Ignored while typing or a
  // dialog/modifier is active.
  const navIdx = useRef(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (!plan || concepts.length === 0) return;
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        navIdx.current = Math.max(0, Math.min(concepts.length - 1, navIdx.current + (e.key === 'j' ? 1 : -1)));
        scrollToConcept(concepts[navIdx.current].concept_id);
      } else if (e.key === 'g' && pendingNotes.length > 0 && !queueBusy) {
        e.preventDefault(); enqueueAll('student_notes');
      } else if (e.key === 'a' && approvables.length > 0 && !approvingAll) {
        e.preventDefault(); approveAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, concepts, pendingNotes.length, approvables.length, queueBusy, approvingAll]);

  return (
    <>
      <WinTopbar title="Generation Studio" actions={
        <Btn variant="ghost" onClick={() => navigate(`/winteach/courses/${courseId}`)}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back to {courseCode}
        </Btn>
      } />
      <WinContent>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Breadcrumb items={[
          { label: 'Courses', onClick: () => navigate('/winteach/courses') },
          { label: courseCode, onClick: () => navigate(`/winteach/courses/${courseId}`) },
          { label: topicTitle },
        ]} />


          {/* ── Studio header: topic identity + cost ── */}
          <div className="ds-rise" style={{
            background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 12,
            boxShadow: W.shadowCard, padding: '22px 26px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div style={{ fontFamily: W.fontDisplay, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: W.brandTintFg, marginBottom: 5 }}>
                  Generation Studio · {courseCode}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 21, color: W.text, lineHeight: 1.2 }}>{topicTitle}</div>
                  {bloom && <Badge variant="blue">{bloom}</Badge>}
                  {subtopics.length > 0 && <Badge variant="muted">{subtopics.length} subtopics</Badge>}
                  {hours != null && <Badge variant="muted">{hours} hrs</Badge>}
                  {groundedCount > 0 && (
                    <span title="New generations for this topic will be grounded in the attached reference materials. Already-generated artifacts show their own Grounded chip.">
                      <Badge variant="green" dot>
                        Grounding · {groundedCount} file{groundedCount > 1 ? 's' : ''}
                      </Badge>
                    </span>
                  )}
                </div>
                {linkedCo?.description && (
                  <div style={{ fontSize: 12.5, color: W.text2, marginTop: 8, lineHeight: 1.55 }}>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, color: W.brandTintFg }}>Linked CO: </span>
                    {linkedCo.description}
                  </div>
                )}
              </div>
              {job && (
                <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
                  {([
                    ['Estimated', `~${usd(job.est_cost_usd)}`, W.text, 'Estimated when the Topic Plan was generated — attaching materials afterwards isn’t reflected here'],
                    ['Spent', usd(job.cost_usd), W.brandTintFg, undefined],
                    ['Tokens', (job.token_count ?? 0).toLocaleString(), W.text2, undefined],
                  ] as [string, string, string, string | undefined][]).map(([l, v, color, tip]) => (
                    <div key={l} title={tip} style={{ background: W.surfaceMuted, borderRadius: 8, padding: '10px 16px', minWidth: 86, textAlign: 'center' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: W.text3, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                      {l === 'Estimated' && groundedCount > 0 && (
                        <div style={{ fontSize: 9.5, color: W.text3, marginTop: 2 }}>+ grounding</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* pipeline tracker */}
            {job && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${W.border}`, overflowX: 'auto' }}>
                <PipelineStage icon={<ILessonPlan />} label="Topic Plan"
                  count={planGenerating ? 'validating…' : planDone ? 'validated' : 'not started'}
                  state={planDone ? 'done' : planGenerating ? 'active' : 'pending'} />
                <PipelineStage icon={<INotes />} label="Notes"
                  count={conceptCount ? `${notesDone}/${conceptCount} ready` : '—'}
                  state={conceptCount > 0 && notesDone === conceptCount ? 'done' : notesDone > 0 || (planDone && conceptCount > 0) ? 'active' : 'pending'} />
                <PipelineStage icon={<IImage />} label="Slides & Quiz"
                  count={conceptCount ? `${derivedDone}/${conceptCount * 2} ready` : '—'}
                  state={conceptCount > 0 && derivedDone === conceptCount * 2 ? 'done' : derivedDone > 0 ? 'active' : anyNotesReady ? 'active' : 'pending'} />
                <PipelineStage icon={<IFlash />} label="Topic-wide"
                  count={`${topicArtsDone}/${TOPIC_ART_TYPES.length} ready`}
                  state={topicArtsDone === TOPIC_ART_TYPES.length ? 'done' : topicArtsDone > 0 ? 'active' : 'pending'} last />
              </div>
            )}
          </div>

          {/* Optional grounding: attach reference PDFs/DOCX before generating */}
          {topicId && (
            <ReferenceMaterials
              courseId={(course as any)?.id ?? courseId ?? ''}
              topicId={topicId}
              toast={toast}
              onReadyCount={setGroundedCount}
              collapseWhenIdle
            />
          )}

          {/* next-step guidance — one line, derived from live pipeline state */}
          {nextStep && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, background: W.brandTintBg,
              borderRadius: 10, padding: '10px 16px', marginBottom: 16,
              fontSize: 13, color: W.text, lineHeight: 1.5,
            }}>
              <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: W.brandTintFg, flexShrink: 0 }}>Next</span>
              {nextStep}
            </div>
          )}

          {dirty && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, background: W.brandTintBg,
              border: '1px solid color-mix(in oklab, var(--tint-brand-fg) 20%, transparent)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 13, color: W.text, flex: 1 }}>You have unsaved plan changes.</span>
              <Btn sm variant="primary" onClick={savePlan} disabled={savingPlan}>{savingPlan ? 'Saving…' : 'Save plan changes'}</Btn>
              <Btn sm variant="ghost" onClick={() => setEdits({})}>Discard</Btn>
            </div>
          )}

          {error && <div style={{ background: W.redBg, color: W.redFg, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {/* initial load — skeleton rather than a blank flash while resuming */}
          {!resumed && (
            <Card>
              <Skeleton lines={1} height={22} width={220} style={{ marginBottom: 16 }} />
              <Skeleton lines={4} height={13} />
            </Card>
          )}

          {/* ── empty state — pipeline preview + syllabus context ── */}
          {resumed && !job && (
            <Card className="ds-rise">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                  background: 'var(--app-bg-grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 16px -6px color-mix(in oklab, var(--brand) 55%, transparent)',
                }}>
                  <span style={{ width: 24, height: 24, display: 'flex' }}><ISpark /></span>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, marginBottom: 6, color: W.text }}>Ready to generate</div>
                  <div style={{ color: W.text2, fontSize: 13.5, maxWidth: 580, marginBottom: 16, lineHeight: 1.6 }}>
                    Step 1 generates & validates the <b>Topic Plan</b>, decomposing this topic into teachable concepts.
                    You then review the plan and generate each concept's Notes, Slides and Quiz on demand — plus topic-wide artifacts like the summary and flashcards.
                  </div>
                  {subtopics.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: W.text3, marginBottom: 8 }}>SYLLABUS SUBTOPICS ({subtopics.length})</div>
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
              </div>
            </Card>
          )}

          {planGenerating && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: W.text2, fontSize: 13.5, marginBottom: 16 }}>
                <Spin />
                Generating & validating the Topic Plan…
              </div>
              <Skeleton lines={3} height={13} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
                {[0, 1, 2].map(i => <Skeleton key={i} height={64} />)}
              </div>
            </Card>
          )}

          {job?.status === 'failed' && job.phase === 'error' && (
            <Card>
              <div style={{ color: W.redFg, fontSize: 13.5, marginBottom: 10 }}>{job.error_msg || 'Topic Plan generation failed.'}</div>
              {planStatus.failures.length > 0 && (
                <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 12.5, color: W.redFg }}>
                  {planStatus.failures.map((f: any, i: number) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {friendlyCheck(f.name)}
                      {f.detail && <div style={{ fontSize: 11, color: W.text3 }}>{f.detail}</div>}
                    </li>
                  ))}
                </ul>
              )}
              <Btn variant="primary" onClick={start} disabled={starting}>Regenerate Topic Plan</Btn>
            </Card>
          )}

          {/* ── artifacts board + concept cards ── */}
          {plan && (
            <>
              {/* generation board — every artifact's status at a glance */}
              <div className="ds-rise" style={{
                background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10,
                boxShadow: W.shadowCard, padding: '18px 22px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: W.fontDisplay, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: W.brandTintFg }}>Generation board</div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {(['approved', 'ready', 'generating', 'pending'] as DotState[]).map(s => (
                      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: W.text2 }}>
                        <StatusDot state={s} /> {DOT_META[s].label.split(' — ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '0 10px 9px 0' }}>Subtopic</th>
                        {CONCEPT_TYPES.map(t => (
                          <th key={t} style={{ textAlign: 'center', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '0 10px 9px', minWidth: 62 }}>{CONCEPT_LABEL[t]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {concepts.map((c: any) => (
                        <tr key={c.concept_id} onClick={() => scrollToConcept(c.concept_id)}
                          role="button" tabIndex={0}
                          aria-label={`Jump to ${c.concept_name}`}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToConcept(c.concept_id); } }}
                          style={{ cursor: 'pointer' }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                        >
                          <td style={{ padding: '8px 10px 8px 0', borderTop: `1px solid ${W.border}`, fontSize: 13, color: W.text, fontFamily: W.fontSans }}>
                            {c.concept_name}
                          </td>
                          {CONCEPT_TYPES.map(t => {
                            const s = stateFor(c.concept_id, t);
                            return (
                              <td key={t} style={{ padding: '8px 10px', borderTop: `1px solid ${W.border}`, textAlign: 'center' }}>
                                <StatusDot state={dotFor(s?.status, s?.approval_status === 'approved')} title={`${c.concept_name} · ${CONCEPT_LABEL[t]}`} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '10px 10px 2px 0', borderTop: `2px solid ${W.border}`, fontSize: 12, color: W.text2, fontFamily: W.fontDisplay, fontWeight: 600 }}>
                          Topic-wide
                        </td>
                        <td colSpan={CONCEPT_TYPES.length} style={{ padding: '10px 10px 2px', borderTop: `2px solid ${W.border}` }}>
                          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {TOPIC_ART_TYPES.map(t => {
                              const a = topicArt(t);
                              const st: DotState = a?.review_status === 'ready' ? 'ready' : a?.review_status === 'generating' ? 'generating' : a?.review_status === 'error' ? 'error' : 'pending';
                              return (
                                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: W.text2 }}>
                                  <StatusDot state={st} title={TOPIC_LABEL[t]} /> {TOPIC_LABEL[t].split(' /')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* topic plan — every section the plan prompt produces, read-only */}
              <TopicPlanPanel plan={plan} />

              {/* concepts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color: W.text }}>Subtopics ({concepts.length})</div>
                {concepts.length > 1 && (
                  <span className="max-md:hidden" title="j/k move between subtopics · g generate all Notes · a approve all ready"
                    style={{ fontSize: 11, color: W.text3, border: `1px solid ${W.border}`, borderRadius: 6, padding: '1px 7px', fontFamily: W.fontDisplay }}>
                    ⌨ j k · g · a
                  </span>
                )}
                {planStatus.ok ? <Badge variant="green" dot>Plan validated</Badge> : <Badge variant="orange">Plan needs revision</Badge>}
                {plan.front_matter?.topic_plan_version && <Badge variant="muted">v{plan.front_matter.topic_plan_version}</Badge>}
                {(pendingNotes.length > 0 || pendingSlides.length > 0 || pendingQuiz.length > 0 || approvables.length > 0) && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {approvables.length > 0 && (
                      <Btn sm onClick={approveAll} disabled={approvingAll}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}><ICheck /></span>
                        {approvingAll ? 'Approving…' : `Approve all ready (${approvables.length})`}
                      </Btn>
                    )}
                    {pendingNotes.length > 0 && (
                      <Btn sm variant="primary" onClick={() => enqueueAll('student_notes')} disabled={queueBusy && queueType !== 'student_notes'}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}><ISpark /></span>
                        Generate all Notes ({pendingNotes.length})
                      </Btn>
                    )}
                    {pendingSlides.length > 0 && (
                      <Btn sm onClick={() => enqueueAll('slides')} disabled={queueBusy && queueType !== 'slides'}>
                        Generate all Slides ({pendingSlides.length})
                      </Btn>
                    )}
                    {pendingQuiz.length > 0 && (
                      <Btn sm onClick={() => enqueueAll('quiz')} disabled={queueBusy && queueType !== 'quiz'}>
                        Generate all Quizzes ({pendingQuiz.length})
                      </Btn>
                    )}
                  </div>
                )}
              </div>

              {/* persistent failure banner — survives past the transient toast */}
              {failedTotal > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: W.redBg,
                  border: `1px solid color-mix(in oklab, var(--tint-red-fg) 25%, transparent)`,
                  borderRadius: 10, padding: '10px 16px', marginBottom: 14,
                }}>
                  <span style={{ fontSize: 13, color: W.redFg, flex: 1 }}>
                    {failedTotal} generation{failedTotal > 1 ? 's' : ''} failed.
                  </span>
                  {failedTypes.map(t => (
                    <Btn key={t} sm variant="ghost" onClick={() => enqueueAll(t)} disabled={queueBusy && queueType !== t}>
                      Retry {CONCEPT_LABEL[t]} ({failedByType[t].length})
                    </Btn>
                  ))}
                </div>
              )}

              {/* ── Notes queue — sequential, visible, editable ── */}
              {queueVisible && (
                <div style={{
                  background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10,
                  boxShadow: W.shadowCard, marginBottom: 14, overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: `1px solid ${W.border}`, background: W.surfaceMuted }}>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text }}>{CONCEPT_LABEL[queueType]} queue</span>
                    <Badge variant={queueRun ? 'info' : queue.length ? 'orange' : 'green'}>
                      {queueRun ? 'Running' : queue.length ? (queuePaused ? 'Paused' : 'Waiting') : 'Finished'}
                    </Badge>
                    <span style={{ fontSize: 12, color: W.text2, fontVariantNumeric: 'tabular-nums' }}>
                      {Object.values(queueDone).filter(v => v === 'done').length} done
                      {Object.values(queueDone).some(v => v === 'failed') && ` · ${Object.values(queueDone).filter(v => v === 'failed').length} failed`}
                      {queue.length > 0 && ` · ${queue.length} waiting`}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {queue.length > 0 && (
                        <Btn sm variant="ghost" onClick={() => setQueuePaused(p => !p)}>{queuePaused ? 'Resume' : 'Pause'}</Btn>
                      )}
                      <Btn sm variant="ghost" onClick={() => { setQueue([]); setQueueDone({}); setQueuePaused(false); }}>
                        {queue.length > 0 ? 'Clear' : 'Dismiss'}
                      </Btn>
                    </div>
                  </div>
                  <div>
                    {/* finished items */}
                    {Object.entries(queueDone).map(([cid, res]) => (
                      <div key={cid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: `1px solid ${W.border}`, opacity: 0.75 }}>
                        <StatusDot state={res === 'done' ? 'ready' : 'error'} />
                        <span style={{ fontSize: 13, color: W.text2, flex: 1, textDecoration: res === 'done' ? 'none' : 'none' }}>{conceptName(cid)}</span>
                        <span style={{ fontSize: 11.5, color: res === 'done' ? W.greenFg : W.redFg, fontWeight: 500 }}>{res === 'done' ? 'Ready' : 'Failed'}</span>
                      </div>
                    ))}
                    {/* running item */}
                    {queueRun && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: `1px solid ${W.border}`, background: 'color-mix(in oklab, var(--tint-brand-bg) 45%, var(--card))' }}>
                        <Spin />
                        <span style={{ fontSize: 13, fontWeight: 600, color: W.text, flex: 1 }}>{conceptName(queueRun)}</span>
                        <span style={{ fontSize: 11.5, color: W.brandTintFg, fontWeight: 500 }}>Generating…</span>
                      </div>
                    )}
                    {/* waiting items — reorder / remove */}
                    {queue.map((cid, i) => (
                      <div key={cid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', borderBottom: i < queue.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                        <span style={{ fontSize: 11.5, color: W.text3, width: 16, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                        <span style={{ fontSize: 13, color: W.text, flex: 1 }}>{conceptName(cid)}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {([['↑', () => queueMove(i, -1), i === 0, 'Move up'], ['↓', () => queueMove(i, 1), i === queue.length - 1, 'Move down'], ['✕', () => queueRemove(i), false, 'Remove']] as [string, () => void, boolean, string][]).map(([sym, fn, off, title]) => (
                            <button key={title} onClick={fn} disabled={off} title={title} style={{
                              width: 24, height: 24, borderRadius: 6, border: `1px solid ${W.border}`, background: 'var(--card)',
                              color: off ? W.text3 : W.text2, cursor: off ? 'default' : 'pointer', fontSize: 11,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: off ? 0.4 : 1,
                            }}>{sym}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!queueRun && queue.length === 0 && (
                      <div style={{ padding: '9px 16px', fontSize: 12.5, color: W.text2 }}>
                        Queue finished. Review the generated notes below or in the reader.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {concepts.length > 1 && (
                  <ConceptRail concepts={concepts} stateFor={stateFor} onJump={scrollToConcept} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {concepts.map((c: any, i: number) => (
                    <ConceptCard key={c.concept_id} index={i} job={job!} concept={c} edit={edits[c.concept_id] ?? {}}
                      onEdit={(patch) => editConcept(c.concept_id, patch)} stateFor={stateFor} onChanged={refetch}
                      onEditingChange={setEditingConcept}
                      onViewArtifact={(cid, t) => navigate(`/winteach/courses/${courseId}/topic/${topicId}/${t === 'student_notes' ? 'notes' : t}/${cid}`)} />
                  ))}
                </div>
              </div>

              {/* topic-level artifacts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 10px' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 16, color: W.text }}>Topic-wide artifacts</div>
                <Badge variant={topicArtsDone === TOPIC_ART_TYPES.length ? 'green' : 'muted'}>{topicArtsDone}/{TOPIC_ART_TYPES.length} ready</Badge>
              </div>
              {!anyNotesReady && <div style={{ fontSize: 12.5, color: W.text3, marginBottom: 10 }}>Generate at least one subtopic's Notes first.</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, opacity: anyNotesReady ? 1 : 0.55, pointerEvents: anyNotesReady ? 'auto' : 'none' }}>
                {TOPIC_ART_TYPES.map(t => <TopicArtCard key={t} jobId={job!.id} type={t} artifact={topicArt(t)} onChanged={refetch}
                  onOpenPage={() => navigate(t === 'summary'
                    ? `/winteach/courses/${courseId}/topic/${topicId}/cheatsheet`
                    : `/winteach/courses/${courseId}/topic/${topicId}/artifact/${t}`)} />)}
              </div>
            </>
          )}
        </div>
      </WinContent>
      <style>{`@keyframes wt-spin { to { transform: rotate(360deg); } } .wt-spin { animation: wt-spin .8s linear infinite; }`}</style>
    </>
  );
}
