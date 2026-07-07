// Full-page "exam revision" cheat sheet for a topic's summary artifact.
// Renders the panel-based schema (definition/keyterms/bullets/code/formula/
// table/mistakes/steps) as a dense, print-friendly reference card — grouped by
// subtopic. Falls back to the legacy key_concepts summary shape.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Btn } from './WinTeachUI';
import { IBack, IBook } from './WinTeachIcons';
import { useCourse, useTopic } from '@/api/hooks';
import { generationApi } from '@/api/generation';
import { MathText } from './WinTeachConceptReader';

/* ── inline icons (panel glyphs not in the shared set) ───────────────────── */
const svg = (d: string) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const ITag = svg('M20.6 13.4 12 22l-8-8V4h10l6.6 6.6a2 2 0 0 1 0 2.8z|M7.5 7.5h.01');
const IList = svg('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');
const ICode = svg('m16 18 6-6-6-6M8 6l-6 6 6 6');
const IFx = svg('M4 20c2 0 3-1 3-4l1.5-9C9 4.5 10 3.5 12 4M6 12h6');
const IGrid = svg('M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18');
const IWarn = svg('M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01');
const ISteps = svg('M4 20h4v-4M4 16h8v-4M4 12h12V8M4 8h16V4');
const IPrint = svg('M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z');

type PanelMeta = { fg: string; bg: string; icon: React.FC; label: string };
const PANEL_META: Record<string, PanelMeta> = {
  definition: { fg: W.blueFg, bg: W.blueBg, icon: IBook, label: 'Definition' },
  keyterms: { fg: W.brandTintFg, bg: W.brandTintBg, icon: ITag, label: 'Key Terms' },
  bullets: { fg: W.text2, bg: W.surfaceMuted, icon: IList, label: 'Key Points' },
  code: { fg: W.pinkFg, bg: W.pinkBg, icon: ICode, label: 'Syntax' },
  formula: { fg: W.greenFg, bg: W.greenBg, icon: IFx, label: 'Formula' },
  table: { fg: W.orangeFg, bg: W.orangeBg, icon: IGrid, label: 'Reference' },
  mistakes: { fg: W.redFg, bg: W.redBg, icon: IWarn, label: 'Pitfalls' },
  steps: { fg: W.infoFg, bg: W.infoBg, icon: ISteps, label: 'Procedure' },
};

/* ── text with **bold** + $math$ (cheat-sheet content contract) ──────────── */
function CheatText({ text }: { text: any }) {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2
    ? <b key={i} style={{ fontWeight: 700, color: W.text }}><MathText text={p} /></b>
    : <MathText key={i} text={p} />))}</>;
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 12.5, lineHeight: 1.55,
};

/* ── one panel body by type ──────────────────────────────────────────────── */
function PanelBody({ p }: { p: any }) {
  const meta = PANEL_META[p.type];
  if (p.type === 'definition')
    return <div style={{ fontSize: 13, lineHeight: 1.62, color: W.text }}><CheatText text={p.body} /></div>;

  if (p.type === 'keyterms')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(p.terms ?? []).map((t: any, i: number) => (
          <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: W.text }}>{t.term}</span>
            <span style={{ color: W.text3 }}> — </span>
            <span style={{ color: W.text2 }}><CheatText text={t.def} /></span>
          </div>
        ))}
      </div>
    );

  if (p.type === 'bullets')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(p.items ?? []).map((it: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, lineHeight: 1.5, color: W.text }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: meta.fg, marginTop: 6, flexShrink: 0 }} />
            <span><CheatText text={it} /></span>
          </div>
        ))}
      </div>
    );

  if (p.type === 'steps')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(p.items ?? []).map((it: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.5, color: W.text }}>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: meta.bg, color: meta.fg, fontSize: 10.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
            <span><CheatText text={it} /></span>
          </div>
        ))}
      </div>
    );

  if (p.type === 'code')
    return (
      <div style={{ position: 'relative', ...mono, background: W.surfaceMuted, borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap', overflowX: 'auto', color: W.text, border: `1px solid ${W.border}` }}>
        {p.language && <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: W.text3, fontFamily: W.fontDisplay }}>{p.language}</span>}
        {p.code}
      </div>
    );

  if (p.type === 'formula')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {(p.formulas ?? []).map((f: any, i: number) => (
          <div key={i}>
            <div style={{ ...mono, background: W.surfaceMuted, borderRadius: 8, padding: '9px 12px', color: W.text, textAlign: 'center', border: `1px solid ${W.border}` }}><MathText text={f.formula} /></div>
            {f.meaning && <div style={{ fontSize: 11.5, lineHeight: 1.5, color: W.text2, marginTop: 4 }}><CheatText text={f.meaning} /></div>}
          </div>
        ))}
      </div>
    );

  if (p.type === 'table')
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
          <thead>
            <tr>{(p.headers ?? []).map((h: string, i: number) => (
              <th key={i} style={{ textAlign: 'left', padding: '5px 9px', background: meta.bg, color: meta.fg, fontWeight: 700, fontFamily: W.fontDisplay, whiteSpace: 'nowrap', borderBottom: `1px solid ${W.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {(p.rows ?? []).map((r: any[], ri: number) => (
              <tr key={ri} style={{ background: ri % 2 ? W.surfaceMuted : 'transparent' }}>
                {(Array.isArray(r) ? r : []).map((c: any, ci: number) => (
                  <td key={ci} style={{ padding: '5px 9px', color: W.text, verticalAlign: 'top', borderBottom: `1px solid ${W.border}`, fontFamily: ci === 0 ? W.fontDisplay : undefined, fontWeight: ci === 0 ? 600 : 400 }}><CheatText text={c} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (p.type === 'mistakes')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {(p.items ?? []).map((m: any, i: number) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: W.redFg, background: W.redBg, borderRadius: 6, padding: '5px 8px' }}>
              <b style={{ fontWeight: 700 }}>✗ </b><CheatText text={m.wrong} />
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: W.greenFg, background: W.greenBg, borderRadius: 6, padding: '5px 8px' }}>
              <b style={{ fontWeight: 700 }}>✓ </b><CheatText text={m.right} />
            </div>
          </div>
        ))}
      </div>
    );

  return null;
}

function Panel({ p }: { p: any }) {
  const meta = PANEL_META[p.type];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <div className="cheat-panel" style={{
      breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', marginBottom: 14,
      background: W.card, border: `1px solid ${W.border}`, borderRadius: 12,
      overflow: 'hidden', boxShadow: W.shadowCard,
    }}>
      <div style={{ height: 3, background: meta.fg }} />
      <div style={{ padding: '11px 14px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: meta.bg, color: meta.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ width: 13, height: 13, display: 'flex' }}><Icon /></span>
          </span>
          <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 13.5, color: W.text, flex: 1, lineHeight: 1.3 }}>{p.title}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: meta.fg, fontFamily: W.fontDisplay, flexShrink: 0 }}>{meta.label}</span>
        </div>
        <PanelBody p={p} />
      </div>
    </div>
  );
}

/* ── legacy key_concepts fallback ────────────────────────────────────────── */
function LegacySummary({ content }: { content: any }) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: W.brandTintFg, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Section title="Key concepts">{(content.key_concepts ?? []).map((k: any, i: number) => <div key={i} style={{ marginBottom: 5, fontSize: 13 }}><b>{k.concept}</b>: {k.one_liner}</div>)}</Section>
      {(content.formulas_or_syntax ?? []).length > 0 && (
        <Section title="Formulas / syntax">{content.formulas_or_syntax.map((f: string, i: number) => <div key={i} style={{ ...mono, padding: '5px 10px', background: W.surfaceMuted, borderRadius: 6, marginBottom: 4 }}>{f}</div>)}</Section>
      )}
      {(content.common_mistakes ?? []).length > 0 && (
        <Section title="Common mistakes">{content.common_mistakes.map((m: string, i: number) => <div key={i} style={{ marginBottom: 3, fontSize: 13 }}>• {m}</div>)}</Section>
      )}
      {(content.exam_pointers ?? []).length > 0 && (
        <Section title="Exam pointers">{content.exam_pointers.map((p: string, i: number) => <div key={i} style={{ marginBottom: 3, fontSize: 13 }}>• {p}</div>)}</Section>
      )}
    </div>
  );
}

const PRINT_CSS = `@media print {
  .cheat-noprint { display: none !important; }
  .cheat-cols { columns: 3 340px !important; }
  .cheat-panel { box-shadow: none !important; }
}`;

/* ── page ────────────────────────────────────────────────────────────────── */
export default function WinTeachCheatSheet() {
  const navigate = useNavigate();
  const { id: courseId, topicId } = useParams();
  const { data: course } = useCourse(courseId ?? '');
  const { data: topic } = useTopic(courseId ?? '', topicId ?? '');
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');

  useEffect(() => {
    if (!topicId) return;
    setStatus('loading');
    generationApi.getTopicJob(topicId)
      .then(j => generationApi.getArtifact(j.id, 'summary'))
      .then(r => {
        const c = r.content;
        const has = c && ((c.panels ?? []).length > 0 || (c.key_concepts ?? []).length > 0);
        setContent(c); setStatus(has ? 'ready' : 'empty');
      })
      .catch(() => setStatus('empty'));
  }, [topicId]);

  const courseCode = (course as any)?.code ?? courseId ?? '';
  const topicTitle = (topic as any)?.title ?? content?.topic_title ?? 'Topic';
  const panels: any[] = content?.panels ?? [];

  // Group panels by subtopic in first-seen order; "" → topic-wide bucket.
  const groups = useMemo(() => {
    const order: string[] = [];
    const by: Record<string, any[]> = {};
    for (const p of panels) {
      const st = p.subtopic || '';
      if (!(st in by)) { by[st] = []; order.push(st); }
      by[st].push(p);
    }
    return order.map(st => ({ subtopic: st, panels: by[st] }));
  }, [panels]);

  const studioPath = `/winteach/courses/${courseId}/topic/${topicId}`;

  return (
    <>
      <style>{PRINT_CSS}</style>
      <WinTopbar title="Cheat Sheet" actions={
        <div className="cheat-noprint" style={{ display: 'flex', gap: 8 }}>
          {status === 'ready' && <Btn variant="ghost" onClick={() => window.print()}>
            <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPrint /></span>Print
          </Btn>}
          <Btn variant="ghost" onClick={() => navigate(studioPath)}>
            <span style={{ width: 15, height: 15, display: 'inline-flex' }}><IBack /></span>Back to studio
          </Btn>
        </div>
      } />
      <WinContent>
        <div className="cheat-page" style={{ maxWidth: 1160, margin: '0 auto' }}>

          {/* hero */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, border: `1px solid ${W.border}`, background: W.card, boxShadow: W.shadowCard, padding: '22px 26px', marginBottom: 22 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--app-bg-grad)', opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: W.brandTintFg, background: W.brandTintBg, padding: '3px 9px', borderRadius: 99 }}>Exam Revision Cheat Sheet</span>
                {courseCode && <span style={{ fontSize: 11.5, color: W.text3, fontWeight: 600 }}>{courseCode}</span>}
              </div>
              <h1 style={{ fontFamily: W.fontDisplay, fontWeight: 800, fontSize: 27, lineHeight: 1.2, color: W.text, margin: 0 }}>{topicTitle}</h1>
              {status === 'ready' && panels.length > 0 && (
                <div style={{ fontSize: 12.5, color: W.text2, marginTop: 9 }}>
                  {panels.length} panel{panels.length !== 1 ? 's' : ''}
                  {groups.filter(g => g.subtopic).length > 0 && ` · ${groups.filter(g => g.subtopic).length} subtopic${groups.filter(g => g.subtopic).length !== 1 ? 's' : ''}`}
                  {' · '}last-minute reference — everything to ace the exam
                </div>
              )}
            </div>
          </div>

          {/* subtopic jump chips (multi-subtopic only) */}
          {status === 'ready' && groups.filter(g => g.subtopic).length > 1 && (
            <div className="cheat-noprint" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
              {groups.map((g, i) => g.subtopic && (
                <a key={i} href={`#cheat-${i}`} style={{ fontSize: 12, fontWeight: 600, color: W.text2, background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 99, padding: '4px 12px', textDecoration: 'none' }}>{g.subtopic}</a>
              ))}
            </div>
          )}

          {status === 'loading' && (
            <div style={{ textAlign: 'center', color: W.text2, fontSize: 13.5, padding: '60px 0' }}>Loading cheat sheet…</div>
          )}

          {status === 'empty' && (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: W.text, marginBottom: 6 }}>No cheat sheet yet</div>
              <div style={{ fontSize: 13, color: W.text2, marginBottom: 16 }}>Generate the topic-wide Summary from the studio to build this cheat sheet.</div>
              <Btn variant="primary" onClick={() => navigate(studioPath)}>Back to studio</Btn>
            </div>
          )}

          {status === 'ready' && panels.length === 0 && content?.key_concepts && <LegacySummary content={content} />}

          {status === 'ready' && groups.map((g, i) => (
            <section key={i} id={`cheat-${i}`} style={{ marginBottom: 26, scrollMarginTop: 76 }}>
              {(g.subtopic || groups.length > 1) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 800, fontSize: 16, color: W.text }}>{g.subtopic || 'Topic-wide'}</span>
                  <span style={{ flex: 1, height: 1, background: W.border }} />
                  <span style={{ fontSize: 11, color: W.text3, fontWeight: 600 }}>{g.panels.length}</span>
                </div>
              )}
              <div className="cheat-cols" style={{ columns: '340px', columnGap: 14 }}>
                {g.panels.map((p, pi) => <Panel key={pi} p={p} />)}
              </div>
            </section>
          ))}
        </div>
      </WinContent>
    </>
  );
}
