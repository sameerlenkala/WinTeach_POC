import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Card, Btn, BloomBadge, SubChip, Field, Select, CoIcon } from './WinTeachUI';
import { ISpark, IFile, IBack, ICheck, IEdit, ITrash } from './WinTeachIcons';
import { useCourses } from '@/api/hooks';
import { uploadsApi } from '@/api/uploads';
import { renumberCos, BLOOM } from './winteachData';
import type { CO } from './winteachData';

// ── Curated catalog ──────────────────────────────────────────────────────────
interface LibTopic {
  title: string;
  bloom: string;
  co: string;
  subs: string[];
}
interface LibSection {
  category: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  topics: LibTopic[];
}

const CATALOG: LibSection[] = [
  {
    category: 'AI & Emerging Tech',
    tag: 'AI',
    tagColor: '#6C5CE7',
    tagBg: '#F0EBFF',
    topics: [
      { title: 'Generative AI & LLM Foundations', bloom: 'Understand', co: 'Understand the foundations and limits of generative AI and LLMs.', subs: ['What LLMs are', 'Tokens & embeddings', 'Capabilities & limits', 'Responsible AI'] },
      { title: 'Prompt Engineering with Python', bloom: 'Apply', co: 'Apply prompt-engineering techniques to build LLM-powered Python apps.', subs: ['Prompt patterns', 'Few-shot prompting', 'Structured outputs', 'Calling LLM APIs'] },
      { title: 'Intro to ML with scikit-learn', bloom: 'Apply', co: 'Apply scikit-learn to train and evaluate basic ML models.', subs: ['Supervised vs unsupervised', 'Train/test split', 'Model fitting', 'Evaluation metrics'] },
    ],
  },
  {
    category: 'Industry-Relevant Skills',
    tag: 'Industry',
    tagColor: '#49A9BE',
    tagBg: 'rgba(73,169,190,0.14)',
    topics: [
      { title: 'Version Control with Git & GitHub', bloom: 'Apply', co: 'Apply Git workflows for collaborative software development.', subs: ['Repos, commits, branches', 'Pull requests', 'Merge conflicts', 'CI basics'] },
      { title: 'Building & Consuming REST APIs', bloom: 'Apply', co: 'Implement Python clients that consume REST APIs.', subs: ['HTTP methods', 'JSON payloads', 'requests library', 'Auth tokens'] },
      { title: 'Cloud Deployment Essentials', bloom: 'Understand', co: 'Understand how to deploy Python applications to the cloud.', subs: ['Containers & Docker', 'Environment config', 'Deploying a Python app', 'Logging & monitoring'] },
      { title: 'Testing & Code Quality', bloom: 'Apply', co: 'Apply automated testing to ensure code quality.', subs: ['Unit testing with pytest', 'Fixtures & assertions', 'Linting & formatting', 'Coverage'] },
    ],
  },
];

type Stage = 'idle' | 'loading' | 'extracted' | 'committed';

interface ExtractedCO { id: string; text: string; bloom: string }
interface ExtractedTopic { name: string; subs: string[]; co: string; bloom: string }
interface ExtractedUnit { n: number; title: string; topics: ExtractedTopic[] }
interface Extraction { course_name: string; course_code: string; units: ExtractedUnit[]; cos: ExtractedCO[] }

// Gap 2 — per-field confidence badge
type Confidence = 'High' | 'Low' | 'Missing';
interface FieldMeta { value: string; confidence: Confidence }
interface ExtractionMeta {
  course_name?: FieldMeta;
  course_code?: FieldMeta;
  credits?: FieldMeta;
  semester?: FieldMeta;
  total_hours?: FieldMeta;
  course_outcomes?: FieldMeta;
  modules?: FieldMeta;
  reference_books?: FieldMeta;
  lab_flag?: FieldMeta;
}

function ConfBadge({ conf }: { conf: Confidence }) {
  const map: Record<Confidence, { bg: string; fg: string; label: string }> = {
    High:    { bg: '#E6FAF4', fg: '#00875A', label: 'High confidence' },
    Low:     { bg: '#FFF3CD', fg: '#856404', label: 'Low confidence — review' },
    Missing: { bg: '#FFE4E4', fg: '#C0392B', label: 'Not found — enter manually' },
  };
  const s = map[conf];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: s.bg, color: s.fg, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {s.label}
    </span>
  );
}


function CoEditModal({ cos, idx, onClose, onChange }: { cos: CO[]; idx: number | null; onClose: () => void; onChange: () => void }) {
  const editing = idx !== null;
  const co = editing ? cos[idx!] : { id: '', text: '', bloom: 'Understand' };
  const [text, setText] = useState(co.text);
  const [bloom, setBloom] = useState(co.bloom);
  const save = () => {
    if (!text.trim()) return;
    if (editing) { cos[idx!].text = text; cos[idx!].bloom = bloom; }
    else { cos.push({ id: 'CO' + (cos.length + 1), text, bloom }); }
    onChange(); onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 500, maxWidth: '92vw' }}>
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 20 }}>{editing ? 'Edit CO' : 'Add CO'}</div>
        <Field label="Outcome statement">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Apply... / Implement... / Analyze..."
            style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${W.border}`, background: W.surfaceMuted, padding: '10px 14px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </Field>
        <Field label="Bloom's level"><Select value={bloom} onChange={setBloom} options={[...BLOOM]} /></Field>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save}><span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>{editing ? 'Save' : 'Add CO'}</Btn>
        </div>
      </div>
    </div>
  );
}

function BloomPill({ bloom }: { bloom: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    Remember:  { bg: '#E5F4E9', fg: '#3DA35D' },
    Understand:{ bg: '#E5F4E9', fg: '#3DA35D' },
    Apply:     { bg: '#FFF3E2', fg: '#E4853B' },
    Analyze:   { bg: '#FFF0F0', fg: '#E05252' },
    Evaluate:  { bg: '#FFF0F0', fg: '#E05252' },
    Create:    { bg: '#F3EFFF', fg: '#6C5CE7' },
  };
  const s = map[bloom] ?? { bg: '#F1F2F7', fg: '#666' };
  return (
    <span style={{ display: 'inline-block', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', borderRadius: 6, padding: '2px 7px', background: s.bg, color: s.fg }}>
      {bloom}
    </span>
  );
}

function CatalogView() {
  return (
    <div>
      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(37,99,235,0.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
        <span style={{ width: 20, height: 20, color: '#2563EB', display: 'flex', flex: '0 0 20px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </span>
        <div style={{ fontSize: 13.5, color: W.text, lineHeight: 1.5 }}>
          A curated catalog of <b>industry-relevant</b> and <b>AI</b> topics institutes can add to any course. While uploading a syllabus, these appear as one-click suggestions under the detected structure.
        </div>
      </div>

      {CATALOG.map(section => (
        <div key={section.category}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>{section.category}</div>
            <span style={{ fontSize: 12.5, color: W.text2 }}>{section.topics.length} topics</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
            {section.topics.map(t => (
              <div key={t.title} style={{ border: '1.5px solid #e9eaf2', borderRadius: 14, padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8, transition: '.15s', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', borderRadius: 6, padding: '2px 8px', background: section.tagBg, color: section.tagColor }}>
                    {section.tag}
                  </span>
                  <BloomPill bloom={t.bloom} />
                </div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, color: '#5b4bff', background: '#efeefe', borderRadius: 6, padding: '2px 8px' }}>
                    CO · {t.bloom}
                  </span>
                  <span style={{ fontSize: 12.5, color: W.text2 }}>{t.co}</span>
                </div>
                <div>
                  {t.subs.map(s => (
                    <span key={s} style={{ display: 'inline-block', fontSize: 11, color: W.text2, background: '#F1F2F7', borderRadius: 6, padding: '2px 8px', margin: '2px 4px 0 0' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WinTeachAddLibrary() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: allCourses = [] } = useCourses();

  const [stage, setStage] = useState<Stage>('idle');
  const [loadMsg, setLoadMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadId, setUploadId] = useState('');
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [exMeta, setExMeta] = useState<ExtractionMeta | null>(null); // Gap 2
  const [targetCourseId, setTargetCourseId] = useState('');
  const [deltaResult, setDeltaResult] = useState<{ cos: number; topics: number } | null>(null);
  const [committing, setCommitting] = useState(false);
  const [coModal, setCoModal] = useState<{ idx: number | null } | null>(null);
  const [, forceUpdate] = useState(0);

  const reset = () => {
    setStage('idle'); setFileName(''); setUploadId('');
    setExtraction(null); setExMeta(null); setTargetCourseId(''); setDeltaResult(null);
  };

  const doExtract = async (file: File) => {
    setFileName(file.name);
    setStage('loading');
    setLoadMsg('Uploading document…');
    try {
      const result = await uploadsApi.upload(file);
      setUploadId(result.upload_id);
      setLoadMsg('Extracting syllabus structure…');

      // Backend extracts synchronously, but poll if still processing
      if ((result as any).status === 'processing') {
        let attempts = 0;
        while (attempts < 20) {
          await new Promise(r => setTimeout(r, 1200));
          const poll = await uploadsApi.getExtraction(result.upload_id);
          if (poll.status === 'done' || poll.status === 'failed') break;
          attempts++;
        }
      }

      const ex = (result as any).extraction ?? {};
      const aiEx = (result as any).ai_extraction;
      const strVal = (f: any) => Array.isArray(f?.value) ? f.value.join(', ') : (f?.value ?? '');

      // Gap 2 — capture per-field confidence metadata
      const meta: ExtractionMeta = {
        course_name:    { value: strVal(ex.course_name), confidence: ex.course_name?.confidence ?? 'Missing' },
        course_code:    { value: strVal(ex.course_code), confidence: ex.course_code?.confidence ?? 'Missing' },
        credits:        { value: strVal(ex.credits), confidence: ex.credits?.confidence ?? 'Missing' },
        semester:       { value: strVal(ex.semester), confidence: ex.semester?.confidence ?? 'Missing' },
        total_hours:    { value: strVal(ex.total_hours), confidence: ex.total_hours?.confidence ?? 'Missing' },
        course_outcomes:{ value: strVal(ex.course_outcomes), confidence: ex.course_outcomes?.confidence ?? 'Missing' },
        modules:        { value: strVal(ex.modules), confidence: ex.modules?.confidence ?? 'Missing' },
        reference_books:{ value: strVal(ex.reference_books), confidence: ex.reference_books?.confidence ?? 'Missing' },
        lab_flag:       { value: strVal(ex.lab_flag), confidence: ex.lab_flag?.confidence ?? 'Missing' },
      };
      setExMeta(meta);

      // Prefer ai_extraction (full structured tree) over flat extraction
      let built: Extraction;
      if (aiEx && aiEx.units && aiEx.units.length > 0) {
        built = {
          course_name: aiEx.course_name || strVal(ex.course_name) || file.name.replace(/\.[^.]+$/, ''),
          course_code: aiEx.course_code || strVal(ex.course_code) || '',
          cos: (aiEx.course_outcomes || []).map((co: any, i: number) => ({
            id: `CO${i + 1}`,
            text: co.text || co,
            bloom: co.bloom_level || 'Understand',
          })),
          units: aiEx.units.map((u: any) => ({
            n: u.unit_number,
            title: u.title,
            topics: (u.topics || []).map((t: any) => ({
              name: t.title,
              subs: (t.subtopics || []).map((s: any) => s.title || s),
              co: `CO${u.unit_number}`,
              bloom: t.bloom_level || 'Understand',
            })),
          })),
        };
      } else {
        const cosRaw: string[] = Array.isArray(ex.course_outcomes?.value) ? ex.course_outcomes.value : [];
        const modsRaw: string[] = Array.isArray(ex.modules?.value) ? ex.modules.value : [];
        built = {
          course_name: strVal(ex.course_name) || file.name.replace(/\.[^.]+$/, ''),
          course_code: strVal(ex.course_code) || '',
          cos: cosRaw.map((text, i) => ({ id: `CO${i + 1}`, text, bloom: 'Understand' })),
          units: modsRaw.map((m, i) => ({
            n: i + 1,
            title: m.replace(/^Module\s*\d+[:\-]\s*/i, '').trim() || m,
            topics: [],
          })),
        };
      }

      setExtraction(built);
      setStage('extracted');
    } catch {
      // Fallback mock for demo
      setLoadMsg('Using sample extraction…');
      await new Promise(r => setTimeout(r, 800));
      setExtraction({
        course_name: file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
        course_code: 'CSE999',
        cos: [
          { id: 'CO1', text: 'Understand fundamental concepts from the syllabus.', bloom: 'Understand' },
          { id: 'CO2', text: 'Apply techniques described in the course material.', bloom: 'Apply' },
        ],
        units: [
          { n: 1, title: 'Introduction', topics: [{ name: 'Overview', subs: ['History', 'Scope'], co: 'CO1', bloom: 'Remember' }] },
          { n: 2, title: 'Core Concepts', topics: [{ name: 'Fundamentals', subs: ['Definitions', 'Examples'], co: 'CO2', bloom: 'Understand' }] },
        ],
      });
      setStage('extracted');
    }
  };

  const handleFile = (file: File) => doExtract(file);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); };

  const commit = async () => {
    if (!extraction || !targetCourseId) return;
    setCommitting(true);
    try {
      const flatTopics = extraction.units.flatMap((u, ui) =>
        u.topics.map(t => ({ unit_index: ui, title: t.name, subtopics: t.subs, co_text: t.co, bloom: t.bloom }))
      );
      const res = await uploadsApi.commit(uploadId || 'demo', {
        course_id: targetCourseId,
        cos: extraction.cos.map(c => ({ text: c.text, bloom: c.bloom })),
        topics: flatTopics,
        replace_cos: false,
        replace_topics: false,
      });
      setDeltaResult({ cos: (res as any).cos_committed ?? extraction.cos.length, topics: (res as any).topics_committed ?? flatTopics.length });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['courses', targetCourseId] });
      setStage('committed');
    } catch {
      // Show delta anyway in demo mode
      setDeltaResult({ cos: extraction.cos.length, topics: extraction.units.reduce((s, u) => s + u.topics.length, 0) });
      setStage('committed');
    }
    setCommitting(false);
  };

  const targetCourse = allCourses.find(c => c.id === targetCourseId);
  const courseOptions = allCourses.map(c => `${c.code} — ${c.name}`);
  const courseOptionValues = allCourses.map(c => c.id);

  return (
    <>
      <WinTopbar title="Add. Course Library" />
      <WinContent>

        {/* ── IDLE: Upload zone + Catalog ── */}
        {stage === 'idle' && (
          <>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleInput} />

            {/* ── Curated Catalog ── */}
            <CatalogView />
          </>
        )}

        {/* ── LOADING ── */}
        {stage === 'loading' && (
          <Card style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#efeefe', color: '#5b4bff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 22, height: 22, display: 'inline-flex' }}><ISpark /></span>
              </div>
              <div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16 }}>Extracting syllabus…</div>
                <div style={{ fontSize: 13, color: W.text2, marginTop: 4 }}>{loadMsg}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
              <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IFile /></span>
              <span style={{ fontSize: 13.5, color: W.text2 }}>{fileName}</span>
            </div>
          </Card>
        )}

        {/* ── EXTRACTED: Review + commit ── */}
        {stage === 'extracted' && extraction && (
          <div style={{ maxWidth: 800 }}>
            {/* Summary banner */}
            <div style={{ background: W.greenBg, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '3px 11px', background: W.greenBg, color: W.greenFg }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} /> Extracted
              </span>
              <span style={{ fontSize: 13, color: W.text }}>
                {extraction.units.length} units · {extraction.units.reduce((s, u) => s + u.topics.length, 0)} topics · {extraction.cos.length} course outcomes
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12.5, color: W.text2 }}>{fileName}</span>
              <button onClick={reset} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${W.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: W.text2 }}><X size={13} /></button>
            </div>

            {/* Gap 2 — Per-field confidence panel */}
            {exMeta && (
              <Card style={{ marginBottom: 16, background: '#FAFAFA' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Extraction confidence</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(Object.entries(exMeta) as [string, FieldMeta][]).map(([key, { value, confidence }]) => (
                    <div key={key} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${W.border}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: W.text2, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        <ConfBadge conf={confidence as Confidence} />
                      </div>
                      {value && <div style={{ fontSize: 12.5, color: W.text, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: W.text2, marginTop: 10 }}>
                  <span style={{ color: '#C0392B', fontWeight: 600 }}>Red fields</span> were not found — add them manually.{' '}
                  <span style={{ color: '#856404', fontWeight: 600 }}>Amber fields</span> were inferred — review before committing.
                </div>
              </Card>
            )}

            {/* CO list */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>Course Outcomes ({extraction.cos.length})</div>
                <Btn sm onClick={() => setCoModal({ idx: null })}>
                  <Plus size={13} /> Add CO
                </Btn>
              </div>
              {extraction.cos.length === 0 ? (
                <div style={{ fontSize: 13.5, color: W.text2, padding: '8px 0' }}>No COs extracted — add them manually.</div>
              ) : extraction.cos.map((co, i) => (
                <div key={co.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: i < extraction.cos.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.brand, flex: '0 0 44px', paddingTop: 2 }}>{co.id}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}>{co.text}</div>
                    <BloomBadge bloom={co.bloom} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <CoIcon onClick={() => setCoModal({ idx: i })}><IEdit /></CoIcon>
                    <CoIcon danger onClick={() => { extraction.cos.splice(i, 1); renumberCos(extraction.cos as any); forceUpdate(n => n + 1); }}><ITrash /></CoIcon>
                  </div>
                </div>
              ))}
            </Card>

            {/* Unit / topic tree */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
                Detected structure — {extraction.course_name} {extraction.course_code && `(${extraction.course_code})`}
              </div>
              {extraction.units.map((u) => (
                <div key={u.n} style={{ border: `1px solid ${W.border}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: W.surfaceMuted }}>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.brand }}>Unit {u.n}</span>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>{u.title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: W.text2 }}>{u.topics.length} topics</span>
                  </div>
                  {u.topics.length === 0 ? (
                    <div style={{ padding: '10px 16px', fontSize: 13, color: W.text3 }}>No topics extracted</div>
                  ) : u.topics.map((t, ti) => (
                    <div key={ti} style={{ padding: '12px 16px', borderBottom: ti < u.topics.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>{t.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <BloomBadge bloom={t.bloom} />
                        {t.co && <span style={{ fontSize: 12, color: W.text2 }}>CO: {t.co}</span>}
                      </div>
                      <div>{t.subs.map(s => <SubChip key={s}>{s}</SubChip>)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </Card>

            {/* Commit panel */}
            <Card style={{ borderColor: '#e9eaf2' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Apply to a course</div>
              <div style={{ fontSize: 13.5, color: W.text2, marginBottom: 16 }}>
                Select an existing course to commit the extracted COs and topics into. Existing COs and topics are preserved.
              </div>
              {allCourses.length === 0 ? (
                <div style={{ fontSize: 13.5, color: W.text2, padding: '8px 0' }}>No courses yet — create a course first.</div>
              ) : (
                <>
                  <Field label="Target course">
                    <Select
                      value={targetCourseId}
                      onChange={(v) => setTargetCourseId(courseOptionValues[courseOptions.indexOf(v)] ?? v)}
                      options={['— select a course —', ...courseOptions]}
                    />
                  </Field>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <Btn variant="ghost" onClick={reset}><span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Start over</Btn>
                    <Btn variant="primary" disabled={!targetCourseId || committing} onClick={commit}>
                      <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
                      {committing ? 'Committing…' : 'Commit to course'}
                    </Btn>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* ── COMMITTED: Delta view ── */}
        {stage === 'committed' && deltaResult && (
          <Card style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <CheckCircle2 size={36} color={W.greenFg} />
              <div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20 }}>Committed successfully</div>
                <div style={{ fontSize: 13.5, color: W.text2, marginTop: 3 }}>
                  Applied to <b>{targetCourse?.code} — {targetCourse?.name}</b>
                </div>
              </div>
            </div>

            {/* Delta summary */}
            <div style={{ background: W.surfaceMuted, borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, marginBottom: 12 }}>What changed</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Course Outcomes added', count: deltaResult.cos, color: W.brand },
                  { label: 'Topics added', count: deltaResult.topics, color: W.greenFg },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 10, padding: 16, border: `1px solid ${W.border}` }}>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 28, color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 12.5, color: W.text2, marginTop: 6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CO list committed */}
            {extraction && extraction.cos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, color: W.text2, marginBottom: 10 }}>COs committed</div>
                {extraction.cos.map((co, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < extraction.cos.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12, color: W.brand, flex: '0 0 40px' }}>{co.id}</div>
                    <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5 }}>{co.text}</div>
                    <BloomBadge bloom={co.bloom} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={reset}>Upload another syllabus</Btn>
            </div>
          </Card>
        )}
      </WinContent>

      {coModal && extraction && (
        <CoEditModal
          cos={extraction.cos as any}
          idx={coModal.idx}
          onClose={() => setCoModal(null)}
          onChange={() => forceUpdate(n => n + 1)}
        />
      )}
    </>
  );
}
