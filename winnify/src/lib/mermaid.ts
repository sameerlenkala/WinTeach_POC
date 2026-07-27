import { sanitizeSvg } from '@/lib/sanitizeSvg';

/**
 * Shared Mermaid renderer for the reader (WinTeach) and the student studio.
 *
 * Diagram source is model-generated, so two things have to be handled here
 * rather than at the call sites:
 *
 *  1. Labels that mermaid cannot parse. `A[grade(score)]` or
 *     `B[cal.month_name[3]]` are a parse error — the flowchart grammar needs
 *     brackets inside label text to be quoted. Models emit these constantly,
 *     so `normalizeMermaid` quotes such labels before we hand them over.
 *  2. Mermaid's error diagram. On a parse failure `mermaid.render` draws its
 *     red "Syntax error in text" graphic into the temporary `#d<id>` sandbox
 *     it appends to <body> and then rethrows — without cleanup, so the graphic
 *     stays in the page (and outlives the React unmount) even though the
 *     component fell back to showing the source. `suppressErrorRendering`
 *     stops it being drawn; the explicit sweep covers the throw-before-render
 *     paths.
 */

let mermaidPromise: Promise<any> | null = null;

const loadMermaid = () =>
  (mermaidPromise ??= import('mermaid').then(m => {
    const mermaid = m.default;
    // htmlLabels must be off: sanitizeSvg (DOMPurify, svg profile) strips
    // <foreignObject>, which is where mermaid puts HTML labels — with them on,
    // every node/edge label vanishes and diagrams render blank.
    mermaid.initialize({
      startOnLoad: false, theme: 'neutral', securityLevel: 'strict',
      htmlLabels: false, flowchart: { htmlLabels: false }, er: { useMaxWidth: true },
      suppressErrorRendering: true,
    } as any);
    return mermaid;
  }));

// Node shapes, longest opener first so `[[` is matched before `[`.
const SHAPES: Array<[open: string, close: string]> = [
  ['[[', ']]'], ['[(', ')]'], ['([', '])'], ['((', '))'], ['{{', '}}'],
  ['[/', '/]'], ['[\\', '\\]'], ['[', ']'], ['(', ')'], ['{', '}'],
];

// Characters that make an unquoted label unparseable.
const NEEDS_QUOTING = /[[\](){}]/;

// What may legally follow a node: end of statement, an edge, a chain (`&`),
// a class assignment (`:::`), or a link/callback suffix.
const AFTER_NODE = /^\s*($|[;&|]|:::|-|=|~|<|\.)/;

/** Index of the closer that ends this label, preferring one followed by valid
 *  syntax so `A[foo(1)] --> B` splits correctly while `A[x[3]]` does not. */
function findClose(line: string, from: number, close: string): number {
  let last = -1;
  for (let i = from; i <= line.length - close.length; i++) {
    if (!line.startsWith(close, i)) continue;
    last = i;
    if (AFTER_NODE.test(line.slice(i + close.length))) return i;
  }
  return last;
}

const quote = (text: string) =>
  (text.startsWith('"') && text.endsWith('"') && text.length >= 2) || !NEEDS_QUOTING.test(text)
    ? text
    : `"${text.replace(/"/g, '#quot;')}"`;

// A bare "..." continuation line — models write it to elide repetitive steps,
// but no diagram grammar accepts it as a statement.
const ELLIPSIS_LINE = /^\s*(\.{2,}|…)\s*$/;

/**
 * Quote flowchart node labels (`A[…]`) and edge labels (`-->|…|`) containing
 * brackets or parentheses, and drop bare "..." continuation lines. Label
 * quoting only touches flowchart/graph source — sequence, class and ER
 * diagrams have their own grammar where these characters are legal — and
 * already-quoted labels are left alone.
 *
 * Mirrors backend/app/services/mermaid_normalize.py, which does the same at
 * generation time; keep the two in step.
 */
export function normalizeMermaid(code: string): string {
  const src = code.trim();
  const lines = src.split('\n').filter(line => !ELLIPSIS_LINE.test(line));
  if (!/^(graph|flowchart)\b/.test(src)) return lines.join('\n');

  return lines.map(line => {
    // `subgraph id [Title]` is the one place a label may be separated from its
    // id by a space, so the node scan below would miss it.
    const sub = line.match(/^(\s*subgraph\s+[\w-]+\s*\[)(.*)(\]\s*)$/);
    if (sub) return sub[1] + quote(sub[2]) + sub[3];
    let out = '';
    let i = 0;
    while (i < line.length) {
      // Edge label: `-->|text|`.
      if (line[i] === '|') {
        const end = line.indexOf('|', i + 1);
        if (end === -1) { out += line[i++]; continue; }
        out += '|' + quote(line.slice(i + 1, end)) + '|';
        i = end + 1;
        continue;
      }
      // A label opener only counts when it directly follows a node id.
      if (!/[\w-]/.test(line[i])) { out += line[i++]; continue; }
      let j = i;
      while (j < line.length && /[\w-]/.test(line[j])) j++;
      const id = line.slice(i, j);
      const shape = SHAPES.find(([open]) => line.startsWith(open, j));
      if (!shape) { out += id; i = j; continue; }
      const [open, close] = shape;
      const end = findClose(line, j + open.length, close);
      if (end === -1) { out += id; i = j; continue; }
      out += id + open + quote(line.slice(j + open.length, end)) + close;
      i = end + close.length;
    }
    return out;
  }).join('\n');
}

let seq = 0;

/**
 * Render Mermaid source to sanitized SVG. Rejects if the source cannot be
 * parsed — callers show the raw source instead — and never leaves a partial
 * render behind in <body>.
 */
export async function renderMermaid(code: string): Promise<string> {
  const mermaid = await loadMermaid();
  const id = `wt-mmd-${++seq}`;
  try {
    const { svg } = await mermaid.render(id, normalizeMermaid(code));
    return sanitizeSvg(svg);
  } finally {
    document.getElementById(`d${id}`)?.remove();
    document.getElementById(id)?.remove();
  }
}
