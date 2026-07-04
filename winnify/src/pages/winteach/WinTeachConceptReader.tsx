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

const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

function DataTable({ columns, rows }: { columns: string[]; rows: any[][] }) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${W.border}`, borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        {columns.length > 0 && (
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '8px 12px', background: W.surfaceMuted, borderBottom: `1px solid ${W.border}`, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.04em', color: W.text3, whiteSpace: 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {(Array.isArray(r) ? r : [r]).map((cell: any, ci: number) => (
                <td key={ci} style={{ padding: '8px 12px', borderBottom: ri < rows.length - 1 ? `1px solid ${W.border}` : 'none', color: W.text2, lineHeight: 1.5, verticalAlign: 'top' }}>
                  {cell == null ? '—' : typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mermaid diagram renderer — the library is imported on demand so it stays out
// of the main bundle. Falls back to showing the Mermaid source if render fails.
let mermaidSeq = 0;
function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setSvg(null); setFailed(false);
    import('mermaid')
      .then(async m => {
        const mermaid = m.default;
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
        try {
          const { svg } = await mermaid.render(`wt-mmd-${++mermaidSeq}`, code);
          if (alive) setSvg(svg);
        } catch {
          if (alive) setFailed(true);
        }
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [code]);
  if (failed) {
    return <pre style={{ background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 8, padding: '12px 16px', overflow: 'auto', fontSize: 12, lineHeight: 1.6, margin: 0, fontFamily: MONO, color: W.text2 }}>{code}</pre>;
  }
  if (!svg) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: W.text3, fontSize: 12.5, padding: '10px 0' }}><span className="wt-spin" style={{ width: 12, height: 12, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block' }} /> Rendering diagram…</div>;
  }
  return <div style={{ overflowX: 'auto', border: `1px solid ${W.border}`, borderRadius: 8, padding: '12px 16px', background: W.card }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── math / code / reveal helpers ─────────────────────────────────────────────

let katexPromise: Promise<any> | null = null;
const loadKatex = () =>
  (katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')])
    .then(([k]) => (k as any).default ?? k));

type MathSeg = { kind: 'text' | 'math'; value: string; display: boolean };
function splitMath(text: string): MathSeg[] {
  const segs: MathSeg[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ kind: 'text', value: text.slice(last, m.index), display: false });
    segs.push({ kind: 'math', value: (m[1] ?? m[2]) as string, display: m[1] != null });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ kind: 'text', value: text.slice(last), display: false });
  return segs;
}

// Typesets LaTeX wrapped in $…$ / $$…$$ via lazily-loaded KaTeX; anything else
// (including content generated before the LaTeX prompt rule) passes through as
// plain text, and invalid LaTeX falls back to the raw delimited source.
function MathText({ text }: { text: any }) {
  const str = typeof text === 'string' ? text : text == null ? '' : String(text);
  const hasMath = /\$[^$]/.test(str);
  const [nodes, setNodes] = useState<React.ReactNode[] | null>(null);
  useEffect(() => {
    let alive = true;
    if (!hasMath) { setNodes(null); return; }
    loadKatex().then(katex => {
      if (!alive) return;
      setNodes(splitMath(str).map((s, i) => {
        if (s.kind === 'text') return <span key={i}>{s.value}</span>;
        try {
          return <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(s.value, { displayMode: s.display, throwOnError: true }) }} />;
        } catch {
          return <span key={i}>{s.display ? `$$${s.value}$$` : `$${s.value}$`}</span>;
        }
      }));
    }).catch(() => {});
    return () => { alive = false; };
  }, [str, hasMath]);
  if (!hasMath || nodes == null) return <>{str}</>;
  return <>{nodes}</>;
}

let hljsPromise: Promise<any> | null = null;
const loadHljs = () =>
  (hljsPromise ??= Promise.all([import('highlight.js/lib/common'), import('highlight.js/styles/github-dark.css')])
    .then(([m]) => (m as any).default ?? m));

function CodeBlock({ code, language }: { code: string; language?: string | null }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setHtml(null);
    loadHljs().then(hljs => {
      if (!alive) return;
      try {
        const lang = (language ?? '').toLowerCase().match(/^[a-z+#]+/)?.[0] ?? '';
        const r = lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }) : hljs.highlightAuto(code);
        setHtml(r.value);
      } catch { /* plain fallback */ }
    }).catch(() => {});
    return () => { alive = false; };
  }, [code, language]);
  return (
    <pre style={{
      background: '#0f1117', color: '#e2e6f0', borderRadius: 8, padding: '16px 18px',
      overflow: 'auto', fontSize: 12.5, lineHeight: 1.6, margin: 0, fontFamily: MONO,
    }}>
      {html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code>{code}</code>}
    </pre>
  );
}

function Reveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (open) return <div style={{ marginTop: 8 }}>{children}</div>;
  return (
    <button onClick={() => setOpen(true)} style={{
      marginTop: 8, padding: '4px 12px', borderRadius: 6, border: `1px solid ${W.borderStrong}`,
      background: 'transparent', color: 'var(--tint-brand-fg)', fontFamily: W.fontDisplay,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'block',
    }}>{label}</button>
  );
}

// Generated visuals: mermaid_code renders as a Mermaid diagram; columns/rows
// render as a table (headers optional). Visuals with neither and only a
// one-line placeholder description ("Diagram showing X…") are skipped.
function VisualBlock({ v }: { v: any }) {
  const mermaidCode = typeof v?.mermaid_code === 'string' && v.mermaid_code.trim() ? v.mermaid_code.trim() : null;
  const hasTable = (v?.rows?.length ?? 0) > 0;
  const desc = typeof v?.description === 'string' ? v.description : '';
  const substantiveDesc = desc.includes('\n') || desc.length >= 100;
  if (!mermaidCode && !hasTable && !substantiveDesc) return null;
  return (
    <figure style={{ margin: '14px 0 0' }}>
      {v.title && <figcaption style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.text, marginBottom: 6 }}>{v.title}</figcaption>}
      {mermaidCode
        ? <MermaidBlock code={mermaidCode} />
        : hasTable
          ? <DataTable columns={v.columns ?? []} rows={v.rows} />
          : <div style={{ border: `1px dashed ${W.borderStrong}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: W.text2, lineHeight: 1.6, background: W.surfaceMuted, whiteSpace: 'pre-wrap' }}>{desc}</div>}
    </figure>
  );
}

function NotesArticle({ content }: { content: any }) {
  const core = content?.core ?? {};
  const opening = content?.opening ?? {};
  const closing = content?.closing ?? {};
  // opening
  const openSections = opening?.sections ?? {};
  const metaInfo = openSections?.topic_overview?.subtopic_metadata;
  const outcomes = openSections?.topic_overview?.outcomes_checklist ?? [];
  const scenario = openSections?.problem_statement?.scenario;
  const gap = openSections?.problem_statement?.gap_statement;
  const intro = openSections?.introduction?.narrative_intro;
  const connectivity = openSections?.introduction?.connectivity_matrix;
  const hasConnectivity = ((connectivity?.foundation?.length ?? 0)
    + (connectivity?.this_subtopic?.length ?? 0)
    + (connectivity?.builds_toward?.length ?? 0)) > 0;
  // core
  const def = core?.core_concept?.formal_definition;
  const intuition = core?.core_concept?.mental_model_analogy ?? core?.core_concept?.intuition ?? opening?.hook;
  const mech = core?.deep_dive?.architecture_and_mechanism?.explanation;
  const archVisuals: any[] = core?.deep_dive?.architecture_and_mechanism?.visuals ?? [];
  // Honor the generator's placement hints; after_worked_example visuals fall
  // back to the mechanism section when there is no worked example.
  const vBefore = archVisuals.filter((v: any) => v?.placement === 'before_explanation');
  const vAfterWorkedRaw = archVisuals.filter((v: any) => v?.placement === 'after_worked_example');
  const vAfterMech = archVisuals.filter((v: any) => v?.placement !== 'before_explanation' && v?.placement !== 'after_worked_example');
  const code = core?.deep_dive?.code_or_formalization;
  const grid = code?.complexity_grid;
  const hasGrid = grid && [grid.best_case_time, grid.average_case_time, grid.worst_case_time, grid.space_complexity].some((v: any) => v && v !== 'N/A');
  const trace = core?.deep_dive?.execution_trace;
  const hasTrace = trace?.applicable && (trace?.dry_run_trace || (trace?.edge_case_matrix?.length ?? 0) > 0 || (trace?.visuals?.length ?? 0) > 0);
  const worked = core?.practical_understanding?.worked_example;
  const advantages: any[] = core?.practical_understanding?.advantages ?? [];
  const disadvantages: any[] = core?.practical_understanding?.disadvantages ?? [];
  const applications = core?.practical_understanding?.applications ?? core?.practical_understanding?.real_world_applications;
  const hasApplications = Array.isArray(applications) ? applications.length > 0 : Boolean(applications);
  const analysis = core?.analysis;
  const hasAnalysis = analysis?.applicable && (analysis?.discussion || (analysis?.complexity_note && analysis.complexity_note !== 'N/A'));
  const comparison = core?.comparison;
  const compRows: any[] = comparison?.comparison_table?.rows ?? [];
  const hasComparison = comparison?.applicable !== false && compRows.length > 0;
  // closing
  const mistakes = closing?.sections?.common_mistakes ?? [];
  const revision = closing?.sections?.revision_section;
  const formulas: any[] = revision?.important_formulas ?? [];
  const hasRevision = (revision?.key_takeaways?.length ?? 0) > 0
    || formulas.length > 0
    || (revision?.important_definitions?.length ?? 0) > 0
    || (revision?.active_recall_prompts?.length ?? 0) > 0;
  const glossaryTerms: any[] = closing?.sections?.glossary_section?.terms ?? [];
  const practice = closing?.sections?.practice_questions;
  const practiceGroups: Array<[string, 'green' | 'orange' | 'red', any[]]> = [
    ['Easy', 'green', practice?.easy ?? []],
    ['Medium', 'orange', practice?.medium ?? []],
    ['Hard', 'red', practice?.hard ?? []],
  ];
  const hasPractice = practiceGroups.some(([, , qs]) => qs.length > 0);
  const related = closing?.sections?.related_topics;
  const hasRelated = related && (related.previous_connection || related.next_connection || (related.builds_toward?.length ?? 0) > 0 || related.industry_relevance);
  let n = 0;

  return (
    <>
      {(metaInfo?.difficulty || metaInfo?.reading_time_minutes || metaInfo?.placement_relevance || metaInfo?.university_importance) && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: W.text3 }}>
            {metaInfo.difficulty && <span>Difficulty {metaInfo.difficulty}</span>}
            {metaInfo.reading_time_minutes != null && <span>~{metaInfo.reading_time_minutes} min read</span>}
            {metaInfo.placement_relevance && <span>Placement relevance: {metaInfo.placement_relevance}</span>}
            {metaInfo.university_importance && <span>Exam importance: {metaInfo.university_importance}</span>}
          </div>
          {(metaInfo.placement_justification || metaInfo.university_justification) && (
            <div style={{ fontSize: 12, color: W.text3, marginTop: 4, lineHeight: 1.5 }}>
              {[metaInfo.placement_justification, metaInfo.university_justification].filter(Boolean).join(' ')}
            </div>
          )}
        </div>
      )}
      {(scenario || intro || hasConnectivity) && (
        <Section n={++n} title="Why this matters">
          {scenario && <p style={{ margin: 0 }}>{scenario}</p>}
          {gap && <p style={{ margin: scenario ? '10px 0 0' : 0, fontWeight: 600, color: W.text }}>{gap}</p>}
          {intro && <p style={{ margin: scenario || gap ? '10px 0 0' : 0 }}>{intro}</p>}
          {hasConnectivity && (
            <div style={{ marginTop: scenario || gap || intro ? 14 : 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, borderLeft: `3px solid ${W.border}`, paddingLeft: 14 }}>
              {(connectivity.foundation?.length ?? 0) > 0 && <div><span style={{ fontWeight: 600, color: W.text }}>You already know:</span> {connectivity.foundation.join(', ')}</div>}
              {(connectivity.this_subtopic?.length ?? 0) > 0 && <div><span style={{ fontWeight: 600, color: W.text }}>This lesson covers:</span> {connectivity.this_subtopic.join(', ')}</div>}
              {(connectivity.builds_toward?.length ?? 0) > 0 && <div><span style={{ fontWeight: 600, color: W.text }}>Builds toward:</span> {connectivity.builds_toward.join(', ')}</div>}
            </div>
          )}
        </Section>
      )}
      {outcomes.length > 0 && (
        <Section n={++n} title="Learning outcomes">
          <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
            {outcomes.map((o: any, i: number) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {o.statement}
                {o.bloom_level && <span style={{ marginLeft: 8, fontSize: 11, color: W.text3 }}>{o.bloom_level}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {def && (
        <Section n={++n} title="Definition">
          <p style={{ margin: 0, fontSize: 15, color: W.text, lineHeight: 1.75 }}><MathText text={def} /></p>
          {intuition && <p style={{ margin: '12px 0 0' }}><MathText text={intuition} /></p>}
        </Section>
      )}
      {(mech || archVisuals.length > 0) && (
        <Section n={++n} title="Architecture & mechanism">
          {vBefore.map((v: any, i: number) => <VisualBlock key={`b${i}`} v={v} />)}
          {mech && <p style={{ margin: vBefore.length ? '14px 0 0' : 0 }}><MathText text={mech} /></p>}
          {vAfterMech.map((v: any, i: number) => <VisualBlock key={i} v={v} />)}
          {!worked && vAfterWorkedRaw.map((v: any, i: number) => <VisualBlock key={`w${i}`} v={v} />)}
        </Section>
      )}
      {code?.applicable && code?.content && (
        <Section n={++n} title={`Code${code.language_or_system ? ` — ${code.language_or_system}` : ''}`}>
          <CodeBlock code={code.content} language={code.language_or_system} />
          {code.explanation && <p style={{ margin: '12px 0 0' }}><MathText text={code.explanation} /></p>}
          {hasGrid && (
            <div style={{ marginTop: 12 }}>
              <DataTable columns={['Best case', 'Average case', 'Worst case', 'Space']}
                rows={[[grid.best_case_time, grid.average_case_time, grid.worst_case_time, grid.space_complexity]]} />
              {grid.justification && grid.justification !== 'N/A' && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: W.text3 }}>{grid.justification}</p>}
            </div>
          )}
        </Section>
      )}
      {hasTrace && (
        <Section n={++n} title="Execution trace & edge cases">
          {trace.dry_run_trace && (
            <pre style={{
              background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 8, padding: '12px 16px',
              overflow: 'auto', fontSize: 12.5, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', fontFamily: MONO, color: W.text,
            }}>{trace.dry_run_trace}</pre>
          )}
          {(trace.edge_case_matrix?.length ?? 0) > 0 && (
            <div style={{ marginTop: trace.dry_run_trace ? 12 : 0 }}>
              <DataTable columns={['Edge input', 'Expected behavior']}
                rows={trace.edge_case_matrix.map((e: any) => [e.edge_input, e.expected_behavior])} />
            </div>
          )}
          {(trace.visuals ?? []).map((v: any, i: number) => <VisualBlock key={i} v={v} />)}
        </Section>
      )}
      {worked && (
        <Section n={++n} title="Worked example">
          <p style={{ margin: 0 }}><MathText text={worked} /></p>
          {vAfterWorkedRaw.map((v: any, i: number) => <VisualBlock key={i} v={v} />)}
        </Section>
      )}
      {(advantages.length > 0 || disadvantages.length > 0) && (
        <Section n={++n} title="Advantages & trade-offs">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {advantages.length > 0 && (
              <div style={{ border: `1px solid ${W.border}`, borderLeft: '3px solid var(--status-green)', borderRadius: 8, padding: '12px 16px', background: W.card }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.greenFg, marginBottom: 6 }}>Advantages</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                  {advantages.map((a: any, i: number) => <li key={i} style={{ marginBottom: 4 }}>{typeof a === 'string' ? a : JSON.stringify(a)}</li>)}
                </ul>
              </div>
            )}
            {disadvantages.length > 0 && (
              <div style={{ border: `1px solid ${W.border}`, borderLeft: `3px solid ${W.orangeFg}`, borderRadius: 8, padding: '12px 16px', background: W.card }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.orangeFg, marginBottom: 6 }}>Trade-offs</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                  {disadvantages.map((d: any, i: number) => <li key={i} style={{ marginBottom: 4 }}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}
      {hasApplications && (
        <Section n={++n} title="Real-world applications">
          {Array.isArray(applications)
            ? <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>{applications.map((a: any, i: number) => <li key={i} style={{ marginBottom: 6 }}>{typeof a === 'string' ? a : a?.text ?? JSON.stringify(a)}</li>)}</ul>
            : <p style={{ margin: 0 }}>{applications}</p>}
        </Section>
      )}
      {hasAnalysis && (
        <Section n={++n} title="Analysis">
          {analysis.discussion && <p style={{ margin: 0 }}><MathText text={analysis.discussion} /></p>}
          {analysis.complexity_note && analysis.complexity_note !== 'N/A' && (
            <p style={{ margin: analysis.discussion ? '10px 0 0' : 0, fontSize: 13, color: W.text3 }}><MathText text={analysis.complexity_note} /></p>
          )}
        </Section>
      )}
      {hasComparison && (
        <Section n={++n} title={`Comparison${comparison.compared_against ? ` — vs ${comparison.compared_against}` : ''}`}>
          <DataTable columns={['Parameter', 'This concept', comparison.compared_against ?? 'Alternative']}
            rows={compRows.map((r: any) => [r.parameter, r.option_a, r.option_b])} />
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
          {formulas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
              {formulas.map((f: any, i: number) => {
                const s = typeof f === 'string' ? f : JSON.stringify(f);
                return /\$/.test(s)
                  ? <div key={i} style={{ fontSize: 14, background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 6, padding: '8px 12px', color: W.text }}><MathText text={s} /></div>
                  : <code key={i} style={{ fontFamily: MONO, fontSize: 13, background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 6, padding: '6px 10px', display: 'block', color: W.text }}>{s}</code>;
              })}
            </div>
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
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text }}><MathText text={p.prompt} /></div>
                  {p.answer_explanation && (
                    <Reveal label="Show answer">
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}><MathText text={p.answer_explanation} /></div>
                    </Reveal>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
      {glossaryTerms.length > 0 && (
        <Section n={++n} title="Glossary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {glossaryTerms.map((t: any, i: number) => (
              <div key={i} style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: W.text }}>{t.term}</span>
                {t.formal_definition && <> — <MathText text={t.formal_definition} /></>}
                {t.simple_explanation && <div style={{ fontSize: 12.5, color: W.text3, marginTop: 2 }}>In plain terms: {t.simple_explanation}</div>}
                {(t.related_terms?.length ?? 0) > 0 && <div style={{ fontSize: 12, color: W.text3, marginTop: 2 }}>Related: {t.related_terms.join(', ')}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {hasPractice && (
        <Section n={++n} title="Practice questions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {practiceGroups.map(([label, variant, qs]) => qs.map((q: any, i: number) => (
              <div key={`${label}${i}`} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 18px', background: W.card }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  <Badge variant={variant}>{label}</Badge>
                  {q.bloom_level && <Badge variant="muted">{q.bloom_level}</Badge>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5 }}><MathText text={q.question} /></div>
                {q.answer_explanation && (
                  <Reveal label="Show answer">
                    <div style={{ fontSize: 13, lineHeight: 1.65, color: W.text2 }}><MathText text={q.answer_explanation} /></div>
                  </Reveal>
                )}
              </div>
            )))}
          </div>
        </Section>
      )}
      {hasRelated && (
        <Section n={++n} title="Related topics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, lineHeight: 1.65 }}>
            {related.previous_connection && <div><span style={{ fontWeight: 600, color: W.text }}>Builds on:</span> {related.previous_subtopic ? `${related.previous_subtopic} — ` : ''}{related.previous_connection}</div>}
            {related.next_connection && <div><span style={{ fontWeight: 600, color: W.text }}>Leads to:</span> {related.next_subtopic ? `${related.next_subtopic} — ` : ''}{related.next_connection}</div>}
            {(related.builds_toward?.length ?? 0) > 0 && <div><span style={{ fontWeight: 600, color: W.text }}>Builds toward:</span> {related.builds_toward.join(', ')}</div>}
            {related.industry_relevance && <div><span style={{ fontWeight: 600, color: W.text }}>In industry:</span> {related.industry_relevance}</div>}
          </div>
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
                  <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5, flex: 1 }}><MathText text={q.question} /></div>
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
                        <span><MathText text={o} /></span>
                        {correct && <span style={{ fontSize: 11, marginLeft: 'auto', flexShrink: 0 }}>✓ correct</span>}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && <div style={{ marginLeft: 28, marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: W.text3 }}><MathText text={q.explanation} /></div>}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5, marginBottom: 6 }}><MathText text={q.question} /></div>
                {q.model_answer && (
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: W.text2 }}>
                    <span style={{ fontWeight: 600, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, display: 'block', marginBottom: 4 }}>Model answer</span>
                    <MathText text={q.model_answer} />
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
  const [regenning, setRegenning] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const approve = async (advance: boolean) => {
    if (!job || !conceptId) return;
    setApproving(true);
    try {
      await generationApi.approveConcept(job.id, conceptId, type);
      setJob(await generationApi.getTopicJob(topicId!));
      if (advance && next) goto(next.concept_id);
    } catch { /* */ }
    finally { setApproving(false); }
  };

  const download = async () => {
    if (!job || !conceptId) return;
    setExporting(true);
    try {
      const ext = type === 'slides' ? 'pptx' : 'docx';
      const base = (concept?.concept_name ?? conceptId).replace(/\s+/g, '_');
      await generationApi.exportConcept(job.id, conceptId, type, `${base}_${meta.segment}.${ext}`);
    } catch { /* */ }
    finally { setExporting(false); }
  };

  // Re-kick generation without a round trip through the studio; the status
  // flips to 'generating', which restarts the poll and clears the article.
  const regenerate = async () => {
    if (!job || !conceptId) return;
    setRegenning(true);
    try {
      await generationApi.genConcept(job.id, conceptId, type);
      setJob(await generationApi.getTopicJob(topicId!));
    } catch { /* */ }
    finally { setRegenning(false); }
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  {content && (
                    <Btn sm variant="ghost" onClick={download} disabled={exporting}>
                      {exporting ? 'Exporting…' : type === 'slides' ? 'Download .pptx' : 'Download .docx'}
                    </Btn>
                  )}
                  {(nState?.status === 'ready' || nState?.status === 'error') && (
                    <Btn sm variant="ghost" onClick={regenerate} disabled={regenning || approving}>
                      {regenning ? 'Restarting…' : 'Regenerate'}
                    </Btn>
                  )}
                  {nState?.status === 'ready' && !approved && (
                    <>
                      {next && <Btn sm onClick={() => approve(false)} disabled={approving || regenning}>Approve</Btn>}
                      <Btn variant="primary" sm onClick={() => approve(!!next)} disabled={approving || regenning}>
                        <span style={{ width: 13, height: 13, display: 'inline-flex' }}><ICheck /></span>
                        {approving ? 'Approving…' : next ? 'Approve & next' : 'Approve'}
                      </Btn>
                    </>
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
              {/* concept switcher for small screens — the contents rail is lg-only */}
              {concepts.length > 0 && (
                <div className="lg:hidden" style={{ marginTop: 12 }}>
                  <select value={conceptId ?? ''} onChange={e => goto(e.target.value)} style={{
                    width: '100%', padding: '8px 12px', borderRadius: 7, border: `1px solid ${W.borderStrong}`,
                    background: W.card, color: W.text, fontFamily: W.fontSans, fontSize: 13.5,
                  }}>
                    {concepts.map((c, i) => (
                      <option key={c.concept_id} value={c.concept_id}>{i + 1}. {c.concept_name}</option>
                    ))}
                  </select>
                </div>
              )}
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
