// LMS-style reader for per-concept generations (Student Notes, Slides, Quiz).
// Routes: /winteach/courses/:id/topic/:topicId/{notes|slides|quiz}/:conceptId
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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

// Per-section visual identity: icon + tint, matched by title prefix.
const SECTION_META: [RegExp, { icon: string; bg: string; fg: string }][] = [
  [/^why this matters/i, { icon: '🎯', bg: 'var(--tint-brand-bg)', fg: 'var(--tint-brand-fg)' }],
  [/^learning outcomes/i, { icon: '🧭', bg: 'var(--tint-blue-bg)', fg: 'var(--tint-blue-fg)' }],
  [/^definition/i, { icon: '📖', bg: 'var(--tint-brand-bg)', fg: 'var(--tint-brand-fg)' }],
  [/^architecture/i, { icon: '⚙️', bg: 'var(--tint-blue-bg)', fg: 'var(--tint-blue-fg)' }],
  [/^code/i, { icon: '💻', bg: '#0f1117', fg: '#e2e6f0' }],
  [/^execution trace/i, { icon: '🔬', bg: 'var(--tint-violet-bg)', fg: 'var(--tint-violet-fg)' }],
  [/^worked example/i, { icon: '✏️', bg: W.greenBg, fg: W.greenFg }],
  [/^advantages/i, { icon: '⚖️', bg: 'var(--tint-orange-bg)', fg: 'var(--tint-orange-fg)' }],
  [/^real-world/i, { icon: '🌍', bg: 'var(--tint-teal-bg)', fg: 'var(--tint-teal-fg)' }],
  [/^analysis/i, { icon: '📈', bg: 'var(--tint-blue-bg)', fg: 'var(--tint-blue-fg)' }],
  [/^comparison/i, { icon: '🔀', bg: 'var(--tint-violet-bg)', fg: 'var(--tint-violet-fg)' }],
  [/^common mistakes/i, { icon: '⚠️', bg: 'var(--tint-orange-bg)', fg: 'var(--tint-orange-fg)' }],
  [/^summary/i, { icon: '📌', bg: 'var(--tint-brand-bg)', fg: 'var(--tint-brand-fg)' }],
  [/^flashcards/i, { icon: '🗂️', bg: 'var(--tint-violet-bg)', fg: 'var(--tint-violet-fg)' }],
  [/^glossary/i, { icon: '📚', bg: 'var(--tint-teal-bg)', fg: 'var(--tint-teal-fg)' }],
  [/^(practice questions|multiple choice|short answer)/i, { icon: '📝', bg: W.greenBg, fg: W.greenFg }],
  [/^related topics/i, { icon: '🔗', bg: W.surfaceMuted, fg: W.text2 }],
];

function sectionMeta(title: string) {
  return SECTION_META.find(([re]) => re.test(title))?.[1];
}

function Section({ n, title, children }: { n?: number; title: string; children: React.ReactNode }) {
  const meta = sectionMeta(title);
  return (
    <section style={{
      marginBottom: 40,
      paddingTop: n != null && n > 1 ? 26 : 0,
      borderTop: n != null && n > 1 ? `1px solid ${W.border}` : 'none',
    }}>
      <h2 data-nav={title} style={{
        display: 'flex', alignItems: 'center', gap: 11,
        fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 17.5, color: W.text,
        letterSpacing: '-0.015em', margin: '0 0 14px',
      }}>
        {meta && (
          <span aria-hidden style={{
            width: 28, height: 28, borderRadius: 8, background: meta.bg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>{meta.icon}</span>
        )}
        {title}
        {n != null && <span style={{ marginLeft: 'auto', fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</span>}
      </h2>
      <div style={{ fontSize: 15.5, lineHeight: 1.8, color: W.text2 }}>{children}</div>
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

// ── rich prose: paragraphs + inline **bold** / *italic* / `code` / $math$ ────
// The notes prompts ask for short paragraphs separated by blank lines with
// light inline markdown; this renders that without a full markdown dependency.
const INLINE_RE = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*\n]+?\*\*|`[^`\n]+?`|\*[^*\n]+?\*)/g;

function useKatex(needed: boolean) {
  const [k, setK] = useState<any | null>(null);
  useEffect(() => {
    if (!needed || k) return;
    let alive = true;
    loadKatex().then(kx => { if (alive) setK(kx); }).catch(() => {});
    return () => { alive = false; };
  }, [needed, k]);
  return k;
}

function renderInline(text: string, katex: any | null, keyBase: string): React.ReactNode[] {
  return text.split(INLINE_RE).map((seg, i) => {
    if (!seg) return null;
    const key = `${keyBase}-${i}`;
    if (seg.startsWith('$$') && seg.endsWith('$$') && seg.length > 4) {
      if (!katex) return <span key={key}>{seg}</span>;
      try { return <span key={key} dangerouslySetInnerHTML={{ __html: katex.renderToString(seg.slice(2, -2), { displayMode: true, throwOnError: true }) }} />; }
      catch { return <span key={key}>{seg}</span>; }
    }
    if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
      if (!katex) return <span key={key}>{seg}</span>;
      try { return <span key={key} dangerouslySetInnerHTML={{ __html: katex.renderToString(seg.slice(1, -1), { throwOnError: true }) }} />; }
      catch { return <span key={key}>{seg}</span>; }
    }
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      return <strong key={key} style={{ color: W.text, fontWeight: 600 }}>{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      return <code key={key} style={{ fontFamily: MONO, fontSize: '0.88em', background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 4, padding: '1px 5px' }}>{seg.slice(1, -1)}</code>;
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) {
      return <em key={key}>{seg.slice(1, -1)}</em>;
    }
    return <span key={key}>{seg}</span>;
  });
}

// Typed callouts — paragraphs starting "> Tip:", "> Warning:", etc. render as
// colored aside cards (the notes prompt asks for 1–3 per subtopic).
const CALLOUT_STYLES: Record<string, { label: string; fg: string; bg: string; border: string }> = {
  'tip': { label: 'Tip', fg: W.greenFg, bg: W.greenBg, border: 'var(--status-green)' },
  'warning': { label: 'Warning', fg: W.orangeFg, bg: 'color-mix(in oklab, var(--status-orange) 10%, var(--card))', border: 'var(--status-orange)' },
  'key idea': { label: 'Key idea', fg: 'var(--tint-brand-fg)', bg: 'var(--tint-brand-bg)', border: 'var(--brand)' },
  'recall': { label: 'Recall', fg: 'var(--tint-blue-fg)', bg: 'var(--tint-blue-bg)', border: 'var(--tint-blue-fg)' },
  'exam tip': { label: 'Exam tip', fg: 'var(--tint-violet-fg)', bg: 'var(--tint-violet-bg)', border: 'var(--tint-violet-fg)' },
  'note': { label: 'Note', fg: W.text2, bg: W.surfaceMuted, border: W.borderStrong },
};
const CALLOUT_RE = /^>\s*(tip|warning|key idea|recall|exam tip|note)\s*[:—-]\s*/i;

// Block prose: splits on blank lines into paragraphs. `inline` renders a single
// run (for bullets, titles, one-liners).
function RichText({ text, inline }: { text: any; inline?: boolean }) {
  const str = typeof text === 'string' ? text : text == null ? '' : String(text);
  const katex = useKatex(/\$[^$]/.test(str));
  if (!str) return null;
  if (inline) return <>{renderInline(str, katex, 'i')}</>;
  const paras = str.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paras.map((p, i) => {
        const t = p.trim();
        const m = t.match(CALLOUT_RE);
        if (m || t.startsWith('>')) {
          const kind = (m?.[1] ?? 'note').toLowerCase();
          const cs = CALLOUT_STYLES[kind] ?? CALLOUT_STYLES['note'];
          const body = m ? t.slice(m[0].length) : t.replace(/^>\s*/, '');
          return (
            <div key={i} style={{ margin: i === 0 ? 0 : '12px 0 0', borderLeft: `3px solid ${cs.border}`, background: cs.bg, borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 10.5, letterSpacing: '.07em', textTransform: 'uppercase', color: cs.fg, display: 'block', marginBottom: 3 }}>{cs.label}</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.6 }}>{renderInline(body, katex, `c${i}`)}</span>
            </div>
          );
        }
        return (
          <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>{renderInline(t, katex, `p${i}`)}</p>
        );
      })}
    </>
  );
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

// ── interactive study artifacts ──────────────────────────────────────────────

const stepBtn: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 6, border: `1px solid ${W.borderStrong}`,
  background: 'var(--brand)', color: '#fff', fontFamily: W.fontDisplay,
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const stepGhostBtn: React.CSSProperties = {
  ...stepBtn, background: 'transparent', color: W.text2, border: `1px solid ${W.border}`,
};

// Long worked examples reveal one step at a time — predict, then advance.
function SteppedParagraphs({ text }: { text: any }) {
  const str = typeof text === 'string' ? text : text == null ? '' : String(text);
  const paras = str.split(/\n\s*\n/).filter(p => p.trim());
  const [shown, setShown] = useState(1);
  useEffect(() => { setShown(1); }, [str]);
  if (paras.length < 3) return <RichText text={str} />;
  const done = shown >= paras.length;
  return (
    <>
      <RichText text={paras.slice(0, shown).join('\n\n')} />
      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={stepBtn} onClick={() => setShown(s => s + 1)}>Next step ({shown}/{paras.length})</button>
          <button style={stepGhostBtn} onClick={() => setShown(paras.length)}>Show all</button>
        </div>
      )}
    </>
  );
}

// Dry-run traces reveal line by line inside the mono block.
function SteppedTrace({ text }: { text: string }) {
  const lines = (text ?? '').split('\n');
  const [shown, setShown] = useState(2);
  useEffect(() => { setShown(2); }, [text]);
  const pre = (body: string) => (
    <pre style={{
      background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 8, padding: '12px 16px',
      overflow: 'auto', fontSize: 12.5, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', fontFamily: MONO, color: W.text,
    }}>{body}</pre>
  );
  if (lines.length < 5) return pre(text);
  const done = shown >= lines.length;
  return (
    <>
      {pre(lines.slice(0, shown).join('\n'))}
      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={stepBtn} onClick={() => setShown(s => Math.min(s + 1, lines.length))}>What happens next? ({shown}/{lines.length})</button>
          <button style={stepGhostBtn} onClick={() => setShown(lines.length)}>Show full trace</button>
        </div>
      )}
    </>
  );
}

// Execution-trace tables reveal row by row.
function SteppedRows({ columns, rows }: { columns: string[]; rows: any[][] }) {
  const [shown, setShown] = useState(1);
  useEffect(() => { setShown(1); }, [rows]);
  const done = shown >= rows.length;
  return (
    <>
      <DataTable columns={columns} rows={rows.slice(0, shown)} />
      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={stepBtn} onClick={() => setShown(s => s + 1)}>Next row ({shown}/{rows.length})</button>
          <button style={stepGhostBtn} onClick={() => setShown(rows.length)}>Show all rows</button>
        </div>
      )}
    </>
  );
}

// A real quiz: pick an option, then get feedback — answers are never pre-shown.
function QuizMCQ({ q, i }: { q: any; i: number }) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => { setPicked(null); }, [q]);
  const correct = picked != null && picked === q.answer_index;
  return (
    <div style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 18px', background: W.card }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: W.text3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>Q{i + 1}</span>
        <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5, flex: 1 }}><MathText text={q.question} /></div>
        {q.bloom_level && <Badge variant="muted">{q.bloom_level}</Badge>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 28 }}>
        {(q.options ?? []).map((o: string, oi: number) => {
          const isAnswer = oi === q.answer_index;
          const isPicked = oi === picked;
          const answered = picked != null;
          const bg = !answered ? 'transparent'
            : isAnswer ? 'color-mix(in oklab, var(--status-green) 10%, transparent)'
              : isPicked ? 'color-mix(in oklab, var(--status-red) 8%, transparent)' : 'transparent';
          const color = !answered ? W.text2 : isAnswer ? W.greenFg : isPicked ? W.redFg : W.text3;
          return (
            <button key={oi} disabled={answered} onClick={() => setPicked(oi)} style={{
              display: 'flex', gap: 8, alignItems: 'baseline', padding: '6px 10px', borderRadius: 7,
              fontSize: 13.5, lineHeight: 1.5, textAlign: 'left', width: '100%',
              border: `1px solid ${!answered ? W.border : 'transparent'}`,
              background: bg, color, fontWeight: answered && (isAnswer || isPicked) ? 600 : 400,
              cursor: answered ? 'default' : 'pointer', fontFamily: W.fontSans,
            }}>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{LETTERS[oi] ?? oi + 1}.</span>
              <span style={{ flex: 1 }}><MathText text={o} /></span>
              {answered && isAnswer && <span style={{ fontSize: 11, flexShrink: 0 }}>✓</span>}
              {answered && isPicked && !isAnswer && <span style={{ fontSize: 11, flexShrink: 0 }}>✗</span>}
            </button>
          );
        })}
      </div>
      {picked != null && (
        <div style={{ marginLeft: 28, marginTop: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: W.fontDisplay, color: correct ? W.greenFg : W.redFg }}>
            {correct ? 'Correct!' : `Not quite — the answer is ${LETTERS[q.answer_index] ?? '?'}.`}
          </div>
          {q.explanation && <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.6, color: W.text2 }}><MathText text={q.explanation} /></div>}
        </div>
      )}
    </div>
  );
}

// Flashcards built from the glossary, key definitions, and recall prompts.
function buildFlashcards(content: any): { front: string; back: string }[] {
  const cs = content?.closing?.sections ?? {};
  const cards: { front: string; back: string }[] = [];
  for (const t of cs.glossary_section?.terms ?? []) {
    if (t?.term) cards.push({ front: t.term, back: t.simple_explanation || t.formal_definition || '' });
  }
  for (const d of cs.revision_section?.important_definitions ?? []) {
    if (d?.term) cards.push({ front: d.term, back: d.definition || '' });
  }
  for (const p of cs.revision_section?.active_recall_prompts ?? []) {
    if (p?.prompt) cards.push({ front: p.prompt, back: p.answer_explanation || '' });
  }
  return cards.filter(c => c.back);
}

// Inline flashcard deck — lives in the article body as its own section.
function FlashcardDeck({ cards }: { cards: { front: string; back: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setIdx(0); setFlipped(false); }, [cards.length]);
  if (!cards.length) return null;
  const card = cards[Math.min(idx, cards.length - 1)];
  const go = (d: number) => { setIdx(i => Math.max(0, Math.min(cards.length - 1, i + d))); setFlipped(false); };
  return (
    <div style={{ maxWidth: 560 }}>
      <div onClick={() => setFlipped(f => !f)} style={{
        minHeight: 170, border: `1.5px solid ${flipped ? 'var(--brand)' : W.borderStrong}`, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 28px',
        cursor: 'pointer', background: flipped ? 'var(--tint-brand-bg)' : 'var(--card)', textAlign: 'center',
        boxShadow: W.shadowCard, transition: 'background .15s, border-color .15s',
      }}>
        {flipped
          ? <div style={{ fontSize: 14, lineHeight: 1.65, color: W.text }}><RichText inline text={card.back} /></div>
          : <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18, lineHeight: 1.4, color: W.text }}><RichText inline text={card.front} /></div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Btn sm onClick={() => go(-1)} disabled={idx === 0}>← Previous</Btn>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: W.text3, fontVariantNumeric: 'tabular-nums' }}>
          {idx + 1} / {cards.length} · click the card to flip
        </span>
        <Btn sm variant="primary" onClick={() => (flipped && idx < cards.length - 1 ? go(1) : setFlipped(f => !f))}>
          {flipped ? (idx < cards.length - 1 ? 'Next card →' : 'Flip back') : 'Flip'}
        </Btn>
      </div>
    </div>
  );
}

// Thin reading-progress bar pinned to the top of the article surface.
function ReadProgress({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = targetRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const done = Math.min(Math.max(-rect.top + 80, 0), Math.max(total, 1));
        setP(total > 60 ? done / total : 0);
      });
    };
    onScroll();
    // Capture phase: the page scrolls inside the layout's <main overflow-y-auto>,
    // not the window, so bubble-phase window scroll events never fire.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => { window.removeEventListener('scroll', onScroll, { capture: true } as any); cancelAnimationFrame(raf); };
  }, [targetRef]);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 7, height: 3, marginBottom: -3 }}>
      <div style={{ height: '100%', width: `${Math.min(p, 1) * 100}%`, background: 'var(--brand)', borderRadius: '0 2px 2px 0', transition: 'width .08s linear' }} />
    </div>
  );
}

// Sticky mini-TOC with scroll-spy: sections check off as you read past them.
function SectionNav({ bodyRef, depsKey, extra }: { bodyRef: React.RefObject<HTMLDivElement | null>; depsKey: string; extra?: React.ReactNode }) {
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const hs = Array.from(root.querySelectorAll('section > h2')) as HTMLElement[];
    hs.forEach((h, i) => { h.id = h.id || `wt-sec-${i}`; h.style.scrollMarginTop = '96px'; });
    setSections(hs.map(h => ({ id: h.id, title: h.dataset.nav || (h.textContent || '').replace(/^\d+\s*/, '') })));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let idx = 0;
        hs.forEach((h, i) => { if (h.getBoundingClientRect().top < 150) idx = i; });
        setActive(idx);
      });
    };
    onScroll();
    // Capture phase — the scroll container is the layout's <main>, not window.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => { window.removeEventListener('scroll', onScroll, { capture: true } as any); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);
  if (sections.length < 3) {
    return extra ? <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>{extra}</div> : null;
  }
  return (
    <div style={{
      position: 'sticky', top: 10, zIndex: 5, display: 'flex', alignItems: 'center', gap: 6,
      overflowX: 'auto', padding: '8px 10px', marginBottom: 18,
      background: 'color-mix(in oklab, var(--card) 90%, transparent)', backdropFilter: 'blur(8px)',
      border: `1px solid ${W.border}`, borderRadius: 10,
    }}>
      {sections.map((s, i) => {
        const read = i < active;
        const current = i === active;
        return (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{
            flexShrink: 0, padding: '3px 10px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: current ? 'var(--tint-brand-bg)' : 'transparent',
            color: current ? 'var(--tint-brand-fg)' : read ? W.text3 : W.text2,
            fontFamily: W.fontDisplay, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {read ? '✓ ' : ''}{s.title}
          </button>
        );
      })}
      {extra && <div style={{ marginLeft: 'auto', flexShrink: 0, paddingLeft: 8 }}>{extra}</div>}
    </div>
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
          ? (String(v.type ?? '').includes('execution_trace') && v.rows.length >= 4
            ? <SteppedRows columns={v.columns ?? []} rows={v.rows} />
            : <DataTable columns={v.columns ?? []} rows={v.rows} />)
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
  const pause: any[] = core?.deep_dive?.pause_and_think ?? [];
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
  const flashcards = buildFlashcards(content);
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
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {(() => {
              const diff = parseInt(String(metaInfo.difficulty ?? ''), 10);
              return Number.isFinite(diff) && diff > 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: W.surfaceMuted, border: `1px solid ${W.border}`, fontSize: 11.5, color: W.text2 }}>
                  Difficulty
                  <span style={{ display: 'inline-flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i <= diff ? 'var(--brand)' : 'var(--score-track)' }} />
                    ))}
                  </span>
                </span>
              ) : null;
            })()}
            {metaInfo.reading_time_minutes != null && (
              <span style={{ padding: '4px 12px', borderRadius: 99, background: W.surfaceMuted, border: `1px solid ${W.border}`, fontSize: 11.5, color: W.text2 }}>⏱ ~{metaInfo.reading_time_minutes} min read</span>
            )}
            {metaInfo.placement_relevance && (
              <span style={{ padding: '4px 12px', borderRadius: 99, background: 'var(--tint-teal-bg)', color: 'var(--tint-teal-fg)', fontSize: 11.5, fontWeight: 600 }}>Placement: {metaInfo.placement_relevance}</span>
            )}
            {metaInfo.university_importance && (
              <span style={{ padding: '4px 12px', borderRadius: 99, background: 'var(--tint-violet-bg)', color: 'var(--tint-violet-fg)', fontSize: 11.5, fontWeight: 600 }}>Exam: {metaInfo.university_importance}</span>
            )}
          </div>
          {(metaInfo.placement_justification || metaInfo.university_justification) && (
            <div style={{ fontSize: 12, color: W.text3, marginTop: 6, lineHeight: 1.5 }}>
              {[metaInfo.placement_justification, metaInfo.university_justification].filter(Boolean).join(' ')}
            </div>
          )}
        </div>
      )}
      {(scenario || intro || hasConnectivity) && (
        <Section n={++n} title="Why this matters">
          {scenario && <div style={{ fontSize: 16, color: W.text, lineHeight: 1.75 }}><RichText text={scenario} /></div>}
          {gap && <div style={{ marginTop: scenario ? 10 : 0, fontWeight: 600, color: W.text }}><RichText text={gap} /></div>}
          {intro && <div style={{ marginTop: scenario || gap ? 10 : 0 }}><RichText text={intro} /></div>}
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
          <div style={{
            borderLeft: '4px solid var(--brand)', borderRadius: '0 10px 10px 0',
            background: 'color-mix(in oklab, var(--tint-brand-bg) 55%, var(--card))',
            padding: '16px 20px', fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 16.5, lineHeight: 1.7, color: W.text,
          }}><RichText text={def} /></div>
          {intuition && <div style={{ marginTop: 14 }}><RichText text={intuition} /></div>}
        </Section>
      )}
      {(mech || archVisuals.length > 0) && (
        <Section n={++n} title="Architecture & mechanism">
          {vBefore.map((v: any, i: number) => <VisualBlock key={`b${i}`} v={v} />)}
          {mech && <div style={{ marginTop: vBefore.length ? 14 : 0 }}><RichText text={mech} /></div>}
          {vAfterMech.map((v: any, i: number) => <VisualBlock key={i} v={v} />)}
          {!worked && vAfterWorkedRaw.map((v: any, i: number) => <VisualBlock key={`w${i}`} v={v} />)}
        </Section>
      )}
      {code?.applicable && code?.content && (
        <Section n={++n} title={`Code${code.language_or_system ? ` — ${code.language_or_system}` : ''}`}>
          <CodeBlock code={code.content} language={code.language_or_system} />
          {code.explanation && <div style={{ marginTop: 12 }}><RichText text={code.explanation} /></div>}
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
          {trace.dry_run_trace && <SteppedTrace text={trace.dry_run_trace} />}
          {(trace.edge_case_matrix?.length ?? 0) > 0 && (
            <div style={{ marginTop: trace.dry_run_trace ? 12 : 0 }}>
              <DataTable columns={['Edge input', 'Expected behavior']}
                rows={trace.edge_case_matrix.map((e: any) => [e.edge_input, e.expected_behavior])} />
            </div>
          )}
          {(trace.visuals ?? []).map((v: any, i: number) => <VisualBlock key={i} v={v} />)}
        </Section>
      )}
      {pause.length > 0 && (
        <div style={{ margin: '0 0 32px', border: `1px solid ${W.border}`, borderLeft: '3px solid var(--brand)', borderRadius: 8, padding: '14px 18px', background: 'color-mix(in oklab, var(--tint-brand-bg) 40%, var(--card))' }}>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11.5, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--tint-brand-fg)', marginBottom: 10 }}>Pause & think</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pause.map((p: any, i: number) => (
              <div key={i}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text, lineHeight: 1.5 }}><RichText inline text={p.question} /></div>
                {p.answer && (
                  <Reveal label="Show answer">
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: W.text2 }}><RichText inline text={p.answer} /></div>
                  </Reveal>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {worked && (
        <Section n={++n} title="Worked example">
          <div><SteppedParagraphs text={worked} /></div>
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
          {analysis.discussion && <div><RichText text={analysis.discussion} /></div>}
          {analysis.complexity_note && analysis.complexity_note !== 'N/A' && (
            <div style={{ marginTop: analysis.discussion ? 10 : 0, fontSize: 13, color: W.text3 }}><RichText text={analysis.complexity_note} /></div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mistakes.map((m: any, i: number) => {
              const wrong = m.wrong_way ?? m.mistake;
              const why = m.why_it_fails ?? m.why_it_happens;
              const right = m.right_way ?? m.correct_approach;
              return (
                <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 10, padding: '11px 16px', background: W.redBg }}>
                    <span style={{ color: W.redFg, fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <div>
                      {wrong && <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text, lineHeight: 1.5 }}><RichText inline text={wrong} /></div>}
                      {why && <div style={{ fontSize: 12.5, color: W.text2, marginTop: 2, lineHeight: 1.55 }}><RichText inline text={why} /></div>}
                    </div>
                  </div>
                  {(right || m.why_it_works) && (
                    <div style={{ display: 'flex', gap: 10, padding: '11px 16px', background: W.greenBg }}>
                      <span style={{ color: W.greenFg, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <div>
                        {right && <div style={{ fontWeight: 600, fontSize: 13.5, color: W.text, lineHeight: 1.5 }}><RichText inline text={right} /></div>}
                        {m.why_it_works && <div style={{ fontSize: 12.5, color: W.text2, marginTop: 2, lineHeight: 1.55 }}><RichText inline text={m.why_it_works} /></div>}
                      </div>
                    </div>
                  )}
                  {m.exam_tip && (
                    <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'var(--tint-violet-fg)', background: 'var(--tint-violet-bg)' }}>
                      Exam tip: <RichText inline text={m.exam_tip} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}
      {hasRevision && (
        <Section n={++n} title="Summary & revision">
          {(revision.key_takeaways?.length ?? 0) > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {revision.key_takeaways.map((t: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, border: `1px solid ${W.border}`, borderRadius: 10, padding: '11px 16px', background: W.card }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 99, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11.5, fontWeight: 700, flexShrink: 0, fontFamily: W.fontDisplay, marginTop: 1,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: W.text, lineHeight: 1.6 }}><RichText inline text={t} /></span>
                </div>
              ))}
            </div>
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
      {flashcards.length > 0 && (
        <Section n={++n} title="Flashcards">
          <FlashcardDeck cards={flashcards} />
        </Section>
      )}
      {glossaryTerms.length > 0 && (
        <Section n={++n} title="Glossary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {glossaryTerms.map((t: any, i: number) => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '12px 16px', background: W.card }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 13.5, color: W.text, marginBottom: 4 }}>{t.term}</div>
                {t.formal_definition && <div style={{ fontSize: 12.5, lineHeight: 1.6, color: W.text2 }}><MathText text={t.formal_definition} /></div>}
                {t.simple_explanation && <div style={{ fontSize: 12, color: W.text3, marginTop: 5, lineHeight: 1.55 }}>In plain terms: {t.simple_explanation}</div>}
                {(t.related_terms?.length ?? 0) > 0 && <div style={{ fontSize: 11.5, color: 'var(--tint-brand-fg)', marginTop: 6 }}>{t.related_terms.join(' · ')}</div>}
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

// ── slides: deck renderer ────────────────────────────────────────────────────
// Each slide renders as a 16:9 surface with a layout-specific body (statement,
// bullets, code, visual, myth vs reality, recall). Older decks without layout/
// visual fields fall back to the bullets layout.

function SlideVisual({ v }: { v: any }) {
  if (!v) return null;
  const code = typeof v.mermaid_code === 'string' && v.mermaid_code.trim() ? v.mermaid_code.trim() : null;
  if (code) return <MermaidBlock code={code} />;
  if ((v.rows?.length ?? 0) > 0) return <DataTable columns={v.columns ?? []} rows={v.rows} />;
  return null;
}

function SlideBullets({ items, small, light }: { items: string[]; small?: boolean; light?: boolean }) {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: small ? 6 : 10 }}>
      {items.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{
            width: 6, height: 6, borderRadius: 2, flexShrink: 0, transform: 'translateY(-2px)',
            background: light ? 'rgba(255,255,255,.75)' : 'var(--brand)',
          }} />
          <span style={{ fontSize: small ? 12.5 : 15.5, lineHeight: 1.5, color: light ? 'rgba(255,255,255,.92)' : W.text2 }}>
            <RichText inline text={b} />
          </span>
        </div>
      ))}
    </div>
  );
}

// Per-role accent for the slide's top band + progress dot.
const ROLE_ACCENT: Record<string, string> = {
  hook: 'var(--brand)', definition: 'var(--brand)', core: 'var(--brand)',
  misconception: 'var(--status-orange)', recall: 'var(--status-green)',
  code: '#0f1117', trace: '#0f1117', proof: 'var(--tint-violet-fg)',
  diagram: 'var(--tint-blue-fg)', complexity: 'var(--tint-blue-fg)',
};

function SlideCard({ s, index, total }: { s: any; index: number; total: number }) {
  const bullets: string[] = (s.body_blocks ?? []).filter((b: any) => typeof b === 'string' && b.trim());
  const hasCode = !!s.code?.content;
  const hasVisual = !!(s.visual && (s.visual.mermaid_code || (s.visual.rows?.length ?? 0) > 0));
  const layout: string = s.layout
    ?? (s.myth || s.reality ? 'myth_reality' : hasCode ? 'code' : hasVisual ? 'visual' : bullets.length ? 'bullets' : 'statement');
  const half = Math.ceil(bullets.length / 2);

  const statement = layout === 'statement';
  const dark = layout === 'code' && hasCode;
  const light = statement || dark; // light text on colored/dark surfaces
  const accent = ROLE_ACCENT[s.role] ?? 'color-mix(in oklab, var(--brand) 45%, transparent)';
  const surface: React.CSSProperties = statement
    ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }
    : dark ? { background: '#0f1117' } : { background: 'var(--card)' };

  return (
    <div>
      <div style={{
        border: `1px solid ${light ? 'transparent' : W.borderStrong}`, borderRadius: 14,
        boxShadow: W.shadowCard, aspectRatio: '16 / 9', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', ...surface,
      }}>
        {!statement && <div style={{ height: 4, flexShrink: 0, background: accent }} />}

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '22px 34px 10px' }}>
          {s.kicker && (
            <div style={{ fontFamily: W.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.75)' : 'var(--brand)', marginBottom: 8 }}>
              {s.kicker}
            </div>
          )}

          {statement ? (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 27, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#fff', maxWidth: '90%' }}>
                <RichText inline text={s.title} />
              </div>
              {s.takeaway && <div style={{ marginTop: 14, fontSize: 14.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.55, maxWidth: '80%' }}><RichText inline text={s.takeaway} /></div>}
            </div>
          ) : (
            <>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 19.5, lineHeight: 1.3, letterSpacing: '-0.01em', color: dark ? '#e7e9f5' : W.text, marginBottom: 13 }}>
                <RichText inline text={s.title} />
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {layout === 'myth_reality' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, flex: 1 }}>
                    <div style={{ borderRadius: 10, padding: '13px 16px', background: W.redBg, borderTop: '3px solid var(--status-red)' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: W.redFg, marginBottom: 6 }}>✗ Myth</div>
                      {s.myth && <div style={{ fontSize: 13.5, fontWeight: 600, color: W.text, lineHeight: 1.45, marginBottom: 6 }}><RichText inline text={s.myth} /></div>}
                      <SlideBullets items={bullets.slice(0, half)} small />
                    </div>
                    <div style={{ borderRadius: 10, padding: '13px 16px', background: W.greenBg, borderTop: '3px solid var(--status-green)' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: W.greenFg, marginBottom: 6 }}>✓ Reality</div>
                      {s.reality && <div style={{ fontSize: 13.5, fontWeight: 600, color: W.text, lineHeight: 1.45, marginBottom: 6 }}><RichText inline text={s.reality} /></div>}
                      <SlideBullets items={bullets.slice(half)} small />
                    </div>
                  </div>
                ) : dark ? (
                  <>
                    <CodeBlock code={s.code.content} language={s.code.language} />
                    <SlideBullets items={bullets} small light />
                  </>
                ) : layout === 'visual' && hasVisual ? (
                  <>
                    <SlideVisual v={s.visual} />
                    <SlideBullets items={bullets} small />
                  </>
                ) : (
                  <SlideBullets items={bullets} />
                )}
                {s.takeaway && (
                  <div style={{ marginTop: 'auto', paddingTop: 8, flexShrink: 0, display: 'flex' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'baseline', gap: 7, padding: '6px 14px', borderRadius: 99,
                      background: dark ? 'rgba(255,255,255,.12)' : 'var(--tint-brand-bg)',
                      color: dark ? '#e7e9f5' : 'var(--tint-brand-fg)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.45,
                    }}>★ <RichText inline text={s.takeaway} /></span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* footer: role + progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 34px 13px', flexShrink: 0 }}>
          {s.role && (
            <span style={{ fontFamily: W.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.6)' : W.text3 }}>
              {s.role}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} style={{
                width: i === index ? 16 : 5, height: 5, borderRadius: 99, transition: 'width .2s',
                background: i === index
                  ? (light ? 'rgba(255,255,255,.9)' : 'var(--brand)')
                  : (light ? 'rgba(255,255,255,.35)' : 'var(--score-track)'),
              }} />
            ))}
            <span style={{ fontSize: 10.5, color: light ? 'rgba(255,255,255,.6)' : W.text3, fontVariantNumeric: 'tabular-nums', marginLeft: 6 }}>{index + 1}/{total}</span>
          </div>
        </div>
      </div>

      {s.speaker_notes && (
        <Reveal label="Speaker notes">
          <div style={{ fontSize: 12.5, lineHeight: 1.65, color: W.text2, padding: '10px 14px', background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 8 }}>
            <RichText text={s.speaker_notes} />
          </div>
        </Reveal>
      )}
    </div>
  );
}

// Fullscreen presentation overlay — ←/→/Space to navigate, Esc to exit.
function SlideShow({ slides, onClose }: { slides: any[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const go = useCallback((d: number) => setIdx(i => Math.max(0, Math.min(slides.length - 1, i + d))), [slides.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);
  const navBtn: React.CSSProperties = {
    width: 38, height: 38, borderRadius: 99, border: '1px solid rgba(255,255,255,.25)',
    background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 17, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(9,11,20,.93)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px',
    }}>
      <div style={{ width: 'min(1080px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <SlideCard s={slides[idx]} index={idx} total={slides.length} />
      </div>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
        <button style={{ ...navBtn, opacity: idx === 0 ? 0.35 : 1 }} disabled={idx === 0} onClick={() => go(-1)}>‹</button>
        <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, fontVariantNumeric: 'tabular-nums', fontFamily: W.fontDisplay, fontWeight: 600 }}>
          {idx + 1} / {slides.length}
        </span>
        <button style={{ ...navBtn, opacity: idx === slides.length - 1 ? 0.35 : 1 }} disabled={idx === slides.length - 1} onClick={() => go(1)}>›</button>
        <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, marginLeft: 10 }}>← → to navigate · Esc to exit</span>
        <button onClick={onClose} style={{ ...navBtn, width: 'auto', padding: '0 16px', fontSize: 12.5, fontFamily: W.fontDisplay, fontWeight: 600 }}>Exit</button>
      </div>
    </div>,
    document.body,
  );
}

function SlidesArticle({ content }: { content: any }) {
  const slides: any[] = content?.slides ?? [];
  const [presenting, setPresenting] = useState(false);
  if (!slides.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12.5, color: W.text3 }}>{slides.length} slides</span>
        <div style={{ marginLeft: 'auto' }}>
          <Btn sm variant="primary" onClick={() => setPresenting(true)}>▶ Present</Btn>
        </div>
      </div>
      {slides.map((s: any, i: number) => <SlideCard key={i} s={s} index={i} total={slides.length} />)}
      {presenting && <SlideShow slides={slides} onClose={() => setPresenting(false)} />}
    </div>
  );
}

function QuizArticle({ content }: { content: any }) {
  const mcq: any[] = content?.mcq ?? [];
  const sa: any[] = content?.short_answer ?? [];
  if (!mcq.length && !sa.length) return null;
  let n = 0;
  return (
    <>
      {mcq.length > 0 && (
        <Section n={++n} title="Multiple choice">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mcq.map((q: any, i: number) => <QuizMCQ key={i} q={q} i={i} />)}
          </div>
        </Section>
      )}
      {sa.length > 0 && (
        <Section n={++n} title="Short answer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sa.map((q: any, i: number) => (
              <div key={i} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 18px', background: W.card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: W.text, lineHeight: 1.5 }}><MathText text={q.question} /></div>
                {q.model_answer && (
                  <Reveal label="Show model answer">
                    <div style={{ fontSize: 13, lineHeight: 1.65, color: W.text2 }}><MathText text={q.model_answer} /></div>
                  </Reveal>
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
  const bodyRef = useRef<HTMLDivElement>(null);

  // Section reveal: fade-up as sections enter the viewport. Sections default
  // visible; the class pair is added only once observed, so re-renders that
  // recreate DOM nodes can never leave content hidden.
  useEffect(() => {
    const root = bodyRef.current;
    if (!root || !content) return;
    const secs = Array.from(root.querySelectorAll('section')) as HTMLElement[];
    if (!secs.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('wt-in'); });
    }, { threshold: 0.06 });
    secs.forEach(s => { s.classList.add('wt-reveal'); io.observe(s); });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptId, content, type]);

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
  // Same call generates a not-yet-generated artifact, so the empty state reuses it.
  const regenerate = async () => {
    if (!job || !conceptId) return;
    setRegenning(true);
    try {
      await generationApi.genConcept(job.id, conceptId, type);
      setJob(await generationApi.getTopicJob(topicId!));
    } catch { /* */ }
    finally { setRegenning(false); }
  };

  // Slides and quiz derive from approved notes, so they can only be generated
  // once this concept's notes are ready (mirrors the studio's tile lock).
  const notesState = job && conceptId ? artState(job, conceptId, 'student_notes') : undefined;
  const notesReady = notesState?.status === 'ready' || notesState?.approval_status === 'approved';
  const canGenerate = type === 'student_notes' || notesReady;

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

          {/* ── Reading pane — barely-warm paper tone so reading feels distinct from UI ── */}
          <article style={{
            flex: 1, minWidth: 0, background: 'color-mix(in srgb, var(--card) 97%, #e8a13c 3%)',
            border: `1px solid ${W.border}`, borderRadius: 12, boxShadow: W.shadowCard,
          }}>
            <ReadProgress targetRef={bodyRef} />
            {/* article header */}
            <header style={{
              padding: '28px 40px 20px', borderBottom: `1px solid ${W.border}`,
              background: 'linear-gradient(180deg, color-mix(in oklab, var(--tint-brand-bg) 45%, var(--card)) 0%, var(--card) 100%)',
              borderRadius: '12px 12px 0 0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: W.text3, marginBottom: 10 }}>
                <span style={{ cursor: 'pointer', color: W.text2 }} onClick={() => navigate(`/winteach/courses/${courseId}`)}>{courseCode}</span>
                {' / '}
                <span style={{ cursor: 'pointer', color: W.text2 }} onClick={() => navigate(studioPath)}>{topicTitle}</span>
                {' / '}{meta.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <h1 style={{ flex: '1 1 300px', minWidth: 0, fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 27, letterSpacing: '-0.025em', color: W.text, margin: 0, lineHeight: 1.22 }}>
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
              {(concept?.concepts_covered?.length ?? 0) > 1 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11.5, color: W.text3 }}>Covers:</span>
                  {concept.concepts_covered.map((c: string) => (
                    <span key={c} style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 99, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
              )}
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
            <div ref={bodyRef} style={{ padding: '30px 40px 8px', maxWidth: 760 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: W.text2, fontSize: 13.5, padding: '30px 0 60px' }}>
                  <span className="wt-spin" style={{ width: 14, height: 14, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block' }} />
                  Loading {meta.tab.toLowerCase()}…
                </div>
              ) : content ? (
                type === 'student_notes' ? (
                  <>
                    <SectionNav bodyRef={bodyRef} depsKey={`${conceptId}`} />
                    <NotesArticle content={content} />
                  </>
                )
                  : type === 'slides' ? <SlidesArticle content={content} />
                    : <QuizArticle content={content} />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 0 72px', color: W.text2 }}>
                  <div style={{ width: 40, height: 40, color: W.text3, margin: '0 auto 14px', display: 'flex', justifyContent: 'center' }}><INotes /></div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, color: W.text, marginBottom: 6 }}>
                    {nState?.status === 'generating' ? `${meta.tab} are generating…`
                      : nState?.status === 'error' ? `${meta.tab} generation failed`
                        : `No ${meta.tab.toLowerCase()} yet`}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 18 }}>
                    {nState?.status === 'generating' ? 'This usually takes 30–90 seconds. Check back shortly.'
                      : nState?.status === 'error' ? (nState.error || 'Something went wrong. Try generating again.')
                        : canGenerate ? `Generate ${meta.tab.toLowerCase()} for this concept — takes about 30–90 seconds.`
                          : `${meta.tab} derive from approved notes. Generate this concept's notes first.`}
                  </div>
                  {nState?.status === 'generating' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: W.text2, fontSize: 13 }}>
                      <span className="wt-spin" style={{ width: 14, height: 14, border: `2px solid ${W.border}`, borderTopColor: W.brand, borderRadius: '50%', display: 'inline-block' }} />
                      Generating…
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {canGenerate ? (
                        <Btn variant="primary" onClick={regenerate} disabled={regenning}>
                          {regenning ? 'Starting…' : nState?.status === 'error' ? `Retry ${meta.tab.toLowerCase()}` : `Generate ${meta.tab.toLowerCase()}`}
                        </Btn>
                      ) : (
                        <Btn variant="primary" onClick={() => navigate(readerPath('student_notes', conceptId!))}>Go to notes</Btn>
                      )}
                      <Btn variant="ghost" onClick={() => navigate(studioPath)}>Open Generation Studio</Btn>
                    </div>
                  )}
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
