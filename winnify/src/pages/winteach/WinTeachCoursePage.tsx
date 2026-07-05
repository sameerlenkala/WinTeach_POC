import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { useCourse, useCOs, useCOMap, useSetCourseStatus, useUnits, useSaveCOMap, useUpdateCO, useCourseProgress } from '@/api/hooks';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { BloomBadge, ProgressBar, Card, Btn, Breadcrumb, CoMapTag, Badge, Modal } from './WinTeachUI';
import { IBack, IEdit, IAssess, IDashboard, IArrow } from './WinTeachIcons';
import { coRefFor } from './winteachData';
import type { CourseOutcome, COMapping } from '@/api/types';
import type { TopicProgress } from '@/api/generation';

/** Real generation status for a topic, from the course-progress endpoint. */
function topicGenState(p?: TopicProgress): { label: string; variant: 'green' | 'info' | 'muted' | 'orange'; pct: number } {
  if (!p || (!p.has_plan && !p.status)) return { label: 'Not started', variant: 'muted', pct: 0 };
  if (p.status === 'failed') return { label: 'Plan failed', variant: 'orange', pct: 0 };
  if (!p.has_plan) return { label: 'Planning…', variant: 'info', pct: 5 };
  const total = p.concept_total || 1;
  if (p.notes_approved >= total && total > 0) return { label: 'Complete', variant: 'green', pct: 100 };
  if (p.notes_ready > 0) return { label: `${p.notes_ready}/${total} notes`, variant: 'info', pct: Math.round((p.notes_ready / total) * 100) };
  return { label: 'Plan ready', variant: 'info', pct: 8 };
}

function CellDropdown({ value, onChange, onClose }: { value: number; onChange: (v: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const opts: { v: number; label: string; bg: string; fg: string }[] = [
    { v: 0, label: '–', bg: 'transparent', fg: W.text3 },
    { v: 1, label: '1 · Low',    bg: W.infoBg,   fg: W.infoFg },
    { v: 2, label: '2 · Medium', bg: W.orangeBg,  fg: W.orangeFg },
    { v: 3, label: '3 · High',   bg: W.greenBg,   fg: W.greenFg },
  ];

  return (
    <div ref={ref} style={{ position: 'absolute', zIndex: 100, top: '100%', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(60,50,140,.14)', padding: 6, minWidth: 130, marginTop: 4 }}>
      {opts.map(o => (
        <div key={o.v} onClick={() => { onChange(o.v); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: value === o.v ? 'var(--tint-brand-bg)' : 'transparent', fontWeight: 600, fontSize: 13, color: o.fg !== W.text3 ? o.fg : W.text }}>
          {o.v > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: o.bg, color: o.fg, fontSize: 12 }}>{o.v}</span>}
          {o.label}
        </div>
      ))}
    </div>
  );
}

function IChevronSvg() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] as const;
type BloomLevel = typeof BLOOM_LEVELS[number];

const BLOOM_COLORS: Record<BloomLevel, { bg: string; fg: string }> = {
  Remember:   { bg: 'var(--tint-blue-bg)', fg: 'var(--tint-blue-fg)' },
  Understand: { bg: 'var(--tint-teal-bg)', fg: 'var(--tint-teal-fg)' },
  Apply:      { bg: 'var(--tint-orange-bg)', fg: 'var(--tint-orange-fg)' },
  Analyze:    { bg: 'var(--status-info-bg)', fg: 'var(--status-info)' },
  Evaluate:   { bg: 'var(--tint-pink-bg)', fg: 'var(--tint-pink-fg)' },
  Create:     { bg: 'var(--tint-violet-bg)', fg: 'var(--tint-violet-fg)' },
};

function BloomDropdown({ current, onSelect, onClose }: { current: string; onSelect: (b: BloomLevel) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: 'absolute', zIndex: 200, top: '100%', left: 0, marginTop: 4, background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(60,50,140,.14)', padding: 6, minWidth: 150 }}>
      {BLOOM_LEVELS.map(b => {
        const { bg, fg } = BLOOM_COLORS[b];
        const active = b === current;
        return (
          <div key={b} onClick={() => { onSelect(b); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: active ? bg : 'transparent', fontWeight: 600, fontSize: 13, color: active ? fg : W.text }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: fg, display: 'inline-block', flexShrink: 0 }} />
            {b}
            {active && <span style={{ marginLeft: 'auto', fontSize: 11 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: W.text3, fontSize: 15 }}>
      Loading…
    </div>
  );
}

export default function WinTeachCoursePage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { courses } = useWinTeach();

  // Real API data
  const { data: apiCourse, isLoading: courseLoading } = useCourse(id);
  const { data: apiCOs = [], isLoading: cosLoading } = useCOs(id);
  const { data: apiUnits = [], isLoading: unitsLoading } = useUnits(id);
  const { data: apiMap = [], isLoading: mapLoading } = useCOMap(id);
  const { data: genProgress = [] } = useCourseProgress(id);
  const progById: Record<string, TopicProgress> = {};
  genProgress.forEach(p => { progById[p.topic_id] = p; });
  // Artifact-level generation %: generated artifacts ÷ concepts × 3
  // (notes/slides/quiz), matching the courses list — not a topic average.
  const artReady = genProgress.reduce((s, p) => s + (p.artifact_ready || 0), 0);
  const artTotal = genProgress.reduce((s, p) => s + (p.artifact_total || 0), 0);
  const overallPct = artTotal ? Math.round((artReady / artTotal) * 100) : 0;
  const totalGenCost = genProgress.reduce((s, p) => s + (p.cost_usd || 0), 0);
  const { mutate: setStatus } = useSetCourseStatus();
  const { mutate: saveMap } = useSaveCOMap(id);
  const { mutate: updateCO } = useUpdateCO(id);
  const [openBloom, setOpenBloom] = useState<string | null>(null); // coId
  const [showCOs, setShowCOs] = useState(false);
  const [showMap, setShowMap] = useState(false);
  void unitsLoading;

  // Local editable map: coId → col → level
  const [localMap, setLocalMap] = useState<Record<string, Record<string, number>>>({});
  const [openCell, setOpenCell] = useState<{ coId: string; col: string } | null>(null);
  // Must stay above the loading/not-found early returns (Rules of Hooks).
  const [editingMap, setEditingMap] = useState(false);

  // Seed placeholder values deterministically per CO×col so they never flicker
  const DEFAULT_COLS = ['PO1','PO2','PO3','PO4','PO5','PSO1','PSO2'];
  const seedVal = (ci: number, pi: number): number => {
    const v = ((ci * 7 + pi * 3) % 4);
    return v === 0 ? 0 : v; // 0=dash, 1/2/3
  };

  // Initialize localMap once: seeded placeholder merged with real API values
  const initializedRef = useRef(false);
  if (!initializedRef.current && apiCOs.length > 0) {
    initializedRef.current = true;
    const m: Record<string, Record<string, number>> = {};
    // 1. seed all cells with placeholder
    apiCOs.forEach((co, ci) => {
      m[co.id] = {};
      DEFAULT_COLS.forEach((col, pi) => { m[co.id][col] = seedVal(ci, pi); });
    });
    // 2. overwrite with real saved values
    for (const e of apiMap as COMapping[]) {
      const col = e.po_code ?? e.pso_code ?? '';
      if (col && m[e.co_id]) m[e.co_id][col] = e.level ?? 0;
    }
    setLocalMap(m);
  }

  // Fallback to local context course (works offline / before backend is up)
  const localCourse = courses.find(x => x.id === id || x.code === id) ?? null;

  // Merge: use API name/status/meta but local units for artifact animation
  const c = localCourse;
  const courseName  = apiCourse?.name  ?? c?.name  ?? '';
  const courseCode  = apiCourse?.code  ?? c?.code  ?? '';
  const courseStatus = (apiCourse?.status ?? c?.status ?? 'draft') as string;

  if (courseLoading && !c) {
    return (
      <>
        <WinTopbar title="Course" />
        <WinContent><Spinner /></WinContent>
      </>
    );
  }

  if (!c && !apiCourse) {
    return (
      <>
        <WinTopbar title="Course not found" />
        <WinContent>
          <Btn onClick={() => navigate('/winteach/courses')}>← Back to courses</Btn>
        </WinContent>
      </>
    );
  }

  // Use API COs when available, fall back to local
  const cos: CourseOutcome[] = apiCOs.length
    ? apiCOs
    : (c?.cos ?? []).map((co, i) => ({ id: co.id, co_number: i + 1, description: co.text, bloom_level: co.bloom, course_id: id }));

  // Build CO-PO/PSO map columns
  const mapByCoId: Record<string, Record<string, number>> = {};
  const allCols = new Set<string>();
  for (const entry of (apiMap as COMapping[])) {
    const key = entry.co_id;
    if (!mapByCoId[key]) mapByCoId[key] = {};
    const col = entry.po_code ?? entry.pso_code ?? '';
    if (col) {
      mapByCoId[key][col] = entry.level ?? 0;
      allCols.add(col);
    }
  }
  const cols = Array.from(allCols).sort();

  // Units from DB (primary) or local context (fallback for artifact state)
  const units = apiUnits.length ? apiUnits : (c?.units ?? []);
  const totalTopics = apiUnits.length
    ? apiUnits.reduce((acc: number, u: any) => acc + (u.topics?.length ?? 0), 0)
    : 0;
  const toggleStatus = () => {
    const next = courseStatus === 'active' ? 'draft' : 'active';
    setStatus({ id, status: next as 'draft' | 'active' | 'archived' });
  };

  // CE section tag palette for CO attainment levels
  const mvStyle = (v: number): React.CSSProperties => {
    if (v === 1) return { background: 'var(--tint-blue-bg)', color: 'var(--tint-blue-fg)' };   // read tag
    if (v === 2) return { background: 'var(--tint-violet-bg)', color: 'var(--tint-violet-fg)' };   // speak tag
    if (v === 3) return { background: 'var(--brand)', color: '#fff' };      // brand solid
    return {};
  };

  return (
    <>
      <WinTopbar title={courseName} actions={
        <>
          <Btn variant="ghost" onClick={() => navigate('/winteach/courses')}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>All courses
          </Btn>
          <Btn onClick={() => navigate(`/winteach/courses/${id}/edit`)}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IEdit /></span>Edit course
          </Btn>
        </>
      } />
      <WinContent>
        <Breadcrumb items={[
          { label: 'Courses', onClick: () => navigate('/winteach/courses') },
          { label: courseCode },
        ]} />

        {/* Hero header */}
        <div className="ds-rise" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-card)', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', padding: '22px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                {/* ce-page__kicker */}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--brand)', marginBottom: 4 }}>
                  {courseCode} · {c?.institute || apiCourse?.code || 'Winnify'}
                </div>
                {/* ce-section-h2 */}
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 10 }}>{courseName}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={toggleStatus} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12,
                    borderRadius: 999, padding: '3px 11px',
                    background: courseStatus === 'active' ? 'var(--status-green-bg)' : 'var(--tint-orange-bg)',
                    color: courseStatus === 'active' ? 'var(--status-green)' : 'var(--tint-orange-fg)',
                    border: 'none', cursor: 'pointer',
                  }}>
                    {courseStatus === 'active'
                      ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)', display: 'inline-block' }} />Active</>
                      : 'Draft'}
                  </button>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                    {c?.program && `${c.program} · `}
                    {(apiCourse?.semester ?? c?.sem) && `Sem ${apiCourse?.semester ?? c?.sem} · `}
                    {(apiCourse?.credits ?? c?.credits) && `${apiCourse?.credits ?? c?.credits} credits · `}
                    {apiCourse?.regulation ?? c?.regulation ?? ''}
                  </span>
                </div>
              </div>
              {/* Progress dial + stat chips */}
              <div style={{ display: 'flex', gap: 12, flex: '0 0 auto', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                  width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(var(--brand) ${overallPct}%, var(--score-track) 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <b style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 14, lineHeight: 1, color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{overallPct}%</b>
                    <span style={{ fontSize: 7.5, color: W.text3, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 1 }}>Gen</span>
                  </div>
                </div>
                {([
                  ['Units', units.length],
                  ['Topics', totalTopics],
                  ['COs', cos.length],
                  ['Complete', `${genProgress.filter(p => topicGenState(p).label === 'Complete').length}/${totalTopics}`],
                ] as [string, string | number][]).map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', minWidth: 80, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '1.12rem', color: 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Frameworks — compact tiles that open detail modals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            {
              key: 'cos', icon: <IAssess />, kicker: 'Outcomes', title: 'Course Outcomes',
              sub: cosLoading ? 'Loading…' : cos.length ? `${cos.length} outcome${cos.length !== 1 ? 's' : ''} defined` : 'None defined yet',
              onClick: () => setShowCOs(true),
            },
            {
              key: 'map', icon: <IDashboard />, kicker: 'Attainment', title: 'CO × PO / PSO Mapping',
              sub: cos.length === 0 ? 'Add COs first' : cols.length ? 'Mapping saved' : 'Preview mapping',
              onClick: () => setShowMap(true),
            },
          ].map(t => (
            <button key={t.key} onClick={t.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '18px 20px', cursor: 'pointer', font: 'inherit', color: 'inherit',
              transition: 'border-color .15s, box-shadow .15s, transform .15s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--brand)'; el.style.boxShadow = '0 6px 18px color-mix(in oklab, var(--brand) 12%, transparent)'; el.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = ''; el.style.transform = ''; }}
            >
              <div style={{ flex: 'none', width: 44, height: 44, borderRadius: 8, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 22, height: 22, display: 'flex' }}>{t.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--brand)', marginBottom: 3 }}>{t.kicker}</div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{t.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginTop: 2 }}>{t.sub}</div>
              </div>
              <span style={{ flex: 'none', color: 'var(--text-2)', width: 16, height: 16, display: 'flex' }}><IArrow /></span>
            </button>
          ))}
        </div>

        {/* Course Outcomes modal */}
        {showCOs && (
        <Modal onClose={() => setShowCOs(false)} maxWidth={640} title="Course Outcomes"
          subtitle={`${courseCode} · ${cos.length} outcome${cos.length !== 1 ? 's' : ''}`}>
          {cosLoading ? <Spinner /> : cos.length ? (() => {
            const bloomNameMap: Record<string, string> = { L1: 'Remember', L2: 'Understand', L3: 'Apply', L4: 'Analyze', L5: 'Evaluate', L6: 'Create' };
            const normBloom = (v?: string) => v ? (bloomNameMap[v] ?? v) : '';
            return cos.map((co, i) => {
              const bloomLabel = normBloom(co.bloom_level);
              return (
            <div key={co.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: '1.5px solid var(--border)', borderRadius: 10, marginBottom: i < cos.length - 1 ? 8 : 0, background: 'var(--card)' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, flex: '0 0 56px', paddingTop: 2 }}>CO{co.co_number || co.number || i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{co.description ?? (co as any).text}</div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => setOpenBloom(openBloom === co.id ? null : co.id)}
                    style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {bloomLabel
                      ? <BloomBadge bloom={bloomLabel} />
                      : <span style={{ fontSize: 11, color: W.brand, fontStyle: 'italic', textDecoration: 'underline dotted' }}>Set bloom level</span>}
                    <span style={{ fontSize: 10, color: W.text3 }}>▾</span>
                  </button>
                  {openBloom === co.id && (
                    <BloomDropdown
                      current={co.bloom_level ?? ''}
                      onSelect={(b) => updateCO({ coId: co.id, data: { bloom: b } })}
                      onClose={() => setOpenBloom(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        });
          })() : (
            <div style={{ fontSize: 12.5, color: W.text2, padding: '12px 0' }}>
              No course outcomes defined.{' '}
              <button onClick={() => navigate(`/winteach/courses/${id}/edit`)} style={{ color: W.brand, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: 0 }}>
                Add COs →
              </button>
            </div>
          )}
        </Modal>
        )}

        {/* CO × PO/PSO Mapping modal */}
        {showMap && (
        <Modal onClose={() => { setShowMap(false); setEditingMap(false); setOpenCell(null); }} maxWidth={760}
          title="CO × PO / PSO Mapping"
          subtitle={`${c?.institute || courseCode}${c?.major ? ` · ${c.major}` : ''}`}>
          {cos.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => { setEditingMap(e => !e); setOpenCell(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${editingMap ? 'var(--brand)' : 'var(--border)'}`, background: editingMap ? 'var(--tint-brand-bg)' : 'var(--card)', color: editingMap ? 'var(--brand)' : W.text2, fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
                <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IEdit /></span>
                {editingMap ? 'Done' : 'Edit levels'}
              </button>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
          {(() => {
            if (mapLoading) return <Spinner />;
            if (cos.length === 0) return <div style={{ fontSize: 12.5, color: W.text2, padding: '8px 0' }}>Add COs first to build a mapping.</div>;

            // Always show the full default column set; merge with any extra cols from real map
            const extraCols = cols.filter(c => !DEFAULT_COLS.includes(c));
            const displayCols = [...DEFAULT_COLS, ...extraCols];
            const hasRealMap = cols.length > 0;

            // Values come from localMap (already seeded + real values merged at init)
            const getVal = (coId: string, col: string) => localMap[coId]?.[col] ?? 0;

            const handleChange = (coId: string, col: string, v: number) => {
              const next = { ...localMap, [coId]: { ...(localMap[coId] ?? {}), [col]: v } };
              setLocalMap(next);
              // Build full mappings payload
              const mappings = cos.map(co => {
                const levels: Record<string, number> = next[co.id] ?? {};
                const po_codes = displayCols.filter(c => c.startsWith('PO') && (levels[c] ?? 0) > 0);
                const pso_codes = displayCols.filter(c => c.startsWith('PSO') && (levels[c] ?? 0) > 0);
                const lvls: Record<string, number> = {};
                [...po_codes, ...pso_codes].forEach(c => { lvls[c] = levels[c]; });
                return { co_id: co.id, po_codes, pso_codes, levels: lvls };
              });
              saveMap({ mappings });
            };

            return (
              <>
                {!hasRealMap && (
                  <div style={{ fontSize: 12, color: W.text3, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: W.orangeBg, color: W.orangeFg, borderRadius: 6, padding: '1px 7px', fontWeight: 600, fontSize: 11 }}>Preview</span>
                    Placeholder mapping — save a real mapping from the Edit page.
                  </div>
                )}
                <table style={{ minWidth: 520, borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '0 12px 12px', borderBottom: `1px solid ${W.border}` }}>CO</th>
                      {displayCols.map(col => (
                        <th key={col} style={{ textAlign: 'center', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '11px 12px', borderBottom: `1px solid ${W.border}` }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cos.map((co, i) => (
                      <tr key={co.id}>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${W.border}` }}>
                          <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>CO{co.co_number || (co as any).number || i + 1}</span>
                        </td>
                        {displayCols.map(col => {
                          const val = getVal(co.id, col);
                          const isOpen = openCell?.coId === co.id && openCell?.col === col;
                          return (
                            <td key={col} style={{ padding: '11px 12px', borderBottom: `1px solid ${W.border}`, textAlign: 'center', position: 'relative' }}>
                              <span
                                onClick={() => editingMap && setOpenCell(isOpen ? null : { coId: co.id, col })}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, cursor: editingMap ? 'pointer' : 'default', ...(val ? mvStyle(val) : { color: W.text3, background: 'transparent' }), outline: isOpen ? `2px solid ${W.brand}` : 'none' }}
                              >
                                {val || '–'}
                              </span>
                              {isOpen && editingMap && (
                                <CellDropdown
                                  value={val}
                                  onChange={v => handleChange(co.id, col, v)}
                                  onClose={() => setOpenCell(null)}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 12.5, color: W.text2, marginTop: 16, display: 'flex', gap: 14 }}>
                  {([['1', 'var(--tint-blue-bg)', 'var(--tint-blue-fg)', 'Low'], ['2', 'var(--tint-violet-bg)', 'var(--tint-violet-fg)', 'Medium'], ['3', 'var(--brand)', '#fff', 'High']]).map(([v, bg, fg, label]) => (
                    <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, background: bg, color: fg }}>{v}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}
          </div>
        </Modal>
        )}

        {/* ── Curriculum: units & topics ── */}
        {units.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--brand)', marginBottom: 3 }}>Curriculum</div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 'var(--fs-h2)', color: W.text }}>Units & topics</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 150 }}><ProgressBar value={overallPct} /></div>
                <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.text2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {overallPct}% generated{totalGenCost > 0 && <> · ${totalGenCost.toFixed(2)}</>}
                </span>
              </div>
            </div>

            {units.map((u, ui) => {
              const unitNum = u.unit_number ?? u.n ?? ui + 1;
              const topics: any[] = u.topics ?? [];
              const unitDone = topics.filter(t => topicGenState(progById[t.id]).label === 'Complete').length;
              // Artifact-level per-unit %, consistent with the course dial.
              const unitArtReady = topics.reduce((s, t) => s + (progById[t.id]?.artifact_ready || 0), 0);
              const unitArtTotal = topics.reduce((s, t) => s + (progById[t.id]?.artifact_total || 0), 0);
              const unitPct = unitArtTotal ? Math.round((unitArtReady / unitArtTotal) * 100) : 0;
              const unitHours = topics.reduce((s, t) => s + (t.contact_hours ?? t.hours ?? 0), 0);
              return (
              <div key={unitNum} className="ds-rise" style={{
                border: `1px solid ${W.border}`, borderRadius: 12, marginBottom: 16, overflow: 'hidden',
                background: 'var(--card)', boxShadow: W.shadowCard, animationDelay: `${ui * 70}ms`,
              }}>
                {/* unit header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', background: W.surfaceMuted, borderBottom: `1px solid ${W.border}`, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: 'var(--app-bg-grad)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 15,
                    boxShadow: '0 4px 10px -4px color-mix(in oklab, var(--brand) 50%, transparent)',
                  }}>{unitNum}</div>
                  <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 15.5, color: W.text, lineHeight: 1.25 }}>{u.title}</div>
                    <div style={{ fontSize: 12, color: W.text2, marginTop: 1 }}>
                      {topics.length} topic{topics.length !== 1 ? 's' : ''}{unitHours > 0 && <> · {unitHours} hrs</>} · {unitDone} complete
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
                    <div style={{ width: 120 }}><ProgressBar value={unitPct} /></div>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: unitPct === 100 ? W.greenFg : W.text2, fontVariantNumeric: 'tabular-nums', width: 38, textAlign: 'right' }}>{unitPct}%</span>
                  </div>
                </div>

                {/* topic rows */}
                {topics.map((t, ti) => {
                  const p = progById[t.id];
                  const g = topicGenState(p);
                  const cost = p?.cost_usd || 0;
                  return (
                  <div
                    key={t.id}
                    className="wt-topic-item"
                    onClick={() => {
                      t._unit = u;
                      navigate(`/winteach/courses/${id}/topic/${t.id}`);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px',
                      borderBottom: ti < topics.length - 1 ? `1px solid ${W.border}` : 'none',
                      cursor: 'pointer', transition: 'background .12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: g.label === 'Complete' ? W.greenBg : 'var(--tint-brand-bg)',
                      color: g.label === 'Complete' ? W.greenFg : 'var(--tint-brand-fg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 12,
                    }}>
                      {g.label === 'Complete' ? '✓' : ti + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text }}>{t.title ?? t.name}</div>
                      <div style={{ fontSize: 12, color: W.text2, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {(t.subtopics ?? t.subs ?? []).length} subtopics
                        {cos.length > 0 && (
                          <><span>·</span><CoMapTag>{c ? coRefFor(c, ui) : `CO${ui + 1}`}</CoMapTag></>
                        )}
                        {(t.bloom_level ?? t.co?.bloom) && (
                          <BloomBadge bloom={t.bloom_level ?? t.co?.bloom} />
                        )}
                      </div>
                    </div>
                    {/* artifact pills — plan & notes progress from the generation pipeline */}
                    {p && (p.has_plan || p.status) && (
                      <div className="max-md:hidden" style={{ display: 'flex', gap: 5, flex: '0 0 auto' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: W.fontDisplay, fontWeight: 600,
                          borderRadius: 6, padding: '2px 8px',
                          background: p.has_plan ? W.greenBg : W.surfaceMuted,
                          color: p.has_plan ? W.greenFg : W.text3,
                        }}>Plan {p.has_plan ? '✓' : '—'}</span>
                        {p.has_plan && p.concept_total > 0 && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: W.fontDisplay, fontWeight: 600,
                            borderRadius: 6, padding: '2px 8px', fontVariantNumeric: 'tabular-nums',
                            background: p.notes_ready >= p.concept_total ? W.greenBg : 'var(--tint-brand-bg)',
                            color: p.notes_ready >= p.concept_total ? W.greenFg : 'var(--tint-brand-fg)',
                          }}>Notes {p.notes_ready}/{p.concept_total}</span>
                        )}
                      </div>
                    )}
                    <div style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 auto' }} className="max-md:hidden">
                      <ProgressBar value={g.pct} />
                      {cost > 0 && <span style={{ fontSize: 10.5, color: W.text3, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${cost.toFixed(2)}</span>}
                    </div>
                    <Badge variant={g.variant}>{g.label}</Badge>
                    <span style={{ width: 18, height: 18, display: 'inline-flex', color: W.text3, flexShrink: 0 }}><IChevronSvg /></span>
                  </div>
                  );
                })}
              </div>
              );
            })}
          </>
        )}
      </WinContent>
    </>
  );
}
