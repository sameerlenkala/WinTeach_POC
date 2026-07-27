// Student Studio lesson player — a mobile-native, paged learning experience.
// Notes read as a story: one section per screen with a thumb-zone Continue,
// interactive check-ins, and a completion screen. Quiz runs one question at a
// time with a feedback sheet; slides are a horizontal snap deck.
// Data plumbing matches the shared reader (topic job → plan → concept
// content; student progress + quiz attempts POST to the same endpoints).
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, HelpCircle,
  Layers, Lightbulb, RotateCcw, SkipForward, Sparkles, X,
} from 'lucide-react';
import { generationApi, type GenJob, type ConceptArtType } from '@/api/generation';
import { studentApi, track, type StudentCourseDetail } from '@/api/student';
import { sanitizeSvg } from '@/lib/sanitizeSvg';
import StudioCelebrate from './StudioCelebrate';

/* ════════════════════════════════════════════════════════════════════════
   Small rendering primitives (studio-native, mobile type scale)
   ════════════════════════════════════════════════════════════════════════ */

// Literal "\n" → real newline, except inside $…$ / $$…$$ where "\n" starts
// LaTeX commands (\neg, \neq, \nexists, …) and must survive for KaTeX.
const unescapeNL = (s: string) =>
  s.replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)|\\n/g, (_m, math) => math ?? '\n');
const asText = (v: unknown): string =>
  typeof v === 'string' ? v : v == null ? '' : Array.isArray(v) ? v.filter(Boolean).map(String).join('\n\n') : String(v);

// Lazily-loaded KaTeX, cached at module level. Lessons that contain `$…$`
// kick the load (see StudioLesson effect) and re-render once it's ready;
// math renders as raw text until then — progressive enhancement, same as
// the faculty reader.
export let katexMod: any = null;
let katexPromise: Promise<any> | null = null;
export const loadKatex = () =>
  (katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')])
    .then(([k]) => { katexMod = (k as any).default ?? k; return katexMod; }));

// Inline markdown-ish runs: **bold**, `code`, *italic*, $math$ / $$math$$.
const INLINE_RE = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

// Fenced code the models embed in prose fields (```python …``` — sometimes on
// one line, sometimes with a `` variant). Rendered as a real code block;
// without this the fences leak as literal backticks through the single-backtick
// inline rule. Mirrors the faculty reader's splitFences.
const FENCE_RE = /(`{2,4})([A-Za-z0-9_+#-]*)[ \t]*\r?\n?([\s\S]*?)\1/;
// Tags accepted on the degenerate ``…`` variant — a real ``inline span`` whose
// first word merely looks tag-like must stay inline code.
const FENCE_LANGS = /^(python|py|sql|java|c|cpp|c\+\+|cs|csharp|js|javascript|ts|typescript|html|css|json|bash|sh|shell|r|go|rust|kotlin|swift|php|ruby|matlab|verilog|vhdl|asm|pseudocode|text)$/i;
function inline(text: string, key = 'k'): ReactNode[] {
  const m = text.match(FENCE_RE);
  // ``…`` is only a fence when it spans lines or names a real language.
  if (m && !(m[1].length === 2 && !/\n/.test(m[3]) && !FENCE_LANGS.test(m[2]))) {
    const idx = m.index!;
    const code = m[3].trim();
    return [
      ...(idx > 0 ? inline(text.slice(0, idx), `${key}a`) : []),
      ...(code ? [<Code key={`${key}f`} code={code} language={m[2] || null} />] : []),
      ...inline(text.slice(idx + m[0].length), `${key}b`),
    ];
  }
  return text.split(INLINE_RE).filter(Boolean).map((seg, i) => {
    const k = `${key}${i}`;
    const math = (src: string, display: boolean) => {
      if (!katexMod) return <span key={k}>{seg}</span>;
      try { return <span key={k} dangerouslySetInnerHTML={{ __html: katexMod.renderToString(src, { displayMode: display, throwOnError: true }) }} />; }
      catch { return <span key={k}>{seg}</span>; }
    };
    if (seg.startsWith('$$') && seg.endsWith('$$') && seg.length > 4) return math(seg.slice(2, -2), true);
    if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) return math(seg.slice(1, -1), false);
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) return <strong key={k}>{seg.slice(2, -2)}</strong>;
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      const inner = seg.slice(1, -1);
      // Models sometimes wrap math in `code` fences instead of $…$; a real
      // identifier never has a backslash command, so typeset if it's valid LaTeX.
      if (katexMod && /\\[a-zA-Z]/.test(inner)) {
        try { return <span key={k} dangerouslySetInnerHTML={{ __html: katexMod.renderToString(inner, { throwOnError: true }) }} />; }
        catch { /* fall through to code */ }
      }
      return <code key={k}>{inner}</code>;
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) return <em key={k}>{seg.slice(1, -1)}</em>;
    return <span key={k}>{seg}</span>;
  });
}

const CALLOUTS: Record<string, { label: string; color: string }> = {
  'tip': { label: 'Tip', color: '#4ade80' },
  'warning': { label: 'Warning', color: '#fbbf24' },
  'key idea': { label: 'Key idea', color: 'var(--st-lime-text)' },
  'recall': { label: 'Recall', color: '#60a5fa' },
  'exam tip': { label: 'Exam tip', color: 'var(--st-violet)' },
  'note': { label: 'Note', color: 'var(--st-text-3)' },
};
const CALLOUT_RE = /^>\s*(tip|warning|key idea|recall|exam tip|note)\s*[:—-]\s*/i;

function Rich({ text }: { text: unknown }) {
  const str = unescapeNL(asText(text));
  if (!str.trim()) return null;
  const paras = str.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paras.map((p, i) => {
        const t = p.trim();
        const m = t.match(CALLOUT_RE);
        if (m || t.startsWith('>')) {
          const c = CALLOUTS[(m?.[1] ?? 'note').toLowerCase()] ?? CALLOUTS['note'];
          const body = m ? t.slice(m[0].length) : t.replace(/^>\s*/, '');
          return (
            <div key={i} className="st-callout" style={{ borderLeft: `3px solid ${c.color}` }}>
              <span className="st-callout-k" style={{ color: c.color }}>{c.label}</span>
              <span style={{ font: '450 14px/1.65 var(--st-sans)', color: 'var(--st-text-2)' }}>{inline(body, `c${i}`)}</span>
            </div>
          );
        }
        return <p key={i}>{inline(t, `p${i}`)}</p>;
      })}
    </>
  );
}

// Rich text for studio surfaces outside the lesson player (revision cards,
// formula sheet, PYQs): same rendering as lesson prose, plus a self-contained
// KaTeX load — the player's central loader (which kicks loadKatex for lesson
// content) doesn't run on those screens.
export function StudioRichText({ text }: { text: unknown }) {
  const [, setTick] = useState(0);
  const str = asText(text);
  useEffect(() => {
    // Load KaTeX for $…$ math OR LaTeX mis-wrapped in `code` fences.
    const needs = str.includes('$') || /`[^`\n]*\\[a-zA-Z][^`\n]*`/.test(str);
    if (!katexMod && needs) loadKatex().then(() => setTick(t => t + 1));
  }, [str]);
  return <Rich text={text} />;
}

// Arrays render as point lists; prose falls through to Rich.
function Pts({ value, ordered }: { value: unknown; ordered?: boolean }) {
  if (value == null) return null;
  if (!Array.isArray(value)) return <Rich text={value} />;
  const items = value.filter(v => v != null && String(v).trim());
  if (!items.length) return null;
  const Tag = (ordered ? 'ol' : 'ul') as 'ol';
  return <Tag>{items.map((it, i) => <li key={i}>{inline(String(it), `l${i}`)}</li>)}</Tag>;
}

function Tbl({ cols, rows }: { cols: string[]; rows: unknown[][] }) {
  if (!rows?.length) return null;
  return (
    <div className="st-tbl-wrap" style={{ margin: '14px 0' }}>
      <table className="st-tbl">
        {cols.length > 0 && <thead><tr>{cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>}
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>{(Array.isArray(r) ? r : [r]).map((cell, ci) => <td key={ci}>{inline(asText(cell), `t${ri}${ci}`)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Lazily-loaded highlight.js (shared cache), github-dark theme — the code
// surface stays dark in both studio themes, so one hljs theme suffices.
let hljsPromise: Promise<any> | null = null;
const loadHljs = () =>
  (hljsPromise ??= Promise.all([import('highlight.js/lib/common'), import('highlight.js/styles/github-dark.css')])
    .then(([m]) => (m as any).default ?? m));

function Code({ code, language, output }: { code: string; language?: string | null; output?: unknown }) {
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
    <>
      <pre className="st-code">{html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code>{code}</code>}</pre>
      {output != null && output !== '' && (
        <div style={{ marginTop: 10 }}>
          <div className="st-eyebrow" style={{ marginBottom: 6 }}>Output</div>
          <pre className="st-code" style={{ color: '#9fe8b8', whiteSpace: 'pre-wrap' }}>
            {typeof output === 'string' ? output : JSON.stringify(output, null, 1)}
          </pre>
        </div>
      )}
    </>
  );
}

// Mermaid diagram — library imported on demand (same pattern as the reader).
// The SVG sits on a white card in both themes: mermaid's neutral theme
// assumes a light background. Falls back to the source on render failure.
let mermaidSeq = 0;
function Mermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setSvg(null); setFailed(false);
    import('mermaid')
      .then(async m => {
        const mermaid = m.default;
        // htmlLabels off: sanitizeSvg (DOMPurify) strips <foreignObject>, where
        // mermaid puts HTML labels — with them on, diagrams render blank.
        mermaid.initialize({
          startOnLoad: false, theme: 'neutral', securityLevel: 'strict',
          htmlLabels: false, flowchart: { htmlLabels: false },
        } as any);
        try {
          const { svg } = await mermaid.render(`st-mmd-${++mermaidSeq}`, code);
          if (alive) setSvg(sanitizeSvg(svg));
        } catch { if (alive) setFailed(true); }
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [code]);
  if (failed) return <pre className="st-code" style={{ whiteSpace: 'pre-wrap' }}>{code}</pre>;
  if (!svg) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--st-text-3)', font: '500 12.5px var(--st-sans)', padding: '10px 0' }}>
        <span className="st-spin" style={{ width: 12, height: 12, border: '2px solid var(--st-border-2)', borderTopColor: 'var(--st-lime)', borderRadius: '50%', display: 'inline-block' }} />
        Rendering diagram…
      </div>
    );
  }
  return (
    <div
      style={{ background: '#fff', border: '1px solid var(--st-border-2)', borderRadius: 16, padding: '14px 12px', overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Studio reveal chip — answers stay hidden until asked for.
function RevealBtn({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  if (open) return <div style={{ marginTop: 8 }}>{children}</div>;
  return (
    <button onClick={() => setOpen(true)} className="st-chip st-press" style={{ marginTop: 10, color: 'var(--st-lime-text)', borderColor: 'rgba(205,244,99,.35)' }}>
      {label}
    </button>
  );
}

// Recover step structure from run-on prose: models sometimes squash
// "Step 1: … Step 2: …" into one line (same heuristic as the reader).
function splitInlineSteps(s: string): string {
  if (/\n\s*\n/.test(s)) return s;
  return s.replace(
    /(?!^)\s+(?=(?:\*\*)?(?:Step\s+\d+|Edge\s+Cases?|Diverse\s+Scenario|Observation|Result|Key\s+insight)\s*(?:\*\*)?:)/gi,
    '\n\n',
  );
}

// Worked examples reveal one step at a time — predict, then advance.
function Stepped({ text }: { text: unknown }) {
  const str = splitInlineSteps(unescapeNL(asText(text)));
  const paras = str.split(/\n\s*\n/).filter(p => p.trim());
  const [shown, setShown] = useState(1);
  useEffect(() => { setShown(1); }, [str]);
  if (paras.length < 3) return <Rich text={str} />;
  const done = shown >= paras.length;
  return (
    <>
      <Rich text={paras.slice(0, shown).join('\n\n')} />
      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="st-chip st-press" style={{ background: 'var(--st-lime)', color: 'var(--st-ink-on-lime)', borderColor: 'var(--st-lime)', fontWeight: 700 }}
            onClick={() => setShown(s => s + 1)}>
            Next step · {shown}/{paras.length}
          </button>
          <button className="st-chip st-press" onClick={() => setShown(paras.length)}>Show all</button>
        </div>
      )}
    </>
  );
}

// Dry-run traces reveal line by line. Each line is rich text (not raw mono):
// math-heavy subjects put $…$ LaTeX, **bold**, and `code` in the trace.
function SteppedTrace({ text: raw }: { text: unknown }) {
  const joined = unescapeNL(Array.isArray(raw) ? raw.filter(Boolean).map(String).join('\n') : asText(raw));
  const text = joined.includes('\n') ? joined : splitInlineSteps(joined).replace(/\n\n/g, '\n');
  const lines = text.split('\n');
  const [shown, setShown] = useState(2);
  useEffect(() => { setShown(2); }, [text]);
  const block = (body: string[]) => (
    <div className="st-code" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {body.map((ln, i) => <div key={i}>{ln.trim() ? <StudioRichText text={ln} /> : ' '}</div>)}
    </div>
  );
  if (lines.length < 5) return block(lines);
  const done = shown >= lines.length;
  return (
    <>
      {block(lines.slice(0, shown))}
      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="st-chip st-press" style={{ background: 'var(--st-lime)', color: 'var(--st-ink-on-lime)', borderColor: 'var(--st-lime)', fontWeight: 700 }}
            onClick={() => setShown(s => Math.min(s + 1, lines.length))}>
            What happens next? · {shown}/{lines.length}
          </button>
          <button className="st-chip st-press" onClick={() => setShown(lines.length)}>Show full trace</button>
        </div>
      )}
    </>
  );
}

// Execution-trace tables reveal row by row.
function SteppedRows({ cols, rows }: { cols: string[]; rows: unknown[][] }) {
  const [shown, setShown] = useState(1);
  useEffect(() => { setShown(1); }, [rows]);
  const done = shown >= rows.length;
  return (
    <>
      <Tbl cols={cols} rows={rows.slice(0, shown)} />
      {!done && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="st-chip st-press" style={{ background: 'var(--st-lime)', color: 'var(--st-ink-on-lime)', borderColor: 'var(--st-lime)', fontWeight: 700 }}
            onClick={() => setShown(s => s + 1)}>
            Next row · {shown}/{rows.length}
          </button>
          <button className="st-chip st-press" onClick={() => setShown(rows.length)}>Show all rows</button>
        </div>
      )}
    </>
  );
}

// Generated visuals: mermaid_code renders as a diagram; columns/rows as a
// table (execution traces reveal row-by-row); desc-only visuals render as a
// quiet figure when substantive.
function Visual({ v }: { v: any }) {
  const mermaidCode = typeof v?.mermaid_code === 'string' && v.mermaid_code.trim() ? v.mermaid_code.trim() : null;
  const hasTable = (v?.rows?.length ?? 0) > 0;
  const desc = typeof v?.description === 'string' ? v.description : '';
  if (!mermaidCode && !hasTable && desc.length < 100 && !desc.includes('\n')) return null;
  return (
    <figure style={{ margin: '14px 0 0' }}>
      {v.title && <figcaption style={{ font: '700 12.5px var(--st-display)', color: 'var(--st-text)', marginBottom: 6 }}>{v.title}</figcaption>}
      {mermaidCode
        ? <Mermaid code={mermaidCode} />
        : hasTable
          ? (String(v.type ?? '').includes('execution_trace') && v.rows.length >= 4
            ? <SteppedRows cols={v.columns ?? []} rows={v.rows} />
            : <Tbl cols={v.columns ?? []} rows={v.rows} />)
          : <div className="st-callout" style={{ borderLeft: '3px solid var(--st-border-2)', whiteSpace: 'pre-wrap', font: '450 13px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>{desc}</div>}
    </figure>
  );
}

// Pause-and-think: reveal, then self-grade.
function CheckIn({ q, index }: { q: any; index: number }) {
  const [open, setOpen] = useState(false);
  const [graded, setGraded] = useState<null | boolean>(null);
  return (
    <div className="st-card" style={{ padding: '15px 16px', marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <Lightbulb size={16} color="var(--st-lime)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ font: '600 14.5px/1.55 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(q.question))}</div>
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="st-chip st-press" style={{ marginTop: 12, color: 'var(--st-lime-text)', borderColor: 'rgba(205,244,99,.35)' }}>
          Reveal answer
        </button>
      ) : (
        <>
          <div style={{ font: '450 13.5px/1.65 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 10 }}>{inline(asText(q.answer))}</div>
          {graded === null ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setGraded(false); track('studio_checkin_answered', { index, correct: false }); }} className="st-chip st-press">Missed it</button>
              <button onClick={() => { setGraded(true); track('studio_checkin_answered', { index, correct: true }); }} className="st-chip st-press" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,.4)' }}>Got it ✓</button>
            </div>
          ) : (
            <div style={{ marginTop: 10, font: '700 12.5px var(--st-sans)', color: graded ? '#4ade80' : 'var(--st-text-3)' }}>
              {graded ? 'Nice — keep going.' : 'Worth a re-read before moving on.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Tap-to-flip card deck with prev/next.
function FlipDeck({ cards }: { cards: { front: string; back: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards.length) return null;
  const card = cards[Math.min(idx, cards.length - 1)];
  const go = (d: number) => { setIdx(i => Math.max(0, Math.min(cards.length - 1, i + d))); setFlipped(false); };
  return (
    <div>
      <div className={`st-flip ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)} style={{ cursor: 'pointer', minHeight: 210, position: 'relative' }}>
        <div className="st-flip-inner" style={{ minHeight: 210 }}>
          <div className="st-flip-face st-flip-front">
            <div style={{ font: '700 18px/1.4 var(--st-display)', color: 'var(--st-text)' }}>{inline(card.front)}</div>
          </div>
          <div className="st-flip-face st-flip-back">
            <div style={{ font: '450 14.5px/1.65 var(--st-sans)', color: 'var(--st-text)' }}>{inline(card.back)}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <button onClick={() => go(-1)} disabled={idx === 0} className="st-chip st-press" style={{ opacity: idx === 0 ? 0.4 : 1 }}><ChevronLeft size={14} /> Prev</button>
        <span style={{ flex: 1, textAlign: 'center', font: '600 12px var(--st-sans)', color: 'var(--st-text-3)' }}>
          {idx + 1} / {cards.length} · tap to flip
        </span>
        <button onClick={() => go(1)} disabled={idx === cards.length - 1} className="st-chip st-press" style={{ opacity: idx === cards.length - 1 ? 0.4 : 1 }}>Next <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}

function buildFlashcards(content: any): { front: string; back: string }[] {
  const cs = content?.closing?.sections ?? {};
  const cards: { front: string; back: string }[] = [];
  for (const c of cs.flashcard_section?.cards ?? []) if (c?.front) cards.push({ front: c.front, back: c.back || '' });
  for (const t of cs.glossary_section?.terms ?? []) if (t?.term) cards.push({ front: t.term, back: t.simple_explanation || t.formal_definition || '' });
  for (const d of cs.revision_section?.important_definitions ?? []) if (d?.term) cards.push({ front: d.term, back: d.definition || '' });
  for (const p of cs.revision_section?.active_recall_prompts ?? []) if (p?.prompt) cards.push({ front: p.prompt, back: p.answer_explanation || '' });
  return cards.filter(c => c.back);
}

/* ════════════════════════════════════════════════════════════════════════
   Notes → pages
   ════════════════════════════════════════════════════════════════════════ */

type Page = { key: string; eyebrow: string; title: string; body: ReactNode };

function buildNotesPages(content: any): Page[] {
  const pages: Page[] = [];
  const add = (key: string, eyebrow: string, title: string, body: ReactNode) => pages.push({ key, eyebrow, title, body });
  const opening = content?.opening?.sections ?? {};
  const core = content?.core ?? {};
  const closing = content?.closing?.sections ?? {};

  // Why this matters
  const scenario = opening?.problem_statement?.scenario;
  const gap = opening?.problem_statement?.gap_statement;
  const intro = opening?.introduction?.narrative_intro;
  const conn = opening?.introduction?.connectivity_matrix;
  const hasConn = ((conn?.foundation?.length ?? 0) + (conn?.this_subtopic?.length ?? 0) + (conn?.builds_toward?.length ?? 0)) > 0;
  if (scenario || intro || hasConn) {
    add('why', 'The hook', 'Why this matters', (
      <>
        {scenario && <Rich text={scenario} />}
        {gap && <div style={{ font: '600 15.5px/1.6 var(--st-sans)', color: 'var(--st-text)', margin: '4px 0 14px' }}><Rich text={gap} /></div>}
        {intro && <Rich text={intro} />}
        {hasConn && (
          <div className="st-card" style={{ padding: '14px 16px', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, font: '450 13.5px/1.55 var(--st-sans)' }}>
            {(conn.foundation?.length ?? 0) > 0 && <div><b style={{ color: 'var(--st-aqua)' }}>You already know</b><br />{conn.foundation.join(', ')}</div>}
            {(conn.this_subtopic?.length ?? 0) > 0 && <div><b style={{ color: 'var(--st-lime-text)' }}>This lesson covers</b><br />{conn.this_subtopic.join(', ')}</div>}
            {(conn.builds_toward?.length ?? 0) > 0 && <div><b style={{ color: 'var(--st-violet)' }}>Builds toward</b><br />{conn.builds_toward.join(', ')}</div>}
          </div>
        )}
      </>
    ));
  }

  // Definition & intuition
  const def = core?.core_concept?.formal_definition;
  const intuition = core?.core_concept?.mental_model_analogy ?? core?.core_concept?.intuition ?? content?.opening?.hook;
  if (def) {
    add('def', 'Core concept', 'The definition', (
      <>
        <div style={{
          borderLeft: '3px solid var(--st-lime)', borderRadius: '4px 18px 18px 4px',
          background: 'rgba(205,244,99,.07)', padding: '16px 18px', marginBottom: 16,
          font: '500 16.5px/1.65 var(--st-sans)', color: 'var(--st-text)',
        }}>
          <Rich text={typeof def === 'object' && !Array.isArray(def) ? def.core : def} />
        </div>
        {typeof def === 'object' && !Array.isArray(def) && (def.elaboration?.length ?? 0) > 0 && <Pts value={def.elaboration} />}
        {intuition != null && (
          <div style={{ marginTop: 14 }}>
            <div className="st-eyebrow" style={{ marginBottom: 8 }}>Mental model</div>
            <Pts value={intuition} />
          </div>
        )}
      </>
    ));
  }

  // Mechanism — honors the generator's visual placement hints; visuals meant
  // for "after_worked_example" render there instead (falling back here only
  // when no worked example exists).
  const mechB = core?.deep_dive?.architecture_and_mechanism;
  const visuals: any[] = mechB?.visuals ?? [];
  const hasWorked = Boolean(core?.practical_understanding?.worked_example);
  if (mechB?.explanation || visuals.length > 0) {
    add('mech', 'Deep dive', 'How it works', (
      <>
        {visuals.filter((v: any) => v?.placement === 'before_explanation').map((v: any, i: number) => <Visual key={`b${i}`} v={v} />)}
        <Pts value={mechB?.explanation} />
        {visuals
          .filter((v: any) => v?.placement !== 'before_explanation' && (v?.placement !== 'after_worked_example' || !hasWorked))
          .map((v: any, i: number) => <Visual key={i} v={v} />)}
      </>
    ));
  }

  // Code
  const code = core?.deep_dive?.code_or_formalization;
  const grid = code?.complexity_grid;
  const hasGrid = grid && [grid.best_case_time, grid.average_case_time, grid.worst_case_time, grid.space_complexity].some((v: any) => v && v !== 'N/A');
  if (code?.applicable && code?.content) {
    add('code', code.language_or_system || 'In practice',
      code.type === 'formal_math' ? 'Formalization' : code.type === 'pseudocode' ? 'Pseudocode' : 'The code', (
        <>
          <Code code={code.content} language={code.language_or_system} output={code.sample_output} />
          {code.explanation && <div style={{ marginTop: 14 }}><Pts value={code.explanation} /></div>}
          {hasGrid && (
            <>
              <Tbl cols={['Best', 'Average', 'Worst', 'Space']} rows={[[grid.best_case_time, grid.average_case_time, grid.worst_case_time, grid.space_complexity]]} />
              {grid.justification && grid.justification !== 'N/A' && <p style={{ font: '450 12.5px/1.6 var(--st-sans)', color: 'var(--st-text-3)' }}>{grid.justification}</p>}
            </>
          )}
        </>
      ));
  }

  // Trace + edge cases — line-by-line stepped reveal
  const trace = core?.deep_dive?.execution_trace;
  if (trace?.applicable && (trace?.dry_run_trace || (trace?.edge_case_matrix?.length ?? 0) > 0 || (trace?.visuals?.length ?? 0) > 0)) {
    add('trace', 'Step by step', 'Execution trace', (
      <>
        {trace.dry_run_trace && <SteppedTrace text={trace.dry_run_trace} />}
        {(trace.edge_case_matrix?.length ?? 0) > 0 && (
          <Tbl cols={['Edge input', 'Expected behavior']} rows={trace.edge_case_matrix.map((e: any) => [e.edge_input, e.expected_behavior])} />
        )}
        {(trace.visuals ?? []).map((v: any, i: number) => <Visual key={i} v={v} />)}
      </>
    ));
  }

  // Pause & think
  const pause: any[] = core?.deep_dive?.pause_and_think ?? [];
  if (pause.length > 0) {
    add('pause', 'Quick check', 'Pause & think', (
      <>
        <p className="st-prose" style={{ color: 'var(--st-text-2)' }}>Answer from memory before revealing — that's what makes it stick.</p>
        {pause.map((p: any, i: number) => <CheckIn key={i} q={p} index={i} />)}
      </>
    ));
  }

  // Worked example — stepped reveal (predict, then advance). Visuals the
  // generator placed "after_worked_example" land here when present.
  const worked = core?.practical_understanding?.worked_example;
  const vAfterWorked = visuals.filter((v: any) => v?.placement === 'after_worked_example');
  if (worked) {
    add('worked', 'Apply it', 'Worked example', (
      <>
        <Stepped text={worked} />
        {vAfterWorked.map((v: any, i: number) => <Visual key={i} v={v} />)}
      </>
    ));
  }

  // Trade-offs
  const adv: any[] = core?.practical_understanding?.advantages ?? [];
  const dis: any[] = core?.practical_understanding?.disadvantages ?? [];
  if (adv.length || dis.length) {
    add('tradeoffs', 'Judgement', 'Strengths & trade-offs', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {adv.length > 0 && (
          <div className="st-card" style={{ padding: '14px 16px', borderLeft: '3px solid #4ade80' }}>
            <div className="st-eyebrow" style={{ color: '#4ade80', marginBottom: 8 }}>Strengths</div>
            <Pts value={adv} />
          </div>
        )}
        {dis.length > 0 && (
          <div className="st-card" style={{ padding: '14px 16px', borderLeft: '3px solid #fbbf24' }}>
            <div className="st-eyebrow" style={{ color: '#fbbf24', marginBottom: 8 }}>Trade-offs</div>
            <Pts value={dis} />
          </div>
        )}
      </div>
    ));
  }

  // Applications
  const apps = core?.practical_understanding?.applications ?? core?.practical_understanding?.real_world_applications;
  if (Array.isArray(apps) ? apps.length > 0 : Boolean(apps)) {
    add('apps', 'Out there', 'Real-world applications',
      Array.isArray(apps) ? <Pts value={apps.map((a: any) => (typeof a === 'string' ? a : a?.text ?? ''))} /> : <Rich text={apps} />);
  }

  // Analysis + comparison
  const analysis = core?.analysis;
  const comparison = core?.comparison;
  const compRows: any[] = comparison?.comparison_table?.rows ?? [];
  const hasAnalysis = analysis?.applicable && (analysis?.discussion || (analysis?.complexity_note && analysis.complexity_note !== 'N/A'));
  const hasComparison = comparison?.applicable !== false && compRows.length > 0;
  if (hasAnalysis || hasComparison) {
    add('analysis', 'Think deeper', hasComparison ? `Compared${comparison?.compared_against ? ` with ${comparison.compared_against}` : ''}` : 'Analysis', (
      <>
        {hasAnalysis && <Rich text={analysis.discussion} />}
        {hasAnalysis && analysis.complexity_note && analysis.complexity_note !== 'N/A' && (
          <p style={{ font: '450 13px/1.6 var(--st-sans)', color: 'var(--st-text-3)' }}>{inline(asText(analysis.complexity_note))}</p>
        )}
        {hasComparison && <Tbl cols={['Parameter', 'This concept', comparison?.compared_against ?? 'Alternative']} rows={compRows.map((r: any) => [r.parameter, r.option_a, r.option_b])} />}
      </>
    ));
  }

  // Common mistakes
  const mistakes: any[] = closing?.common_mistakes ?? [];
  if (mistakes.length > 0) {
    add('mistakes', 'Watch out', 'Common mistakes', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mistakes.map((m: any, i: number) => {
          const wrong = m.wrong_way ?? m.mistake;
          const why = m.why_it_fails ?? m.why_it_happens;
          const right = m.right_way ?? m.correct_approach;
          return (
            <div key={i} className="st-card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ display: 'flex', gap: 10, padding: '13px 16px', background: 'rgba(251,113,133,.08)' }}>
                <span style={{ color: '#fb7185', fontWeight: 700, flexShrink: 0 }}>✗</span>
                <div>
                  {wrong && <div style={{ font: '600 14px/1.5 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(wrong), `w${i}`)}</div>}
                  {why && <div style={{ font: '450 12.5px/1.55 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 3 }}>{inline(asText(why), `y${i}`)}</div>}
                </div>
              </div>
              {(right || m.why_it_works) && (
                <div style={{ display: 'flex', gap: 10, padding: '13px 16px', background: 'rgba(74,222,128,.07)' }}>
                  <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <div>
                    {right && <div style={{ font: '600 14px/1.5 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(right), `r${i}`)}</div>}
                    {m.why_it_works && <div style={{ font: '450 12.5px/1.55 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 3 }}>{inline(asText(m.why_it_works), `k${i}`)}</div>}
                  </div>
                </div>
              )}
              {m.exam_tip && (
                <div style={{ padding: '9px 16px', font: '600 12px var(--st-sans)', color: 'var(--st-violet)', background: 'rgba(167,139,250,.1)' }}>
                  Exam tip: {inline(asText(m.exam_tip), `e${i}`)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));
  }

  // Practice questions — easy/medium/hard cards with reveal-on-demand answers
  const practice = closing?.practice_questions;
  const bands: [string, string, any[]][] = [
    ['Easy', '#4ade80', practice?.easy ?? []],
    ['Medium', '#fbbf24', practice?.medium ?? []],
    ['Hard', '#fb7185', practice?.hard ?? []],
  ];
  if (bands.some(([, , qs]) => qs.length > 0)) {
    add('practice', 'Test yourself', 'Practice questions', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bands.map(([label, color, qs]) => qs.map((q: any, i: number) => (
          <div key={`${label}${i}`} className="st-card" style={{ padding: '15px 16px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span className="st-chip" style={{ padding: '3px 10px', fontSize: 11, color, borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, fontWeight: 700 }}>{label}</span>
              {q.bloom_level && <span className="st-chip" style={{ padding: '3px 10px', fontSize: 11 }}>{q.bloom_level}</span>}
            </div>
            <div style={{ font: '600 14.5px/1.55 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(q.question), `pq${label}${i}`)}</div>
            {q.answer_explanation && (
              <RevealBtn label="Show answer">
                <div style={{ font: '450 13.5px/1.65 var(--st-sans)', color: 'var(--st-text-2)' }}>{inline(asText(q.answer_explanation), `pa${label}${i}`)}</div>
              </RevealBtn>
            )}
          </div>
        )))}
      </div>
    ));
  }

  // Recap — takeaways, formulas, key definitions, active-recall prompts
  const revision = closing?.revision_section;
  const takeaways: any[] = revision?.key_takeaways ?? [];
  const formulas: any[] = revision?.important_formulas ?? [];
  const definitions: any[] = revision?.important_definitions ?? [];
  const recalls: any[] = revision?.active_recall_prompts ?? [];
  if (takeaways.length || formulas.length || definitions.length || recalls.length) {
    add('recap', 'Lock it in', 'Key takeaways', (
      <>
        {takeaways.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {takeaways.map((t: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 8, flexShrink: 0, marginTop: 2,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(205,244,99,.12)', border: '1px solid rgba(205,244,99,.3)',
                }}><Check size={12} color="var(--st-lime)" /></span>
                <span style={{ font: '500 14.5px/1.6 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(t), `t${i}`)}</span>
              </div>
            ))}
          </div>
        )}
        {formulas.length > 0 && (
          <div style={{ marginTop: takeaways.length ? 18 : 0 }}>
            <div className="st-eyebrow" style={{ marginBottom: 8 }}>Formulas</div>
            {formulas.map((f: any, i: number) => {
              const s = asText(f?.formula ?? f);
              // LaTeX formulas typeset via KaTeX; plain ones stay mono
              return /\$/.test(s)
                ? <div key={i} className="st-callout" style={{ borderLeft: '3px solid var(--st-aqua)', font: '500 15px/1.7 var(--st-sans)', color: 'var(--st-text)', margin: '0 0 8px' }}>{inline(s, `f${i}`)}</div>
                : <pre key={i} className="st-code" style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{s}</pre>;
            })}
          </div>
        )}
        {definitions.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="st-eyebrow" style={{ marginBottom: 8 }}>Key definitions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {definitions.map((d: any, i: number) => (
                <div key={i} style={{ font: '450 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>
                  <b style={{ color: 'var(--st-text)', fontWeight: 700 }}>{d.term}</b> — {inline(asText(d.definition), `d${i}`)}
                </div>
              ))}
            </div>
          </div>
        )}
        {recalls.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="st-eyebrow" style={{ marginBottom: 8 }}>Active recall</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recalls.map((p: any, i: number) => (
                <div key={i} className="st-card" style={{ padding: '14px 16px' }}>
                  <div style={{ font: '600 14px/1.55 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(p.prompt), `rp${i}`)}</div>
                  {p.answer_explanation && (
                    <RevealBtn label="Show answer">
                      <div style={{ font: '450 13px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>{inline(asText(p.answer_explanation), `ra${i}`)}</div>
                    </RevealBtn>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ));
  }

  // Flashcards
  const cards = buildFlashcards(content);
  if (cards.length > 0) {
    add('cards', 'Memorise', 'Flashcards', <FlipDeck cards={cards} />);
  }

  // Glossary — term cards with formal + plain-terms explanations
  const glossary: any[] = closing?.glossary_section?.terms ?? [];
  if (glossary.length > 0) {
    add('glossary', 'Vocabulary', 'Glossary', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {glossary.map((t: any, i: number) => (
          <div key={i} className="st-card" style={{ padding: '14px 16px' }}>
            <div style={{ font: '700 14.5px var(--st-display)', color: 'var(--st-text)', marginBottom: 4 }}>{t.term}</div>
            {t.formal_definition && <div style={{ font: '450 13px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>{inline(asText(t.formal_definition), `gf${i}`)}</div>}
            {t.simple_explanation && (
              <div style={{ font: '450 12.5px/1.55 var(--st-sans)', color: 'var(--st-text-3)', marginTop: 6 }}>
                In plain terms: {inline(asText(t.simple_explanation), `gs${i}`)}
              </div>
            )}
            {(t.related_terms?.length ?? 0) > 0 && (
              <div style={{ font: '600 11.5px var(--st-sans)', color: 'var(--st-aqua)', marginTop: 8 }}>{t.related_terms.join(' · ')}</div>
            )}
          </div>
        ))}
      </div>
    ));
  }

  // Related topics — where this lesson sits in the syllabus
  const related = closing?.related_topics;
  if (related && (related.previous_connection || related.next_connection || (related.builds_toward?.length ?? 0) > 0 || related.industry_relevance)) {
    const row = (label: string, body: ReactNode) => (
      <div className="st-card" style={{ padding: '13px 16px' }}>
        <div className="st-eyebrow" style={{ marginBottom: 5 }}>{label}</div>
        <div style={{ font: '450 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>{body}</div>
      </div>
    );
    add('related', 'The bigger picture', 'Related topics', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {related.previous_connection && row('Builds on', <>{related.previous_subtopic ? <b style={{ color: 'var(--st-text)' }}>{related.previous_subtopic} — </b> : null}{related.previous_connection}</>)}
        {related.next_connection && row('Leads to', <>{related.next_subtopic ? <b style={{ color: 'var(--st-text)' }}>{related.next_subtopic} — </b> : null}{related.next_connection}</>)}
        {(related.builds_toward?.length ?? 0) > 0 && row('Builds toward', related.builds_toward.join(', '))}
        {related.industry_relevance && row('In industry', related.industry_relevance)}
      </div>
    ));
  }

  return pages;
}

/* ════════════════════════════════════════════════════════════════════════
   Data
   ════════════════════════════════════════════════════════════════════════ */

// Opening a lesson used to cost two serial round trips (topic job, then the
// concept), and every hop to the next lesson paid both again even though the
// job never changes within a topic. These module-level caches make the second
// and subsequent lessons in a topic a single request — and let us prefetch the
// next one while the student is still reading this one.
const jobCache = new Map<string, Promise<{ job: GenJob; plan: any }>>();
const conceptCache = new Map<string, Promise<any>>();

function loadTopic(topicId: string) {
  let p = jobCache.get(topicId);
  if (!p) {
    p = generationApi.getTopicJob(topicId).then(async job => {
      let plan: any = null;
      try { plan = (await generationApi.getArtifact(job.id, 'topic_plan')).content; } catch { /* plan optional */ }
      return { job, plan };
    });
    // A failed load must not be cached as a permanent failure.
    p.catch(() => jobCache.delete(topicId));
    jobCache.set(topicId, p);
  }
  return p;
}

function loadConcept(jobId: string, conceptId: string, type: ConceptArtType) {
  const key = `${jobId}:${conceptId}:${type}`;
  let p = conceptCache.get(key);
  if (!p) {
    p = generationApi.getConcept(jobId, conceptId, type).then(r => r.content);
    p.catch(() => conceptCache.delete(key));
    conceptCache.set(key, p);
  }
  return p;
}

// Warm the cache for a lesson the student is likely to open next. Failures are
// ignored — this is opportunistic, never load-bearing.
export function prefetchConcept(jobId?: string, conceptId?: string | null, type: ConceptArtType = 'student_notes') {
  if (jobId && conceptId) loadConcept(jobId, conceptId, type).catch(() => {});
}

function useLesson(topicId?: string, conceptId?: string, type: ConceptArtType = 'student_notes') {
  const [job, setJob] = useState<GenJob | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!topicId) return;
    let live = true;
    loadTopic(topicId)
      .then(({ job: j, plan: pl }) => { if (live) { setJob(j); setPlan(pl); } })
      .catch(() => { if (live) { setError('Could not load this lesson.'); setLoading(false); } });
    return () => { live = false; };
  }, [topicId]);

  const jobId = job?.id;
  useEffect(() => {
    if (!jobId || !conceptId) return;
    let live = true;
    setLoading(true); setContent(null);
    loadConcept(jobId, conceptId, type)
      .then(c => { if (live) setContent(c); })
      .catch(() => { if (live) setError('This lesson isn’t available yet.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [jobId, conceptId, type]);

  return { job, plan, content, loading, error };
}

const approvedFor = (job: GenJob | null, cid: string, t: ConceptArtType) =>
  (job?.concept_artifacts ?? []).some(a => a.concept_id === cid && a.artifact_type === t && a.approval_status === 'approved');

/* ════════════════════════════════════════════════════════════════════════
   Player chrome
   ════════════════════════════════════════════════════════════════════════ */

function HeadBar({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onClose} aria-label="Close lesson" className="st-press"
        style={{
          width: 38, height: 38, borderRadius: 13, flexShrink: 0,
          border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={17} />
      </button>
      {children}
    </div>
  );
}

function Segs({ total, done }: { total: number; done: number }) {
  return (
    <div className="st-segs">
      {Array.from({ length: total }).map((_, i) => <i key={i} className={i < done ? 'on' : ''} />)}
    </div>
  );
}

function ModePills({ base, conceptId, job, active }: { base: string; conceptId: string; job: GenJob | null; active: ConceptArtType }) {
  const navigate = useNavigate();
  const modes: { t: ConceptArtType; label: string; seg: string; icon: typeof BookOpen }[] = [
    { t: 'student_notes', label: 'Read', seg: 'notes', icon: BookOpen },
    { t: 'slides', label: 'Slides', seg: 'slides', icon: Layers },
    { t: 'quiz', label: 'Quiz', seg: 'quiz', icon: HelpCircle },
  ];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {modes.filter(m => m.t === active || approvedFor(job, conceptId, m.t)).map(m => {
        const on = m.t === active;
        const Icon = m.icon;
        return (
          <button
            key={m.t} className="st-chip st-press"
            onClick={() => !on && navigate(`${base}/${m.seg}/${conceptId}`)}
            style={on ? { background: 'var(--st-lime)', color: 'var(--st-ink-on-lime)', borderColor: 'var(--st-lime)', fontWeight: 700 } : undefined}
          >
            <Icon size={13} /> {m.label}
          </button>
        );
      })}
    </div>
  );
}

function FootBtn({ children, primary, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  const base = primary ? { flex: 1 } : {
    width: 56, minHeight: 56, borderRadius: 999, flexShrink: 0,
    border: '1px solid var(--st-border-2)', background: 'var(--st-glass)', color: 'var(--st-text)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  } as const;
  return (
    <button {...rest} className={primary ? 'st-cta' : 'st-press'} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Notes player
   ════════════════════════════════════════════════════════════════════════ */

// Where the player sends a student who has finished the last lesson of a
// topic: the next topic, or the course's mastery map when the course is done.
type Onward = { label: string; go: () => void } | null;

function NotesPlayer({ content, meta, onDone, onQuiz, hasQuiz, onNext, onward, onRevise, onPage, onExit }: {
  content: any;
  meta: { title: string; code: string; lessonNo: number | null };
  // Reports how much of the lesson was actually opened; returns whether that
  // (combined with dwell, which the parent owns) earned a completion.
  onDone: (visitedRatio: number) => boolean;
  onQuiz: (() => void) | null;
  hasQuiz: boolean;
  onNext: (() => void) | null;
  onward: Onward;
  onRevise: () => void;
  onPage?: (idx: number, total: number, leaving?: { key: string; title: string }) => void;
  // Explicit exit target — never history.back(), which can pop out of the
  // studio (deep links, PWA launches, stale non-student history entries).
  onExit: () => void;
}) {
  const pages = useMemo(() => buildNotesPages(content), [content]);
  // idx 0 = cover; 1..n = pages; n+1 = completion
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const total = pages.length + 2;
  // Which content pages were actually opened. Tapping straight through still
  // visits them all, so this alone can't earn a completion — the parent's dwell
  // check is the other half of the gate.
  const visited = useRef(new Set<number>());
  const go = (d: 1 | -1) => {
    setDir(d);
    setIdx(i => {
      const n = Math.max(0, Math.min(total - 1, i + d));
      if (n !== i) {
        visited.current.add(n);
        // Report the section being left, so its dwell is attributable.
        const from = pages[i - 1];
        onPage?.(n, total, from ? { key: from.key, title: from.title } : undefined);
      }
      return n;
    });
    bodyRef.current?.scrollTo({ top: 0 });
  };
  const doneFired = useRef(false);
  const [earned, setEarned] = useState(true);
  useEffect(() => {
    if (idx === total - 1 && !doneFired.current) {
      doneFired.current = true;
      const seen = [...visited.current].filter(i => i >= 1 && i <= pages.length).length;
      setEarned(onDone(pages.length ? seen / pages.length : 1));
    }
  }, [idx, total, pages.length, onDone]);

  // Horizontal swipe advances/rewinds sections. Vertical-dominant moves are
  // ignored (that's reading scroll), as are swipes on horizontally-scrollable
  // or interactive blocks (code, tables, flip cards).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    if ((e.target as HTMLElement).closest('pre, .st-tbl-wrap, .st-flip, button')) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  const info = content?.opening?.sections?.topic_overview?.subtopic_metadata;
  const outcomes: any[] = content?.opening?.sections?.topic_overview?.outcomes_checklist ?? [];
  const anim = dir === 1 ? 'st-page-in' : 'st-page-back';

  const cover = (
    <div key="cover" className={anim} style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ margin: 'auto 0', paddingTop: 12 }}>
        <div className="st-eyebrow" style={{ color: 'var(--st-lime-text)' }}>
          {meta.code}{meta.lessonNo != null ? ` · Lesson ${meta.lessonNo}` : ''}
        </div>
        <h1 style={{ font: '700 32px/1.15 var(--st-display)', letterSpacing: '-0.025em', color: 'var(--st-text)', margin: '10px 0 14px' }}>
          {meta.title}
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {info?.reading_time_minutes != null && <span className="st-chip">⏱ ~{info.reading_time_minutes} min</span>}
          {(() => {
            const d = parseInt(String(info?.difficulty ?? ''), 10);
            return Number.isFinite(d) && d > 0 ? (
              <span className="st-chip">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: i <= d ? 'var(--st-lime)' : 'rgba(255,255,255,.18)' }} />
                ))}
              </span>
            ) : null;
          })()}
          {info?.placement_relevance && <span className="st-chip" style={{ color: 'var(--st-aqua)' }}>Placement: {info.placement_relevance}</span>}
          {info?.university_importance && <span className="st-chip" style={{ color: 'var(--st-violet)' }}>Exam: {info.university_importance}</span>}
        </div>
        {outcomes.length > 0 && (
          <>
            <div className="st-eyebrow" style={{ marginBottom: 10 }}>You'll be able to</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {outcomes.map((o: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 21, height: 21, borderRadius: 99, flexShrink: 0, marginTop: 2,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    font: '700 10.5px var(--st-display)', color: 'var(--st-text-3)',
                    border: '1.5px solid var(--st-border-2)',
                  }}>{i + 1}</span>
                  <span style={{ font: '500 14px/1.55 var(--st-sans)', color: 'var(--st-text-2)' }}>{o.statement}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const completion = (
    <div key="end" className={anim} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', textAlign: 'center', gap: 6 }} aria-live="polite">
      {earned && <StudioCelebrate />}
      <div style={{
        width: 84, height: 84, borderRadius: '50%', marginBottom: 12,
        background: earned
          ? 'linear-gradient(135deg, var(--st-lime), var(--st-aqua))'
          : 'var(--st-glass-2)',
        border: earned ? 'none' : '1px solid var(--st-border-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: earned ? '0 14px 44px rgba(205,244,99,.3)' : 'none',
      }}>
        {earned
          ? <Check size={38} color="var(--st-ink-on-lime)" strokeWidth={3} />
          : <BookOpen size={34} color="var(--st-text-2)" />}
      </div>
      <div style={{ font: '700 26px var(--st-display)', letterSpacing: '-0.02em' }}>
        {earned ? 'Lesson complete' : 'End of the lesson'}
      </div>
      <div style={{ font: '500 14px/1.6 var(--st-sans)', color: 'var(--st-text-2)', maxWidth: 264 }}>
        {earned
          ? (hasQuiz ? 'Great read. Lock it in with the quiz.' : 'Great read — this lesson now counts toward your mastery.')
          : (hasQuiz
            ? 'That was a quick skim. Take the quiz to count it, or read back through.'
            : 'That was a quick skim — read back through and it’ll count toward your mastery.')}
      </div>
    </div>
  );

  const page = idx === 0 ? cover : idx === total - 1 ? completion : (() => {
    const p = pages[idx - 1];
    return (
      <div key={p.key} className={anim}>
        <div className="st-eyebrow" style={{ color: 'var(--st-aqua)', marginBottom: 6 }}>{p.eyebrow}</div>
        <h2 className="st-h-page">{p.title}</h2>
        <div className="st-prose" style={{ marginTop: 14 }}>{p.body}</div>
      </div>
    );
  })();

  const atEnd = idx === total - 1;
  return (
    <>
      {idx > 0 && !atEnd && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 22px 10px' }}>
          <Segs total={pages.length} done={idx} />
          <span style={{ font: '700 11px var(--st-display)', color: 'var(--st-text-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {idx}/{pages.length}
          </span>
        </div>
      )}
      <div className="st-player-body" ref={bodyRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>{page}</div>
      <div className="st-player-foot">
        {idx > 0 && !atEnd && <FootBtn onClick={() => go(-1)} aria-label="Previous section"><ChevronLeft size={22} /></FootBtn>}
        {atEnd ? (
          hasQuiz && onQuiz ? (
            <>
              {onNext && <FootBtn onClick={onNext} aria-label="Next lesson"><SkipForward size={20} /></FootBtn>}
              <FootBtn primary onClick={onQuiz}>Take the quiz <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
            </>
          ) : onNext ? (
            <FootBtn primary onClick={onNext}>Next lesson <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
          ) : (
            // Last lesson of the topic — keep the thread going rather than
            // dropping the student back on the list they came from.
            <>
              <FootBtn onClick={onRevise} aria-label="Revise this course"><Layers size={19} /></FootBtn>
              {onward
                ? <FootBtn primary onClick={onward.go}>{onward.label} <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
                : <FootBtn primary onClick={onExit}>Back to topic</FootBtn>}
            </>
          )
        ) : (
          <FootBtn primary onClick={() => go(1)}>
            {idx === 0 ? 'Start reading' : idx === total - 2 ? 'Finish' : 'Continue'}
            <ArrowRight size={19} strokeWidth={2.5} />
          </FootBtn>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Quiz player
   ════════════════════════════════════════════════════════════════════════ */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Normalise both quiz schemas into one shape.
type NormQ = { question: string; options: string[]; correct: Set<number>; multi: boolean; hint?: string; explanation?: string; difficulty?: string };

function normaliseQuestions(content: any): NormQ[] {
  const out: NormQ[] = [];
  for (const q of content?.questions ?? []) {
    const isTf = q.type === 'true_false';
    const isMaq = q.type === 'maq';
    const options: string[] = isTf ? ['True', 'False'] : (q.options ?? []).map((o: string) => String(o).replace(/^[A-F]\)\s*/, ''));
    const correct = new Set<number>(
      isTf ? [String(q.answer).toLowerCase() === 'true' ? 0 : 1]
        : (Array.isArray(q.answer) ? q.answer : [q.answer])
          .map((l: any) => LETTERS.indexOf(String(l).trim().toUpperCase()))
          .filter((n: number) => n >= 0));
    if (options.length && correct.size) out.push({ question: q.question, options, correct, multi: isMaq, hint: q.hint, explanation: q.explanation, difficulty: q.difficulty });
  }
  if (!out.length) {
    for (const q of content?.mcq ?? []) {
      if ((q.options ?? []).length && q.answer_index != null) {
        out.push({ question: q.question, options: q.options, correct: new Set([q.answer_index]), multi: false, explanation: q.explanation });
      }
    }
  }
  return out;
}

function QuizPlayer({ content, meta, onScore, onNext, onward, onExit }: {
  content: any;
  meta: { title: string; code: string };
  onScore: (score: number, total: number, answers: unknown[]) => void;
  onNext: (() => void) | null;
  onward: Onward;
  onExit: () => void;
}) {
  const questions = useMemo(() => normaliseQuestions(content), [content]);
  // Which questions this run covers, as indices into `questions`. A full run is
  // every question; a "retry missed" run is the subset the student got wrong.
  const [order, setOrder] = useState<number[]>(() => questions.map((_, i) => i));
  // Practice runs (retry-missed) are never reported: the backend clamps a
  // partial total up to the real question count, so posting 2/2 from a subset
  // would read as a perfect full attempt and inflate mastery.
  const [practice, setPractice] = useState(false);
  // idx: -1 cover, 0..order.length-1 questions, order.length = results
  const [idx, setIdx] = useState(-1);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [results, setResults] = useState<{ qi: number; ok: boolean; picked: number[] }[]>([]);
  const [openRecap, setOpenRecap] = useState<number | null>(null);
  const reported = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const total = order.length;
  const q = idx >= 0 && idx < total ? questions[order[idx]] : null;
  const isCorrect = q ? picked.length === q.correct.size && picked.every(p => q.correct.has(p)) : false;

  const advance = () => {
    setPicked([]); setChecked(false); setHintOpen(false);
    setIdx(i => i + 1);
    bodyRef.current?.scrollTo({ top: 0 });
  };
  const check = () => {
    if (!q || !picked.length) return;
    const ok = isCorrectFor(q, picked);
    // Haptic tick where supported (Android Chrome); silently no-ops on iOS.
    try { navigator.vibrate?.(ok ? 10 : [30, 40, 30]); } catch { /* unsupported */ }
    setChecked(true);
    setResults(r => [...r, { qi: order[idx], ok, picked: [...picked] }]);
  };
  const isCorrectFor = (qq: NormQ, sel: number[]) => sel.length === qq.correct.size && sel.every(p => qq.correct.has(p));
  const pick = (oi: number) => {
    if (checked || !q) return;
    if (q.multi) setPicked(p => (p.includes(oi) ? p.filter(x => x !== oi) : [...p, oi]));
    else setPicked([oi]);
  };

  const score = results.filter(r => r.ok).length;
  const missed = results.filter(r => !r.ok).map(r => r.qi);
  const restart = (subset: number[] | null) => {
    setOrder(subset ?? questions.map((_, i) => i));
    setPractice(!!subset);
    setResults([]); setPicked([]); setChecked(false); setOpenRecap(null);
    setIdx(subset ? 0 : -1);
    if (!subset) reported.current = false;
  };
  useEffect(() => {
    if (idx === total && total > 0 && !reported.current && !practice) {
      reported.current = true;
      onScore(score, total, results.map(r => ({
        question_index: r.qi, picked: r.picked, correct: r.ok,
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!questions.length) {
    return (
      <div className="st-player-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--st-text-2)', font: '500 14px var(--st-sans)' }}>No quiz questions yet.</div>
      </div>
    );
  }

  // ── cover ──
  if (idx === -1) {
    return (
      <>
        <div className="st-player-body" style={{ display: 'flex' }}>
          <div className="st-page-in" style={{ margin: 'auto 0' }}>
            <div className="st-eyebrow" style={{ color: 'var(--st-lime-text)' }}>{meta.code} · Quiz</div>
            <h1 style={{ font: '700 30px/1.18 var(--st-display)', letterSpacing: '-0.025em', margin: '10px 0 12px' }}>{meta.title}</h1>
            <p style={{ font: '500 14.5px/1.65 var(--st-sans)', color: 'var(--st-text-2)', margin: 0 }}>
              {questions.length} question{questions.length === 1 ? '' : 's'} · instant feedback · your best score counts toward mastery.
            </p>
          </div>
        </div>
        <div className="st-player-foot">
          <FootBtn primary onClick={advance}>Start quiz <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
        </div>
      </>
    );
  }

  // ── results ──
  if (idx >= total) {
    const pct = Math.round((score / total) * 100);
    const strong = pct >= 70;
    return (
      <>
        <div className="st-player-body" style={{ position: 'relative' }}>
          {pct === 100 && !practice && <StudioCelebrate count={30} />}
          <div className="st-page-in" style={{ textAlign: 'center', paddingTop: 8 }} aria-live="polite">
            <div style={{ position: 'relative', width: 132, height: 132, margin: '0 auto 18px' }}>
              <svg width={132} height={132} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={66} cy={66} r={58} fill="none" strokeWidth={9} stroke="rgba(255,255,255,.1)" />
                <circle
                  cx={66} cy={66} r={58} fill="none" strokeWidth={9} strokeLinecap="round"
                  stroke={strong ? 'var(--st-lime-text)' : pct >= 40 ? 'var(--st-aqua)' : '#fb7185'}
                  strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - pct / 100)}
                  style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ font: '700 30px var(--st-display)' }}>{pct}%</span>
                <span style={{ font: '600 11px var(--st-sans)', color: 'var(--st-text-3)' }}>{score}/{total}</span>
              </div>
            </div>
            <div style={{ font: '700 24px var(--st-display)', letterSpacing: '-0.02em' }}>
              {practice ? (pct === 100 ? 'Nailed them.' : 'Practice run.')
                : pct === 100 ? 'Flawless.' : strong ? 'Strong work.' : pct >= 40 ? 'Getting there.' : 'Worth a re-read.'}
            </div>
            <div style={{ font: '500 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)', margin: '6px auto 0', maxWidth: 264 }}>
              {practice
                ? 'Practice isn’t recorded — retake the full quiz to update your score.'
                : `Your attempt has been recorded${strong ? ' — this topic is looking solid.' : '. Re-read the lesson and try again.'}`}
            </div>
          </div>

          {/* Answer review. Without it the score is a verdict with no lesson
              attached — the student can't tell which ideas they missed. */}
          <div style={{ marginTop: 22 }}>
            <div className="st-eyebrow" style={{ marginBottom: 8 }}>Your answers</div>
            <div className="st-card" style={{ overflow: 'hidden' }}>
              {results.map((r, i) => {
                const qq = questions[r.qi];
                const open = openRecap === i;
                return (
                  <div key={i} style={{ borderBottom: i < results.length - 1 ? '1px solid var(--st-border)' : 'none' }}>
                    <button
                      onClick={() => setOpenRecap(open ? null : i)}
                      className="st-press"
                      aria-expanded={open}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', textAlign: 'left',
                        padding: '12px 14px', border: 'none', background: 'transparent', color: 'var(--st-text)',
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: 99, flexShrink: 0, marginTop: 1,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: r.ok ? 'rgba(74,222,128,.16)' : 'rgba(251,113,133,.16)',
                        color: r.ok ? '#4ade80' : '#fb7185',
                      }}>
                        {r.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, font: '500 12.5px/1.5 var(--st-sans)', color: 'var(--st-text-2)' }}>
                        {qq.question}
                      </span>
                      <ChevronDown
                        size={15} color="var(--st-text-3)"
                        style={{ flexShrink: 0, marginTop: 3, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}
                      />
                    </button>
                    {open && (
                      <div style={{ padding: '0 14px 13px 46px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {!r.ok && (
                          <div style={{ font: '500 12px/1.5 var(--st-sans)', color: '#fb7185' }}>
                            You chose {r.picked.map(p => LETTERS[p]).join(', ') || '—'}
                          </div>
                        )}
                        <div style={{ font: '600 12px/1.5 var(--st-sans)', color: '#4ade80' }}>
                          Correct: {[...qq.correct].sort((a, b) => a - b).map(c => LETTERS[c]).join(', ')} — {[...qq.correct].sort((a, b) => a - b).map(c => qq.options[c]).join(' / ')}
                        </div>
                        {qq.explanation && (
                          <div style={{ font: '500 12px/1.6 var(--st-sans)', color: 'var(--st-text-3)' }}>{inline(qq.explanation)}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="st-player-foot">
          <FootBtn onClick={() => restart(null)} aria-label="Retake the full quiz">
            <RotateCcw size={20} />
          </FootBtn>
          {missed.length > 0 ? (
            <FootBtn primary onClick={() => restart(missed)}>
              Retry {missed.length} missed <ArrowRight size={19} strokeWidth={2.5} />
            </FootBtn>
          ) : onNext ? (
            <>
              <FootBtn onClick={onExit} aria-label="Back to topic"><X size={20} /></FootBtn>
              <FootBtn primary onClick={onNext}>Next lesson <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
            </>
          ) : onward ? (
            <FootBtn primary onClick={onward.go}>{onward.label} <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
          ) : (
            <FootBtn primary onClick={onExit}>Done</FootBtn>
          )}
        </div>
      </>
    );
  }

  // ── question ──
  return (
    <>
      <div style={{ padding: '2px 22px 10px' }}>
        <Segs total={total} done={idx + (checked ? 1 : 0)} />
      </div>
      <div className="st-player-body" ref={bodyRef}>
        <div key={idx} className="st-page-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="st-eyebrow" style={{ color: 'var(--st-aqua)' }}>
              {practice ? 'Practice · ' : ''}Question {idx + 1} of {total}
            </span>
            {q!.difficulty && <span className="st-chip" style={{ padding: '3px 10px', fontSize: 11 }}>{q!.difficulty}</span>}
          </div>
          <h2 style={{ font: '700 21px/1.35 var(--st-display)', letterSpacing: '-0.015em', margin: '0 0 18px', color: 'var(--st-text)' }}>
            {inline(asText(q!.question))}
          </h2>
          {q!.multi && !checked && <div style={{ font: '600 12px var(--st-sans)', color: 'var(--st-text-3)', margin: '-8px 0 12px' }}>Select all that apply</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q!.options.map((o, oi) => {
              const sel = picked.includes(oi);
              const cls = checked
                ? q!.correct.has(oi) ? 'st-opt good' : sel ? 'st-opt bad' : 'st-opt'
                : sel ? 'st-opt sel' : 'st-opt';
              return (
                <button key={oi} className={cls} disabled={checked} onClick={() => pick(oi)}>
                  <span className="st-opt-letter">{LETTERS[oi] ?? oi + 1}</span>
                  <span style={{ flex: 1 }}>{inline(o, `o${oi}`)}</span>
                  {checked && q!.correct.has(oi) && <Check size={17} color="#4ade80" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
          {!checked && q!.hint && (
            hintOpen
              ? <div className="st-callout" style={{ borderLeft: '3px solid var(--st-violet)', marginTop: 16 }}>
                  <span className="st-callout-k" style={{ color: 'var(--st-violet)' }}>Hint</span>
                  <span style={{ font: '450 13.5px/1.6 var(--st-sans)', color: 'var(--st-text-2)' }}>{inline(asText(q!.hint))}</span>
                </div>
              : <button onClick={() => setHintOpen(true)} className="st-chip st-press" style={{ marginTop: 16, color: 'var(--st-violet)', borderColor: 'rgba(167,139,250,.4)' }}>
                  <Lightbulb size={13} /> Show hint
                </button>
          )}
        </div>
      </div>

      {checked && (
        <div
          className="st-sheet"
          style={isCorrect
            ? { background: 'rgba(74,222,128,.1)', borderColor: 'rgba(74,222,128,.4)' }
            : { background: 'rgba(251,113,133,.09)', borderColor: 'rgba(251,113,133,.4)' }}
        >
          <div style={{ font: '700 15px var(--st-display)', color: isCorrect ? '#4ade80' : '#fb7185' }}>
            {isCorrect ? 'Correct!' : `Not quite — it's ${[...q!.correct].sort((a, b) => a - b).map(n => LETTERS[n]).join(', ')}.`}
          </div>
          {q!.explanation && <div style={{ font: '450 13px/1.6 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 5 }}>{inline(asText(q!.explanation))}</div>}
        </div>
      )}

      <div className="st-player-foot">
        {checked
          ? <FootBtn primary onClick={advance}>{idx === questions.length - 1 ? 'See results' : 'Continue'} <ArrowRight size={19} strokeWidth={2.5} /></FootBtn>
          : <FootBtn primary disabled={!picked.length} onClick={check}>Check answer</FootBtn>}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Slides player — horizontal snap deck
   ════════════════════════════════════════════════════════════════════════ */

function SlidesPlayer({ content, hasQuiz, onQuiz, onNotes, onSeen }: {
  content: any;
  hasQuiz: boolean;
  onQuiz: (() => void) | null;
  onNotes: () => void;
  // Fired once when the deck is opened and once when it is finished — slides
  // were the only format leaving no trace at all.
  onSeen: (done: boolean) => void;
}) {
  const slides: any[] = content?.slides ?? [];
  const deckRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  // Slide stride = width + the deck's flex gap. Dividing by clientWidth alone
  // drifts by one gap per slide, so on long decks the computed index ran ahead
  // of the real one and jump() snapped back to the same slide — navigation
  // appeared stuck a couple of slides before the end (e.g. "29/31").
  const stride = (el: HTMLElement) => {
    const a = el.children[0] as HTMLElement | undefined;
    const b = el.children[1] as HTMLElement | undefined;
    return a && b ? b.offsetLeft - a.offsetLeft : el.clientWidth;
  };
  const onScroll = () => {
    const el = deckRef.current;
    if (!el) return;
    setIdx(Math.max(0, Math.min(slides.length - 1, Math.round(el.scrollLeft / stride(el)))));
  };
  const jump = (d: 1 | -1) => {
    const el = deckRef.current;
    if (!el) return;
    el.scrollTo({ left: (idx + d) * stride(el), behavior: 'smooth' });
  };

  const seenOpen = useRef(false);
  const seenDone = useRef(false);
  useEffect(() => {
    if (!slides.length || seenOpen.current) return;
    seenOpen.current = true;
    onSeen(false);
  }, [slides.length, onSeen]);
  useEffect(() => {
    if (!slides.length || seenDone.current || idx < slides.length - 1) return;
    seenDone.current = true;
    onSeen(true);
  }, [idx, slides.length, onSeen]);

  const atEnd = idx === slides.length - 1;
  if (!slides.length) {
    return (
      <div className="st-player-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--st-text-2)', font: '500 14px var(--st-sans)' }}>No slides yet.</div>
      </div>
    );
  }
  return (
    <>
      <div className="st-deck" ref={deckRef} onScroll={onScroll} style={{ flex: 1, minHeight: 0 }}>
        {slides.map((s: any, i: number) => {
          const bullets: string[] = (s.body_blocks ?? []).filter((b: any) => typeof b === 'string' && b.trim());
          // `code` is a {content, language} object from the generator — and it is
          // present (with null content) even on non-code slides, so never
          // stringify it wholesale; extract the text or skip.
          const codeText: string | null =
            typeof s.code === 'string' && s.code.trim() ? s.code
              : typeof s.code?.content === 'string' && s.code.content.trim() ? s.code.content
                : typeof s.code_block === 'string' && s.code_block.trim() ? s.code_block : null;
          const hasVisual = !!(s.visual && (s.visual.mermaid_code || (s.visual.rows?.length ?? 0) > 0));
          // Same layout fallback chain as the faculty reader's SlideCard.
          const layout: string = s.layout
            ?? (s.myth || s.reality ? 'myth_reality' : codeText ? 'code' : hasVisual ? 'visual' : bullets.length ? 'bullets' : 'statement');
          const half = Math.ceil(bullets.length / 2);
          // Quiz slides arrive as flat bullets ("Q1. …", "A) …" … "D) …") — style
          // questions bold and options as indented answer chips so the two are
          // visually distinct instead of one undifferentiated bullet list.
          const renderBullets = (items: any[], kb: string) => items
            .filter(b => b != null && asText(b).trim())
            .map((b, bi) => {
              const t = asText(b).trim();
              if (/^[A-D]\)\s/.test(t)) {
                return (
                  <div key={`${kb}${bi}`} style={{
                    margin: '0 0 6px 16px', padding: '7px 12px', borderRadius: 10,
                    border: '1px solid var(--st-border-2)', background: 'var(--st-glass)',
                    font: '450 13.5px/1.5 var(--st-sans)', color: 'var(--st-text-2)',
                  }}>{inline(t, `${kb}${bi}`)}</div>
                );
              }
              const isQ = /^Q\d+[.)]\s/i.test(t);
              return (
                <div key={`${kb}${bi}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, marginTop: isQ && bi > 0 ? 10 : 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--st-lime)', flexShrink: 0, marginTop: 8 }} />
                  <span style={{ font: `${isQ ? 600 : 450} 14px/1.6 var(--st-sans)`, color: isQ ? 'var(--st-text)' : 'var(--st-text-2)' }}>{inline(t, `${kb}${bi}`)}</span>
                </div>
              );
            });
          const tintCard = (label: string, color: string, body: ReactNode, key?: string) => (
            <div key={key} style={{ borderRadius: 14, padding: '12px 14px', background: `color-mix(in oklab, ${color} 9%, transparent)`, border: `1px solid color-mix(in oklab, ${color} 35%, transparent)` }}>
              <div className="st-eyebrow" style={{ color, marginBottom: 6 }}>{label}</div>
              {body}
            </div>
          );
          return (
            <div key={i} className="st-slide">
              {s.role && <div className="st-eyebrow" style={{ color: 'var(--st-aqua)', marginBottom: 8 }}>{s.role}</div>}
              {s.kicker && <div className="st-eyebrow" style={{ color: 'var(--st-text-3)', marginBottom: 6 }}>{asText(s.kicker)}</div>}
              <div style={{ font: '700 21px/1.25 var(--st-display)', letterSpacing: '-0.02em', color: 'var(--st-text)', marginBottom: 14 }}>
                {inline(asText(s.title), `st${i}`)}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 11 }}>
                {layout === 'myth_reality' ? (
                  <>
                    {tintCard('✗ Myth', '#fb7185', <>
                      {s.myth && <div style={{ font: '600 14px/1.5 var(--st-sans)', color: 'var(--st-text)', marginBottom: 6 }}>{inline(asText(s.myth), `my${i}`)}</div>}
                      {renderBullets(bullets.slice(0, half), `s${i}m`)}
                    </>)}
                    {tintCard('✓ Reality', '#4ade80', <>
                      {s.reality && <div style={{ font: '600 14px/1.5 var(--st-sans)', color: 'var(--st-text)', marginBottom: 6 }}>{inline(asText(s.reality), `re${i}`)}</div>}
                      {renderBullets(bullets.slice(half), `s${i}r`)}
                    </>)}
                  </>
                ) : layout === 'two_column' ? (
                  <>
                    {tintCard(asText(s.left_heading) || 'Advantages', '#4ade80', <>{renderBullets(s.left_bullets ?? [], `s${i}l`)}</>)}
                    {tintCard(asText(s.right_heading) || 'Limitations', '#fb7185', <>{renderBullets(s.right_bullets ?? [], `s${i}rt`)}</>)}
                  </>
                ) : layout === 'terminology' ? (
                  (s.terms ?? []).map((t: any, ti: number) => (
                    <div key={ti} style={{ borderRadius: 14, padding: '10px 14px', background: 'var(--st-card, rgba(255,255,255,.04))', border: '1px solid var(--st-border-2)' }}>
                      <span style={{ font: '700 13.5px var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(t?.term), `tm${i}${ti}`)}</span>
                      <div style={{ font: '450 13px/1.55 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 2 }}>{inline(asText(t?.definition), `td${i}${ti}`)}</div>
                    </div>
                  ))
                ) : layout === 'definition' && s.definition_core ? (
                  <>
                    <div style={{ borderRadius: 14, padding: '13px 16px', background: 'rgba(205,244,99,.08)', borderLeft: '3px solid var(--st-lime)' }}>
                      <div style={{ font: '600 14.5px/1.55 var(--st-sans)', color: 'var(--st-text)' }}>{inline(asText(s.definition_core), `dc${i}`)}</div>
                    </div>
                    {renderBullets(bullets, `s${i}b`)}
                  </>
                ) : (
                  <>
                    {codeText && layout !== 'visual' && <Code code={codeText} language={typeof s.code === 'object' ? s.code?.language : null} />}
                    {hasVisual && (s.visual.mermaid_code
                      ? <Mermaid code={String(s.visual.mermaid_code)} />
                      : <Tbl cols={s.visual.columns ?? []} rows={s.visual.rows ?? []} />)}
                    {renderBullets(bullets, `s${i}b`)}
                  </>
                )}
                {(s.sections ?? []).map((sec: any, si: number) => (
                  <div key={si}>
                    {sec.heading && <div style={{ font: '700 13px var(--st-display)', color: 'var(--st-text)', marginBottom: 6 }}>{inline(asText(sec.heading), `sh${si}`)}</div>}
                    {renderBullets(sec.bullets ?? [], `sec${si}b`)}
                  </div>
                ))}
              </div>
              {s.takeaway && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 14, flexShrink: 0,
                  background: 'rgba(205,244,99,.1)', border: '1px solid rgba(205,244,99,.3)',
                  font: '600 13px/1.5 var(--st-sans)', color: 'var(--st-lime-text)',
                }}>
                  ★ {inline(asText(s.takeaway), `tk${i}`)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="st-player-foot" style={{ alignItems: 'center' }}>
        <FootBtn onClick={() => jump(-1)} disabled={idx === 0} aria-label="Previous slide" style={{ opacity: idx === 0 ? 0.4 : 1 }}><ChevronLeft size={22} /></FootBtn>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {slides.length <= 12 ? slides.map((_, i) => (
            <span key={i} style={{
              width: i === idx ? 18 : 6, height: 6, borderRadius: 99, transition: 'width .25s, background .25s',
              background: i === idx ? 'var(--st-lime)' : 'rgba(255,255,255,.2)',
            }} />
          )) : (
            <span style={{ font: '700 13px var(--st-display)', color: 'var(--st-text-2)', fontVariantNumeric: 'tabular-nums' }}>
              {idx + 1} / {slides.length}
            </span>
          )}
        </div>
        {/* The last slide used to be a disabled arrow — a full stop with no
            way onward. Hand off to the quiz or the notes instead. */}
        {atEnd ? (
          hasQuiz && onQuiz ? (
            <FootBtn primary onClick={onQuiz} style={{ flex: 1 }}>
              Take the quiz <ArrowRight size={19} strokeWidth={2.5} />
            </FootBtn>
          ) : (
            <FootBtn primary onClick={onNotes} style={{ flex: 1 }}>
              Read the notes <ArrowRight size={19} strokeWidth={2.5} />
            </FootBtn>
          )
        ) : (
          <FootBtn onClick={() => jump(1)} aria-label="Next slide">
            <ArrowRight size={22} />
          </FootBtn>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════════════════ */

export default function StudioLesson({ type }: { type: ConceptArtType }) {
  const navigate = useNavigate();
  const { id: courseId, topicId, conceptId } = useParams();
  const { job, plan, content, loading, error } = useLesson(topicId, conceptId, type);

  const concepts: any[] = plan?.concept_inventory ?? [];
  const cIdx = concepts.findIndex((c: any) => c.concept_id === conceptId);
  const conceptName = cIdx >= 0 ? concepts[cIdx].concept_name : 'Lesson';
  const topicPath = `/study/courses/${courseId}/topic/${topicId}`;
  const base = topicPath;

  // Course detail powers the cover eyebrow and, at the end of a topic, the
  // hand-off to whatever comes next in the syllabus.
  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  useEffect(() => {
    if (!courseId) return;
    studentApi.course(courseId).then(setCourse).catch(() => {});
  }, [courseId]);
  const code = course?.code ?? course?.name ?? '';

  // The next topic a student can open once this one runs out of lessons.
  const nextTopic = useMemo(() => {
    if (!course || !topicId) return null;
    const flat = course.units.flatMap(u => u.topics);
    const here = flat.findIndex(t => t.id === topicId);
    if (here < 0) return null;
    return flat.slice(here + 1).find(t => t.published_lessons > 0) ?? null;
  }, [course, topicId]);

  // Lessons with $…$ math (or LaTeX mis-wrapped in `code` fences) load KaTeX
  // once, then re-render.
  const [, setMathTick] = useState(0);
  useEffect(() => {
    if (!content || katexMod) return;
    try {
      const s = JSON.stringify(content);
      // Serialized content doubles backslashes, so match `…\\command inside a
      // `code` fence (mis-wrapped LaTeX with no surrounding $…$).
      if (s.includes('$') || /`[^`]*\\\\[a-zA-Z]/.test(s)) loadKatex().then(() => setMathTick(t => t + 1));
    } catch { /* non-serialisable content — skip */ }
  }, [content]);

  // Dwell clock: seconds with the tab visible while reading this lesson.
  const dwellRef = useRef(0);
  useEffect(() => {
    if (type !== 'student_notes' || !content) return;
    dwellRef.current = 0;
    const t = window.setInterval(() => { if (!document.hidden) dwellRef.current += 1; }, 1000);
    return () => window.clearInterval(t);
  }, [type, content, conceptId]);

  // Page-turn telemetry: keeps the resume pointer + "% read" fresh. Page
  // turns are user-paced, so no extra throttling is needed.
  const lastPage = useRef(0);
  // Per-section dwell: how long the student stayed on the page they are
  // leaving. Lesson-level dwell can't tell a well-written section from one
  // students bounce off, which is what the generation critic needs to know.
  const sectionEnter = useRef(0);
  const reportPage = useCallback((idx: number, total: number, leaving?: { key: string; title: string }) => {
    if (!topicId || !conceptId) return;
    lastPage.current = Math.min(100, Math.round((idx / Math.max(total - 1, 1)) * 100));
    studentApi.progress({
      course_id: courseId, topic_id: topicId, concept_id: conceptId,
      artifact_type: 'student_notes',
      scroll_pct: lastPage.current,
      dwell_sec: dwellRef.current,
    }).catch(() => {});

    const spent = dwellRef.current - sectionEnter.current;
    sectionEnter.current = dwellRef.current;
    if (leaving && spent > 0) {
      track('section_dwell', {
        concept_id: conceptId, topic_id: topicId,
        section: leaving.key, section_title: leaving.title, dwell_sec: spent,
      });
    }
  }, [courseId, topicId, conceptId]);

  // Dwell only rode along on page turns, so a student who read one long page
  // and then backgrounded the tab reported almost nothing. Flush on hide and
  // on unmount, with keepalive so the request survives the page going away.
  useEffect(() => {
    if (type !== 'student_notes' || !content || !topicId || !conceptId) return;
    const flush = () => {
      if (dwellRef.current <= 0) return;
      studentApi.progress({
        course_id: courseId, topic_id: topicId, concept_id: conceptId,
        artifact_type: 'student_notes',
        scroll_pct: lastPage.current, dwell_sec: dwellRef.current,
      }, { keepalive: true }).catch(() => {});
    };
    const onHide = () => { if (document.hidden) flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); flush(); };
  }, [type, content, courseId, topicId, conceptId]);

  // The next lesson a student can open (first later concept with approved notes).
  const nextConcept = useMemo(() => {
    if (cIdx < 0) return null;
    for (let i = cIdx + 1; i < concepts.length; i++) {
      if (approvedFor(job, concepts[i].concept_id, 'student_notes')) return concepts[i];
    }
    return null;
  }, [concepts, cIdx, job]);
  const goNext = nextConcept ? () => navigate(`${base}/notes/${nextConcept.concept_id}`) : null;

  // "Next lesson" is the primary CTA at the end of every lesson, so fetch it
  // while the student is still reading — the tap then paints immediately.
  useEffect(() => {
    if (!content || !job?.id || !nextConcept) return;
    const t = window.setTimeout(() => prefetchConcept(job.id, nextConcept.concept_id), 1500);
    return () => window.clearTimeout(t);
  }, [content, job?.id, nextConcept]);

  // Where a student goes when this topic has no more lessons. Landing on a
  // bare "Back to topic" at the end of a topic ends the session; the syllabus
  // almost always has an obvious next move, so offer it.
  const onward: Onward = useMemo(() => {
    if (nextTopic) {
      return {
        label: `Next: ${nextTopic.title}`,
        go: () => navigate(nextTopic.first_concept_id
          ? `/study/courses/${courseId}/topic/${nextTopic.id}/notes/${nextTopic.first_concept_id}`
          : `/study/courses/${courseId}/topic/${nextTopic.id}`),
      };
    }
    if (course) return { label: 'See your mastery', go: () => navigate(`/study/courses/${courseId}/mastery`) };
    return null;
  }, [nextTopic, course, courseId, navigate]);
  const goRevise = useCallback(() => navigate(`/study/courses/${courseId}/revision`), [navigate, courseId]);

  // Progress: viewed on load (notes), completed when the reader finishes.
  useEffect(() => {
    if (!content || !topicId || !conceptId || type !== 'student_notes') return;
    track('studio_lesson_opened', { concept_id: conceptId });
    studentApi.progress({ course_id: courseId, topic_id: topicId, concept_id: conceptId, artifact_type: type, status: 'viewed' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, topicId, conceptId, type]);

  // A lesson counts as read only when most of it was opened AND the student
  // spent a plausible fraction of its estimated reading time on it. Tapping
  // Continue fifteen times in ten seconds leaves it at "viewed", so mastery
  // measures reading rather than button presses. (A quiz submission still
  // force-completes server-side — answering the questions is the stronger
  // signal.) Lessons with no reading-time estimate keep the old behaviour.
  const markComplete = useCallback((visitedRatio: number) => {
    if (!topicId || !conceptId) return false;
    const mins = Number(content?.opening?.sections?.topic_overview?.subtopic_metadata?.reading_time_minutes);
    const needSec = Number.isFinite(mins) && mins > 0 ? mins * 60 * 0.4 : 0;
    const earned = visitedRatio >= 0.85 && dwellRef.current >= needSec;
    studentApi.progress({
      course_id: courseId, topic_id: topicId, concept_id: conceptId,
      artifact_type: 'student_notes', status: earned ? 'completed' : 'viewed',
      scroll_pct: Math.round(visitedRatio * 100), dwell_sec: dwellRef.current,
    }).catch(() => {});
    track(earned ? 'studio_lesson_completed' : 'studio_lesson_skimmed', {
      concept_id: conceptId, visited_pct: Math.round(visitedRatio * 100), dwell_sec: dwellRef.current,
    });
    return earned;
  }, [courseId, topicId, conceptId, content]);

  // Slides progress is telemetry and UI state only — mastery is computed from
  // notes and quizzes, so a slide row never moves a student's score.
  const markSlidesSeen = useCallback((done: boolean) => {
    if (!topicId || !conceptId) return;
    studentApi.progress({
      course_id: courseId, topic_id: topicId, concept_id: conceptId,
      artifact_type: 'slides', status: done ? 'completed' : 'viewed',
    }).catch(() => {});
    if (done) track('studio_slides_finished', { concept_id: conceptId });
  }, [courseId, topicId, conceptId]);

  const recordScore = useCallback((score: number, total: number, answers: unknown[]) => {
    if (!topicId || !conceptId || !total) return;
    studentApi.quizAttempt({
      course_id: courseId, topic_id: topicId, concept_id: conceptId, score, total, answers,
    }).catch(() => {});
    track('studio_quiz_submitted', { concept_id: conceptId, score, total });
  }, [courseId, topicId, conceptId]);

  const hasQuiz = conceptId ? approvedFor(job, conceptId, 'quiz') : false;

  return (
    <div className="st-player">
      <div className="st-player-head">
        <HeadBar onClose={() => navigate(topicPath)}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 14px/1.25 var(--st-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conceptName}
            </div>
          </div>
          {conceptId && <ModePills base={base} conceptId={conceptId} job={job} active={type} />}
        </HeadBar>
      </div>

      {loading && !error && (
        <div className="st-player-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
          <div className="st-skeleton" style={{ height: 30, width: '70%' }} />
          <div className="st-skeleton" style={{ height: 16, width: '45%' }} />
          <div className="st-skeleton" style={{ height: 220, marginTop: 10 }} />
        </div>
      )}

      {!loading && (error || !content) && (
        <div className="st-player-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Sparkles size={26} color="var(--st-text-3)" style={{ margin: '0 auto 10px' }} />
            <div style={{ font: '700 16px var(--st-display)' }}>Not available yet</div>
            <div style={{ font: '500 13px/1.6 var(--st-sans)', color: 'var(--st-text-2)', marginTop: 4, maxWidth: 240 }}>
              {error || 'This content hasn’t been published. Check back soon.'}
            </div>
            <button onClick={() => navigate(topicPath)} className="st-chip st-press" style={{ marginTop: 16 }}>
              <ArrowLeft size={13} /> Back to topic
            </button>
          </div>
        </div>
      )}

      {!loading && content && type === 'student_notes' && (
        <NotesPlayer
          key={conceptId}
          content={content}
          meta={{ title: conceptName, code, lessonNo: cIdx >= 0 ? cIdx + 1 : null }}
          onDone={markComplete}
          hasQuiz={hasQuiz}
          onQuiz={hasQuiz ? () => navigate(`${base}/quiz/${conceptId}`) : null}
          onNext={goNext}
          onward={onward}
          onRevise={goRevise}
          onPage={reportPage}
          onExit={() => navigate(topicPath)}
        />
      )}
      {!loading && content && type === 'quiz' && (
        <QuizPlayer
          key={conceptId} content={content} meta={{ title: conceptName, code }}
          onScore={recordScore} onNext={goNext} onward={onward} onExit={() => navigate(topicPath)}
        />
      )}
      {!loading && content && type === 'slides' && (
        <SlidesPlayer
          key={conceptId}
          content={content}
          hasQuiz={hasQuiz}
          onQuiz={hasQuiz ? () => navigate(`${base}/quiz/${conceptId}`) : null}
          onNotes={() => navigate(`${base}/notes/${conceptId}`)}
          onSeen={markSlidesSeen}
        />
      )}
    </div>
  );
}
