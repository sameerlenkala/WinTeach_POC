import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useWinTeach } from './WinTeachContext';
import { W, bloomStyle } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import {
  Card, Btn, Breadcrumb, Stepper, Field, Input, Select, Textarea,
  CoIcon, BloomBadge, SubChip, Modal, useClickOutside,
} from './WinTeachUI';
import {
  IBack, IPlus, IUpload, IText, IFile,
  ISpark, ICheck, IX, IEdit, ITrash,
} from './WinTeachIcons';
import type { Course, CO, Topic, Unit } from './winteachData';
import {
  MAJORS, BLOOM, REGULATIONS,
  nid, ckey, newArtifacts, renumberCos,
  normCo, allTopics, getElectivesUnit,
  linkCoKeys, topicsForCo, addToIndustryLibrary,
} from './winteachData';
import { uploadsApi } from '@/api/uploads';
import { coursesApi } from '@/api/courses';


export default function WinTeachCreateCourse() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const qc = useQueryClient();
  const { courses, setCourses, institutes, draft, setDraft, toast, setCurrentCourse } = useWinTeach();

  useEffect(() => {
    if (editId) {
      // Edit mode — find the course and pre-populate the draft
      const target = courses.find(c => c.id === editId || c.code === editId) ?? null;
      if (target && (!draft || draft.mode !== 'edit' || (draft.target?.id ?? draft.target?.code) !== editId)) {
        setDraft({
          mode: 'edit',
          step: 1,
          target,
          details: {
            code: target.code,
            name: target.name,
            institute: target.institute || institutes[0]?.name || 'Winnify',
            program: target.program || 'B.Tech CSE',
            major: target.major || 'CSE',
            sem: target.sem,
            credits: target.credits,
            regulation: target.regulation || 'CIET R24',
          },
          method: 'upload',
          fileName: '',
          extracted: JSON.parse(JSON.stringify(target)),
          delta: [],
        });
      }
    } else {
      // Always reset draft when entering create mode
      setDraft({
        mode: 'create', step: 1,
        details: { code: '', name: '', institute: institutes[0]?.name || 'Winnify', program: 'B.Tech CSE', major: 'CSE', sem: '', credits: '', regulation: 'CIET R24' },
        method: 'upload', fileName: '', extracted: null, delta: [],
      });
    }
  }, [editId]);

  // Create-mode AI build state lives here so it survives step transitions
  const [build, setBuild] = useState<{ phase: 'idle' | 'uploading' | 'analysing' | 'error'; error?: string }>({ phase: 'idle' });
  const buildCancelled = useRef(false);

  if (!draft) return null;

  const cancelPath = editId ? `/winteach/courses/${editId}` : '/winteach/courses';
  const instNames = institutes.map(i => i.name);
  const gotoStep = (n: number) => {
    if (draft!.mode === 'create' && n === 2) return; // the AI build stage runs itself
    setDraft(prev => prev ? { ...prev, step: n } : prev);
  };
  const stepLabels = draft.mode === 'edit'
    ? ['Course details', 'Syllabus', 'Edit course plan']
    : ['Upload syllabus', 'AI build', 'Review & create'];

  // Upload the syllabus and run the extraction pipeline, then land on Review.
  const startBuild = async (file: File) => {
    buildCancelled.current = false;
    setBuild({ phase: 'uploading' });
    setDraft(prev => prev ? { ...prev, step: 2, fileName: file.name, uploadId: undefined, extracted: null } : prev);
    try {
      const up = await uploadsApi.upload(file) as any;
      if (buildCancelled.current) return;
      setDraft(prev => prev ? { ...prev, uploadId: up.upload_id } : prev);
      setBuild({ phase: 'analysing' });
      let result = await uploadsApi.getExtraction(up.upload_id) as any;
      let attempts = 0;
      while (result.status === 'processing' && attempts < 100 && !buildCancelled.current) {
        await new Promise(r => setTimeout(r, 3000));
        result = await uploadsApi.getExtraction(up.upload_id);
        attempts++;
      }
      if (buildCancelled.current) return;
      if (result.status === 'failed') throw new Error(result.error || 'Extraction failed — please try again.');
      const extracted = courseFromResult(result, draft!.details);
      linkCoKeys(extracted);
      setDraft(prev => prev ? { ...prev, extracted, step: 3 } : prev);
      setBuild({ phase: 'idle' });
    } catch (err: any) {
      if (!buildCancelled.current) setBuild({ phase: 'error', error: err?.message ?? 'Something went wrong — please try again.' });
    }
  };
  const cancelBuild = () => {
    buildCancelled.current = true;
    setBuild({ phase: 'idle' });
    setDraft(prev => prev ? { ...prev, step: 1 } : prev);
  };

  if (draft.mode === 'edit') {
    if (draft.step === 1) return <Step1 />;
    if (draft.step === 2) return <Step2 />;
    return <EditPlanStep />;
  }
  if (draft.step === 1) return <StartStep />;
  if (draft.step === 2) return <BuildStep />;
  return <ReviewStep />;

  // ===== Create · Stage 1 — Start (upload-first) =====
  function StartStep() {
    const fileRef = useRef<HTMLInputElement>(null);
    const [method, setMethod] = useState<'upload' | 'paste'>('upload');
    const [pasteText, setPasteText] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const beginPaste = () => {
      if (!pasteText.trim()) return;
      const file = new File([new Blob([pasteText], { type: 'text/plain' })], 'syllabus.txt', { type: 'text/plain' });
      startBuild(file);
    };
    const startBlank = () => {
      const d = draft!.details;
      const blank: Course = {
        id: '', code: '', name: '', credits: '', sem: '',
        regulation: d.regulation, institute: d.institute, program: d.program, major: d.major,
        status: 'draft', cos: [], units: [{ n: '1', title: 'Unit 1', topics: [] }],
      };
      setDraft(prev => prev ? { ...prev, extracted: blank, fileName: '', uploadId: undefined, step: 3 } : prev);
    };

    return (
      <>
        <WinTopbar title="Create New Course" actions={<Btn variant="ghost" onClick={() => navigate(cancelPath)}>Cancel</Btn>} />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: 'New course' }]} />
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <Stepper steps={stepLabels} current={1} />

            {/* Hero */}
            <div style={{ textAlign: 'center', margin: '8px 0 22px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--tint-brand-bg)', color: W.brand, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <span style={{ width: 24, height: 24, display: 'inline-flex' }}><ISpark /></span>
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 26, lineHeight: 1.25 }}>Drop in your syllabus</div>
              <div style={{ fontSize: 14.5, color: W.text2, marginTop: 8, lineHeight: 1.6 }}>
                Winnify AI reads it and builds the complete course plan.<br />You review, adjust and hit create — no forms first.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {['Course details', 'Units & topics', 'Outcomes + Bloom levels', 'Industry alignment'].map(f => (
                  <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11.5, color: W.text2, background: W.surfaceMuted, borderRadius: 999, padding: '4px 12px' }}>
                    <span style={{ width: 11, height: 11, display: 'inline-flex', color: W.greenFg }}><ICheck /></span>{f}
                  </span>
                ))}
              </div>
            </div>

            <Card>
              {/* Method tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['upload', 'paste'] as const).map(m => (
                  <button key={m} onClick={() => setMethod(m)} style={{
                    height: 34, padding: '0 15px', borderRadius: 8,
                    border: `1px solid ${method === m ? 'var(--brand)' : 'var(--border)'}`,
                    background: method === m ? 'var(--tint-brand-bg)' : 'transparent',
                    fontFamily: W.fontSans, fontWeight: 600, fontSize: '.82rem',
                    color: method === m ? 'var(--brand)' : 'var(--text-2)',
                    display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: '.15s',
                  }}>
                    <span style={{ width: 15, height: 15, display: 'inline-flex' }}>{m === 'upload' ? <IUpload /> : <IText />}</span>
                    {m === 'upload' ? 'PDF / Image' : 'Paste text'}
                  </button>
                ))}
              </div>

              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx"
                style={{ display: 'none' }}
                onChange={ev => { const f = ev.target.files?.[0]; if (f) startBuild(f); }} />

              {method === 'upload' ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={ev => { ev.preventDefault(); setDragOver(false); const f = ev.dataTransfer.files?.[0]; if (f) startBuild(f); }}
                  onDragOver={ev => { ev.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? W.brand : W.borderStrong}`,
                    borderRadius: W.r5, padding: '46px 24px', textAlign: 'center',
                    background: dragOver ? 'var(--tint-brand-bg)' : W.surfaceMuted,
                    cursor: 'pointer', transition: 'border-color .15s, background .15s',
                  }}
                >
                  <div style={{ width: 34, height: 34, color: W.brand, margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}><IUpload /></div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    Drop your syllabus here, or browse
                  </div>
                  <div style={{ fontSize: 12.5, color: W.text2 }}>.pdf, .png, .jpg, .docx · up to 20 MB · the build starts immediately</div>
                </div>
              ) : (
                <div>
                  <Field label="Paste syllabus text">
                    <Textarea value={pasteText} onChange={setPasteText} rows={9} placeholder="Paste your syllabus content here…" />
                  </Field>
                  <Btn variant="primary" disabled={!pasteText.trim()} onClick={beginPaste}>
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                    Build course plan
                  </Btn>
                </div>
              )}
            </Card>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: W.text2 }}>
              No syllabus handy?{' '}
              <a onClick={startBlank} style={{ color: W.brandTintFg ?? W.brand, fontWeight: 600, cursor: 'pointer' }}>Start from a blank plan</a>
            </div>
          </div>
        </WinContent>
      </>
    );
  }

  // ===== Create · Stage 2 — AI build (automatic) =====
  function BuildStep() {
    const STAGES = [
      'Uploading syllabus',
      'Reading the document',
      'Detecting units, topics & subtopics',
      'Assigning Bloom levels',
      'Scanning industry & AI skills',
      'Evaluating course outcomes',
      'Linking outcomes to topics',
    ];
    // Pace the visible stage while the pipeline runs; the last stage waits for completion.
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setTick(n => n + 1), 6000);
      return () => clearInterval(t);
    }, []);
    const stageIdx = build.phase === 'uploading' ? 0 : Math.min(1 + tick, STAGES.length - 1);

    return (
      <>
        <WinTopbar title="Create New Course" actions={<Btn variant="ghost" onClick={cancelBuild}>Cancel</Btn>} />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: 'New course · AI build' }]} />
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <Stepper steps={stepLabels} current={2} />
            <Card style={{ padding: '34px 38px' }}>
              {build.phase === 'error' ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: W.redBg, color: W.redFg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <span style={{ width: 20, height: 20, display: 'inline-flex' }}><IX /></span>
                  </div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 19, marginBottom: 6 }}>The build hit a snag</div>
                  <div style={{ fontSize: 13.5, color: W.text2, marginBottom: 20 }}>{build.error}</div>
                  <Btn variant="primary" onClick={cancelBuild}>
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>
                    Back to upload
                  </Btn>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ width: 22, height: 22, display: 'inline-flex', color: W.brand, animation: 'spin 1.1s linear infinite' }}><ISpark /></span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 19 }}>Building your course plan…</div>
                      <div style={{ fontSize: 13, color: W.text2, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex', flexShrink: 0 }}><IFile /></span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft!.fileName || 'syllabus'}</span>
                      </div>
                    </div>
                  </div>

                  {STAGES.map((s, i) => {
                    const done = i < stageIdx;
                    const active = i === stageIdx;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: done || active ? 1 : 0.45 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? W.greenBg : active ? 'var(--tint-brand-bg)' : W.surfaceMuted, color: done ? W.greenFg : active ? W.brand : W.text3 }}>
                          {done
                            ? <span style={{ width: 12, height: 12, display: 'inline-flex' }}><ICheck /></span>
                            : active
                              ? <span style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${W.brand}`, borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} />
                              : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: done || active ? 600 : 500, fontFamily: W.fontDisplay, color: done ? W.text2 : active ? W.text : W.text3 }}>{s}</span>
                        {active && <span style={{ marginLeft: 'auto', fontSize: 11.5, color: W.text3 }}>working…</span>}
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTop: `1px solid ${W.border}` }}>
                    <span style={{ fontSize: 12.5, color: W.text3 }}>Usually takes 1–2 minutes. You'll land on the review workspace automatically.</span>
                    <Btn variant="ghost" onClick={cancelBuild}>Cancel build</Btn>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </>
              )}
            </Card>
          </div>
        </WinContent>
      </>
    );
  }

  // ===== Step 1 (edit mode) =====
  function Step1() {
    const d = draft!.details;
    const defaultInstitute = institutes[0]?.name || 'Winnify';
    const [code, setCode] = useState(String(d.code));
    const [name, setName] = useState(d.name);
    const [institute, setInstitute] = useState(d.institute || defaultInstitute);
    const [program, setProgram] = useState(d.program || '');
    const [majors, setMajors] = useState<string[]>(
      d.major && d.major !== 'All' ? d.major.split(',').map(s => s.trim()) : []
    );
    const [regulation, setRegulation] = useState(d.regulation || 'R24');
    const regOptions = Array.from(new Set([
      regulation,
      ...institutes.map(i => i.regulation).filter(Boolean),
      ...REGULATIONS,
    ]));
    const [sem, setSem] = useState(String(d.sem || ''));
    const [credits, setCredits] = useState(String(d.credits || ''));

    const PROGRAMS = [
      '', 'B.Tech', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'B.Sc', 'M.Sc',
      'MBA', 'BBA', 'B.Com', 'M.Com', 'B.Arch', 'Ph.D',
    ];
    const [majorOpen, setMajorOpen] = useState(false);
    const majorRef = useClickOutside<HTMLDivElement>(majorOpen, () => setMajorOpen(false));
    const toggleMajor = (m: string) => {
      setMajors(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
      setErrors(e => ({ ...e, major: '' }));
    };
    const allMajorsSelected = majors.length === MAJORS.length;
    const toggleAllMajors = () => { setMajors(allMajorsSelected ? [] : [...MAJORS]); setErrors(e => ({ ...e, major: '' })); };
    const [errors, setErrors] = useState<Record<string, string>>({});

    const next = () => {
      const errs: Record<string, string> = {};
      if (!code.trim()) errs.code = 'Required';
      if (!name.trim()) errs.name = 'Required';
      if (!program) errs.program = 'Required';
      if (!majors.length) errs.major = 'Select at least one';
      if (!sem.trim()) errs.sem = 'Required';
      if (!credits.trim()) errs.credits = 'Required';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setDraft(prev => prev ? {
        ...prev,
        details: { code, name, institute, program, major: majors.join(', ') || 'All', regulation, sem, credits },
        step: draft!.mode === 'edit' ? 3 : 2,
      } : prev);
    };

    return (
      <>
        <WinTopbar title={draft!.mode === 'edit' ? 'Edit Course' : 'Create New Course'} actions={
          <Btn variant="ghost" onClick={() => navigate(cancelPath)}>Cancel</Btn>
        } />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: draft!.mode === 'edit' ? `${d.code} · Edit` : 'New course' }]} />
          <div style={{ maxWidth: 760, margin: '0 auto' }}><Stepper steps={stepLabels} current={1} /></div>
          <Card style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Course details</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              {draft!.mode === 'edit' ? 'Update the course identity.' : "Identify the course. You'll attach the syllabus next."}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Course code" error={errors.code}><Input value={code} onChange={v => { setCode(v); setErrors(e => ({ ...e, code: '' })); }} placeholder="e.g. CS401" /></Field>
              <Field label="Course name" error={errors.name}><Input value={name} onChange={v => { setName(v); setErrors(e => ({ ...e, name: '' })); }} placeholder="e.g. Operating Systems" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Institute"><Select value={institute} onChange={setInstitute} options={instNames.length ? instNames : [defaultInstitute]} /></Field>
              <Field label="Program" error={errors.program}><Select value={program} onChange={v => { setProgram(v); setErrors(e => ({ ...e, program: '' })); }} options={PROGRAMS} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              {/* Major — multi-select dropdown */}
              <Field label="Major" error={errors.major}>
                <div ref={majorRef} style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setMajorOpen(o => !o)}
                    style={{ width: '100%', background: 'var(--input-bg)', border: `1px solid ${majorOpen ? W.brand : 'transparent'}`, borderRadius: 8, padding: '11px 14px', fontFamily: W.fontSans, fontSize: 14, color: majors.length ? W.text : W.text3, outline: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: majorOpen ? '0 0 0 3px rgba(108,92,231,0.12)' : 'none' }}>
                    <span>{allMajorsSelected ? 'All majors' : majors.length ? majors.join(', ') : 'Select majors…'}</span>
                    <span style={{ fontSize: 10, color: W.text3 }}>▾</span>
                  </button>
                  {majorOpen && (
                    <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(60,50,140,.12)', padding: 8, maxHeight: 220, overflowY: 'auto' }}>
                      {/* All — select/clear every major at once */}
                      <div onClick={toggleAllMajors}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', borderBottom: `1px solid ${W.border}`, marginBottom: 4 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${allMajorsSelected ? W.brand : W.border}`, background: allMajorsSelected ? W.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {allMajorsSelected && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{ fontFamily: W.fontSans, fontSize: 13, fontWeight: 600, color: W.text }}>All</span>
                      </div>
                      {MAJORS.map(m => (
                        <div key={m} onClick={() => toggleMajor(m)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: majors.includes(m) ? 'var(--tint-brand-bg)' : 'transparent' }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${majors.includes(m) ? W.brand : W.border}`, background: majors.includes(m) ? W.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {majors.includes(m) && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                          </div>
                          <span style={{ fontFamily: W.fontSans, fontSize: 13, color: W.text }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Regulation"><Select value={regulation} onChange={setRegulation} options={regOptions} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Semester" error={errors.sem}><Input value={sem} onChange={v => { setSem(v); setErrors(e => ({ ...e, sem: '' })); }} type="number" placeholder="e.g. 4" /></Field>
              <Field label="Credits" error={errors.credits}><Input value={credits} onChange={v => { setCredits(v); setErrors(e => ({ ...e, credits: '' })); }} type="number" placeholder="e.g. 3" /></Field>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <span style={{ fontSize: 12.5, color: W.text2 }}>Step 1 of 3</span>
              <Btn variant="primary" onClick={next}>
                {draft!.mode === 'edit' ? 'Continue to plan' : 'Continue to syllabus'}
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IChevron /></span>
              </Btn>
            </div>
          </Card>
        </WinContent>
      </>
    );
  }

  // ===== Step 2 =====
  function Step2() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [method, setMethod] = useState<'upload' | 'paste'>(draft!.method);
    const [pasteText, setPasteText] = useState('');
    // phase: idle → ready(file picked, not yet uploaded) → uploading → extracting → done | error
    const [phase, setPhase] = useState<'idle' | 'ready' | 'uploading' | 'extracting' | 'done' | 'error'>(
      draft!.extracted ? 'done' : (draft!.uploadId || draft!.fileName) ? 'ready' : 'idle'
    );
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [stage, setStage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [, forceUpdate] = useState(0);

    // Just store the file locally — do NOT call setDraft here (it re-renders parent and resets phase)
    const pickFile = (file: File) => {
      setPendingFile(file);
      setPhase('ready');
    };

    // Called when user clicks "Extract & Continue"
    const runExtract = async (): Promise<boolean> => {
      // Step A: upload — if user picked a new file, ignore any cached uploadId
      let uploadId = pendingFile ? undefined : draft!.uploadId;
      if (!uploadId) {
        if (!pendingFile) return false;
        setPhase('uploading');
        setStage('Extracting syllabus…');
        try {
          const result = await uploadsApi.upload(pendingFile) as any;
          uploadId = result.upload_id;
          setDraft(prev => prev ? { ...prev, uploadId, fileName: pendingFile.name, extracted: null } : prev);
        } catch (err: any) {
          setErrorMsg(err?.message ?? 'Upload failed — please try again.');
          setPhase('error');
          return false;
        }
      }
      // Step B: extract
      setPhase('extracting');
      setStage('AI is reading your syllabus…');
      if (!uploadId) return false;
      setPhase('extracting');
      setStage('AI is reading your syllabus…');
      try {
        // Poll if still processing (async job path)
        let result = await uploadsApi.getExtraction(uploadId) as any;
        if (result.status === 'processing') {
          let attempts = 0;
          while (attempts < 60) {
            await new Promise(r => setTimeout(r, 3000));
            result = await uploadsApi.getExtraction(uploadId);
            if (result.status === 'done' || result.status === 'failed') break;
            attempts++;
          }
        }

        setStage('Building course structure…');
        const extracted = courseFromResult(result, draft!.details);
        linkCoKeys(extracted);
        setDraft(prev => prev ? { ...prev, extracted } : prev);
        setPhase('done');
        return true;
      } catch (err: any) {
        setErrorMsg(err?.message ?? 'Extraction failed — please try again.');
        setPhase('error');
        return false;
      }
    };

    // Paste path: store as pending file, then extract on button click
    const handlePasteExtract = async () => {
      const blob = new Blob([pasteText], { type: 'text/plain' });
      const file = new File([blob], 'syllabus.txt', { type: 'text/plain' });
      setPendingFile(file);
      setDraft(prev => prev ? { ...prev, fileName: file.name, uploadId: undefined, extracted: null } : prev);
      setPhase('ready');
      await runExtract();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) pickFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    };

    const busy = phase === 'uploading' || phase === 'extracting';

    return (
      <>
        <WinTopbar title="Create New Course" actions={<Btn variant="ghost" onClick={() => navigate(cancelPath)}>Cancel</Btn>} />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: `${draft!.details.code || 'New'} · Syllabus` }]} />
          <div style={{ maxWidth: 760, margin: '0 auto' }}><Stepper steps={stepLabels} current={2} onStepClick={gotoStep} /></div>
          <Card style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Upload syllabus</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              Upload your syllabus, then click <strong>Continue to finalize COs</strong> — AI will parse it into units, topics and outcomes.
            </div>

            {/* Upload tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {(['upload', 'paste'] as const).map(m => (
                <button key={m} onClick={() => { if (!busy) setMethod(m); }} style={{
                  height: 36, padding: '0 16px', borderRadius: 8,
                  border: `1px solid ${method === m ? 'var(--brand)' : 'var(--border)'}`,
                  background: method === m ? '#fff' : 'transparent',
                  fontFamily: W.fontSans, fontWeight: 600, fontSize: '.84rem',
                  color: method === m ? 'var(--brand)' : 'var(--text-2)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, cursor: busy ? 'not-allowed' : 'pointer', transition: '.15s',
                }}>
                  <span style={{ width: 16, height: 16, display: 'inline-flex' }}>{m === 'upload' ? <IUpload /> : <IText />}</span>
                  {m === 'upload' ? 'PDF / Image' : 'Paste text'}
                </button>
              ))}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Upload area */}
            {method === 'upload' ? (
              <div
                onClick={() => { if (!busy) fileInputRef.current?.click(); }}
                onDrop={e => { if (!busy) handleDrop(e); else e.preventDefault(); }}
                onDragOver={e => e.preventDefault()}
                style={{
                  border: `2px dashed ${phase === 'ready' || phase === 'done' ? W.brand : W.borderStrong}`,
                  borderRadius: W.r5, padding: '40px 24px', textAlign: 'center',
                  background: W.surfaceMuted, cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <div style={{ width: 34, height: 34, color: W.brand, margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}><IUpload /></div>
                {busy ? (
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, color: W.brand }}>{phase === 'uploading' ? 'Extracting…' : 'Processing…'}</div>
                ) : (
                  <>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                      {(pendingFile?.name || draft!.fileName) ? 'Click to replace file' : 'Drop a PDF or image, or browse'}
                    </div>
                    <div style={{ fontSize: 12.5, color: W.text2 }}>.pdf, .png, .jpg · up to 20 MB</div>
                  </>
                )}
                {(pendingFile?.name || draft!.fileName) && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', borderRadius: 8, padding: '10px 14px', fontWeight: 500, fontSize: 14, marginTop: 14 }}>
                    <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IFile /></span>
                    {(pendingFile?.name || draft!.fileName)}
                    {(phase === 'ready' || phase === 'done') && (
                      <span style={{ width: 16, height: 16, display: 'inline-flex', color: 'var(--status-green)' }}><ICheck /></span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Field label="Paste syllabus text">
                  <Textarea value={pasteText} onChange={setPasteText} rows={10} placeholder="Paste your syllabus content here…" />
                </Field>
                <Btn sm disabled={!pasteText.trim() || busy} onClick={handlePasteExtract}>
                  <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                  Parse pasted text
                </Btn>
              </div>
            )}

            {/* Shimmer skeleton while uploading/extracting */}
            {(phase === 'uploading' || phase === 'extracting') && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 18, height: 18, display: 'inline-flex', color: W.brand }}><ISpark /></span>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.brand }}>
                    {phase === 'uploading' ? 'Extracting syllabus…' : stage || 'AI is reading your syllabus…'}
                  </span>
                </div>
                {/* Shimmer rows */}
                {[90, 70, 80, 55, 75, 60].map((w, i) => (
                  <div key={i} style={{ height: 14, borderRadius: 7, marginBottom: 10, width: `${w}%`, background: 'linear-gradient(90deg, #E5E2FB 25%, #F1F0FD 50%, #E5E2FB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', animationDelay: `${i * 0.08}s` }} />
                ))}
                {/* Unit skeleton cards */}
                {[1, 2, 3].map(u => (
                  <div key={u} style={{ border: `1px solid ${W.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                    <div style={{ height: 14, borderRadius: 7, width: '45%', background: 'linear-gradient(90deg, #E5E2FB 25%, #F1F0FD 50%, #E5E2FB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 10 }} />
                    {[65, 50, 58].map((w2, j) => (
                      <div key={j} style={{ height: 11, borderRadius: 6, width: `${w2}%`, background: 'linear-gradient(90deg, #EEEDF8 25%, #F5F4FC 50%, #EEEDF8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 7, animationDelay: `${j * 0.1}s` }} />
                    ))}
                  </div>
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
              </div>
            )}

            {/* Error */}
            {phase === 'error' && (
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', color: 'var(--status-red)', fontSize: 13 }}>
                {errorMsg}
                <button onClick={() => setPhase('ready')} style={{ marginLeft: 12, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
              </div>
            )}

            {/* Extracted preview */}
            {phase === 'done' && draft!.extracted && (
              <ExtractedView
                extracted={draft!.extracted}
                onChange={() => forceUpdate(n => n + 1)}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <Btn variant="ghost" disabled={busy} onClick={() => setDraft(prev => prev ? { ...prev, step: 1 } : prev)}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back
              </Btn>
              <Btn variant="primary" disabled={phase === 'idle' || busy} onClick={async () => {
                if (phase === 'done' && draft!.extracted) {
                  const delta = (draft!.extracted?.libraryDelta || []).map((d: any) => ({ ...d, state: 'open' }));
                  setDraft(prev => prev ? { ...prev, step: 3, delta } : prev);
                } else if (phase === 'ready' || phase === 'error') {
                  await runExtract();
                }
              }}>
                {phase === 'extracting' ? (
                  <>
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                    Analysing…
                  </>
                ) : phase === 'done' ? (
                  <>
                    Continue to finalize COs
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IChevron /></span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                    Extract & Continue
                    <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IChevron /></span>
                  </>
                )}
              </Btn>
            </div>
          </Card>
        </WinContent>
      </>
    );
  }

  // ===== Create · Stage 3 — Review & create (single workspace) =====
  function ReviewStep() {
    const e = draft!.extracted;
    const [, forceUpdate] = useState(0);

    // Course identity — prefilled by the AI extraction, editable inline
    const d0 = draft!.details;
    const [code, setCode] = useState(String(e?.code || d0.code || ''));
    const [name, setName] = useState(e?.name || d0.name || '');
    const [institute, setInstitute] = useState(d0.institute || institutes[0]?.name || 'Winnify');
    const [program, setProgram] = useState(d0.program || 'B.Tech CSE');
    const [majors, setMajors] = useState<string[]>(
      d0.major && d0.major !== 'All' ? d0.major.split(',').map(s => s.trim()) : ['CSE']
    );
    const [regulation, setRegulation] = useState(String(e?.regulation || d0.regulation || 'R24'));
    const [sem, setSem] = useState(String(e?.sem || d0.sem || ''));
    const [credits, setCredits] = useState(String(e?.credits || d0.credits || ''));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [majorOpen, setMajorOpen] = useState(false);
    const majorRef = useClickOutside<HTMLDivElement>(majorOpen, () => setMajorOpen(false));
    const regOptions = Array.from(new Set([regulation, ...institutes.map(i => i.regulation).filter(Boolean), ...REGULATIONS]));
    const PROGRAMS = ['B.Tech', 'B.Tech CSE', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'BBA', 'B.Com', 'M.Com', 'B.Arch', 'Ph.D'];
    const progOptions = Array.from(new Set([program, ...PROGRAMS].filter(Boolean)));

    // Structure editing
    const [topicModal, setTopicModal] = useState<{ ui: number; ti: number | null } | null>(null);
    const [unitEdit, setUnitEdit] = useState<string | null>(null);

    useEffect(() => {
      if (!e) return;
      linkCoKeys(e);
      const bloomMap: Record<string, string> = { L1: 'Remember', L2: 'Understand', L3: 'Apply', L4: 'Analyze', L5: 'Evaluate', L6: 'Create' };
      // Once per extraction: the CO's default level is what the syllabus itself
      // declares (P2); the pipeline's evaluated level becomes the industry
      // target (P4) — so the "Industry expects" delta is real, not circular.
      const evaluated: any[] = (e as any)._pipelineEvaluated ?? [];
      const syllabusBloom: any[] = (e as any)._pipelineBloom ?? [];
      if ((evaluated.length > 0 || syllabusBloom.length > 0) && !(e as any)._evaluatedApplied) {
        (e as any)._evaluatedApplied = true;
        const regular = e.cos.filter(c => !c.isIndustry);
        const coFor = (co_id: any, i: number) => {
          const idx = parseInt(String(co_id ?? '').replace(/\D/g, ''), 10);
          return regular[(isNaN(idx) ? i + 1 : idx) - 1];
        };
        syllabusBloom.forEach((m: any, i: number) => {
          const co = coFor(m.co_id, i);
          const b = bloomMap[m.bloom_level];
          if (co && b) co.bloom = b;
        });
        evaluated.forEach((ev: any, i: number) => {
          const co = coFor(ev.co_id, i);
          if (!co) return;
          co.industryBloom = bloomMap[ev.bloom_level] ?? ev.bloom_level ?? undefined;
          co.aiReason = ev.reason ?? undefined;
          if (ev.action === 'rewritten' && ev.final_text && normCo(ev.final_text) !== normCo(co.text)) {
            co.aiText = ev.final_text;
          }
        });
        forceUpdate(n => n + 1);
      }
      // Auto-inject pipeline suggested outcomes as Winnify Industry Outcomes
      // (IOx) once — capped at MAX_IOS, each mapped to its best-fit topics.
      const pipelineSugs: any[] = (e as any)._pipelineSuggested ?? [];
      if (pipelineSugs.length > 0 && !(e as any)._pipelineInjected) {
        (e as any)._pipelineInjected = true;
        const existing = new Set(e.cos.map(c => normCo(c.text)));
        let ioCount = e.cos.filter(c => c.isIndustry).length;
        pipelineSugs.forEach((s: any) => {
          if (ioCount >= MAX_IOS) return;
          const text = s.text ?? '';
          if (text && !existing.has(normCo(text))) {
            const rawBloom = s.bloom_name ?? s.bloom_level ?? 'Apply';
            const bloom = bloomMap[rawBloom] ?? rawBloom;
            const io: CO = { id: 'IO', key: ckey(), text, bloom, isIndustry: true };
            e.cos.push(io);
            existing.add(normCo(text));
            ioCount++;
            autoMapIoTopics(e, io, text);
          }
        });
        renumberCos(e.cos);
        forceUpdate(n => n + 1);
      }
    }, [(e as any)?._pipelineSuggested?.length]);
    const [coModal, setCoModal] = useState<{ idx: number | null } | null>(null);
    const [saving, setSaving] = useState(false);
    // Mapping mode: the outcome currently being wired to topics in the structure pane
    const [activeKey, setActiveKey] = useState<string | null>(null);
    useEffect(() => {
      if (!activeKey) return;
      const h = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setActiveKey(null); };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, [activeKey]);

    if (!e) return null;
    const cos = e.cos || [];
    const bloomCounts: Record<string, number> = {};
    cos.forEach(c => { bloomCounts[c.bloom] = (bloomCounts[c.bloom] || 0) + 1; });
    const nCo = cos.filter(c => !c.isIndustry).length;
    const nIo = cos.length - nCo;
    const activeCo = activeKey ? cos.find(c => c.key === activeKey) ?? null : null;
    const unmapped = e.units.reduce((s, u) => s + u.topics.filter(t => !t.coKey).length, 0);

    const finalize = async () => {
      const errs: Record<string, string> = {};
      if (!code.trim()) errs.code = 'Required';
      if (!name.trim()) errs.name = 'Required';
      if (Object.keys(errs).length) {
        // No toast here: a toast re-renders the context and remounts this
        // inline step component, wiping the error state it just set.
        setErrors(errs);
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!cos.length) { toast('Add at least one course outcome'); return; }
      setSaving(true);
      try {
        const d = {
          code: code.trim(), name: name.trim(), institute, program,
          major: majors.length === MAJORS.length || !majors.length ? 'All' : majors.join(', '),
          regulation, sem, credits,
        };

        // 1. Create the course record with units + COs in one call
        const created = await coursesApi.create({
          code: d.code,
          name: d.name,
          credits: Number(d.credits) || 0,
          semester: String(d.sem),
          regulation: d.regulation,
          status: 'draft',
          course_outcomes: cos.map(c => ({ text: c.text, bloom: c.bloom || '' })) as any,
          units: e.units.map((u, ui) => ({
            unit_number: ui + 1,
            title: u.title || `Unit ${ui + 1}`,
            hours: (u as any).hours || 0,
            // Send the wizard's CO mapping and bloom along — a bare name list
            // dropped both, so every later surface fell back to guessing the
            // CO from the unit position.
            topics: u.topics.map(t => {
              const coIdx = t.coKey ? cos.findIndex(c => c.key === t.coKey) : -1;
              return {
                title: t.name,
                co_number: coIdx >= 0 ? coIdx + 1 : t.coNumber ?? null,
                bloom_level: t.co?.bloom || null,
              };
            }),
          })),
        });

        // 2. If there's an upload, commit subtopics + bloom levels via the upload path
        if (draft!.uploadId) {
          const flatTopics = e.units.flatMap((u, ui) =>
            u.topics.map(t => ({
              unit_index: ui,
              title: t.name,
              subtopics: t.subs,
              co_text: t.co.text,
              bloom: t.co.bloom,
            }))
          );
          await uploadsApi.commit(draft!.uploadId, {
            course_id: created.id,
            cos: [],
            topics: flatTopics,
            replace_cos: false,
            replace_topics: true,
          });
        }

        // 3. Industry & AI topics accepted into this course become reusable
        // Industry-topic-library entries for every future course.
        const accepted: any[] = ((e as any).addTopics ?? []).filter((s: any) => s.state === 'added');
        if (accepted.length) {
          addToIndustryLibrary(accepted.map((s: any) => ({
            cat: s.cat, name: s.name, subs: s.subs ?? [], co: s.co, bloom: s.bloom,
          })));
        }

        // 4. Optimistically add to local state so the list shows immediately
        const local: Course = JSON.parse(JSON.stringify(e));
        Object.assign(local, { id: created.id, code: d.code, name: d.name, institute: d.institute, program: d.program, major: d.major, sem: d.sem, credits: d.credits, regulation: d.regulation, status: 'draft' });
        delete local.libraryDelta; delete local.coMapping;
        local.units.forEach(u => u.topics.forEach(t => { if (!t.artifacts) t.artifacts = newArtifacts(); if (!t.id) t.id = nid(); }));
        setCourses(prev => [local, ...prev]);

        qc.invalidateQueries({ queryKey: ['courses'] });
        setDraft(null);
        setCurrentCourse(local);
        const nt = allTopics(local).length;
        navigate(`/winteach/courses/${created.id}`);
        toast(`Course plan finalized · ${nt} topics queued for generation`);
      } catch (err) {
        toast('Failed to save course — check backend');
        setSaving(false);
      }
    };

    return (
      <>
        {/* Full-screen saving overlay */}
        {saving && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(255,255,255,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 28, height: 28, display: 'inline-flex', color: W.brand, animation: 'spin 1s linear infinite' }}><ISpark /></span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 22, color: W.text, marginBottom: 6 }}>Creating your course…</div>
              <div style={{ fontSize: 14, color: W.text2 }}>AI is building the course plan. This takes a few seconds.</div>
            </div>
            {/* Progress shimmer bar */}
            <div style={{ width: 280, height: 6, borderRadius: 6, background: W.surfaceMuted, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${W.brand} 0%, #A78BFA 50%, ${W.brand} 100%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          </div>
        )}
        <WinTopbar title="Create New Course" actions={<Btn variant="ghost" onClick={() => navigate(cancelPath)}>Cancel</Btn>} />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: `${name || code || 'New course'} · Review` }]} />
          <div style={{ maxWidth: 1160, margin: '0 auto' }}><Stepper steps={stepLabels} current={3} onStepClick={gotoStep} /></div>

          {/* ── Course identity — AI-prefilled, editable inline ── */}
          <Card style={{ maxWidth: 1160, margin: '0 auto 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, borderRadius: W.r6, padding: '3px 11px', background: W.greenBg, color: W.greenFg }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {draft!.fileName ? `Built from ${draft!.fileName}` : 'Blank plan'}
              </span>
              <span style={{ fontSize: 12.5, color: W.text2 }}>
                {e.units.filter(u => !u.isElective && u.n !== 'E').length} units · {e.units.reduce((s, u) => s + u.topics.length, 0)} topics · {cos.length} outcomes
              </span>
              {(((e as any)._coverageReport?.flagged_units ?? []) as number[]).length > 0 && (
                <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11.5, borderRadius: 6, padding: '2px 9px', background: W.orangeBg, color: W.orangeFg }}
                  title="Some units may be missing syllabus content — check their topics in the structure pane.">
                  Coverage: review Unit {((e as any)._coverageReport.flagged_units as number[]).join(', ')}
                </span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: W.text3 }}>Everything below is editable — review, adjust, create.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr)', gap: '0 16px' }}>
              <Field label="Course code" error={errors.code}>
                <Input value={code} onChange={v => { setCode(v); setErrors(er => ({ ...er, code: '' })); }} placeholder="e.g. CS401" />
              </Field>
              <Field label="Course name" error={errors.name}>
                <Input value={name} onChange={v => { setName(v); setErrors(er => ({ ...er, name: '' })); }} placeholder="e.g. Operating Systems" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0 14px' }}>
              <Field label="Institute"><Select value={institute} onChange={setInstitute} options={instNames.length ? instNames : [institute]} /></Field>
              <Field label="Program"><Select value={program} onChange={setProgram} options={progOptions} /></Field>
              <Field label="Major">
                <div ref={majorRef} style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setMajorOpen(o => !o)}
                    style={{ width: '100%', background: 'var(--input-bg)', border: `1.5px solid ${majorOpen ? W.brand : W.border}`, borderRadius: W.r4, padding: '10px 12px', fontFamily: W.fontSans, fontSize: 14, color: majors.length ? 'var(--input-fg)' : W.text3, outline: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {majors.length === MAJORS.length ? 'All' : majors.length ? majors.join(', ') : 'Select…'}
                    </span>
                    <span style={{ fontSize: 9, color: W.text3, flexShrink: 0, marginLeft: 4 }}>▾</span>
                  </button>
                  {majorOpen && (
                    <div style={{ position: 'absolute', zIndex: 60, top: '100%', left: 0, minWidth: 180, marginTop: 4, background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 8, boxShadow: W.shadowCard, padding: 6, maxHeight: 220, overflowY: 'auto' }}>
                      <div onClick={() => setMajors(majors.length === MAJORS.length ? [] : [...MAJORS])}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', borderBottom: `1px solid ${W.border}`, marginBottom: 4 }}>
                        <MapCheck checked={majors.length === MAJORS.length} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: W.text }}>All</span>
                      </div>
                      {MAJORS.map(m => (
                        <div key={m} onClick={() => setMajors(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, cursor: 'pointer' }}
                          onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-muted)')}
                          onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                          <MapCheck checked={majors.includes(m)} />
                          <span style={{ fontSize: 13, color: W.text }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Regulation"><Select value={regulation} onChange={setRegulation} options={regOptions} /></Field>
              <Field label="Semester"><Input value={sem} onChange={setSem} type="number" placeholder="e.g. 4" /></Field>
              <Field label="Credits"><Input value={credits} onChange={setCredits} type="number" placeholder="e.g. 3" /></Field>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)', gap: 18, maxWidth: 1160, margin: '0 auto', alignItems: 'start' }}>

            {/* ── Outcomes (left pane) ── */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 6 }}>Course outcomes</div>
                  <div style={{ fontSize: 13.5, color: W.text2, lineHeight: 1.55 }}>
                    Click text to edit it in place, use the badge to change the Bloom level, and <strong>Map topics</strong> to link an outcome to the course structure on the right.
                  </div>
                </div>
                <Btn sm onClick={() => setCoModal({ idx: null })} style={{ flexShrink: 0 }}>
                  <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add CO
                </Btn>
              </div>

              {/* Summary strip */}
              <div style={{ background: 'var(--surface-muted)', borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', margin: '16px 0 18px' }}>
                <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text, whiteSpace: 'nowrap' }}>
                  {nCo} CO{nCo === 1 ? '' : 's'}{nIo ? ` · ${nIo} IO${nIo === 1 ? '' : 's'}` : ''}
                </span>
                <div style={{ width: 1, height: 20, background: W.borderStrong }} />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
                  {BLOOM.map(b => bloomCounts[b]
                    ? <BloomBadge key={b} bloom={`${bloomCounts[b]} ${b}`} />
                    : <span key={b} style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, borderRadius: 6, padding: '2px 8px', border: `1px dashed ${W.border}`, color: W.text3 }}>0 {b}</span>
                  )}
                </div>
              </div>

              {cos.length ? cos.map((co, i) => {
                const isIndustry = co.isIndustry;
                const isActive = !!activeCo && activeCo.key === co.key;
                const mapped = topicsForCo(e, co);
                return (
                <div key={co.key ?? co.id}
                  onClick={() => setActiveKey(isActive ? null : co.key ?? null)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                    border: isActive ? `1.5px solid ${W.brand}` : `1px solid ${isIndustry ? W.blueFg : W.border}`,
                    boxShadow: isActive ? '0 0 0 3px rgba(108,92,231,.10)' : 'none',
                    borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                    background: isIndustry ? 'rgba(37,99,235,.03)' : 'var(--card)',
                    transition: 'border-color .12s, box-shadow .12s',
                  }}>
                  <div style={{ flex: '0 0 44px', paddingTop: 2 }}>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: isIndustry ? W.blueFg : W.brand }}>{co.id}</div>
                    {isIndustry && <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: W.blueFg, marginTop: 2 }}>Industry</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isIndustry && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, color: W.blueFg, background: 'rgba(37,99,235,.08)', borderRadius: 6, padding: '2px 8px', marginBottom: 6 }}>
                        <span style={{ width: 12, height: 12, display: 'inline-flex' }}><ISpark /></span>
                        Suggested by Winnify AI
                      </div>
                    )}
                    <InlineCoText value={co.text} onSave={v => { co.text = v; forceUpdate(n => n + 1); }} />
                    {/* AI-improved wording (pipeline flagged this CO as weak) */}
                    {co.aiText && (
                      <div onClick={ev => ev.stopPropagation()} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--tint-brand-bg)', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
                        <span style={{ width: 13, height: 13, display: 'inline-flex', color: 'var(--tint-brand-fg)', flexShrink: 0, marginTop: 2 }}><ISpark /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, color: 'var(--tint-brand-fg)', marginBottom: 2 }}>AI-improved wording</div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.5, color: W.text }} title={co.aiReason}>{co.aiText}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => { co.text = co.aiText!; co.aiText = undefined; forceUpdate(n => n + 1); }}
                            style={{ border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, fontFamily: W.fontDisplay, cursor: 'pointer' }}>Use</button>
                          <button onClick={() => { co.aiText = undefined; forceUpdate(n => n + 1); }} title="Dismiss suggestion"
                            style={{ border: 'none', background: 'transparent', color: W.text3, cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 4px' }}>×</button>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }} onClick={ev => ev.stopPropagation()}>
                      <BloomSelect value={co.bloom} onChange={b => { co.bloom = b; forceUpdate(n => n + 1); }} industryBloom={co.industryBloom} />
                      {/* Industry expects a higher Bloom level — one click to adopt it */}
                      {co.industryBloom && BLOOM.findIndex(x => x.toLowerCase() === co.bloom?.toLowerCase()) < BLOOM.findIndex(x => x.toLowerCase() === co.industryBloom!.toLowerCase()) && (
                        <button onClick={() => { co.bloom = co.industryBloom!; forceUpdate(n => n + 1); }}
                          title={co.aiReason || `Industry expects students to reach ${co.industryBloom} for this outcome`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: W.blueBg, color: W.blueFg, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600, fontFamily: W.fontDisplay, cursor: 'pointer' }}>
                          Industry expects {co.industryBloom} ↑
                        </button>
                      )}
                      <button onClick={() => setActiveKey(isActive ? null : co.key ?? null)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                          border: isActive ? 'none' : `1px dashed ${W.borderStrong}`,
                          background: isActive ? 'var(--brand)' : 'transparent',
                          color: isActive ? '#fff' : W.text2,
                          borderRadius: 6, padding: isActive ? '3px 9px' : '2px 8px',
                          fontSize: 11, fontWeight: 600, fontFamily: W.fontDisplay,
                        }}>
                        {isActive ? 'Done mapping' : 'Map topics'}
                      </button>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} onClick={ev => ev.stopPropagation()}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: W.text2 }}>Maps to:</span>
                      {mapped.map(t => (
                        <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: W.text2, background: W.surfaceMuted, borderRadius: 6, padding: '2px 4px 2px 8px' }}>
                          {t.name}
                          <button onClick={() => { t.coKey = null; forceUpdate(n => n + 1); }} title="Unmap topic"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: W.text3, fontSize: 12, lineHeight: 1, padding: '0 3px' }}>×</button>
                        </span>
                      ))}
                      {!mapped.length && (
                        <span style={{ fontSize: 12, color: isActive ? W.brand : W.text3, fontStyle: 'italic' }}>
                          {isActive ? 'click topics on the right →' : 'no topics yet'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={ev => ev.stopPropagation()}>
                    <CoIcon onClick={() => setCoModal({ idx: i })} title="Edit CO"><IEdit /></CoIcon>
                    <CoIcon danger onClick={() => {
                      const removed = e.cos[i];
                      e.cos.splice(i, 1);
                      if (removed?.key) {
                        e.units.forEach(u => u.topics.forEach(t => { if (t.coKey === removed.key) t.coKey = null; }));
                        if (activeKey === removed.key) setActiveKey(null);
                      }
                      renumberCos(e.cos); forceUpdate(n => n + 1);
                    }} title="Delete CO"><ITrash /></CoIcon>
                  </div>
                </div>
              );}) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 16, border: `1px dashed ${W.border}`, borderRadius: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: W.text2 }}>No course outcomes yet — add one above.</span>
                </div>
              )}
            </Card>

            {/* ── Course structure (right pane, sticky) ── */}
            <Card compact style={{ position: 'sticky', top: 16, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Course structure</div>
              <div style={{
                fontSize: 12, lineHeight: 1.5, borderRadius: 8, padding: '8px 10px', marginBottom: 12,
                background: activeCo ? 'var(--tint-brand-bg)' : W.surfaceMuted,
                color: activeCo ? 'var(--tint-brand-fg)' : W.text2,
              }}>
                {activeCo
                  ? <>Mapping <strong>{activeCo.id}</strong> — click topics to link or unlink. Esc when done.</>
                  : <>Select an outcome on the left, then click topics here to map them.</>}
              </div>
              {e.units.map((u, ui) => (
                <div key={u.n} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: W.surfaceMuted, borderRadius: 8 }}>
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12, color: W.brand, flexShrink: 0 }}>Unit {u.n}</span>
                    {unitEdit === u.n ? (
                      <input autoFocus defaultValue={u.title}
                        onBlur={ev => { const v = ev.target.value.trim(); if (v) u.title = v; setUnitEdit(null); forceUpdate(n => n + 1); }}
                        onKeyDown={ev => { if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur(); if (ev.key === 'Escape') setUnitEdit(null); }}
                        style={{ flex: 1, minWidth: 0, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: 'var(--input-fg)', background: 'var(--input-bg)', border: `1.5px solid ${W.brand}`, borderRadius: 6, padding: '2px 6px', outline: 'none' }} />
                    ) : (
                      <span onClick={() => setUnitEdit(u.n)} title="Click to rename unit"
                        style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text' }}>{u.title}</span>
                    )}
                    {(u.isElective || u.n === 'E') && <ElectiveTag />}
                    <button onClick={() => setTopicModal({ ui, ti: null })} title="Add topic"
                      style={{ marginLeft: 'auto', width: 22, height: 22, flexShrink: 0, border: `1px solid ${W.border}`, background: 'var(--card)', color: W.text2, borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 12, height: 12, display: 'inline-flex' }}><IPlus /></span>
                    </button>
                  </div>
                  {u.topics.map((t, ti) => {
                    const mappedCo = t.coKey ? cos.find(c => c.key === t.coKey) : null;
                    const isMine = !!activeCo && t.coKey === activeCo.key;
                    return (
                      <div key={t.id}
                        onClick={activeCo ? () => { t.coKey = isMine ? null : activeCo.key ?? null; forceUpdate(n => n + 1); } : undefined}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 7, cursor: activeCo ? 'pointer' : 'default', background: isMine ? 'var(--tint-brand-bg)' : 'transparent' }}
                        onMouseEnter={activeCo ? ev => { if (!isMine) ev.currentTarget.style.background = 'var(--surface-muted)'; } : undefined}
                        onMouseLeave={activeCo ? ev => { ev.currentTarget.style.background = isMine ? 'var(--tint-brand-bg)' : 'transparent'; } : undefined}>
                        {activeCo && <MapCheck checked={isMine} />}
                        <span style={{ fontSize: 12.5, color: W.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={t.name}>{t.name}</span>
                        {!activeCo && (
                          <span style={{ display: 'inline-flex', gap: 2, flexShrink: 0 }} onClick={ev => ev.stopPropagation()}>
                            <button onClick={() => setTopicModal({ ui, ti })} title="Edit topic"
                              style={{ width: 20, height: 20, border: 'none', background: 'transparent', color: W.text3, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}
                              onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--text)')}
                              onMouseLeave={ev => (ev.currentTarget.style.color = '')}>
                              <span style={{ width: 12, height: 12, display: 'inline-flex' }}><IEdit /></span>
                            </button>
                            <button onClick={() => { u.topics.splice(ti, 1); forceUpdate(n => n + 1); }} title="Delete topic"
                              style={{ width: 20, height: 20, border: 'none', background: 'transparent', color: W.text3, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}
                              onMouseEnter={ev => (ev.currentTarget.style.color = 'var(--status-red)')}
                              onMouseLeave={ev => (ev.currentTarget.style.color = '')}>
                              <span style={{ width: 12, height: 12, display: 'inline-flex' }}><ITrash /></span>
                            </button>
                          </span>
                        )}
                        {mappedCo
                          ? <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10, color: mappedCo.isIndustry ? W.blueFg : 'var(--tint-brand-fg)', background: mappedCo.isIndustry ? W.blueBg : 'var(--tint-brand-bg)', borderRadius: 5, padding: '1px 6px', flexShrink: 0 }}>{mappedCo.id}</span>
                          : <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10, color: W.orangeFg, background: W.orangeBg, borderRadius: 5, padding: '1px 6px', flexShrink: 0 }}>unmapped</span>}
                      </div>
                    );
                  })}
                  {!u.topics.length && <div style={{ fontSize: 12, color: W.text3, padding: '6px 9px', fontStyle: 'italic' }}>No topics — add one with the + above</div>}
                </div>
              ))}
              <button
                onClick={() => {
                  const nums = e.units.map(x => parseInt(x.n, 10)).filter(n => !isNaN(n));
                  // Roman-numeral unit ids don't parse — fall back to the unit count
                  const next = (nums.length ? Math.max(...nums) : e.units.length) + 1;
                  e.units.push({ n: String(next), title: `Unit ${next}`, topics: [] });
                  forceUpdate(n => n + 1);
                }}
                style={{ width: '100%', border: `1px dashed ${W.borderStrong}`, background: 'transparent', color: W.text2, borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, fontFamily: W.fontDisplay, cursor: 'pointer' }}
                onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'var(--brand)'; ev.currentTarget.style.color = 'var(--brand)'; }}
                onMouseLeave={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.color = ''; }}>
                + Add unit
              </button>
              <AddIndustryTopicsSection extracted={e} onChange={() => forceUpdate(n => n + 1)} />
            </Card>
          </div>

          {/* Footer actions — pinned to the viewport so Create course is always reachable */}
          <div style={{ position: 'sticky', bottom: 12, zIndex: 40, maxWidth: 1160, margin: '18px auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 12, padding: '10px 14px', boxShadow: W.shadowPop }}>
              <Btn variant="ghost" onClick={() => setDraft(prev => prev ? { ...prev, step: 1 } : prev)}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Start over
              </Btn>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {unmapped > 0
                  ? <span style={{ fontSize: 12.5, color: W.orangeFg }}>{unmapped} topic{unmapped === 1 ? '' : 's'} not mapped to an outcome</span>
                  : cos.length > 0 && <span style={{ fontSize: 12.5, color: W.greenFg }}>All topics mapped</span>}
                <Btn variant="primary" onClick={finalize} disabled={saving}>
                  <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                  {saving ? 'Creating course…' : 'Create course'}
                </Btn>
              </div>
            </div>
          </div>
        </WinContent>

        {coModal && (
          <CoEditorModal
            cos={cos}
            idx={coModal.idx}
            course={e}
            onClose={() => setCoModal(null)}
            onChange={() => { renumberCos(e.cos); forceUpdate(n => n + 1); }}
          />
        )}
        {topicModal && (
          <TopicEditorModal
            extracted={e}
            ui={topicModal.ui}
            ti={topicModal.ti}
            onClose={() => setTopicModal(null)}
            onChange={() => forceUpdate(n => n + 1)}
          />
        )}
      </>
    );
  }

  // ===== Edit Plan Step =====
  function EditPlanStep() {
    const e = draft!.extracted;
    const [, forceUpdate] = useState(0);
    const [topicModal, setTopicModal] = useState<{ ui: number; ti: number | null } | null>(null);
    const [saving, setSaving] = useState(false);

    if (!e) return null;

    const save = async () => {
      const target = draft!.target;
      if (!target || !target.id) return;
      setSaving(true);
      try {
        const d = draft!.details;
        await coursesApi.update(target.id, {
          code: d.code || e.code,
          name: d.name || e.name,
          semester: String(d.sem),
          credits: Number(d.credits),
          regulation: d.regulation,
        });
        qc.invalidateQueries({ queryKey: ['courses', target.id] });

        // Update local state immediately
        const built: Course = JSON.parse(JSON.stringify(e));
        Object.assign(target, { code: d.code || built.code, name: d.name || built.name, institute: d.institute, program: d.program, major: d.major, sem: d.sem, credits: d.credits, regulation: d.regulation, units: built.units });
        target.units.forEach((u: Unit) => u.topics.forEach((t: Topic) => { if (!t.artifacts) t.artifacts = newArtifacts(); if (!t.id) t.id = nid(); }));
        setCurrentCourse(target);
        setDraft(null);
        navigate(`/winteach/courses/${target.id}`);
        toast('Course plan updated');
      } catch {
        toast('Failed to save — check backend');
        setSaving(false);
      }
    };

    return (
      <>
        <WinTopbar title="Edit Course" actions={<Btn variant="ghost" onClick={() => navigate(cancelPath)}>Cancel</Btn>} />
        <WinContent>
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: `${draft!.details.code} · Edit plan` }]} />
          <div style={{ maxWidth: 900, margin: '0 auto' }}><Stepper steps={stepLabels} current={3} onStepClick={gotoStep} /></div>
          <Card style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Edit course plan</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              Each topic carries one mapped course outcome (Bloom-tagged). Edit topics or their outcomes, add a topic.
            </div>
            {e.units.map((u, ui) => (
              <div key={u.n} style={{ border: `1px solid ${W.border}`, borderRadius: 10, marginBottom: 14, overflow: 'hidden', background: 'var(--card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: W.surfaceMuted }}>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>Unit {u.n}</span>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{u.title}</span>
                  {(u.isElective || u.n === 'E') && <ElectiveTag />}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: W.text2 }}>{u.topics.length} topics</span>
                  <CoIcon onClick={() => setTopicModal({ ui, ti: null })} title="Add topic"><IPlus /></CoIcon>
                </div>
                {u.topics.map((t, ti) => (
                  <div key={t.id} style={{ padding: '14px 18px', borderBottom: ti < u.topics.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <BloomBadge bloom={t.co.bloom} />
                          <span style={{ fontSize: 12.5, color: W.text2 }}>CO: {t.co.text}</span>
                        </div>
                        <div style={{ marginTop: 8 }}>{t.subs.map(s => <SubChip key={s}>{s}</SubChip>)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <CoIcon onClick={() => setTopicModal({ ui, ti })} title="Edit topic"><IEdit /></CoIcon>
                        <CoIcon danger onClick={() => { e.units[ui].topics.splice(ti, 1); forceUpdate(n => n + 1); }} title="Delete topic"><ITrash /></CoIcon>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <Btn variant="ghost" onClick={() => setDraft(prev => prev ? { ...prev, step: 1 } : prev)}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back
              </Btn>
              <Btn variant="primary" onClick={save} disabled={saving}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
                {saving ? 'Saving…' : 'Save changes'}
              </Btn>
            </div>
          </Card>
        </WinContent>
        {topicModal && (
          <TopicEditorModal
            extracted={e}
            ui={topicModal.ui}
            ti={topicModal.ti}
            onClose={() => setTopicModal(null)}
            onChange={() => forceUpdate(n => n + 1)}
          />
        )}
      </>
    );
  }
}

// Courses carry at most this many Industry Outcomes.
const MAX_IOS = 2;

// ---- Best-effort default topic mapping for an injected IO ----
// Scores every topic by keyword overlap with the IO text, boosted when a
// matching P3 industry skill explicitly names the topic. Unmapped topics are
// preferred; an already-mapped topic is reassigned only as a last resort.
function autoMapIoTopics(course: Course, io: CO, ioText: string): void {
  const STOP = new Set(['with', 'using', 'apply', 'build', 'design', 'develop', 'implement', 'industry', 'modern', 'based', 'their', 'through', 'tools', 'workflows', 'students', 'techniques', 'solutions', 'real', 'world', 'production', 'services']);
  const ioNorm = normCo(ioText);
  const words = ioNorm.split(' ').filter(w => w.length > 3 && !STOP.has(w));

  const hinted = new Set<string>();
  const skills: any[] = (course as any)._pipelineIndustryTopics ?? [];
  skills.forEach((s: any) => {
    const nameWords = normCo(String(s.skill_name ?? '')).split(' ').filter(w => w.length > 3);
    if (nameWords.some(w => ioNorm.includes(w))) {
      (s.relevant_topics ?? []).forEach((rt: string) => hinted.add(normCo(String(rt))));
    }
  });

  const scored = course.units.flatMap(u => u.topics).map(t => {
    const hay = normCo(t.name + ' ' + t.subs.join(' '));
    let score = words.filter(w => hay.includes(w)).length;
    if (hinted.has(normCo(t.name))) score += 3;
    return { t, score };
  }).filter(x => x.score > 0);

  scored.sort((a, b) => (Number(!!a.t.coKey) - Number(!!b.t.coKey)) || (b.score - a.score));
  scored.slice(0, 2).forEach(x => { x.t.coKey = io.key; });
}

// ---- Map an extraction API result onto the Course shape the flow edits ----
function courseFromResult(result: any, details: any): Course {
  const strVal = (f: { value: string | string[] | null } | undefined) =>
    Array.isArray(f?.value) ? f!.value.join(', ') : (f?.value ?? '');

  const ai = result.ai_extraction;
  const ex = result.extraction;
  const coverageReport = result.extraction?.coverage_report ?? null;
  const pipelineSuggested: any[] = result.extraction?.pipeline_result?.p4_co_evaluation?.suggested_cos ?? [];
  const pipelineEvaluated: any[] = result.extraction?.pipeline_result?.p4_co_evaluation?.evaluated_cos ?? [];
  // P2 = the Bloom level each CO declares in the syllabus itself (pre-evaluation)
  const pipelineBloom: any[] = result.extraction?.pipeline_result?.p2_bloom_mapping?.bloom_mapping ?? [];
  const p3 = result.extraction?.pipeline_result?.p3_industry_skills;
  const pipelineIndustryTopics: any[] = Array.isArray(p3?.industry_skills) ? p3.industry_skills : (Array.isArray(p3) ? p3 : []);

  if (ai && (ai.units?.length || ai.course_outcomes?.length)) {
    const bloomNameMap: Record<string, string> = { L1: 'Remember', L2: 'Understand', L3: 'Apply', L4: 'Analyze', L5: 'Evaluate', L6: 'Create' };
    const normBloom = (v: string | undefined) => { if (!v) return 'Understand'; return bloomNameMap[v] ?? v; };
    const units: Unit[] = (ai.units ?? []).map((u: any, ui: number) => ({
      n: String(u.unit_number ?? ui + 1),
      title: u.title ?? `Unit ${ui + 1}`,
      hours: u.hours ?? 0,
      topics: (u.topics ?? []).map((t: any) => ({
        id: nid(),
        name: t.title,
        subs: (t.subtopics ?? []).map((s: any) => s.title ?? s),
        co: { text: '', bloom: normBloom(t.bloom_level) },
        coNumber: t.co_number ?? null,
        artifacts: newArtifacts(),
      })),
    }));
    const cos: CO[] = (ai.course_outcomes ?? []).map((c: any, i: number) => ({
      id: `CO${i + 1}`,
      text: c.text,
      bloom: normBloom(c.bloom_level),
    }));
    return {
      id: '', code: ai.course_code || details.code,
      name: ai.course_name || details.name,
      credits: ai.credits || details.credits,
      sem: ai.semester || details.sem,
      regulation: ai.regulation || details.regulation,
      institute: details.institute, program: details.program,
      major: details.major, status: 'draft', cos, units,
      _pipelineSuggested: pipelineSuggested,
      _pipelineEvaluated: pipelineEvaluated,
      _pipelineBloom: pipelineBloom,
      _pipelineIndustryTopics: pipelineIndustryTopics,
      _coverageReport: coverageReport,
    } as any;
  }

  const coStrings: string[] = Array.isArray(ex?.course_outcomes?.value) ? ex.course_outcomes.value : [];
  return {
    id: '',
    code:      strVal(ex?.course_code)  || details.code,
    name:      strVal(ex?.course_name)  || details.name,
    credits:   strVal(ex?.credits)      || details.credits,
    sem:       strVal(ex?.semester)     || details.sem,
    regulation: details.regulation,
    institute: details.institute, program: details.program,
    major: details.major, status: 'draft',
    cos: coStrings.map((text, i) => ({ id: `CO${i + 1}`, text, bloom: 'Understand' as string })),
    units: [],
  } as Course;
}

// ---- Extracted view sub-component ----
function ExtractedView({ extracted, onChange }: {
  extracted: Course;
  onChange: () => void;
}) {
  const e = extracted;
  const [topicModal, setTopicModal] = useState<{ ui: number; ti: number | null } | null>(null);
  const [cosOpen, setCosOpen] = useState(true);
  const [structOpen, setStructOpen] = useState(true);
  const [, forceUpdate] = useState(0);
  const nt = e.units.reduce((s, u) => s + u.topics.length, 0);
  const ns = e.units.reduce((s, u) => s + u.topics.reduce((a, t) => a + t.subs.length, 0), 0);
  const cov: any = (e as any)._coverageReport;
  const covByUnit: Record<string, any> = {};
  (cov?.units ?? []).forEach((cu: any) => { covByUnit[String(cu.unit_number)] = cu; });
  const flaggedUnits: number[] = cov?.flagged_units ?? [];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: W.greenBg, borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, borderRadius: W.r6, padding: '3px 11px', background: W.greenBg, color: W.greenFg }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />Extracted
        </span>
        <span style={{ fontSize: 12.5, color: W.text }}>{e.units.filter((u: any) => !u.isElective && u.n !== 'E').length} units · {nt} topics · {ns} subtopics · {(e.cos || []).filter((c: any) => !c.isIndustry).length} course outcomes</span>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: W.text2 }}>Review & edit before continuing</span>
      </div>

      {flaggedUnits.length > 0 && (
        <div style={{ background: W.orangeBg, borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.orangeFg }}>Coverage check</span>
          <span style={{ fontSize: 12.5, color: W.text }}>
            {flaggedUnits.map(n => `Unit ${n}`).join(', ')} may be missing content from the syllabus — compare against the original document below.
          </span>
        </div>
      )}

      {/* Read-only outcome preview — editing, mapping and enrichment happen in the next step */}
      <div
        onClick={() => setCosOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: cosOpen ? 12 : 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, display: 'inline-flex', transition: 'transform .15s', transform: cosOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}><IChevron /></span>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Course Outcomes — {(e.cos || []).filter((c: any) => !c.isIndustry).length} extracted</div>
        </div>
        <span style={{ fontSize: 12, color: W.text3 }}>You'll refine &amp; map these in the next step</span>
      </div>
      {cosOpen && (e.cos || []).filter((co: any) => !co.isIndustry).length > 0 && (
        <div style={{ border: `1px solid ${W.border}`, borderRadius: 10, background: 'var(--card)', overflow: 'hidden' }}>
          {(e.cos || []).filter((co: any) => !co.isIndustry).map((co, i, arr) => (
            <div key={co.key ?? co.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${W.border}` : 'none' }}>
              <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.brand, flex: '0 0 40px', paddingTop: 1 }}>{co.id}</span>
              <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5, minWidth: 0 }}>{co.text}</span>
              <BloomBadge bloom={co.bloom} />
            </div>
          ))}
        </div>
      )}


      <div
        onClick={() => setStructOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: structOpen ? 16 : 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ width: 18, height: 18, display: 'inline-flex', transition: 'transform .15s', transform: structOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}><IChevron /></span>
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>
          Detected structure — {e.name} ({e.code})
        </div>
      </div>
      {structOpen && e.units.map((u, ui) => (
        <div key={u.n} style={{ border: `1px solid ${W.border}`, borderRadius: 10, marginBottom: 14, overflow: 'hidden', background: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: W.surfaceMuted }}>
            <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>Unit {u.n}</span>
            <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{u.title}</span>
            {(u.isElective || u.n === 'E') && <ElectiveTag />}
            {(() => {
              const cu = covByUnit[String(u.n)];
              if (!cu || (!cu.flagged && !(cu.missing_terms?.length))) return null;
              const missing = (cu.missing_terms ?? []).slice(0, 6).join(', ');
              return (
                <span
                  title={`Coverage ${Math.round((cu.coverage ?? 0) * 100)}% — terms from the syllabus not found in this unit's structure: ${(cu.missing_terms ?? []).join(', ')}`}
                  style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, borderRadius: 6, padding: '2px 8px',
                           background: cu.flagged ? W.orangeBg : W.surfaceMuted,
                           color: cu.flagged ? W.orangeFg : W.text3,
                           border: cu.flagged ? 'none' : `1px solid ${W.border}` }}>
                  {cu.flagged
                    ? `${Math.round((cu.coverage ?? 0) * 100)}% captured — review`
                    : `missing: ${missing}`}
                </span>
              );
            })()}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: W.text2 }}>{u.topics.length} topics</span>
            <CoIcon onClick={() => setTopicModal({ ui, ti: null })} title="Add topic"><IPlus /></CoIcon>
          </div>
          {u.topics.map((t, ti) => (
            <div key={t.id} style={{ padding: '14px 18px', borderBottom: ti < u.topics.length - 1 ? `1px solid ${W.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, borderRadius: 6, padding: '2px 8px', ...bloomStyle(t.co.bloom) }}>
                      {(() => {
                        const mapped = t.coKey ? (e.cos || []).find(c => c.key === t.coKey) : null;
                        const ref = mapped ? mapped.id : t.coNumber != null ? `CO${t.coNumber}` : '';
                        return ref ? `${ref} · ` : '';
                      })()}{t.co.bloom}
                    </span>
                  </div>
                  <div>{t.subs.map(s => <SubChip key={s}>{s}</SubChip>)}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <CoIcon onClick={() => setTopicModal({ ui, ti })}><IEdit /></CoIcon>
                  <CoIcon danger onClick={() => { e.units[ui].topics.splice(ti, 1); onChange(); forceUpdate(n => n + 1); }}><ITrash /></CoIcon>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {topicModal && <TopicEditorModal extracted={e} ui={topicModal.ui} ti={topicModal.ti} onClose={() => setTopicModal(null)} onChange={() => { onChange(); forceUpdate(n => n + 1); }} />}
    </div>
  );
}

// ---- Add Industry & AI Topics Section (compact, lives in the step-3 structure pane) ----
function AddIndustryTopicsSection({ extracted, onChange }: { extracted: Course; onChange: () => void }) {
  const e = extracted as any;
  const [open, setOpen] = useState(true);
  const [, forceUpdate] = useState(0);

  if (!e.addTopics) {
    const raw = e._pipelineIndustryTopics;
    const pipelineTopics: any[] = Array.isArray(raw) ? raw : [];

    // Build a set of existing topic/subtopic names (normalised) to filter out already-covered skills
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const existingNames = new Set<string>();
    (extracted.units ?? []).forEach(u => {
      u.topics.forEach(t => {
        existingNames.add(norm(t.name));
        t.subs.forEach(sub => existingNames.add(norm(sub)));
      });
    });

    const isAlreadyCovered = (skill: any) => existingNames.has(norm(skill.skill_name));

    const novel = pipelineTopics.filter(s => !isAlreadyCovered(s));
    e.addTopics = novel.slice(0, 3).map((s: any) => ({
      cat: s.category === 'emerging_ai' ? 'AI' : 'Industry',
      name: s.skill_name,
      subs: (s.relevant_topics ?? []).slice(0, 4),
      co: s.description,
      bloom: s.category === 'emerging_ai' ? 'Analyze' : 'Apply',
      state: 'open',
    }));
  }

  const suggestions: any[] = e.addTopics;
  const addCount = suggestions.filter((s: any) => s.state !== 'added').length;
  const ioCount = ((e.cos ?? []) as CO[]).filter(c => c.isIndustry).length;
  const capReached = ioCount >= MAX_IOS;

  if (!suggestions.length) return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${W.border}` }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', userSelect: 'none', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.text }}
      >
        <span style={{ width: 15, height: 15, display: 'inline-flex', color: W.brand }}><ISpark /></span>
        Industry &amp; AI topics
        {addCount > 0 && (
          <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10, color: W.blueFg, background: W.blueBg, borderRadius: 8, padding: '1px 7px' }}>{addCount}</span>
        )}
        <span style={{ marginLeft: 'auto', width: 16, height: 16, display: 'inline-flex', transition: 'transform .15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}><IChevron /></span>
      </div>
      {open && (
        <div>
          <div style={{ fontSize: 11.5, color: W.text2, lineHeight: 1.5, marginBottom: 10 }}>
            Suggested from your syllabus. Adding one creates the topic in an <strong>Electives</strong> unit with its own Industry Outcome (IO) attached.
          </div>
          {capReached && addCount > 0 && (
            <div style={{ fontSize: 11.5, color: W.orangeFg, background: W.orangeBg, borderRadius: 7, padding: '7px 10px', marginBottom: 10, lineHeight: 1.45 }}>
              IO limit reached — a course carries at most {MAX_IOS} Industry Outcomes. Remove one to add another topic.
            </div>
          )}
          {addCount === 0 ? (
            <div style={{ fontSize: 12, color: W.text3, padding: '4px 2px', fontStyle: 'italic' }}>All suggestions handled.</div>
          ) : suggestions.map((s: any, i: number) => {
            if (s.state === 'added') return null;
            const dismissed = s.state === 'dismissed';
            const catColor = s.cat === 'AI'
              ? { background: '#F0EBFF', color: '#6C5CE7' }
              : { background: 'rgba(73,169,190,.14)', color: '#3895AD' };
            return (
              <div key={i} style={{ padding: '10px 12px', border: `1px solid ${W.border}`, borderRadius: 9, marginBottom: 8, background: 'var(--card)', opacity: dismissed ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ display: 'inline-flex', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10, letterSpacing: '.04em', textTransform: 'uppercase', borderRadius: 5, padding: '1px 7px', ...catColor }}>
                    {s.cat}
                  </span>
                  <BloomBadge bloom={s.bloom} />
                </div>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, marginBottom: 4 }}>{s.name}</div>
                <div style={{ marginBottom: 8 }}>{(s.subs ?? []).map((sub: string) => <SubChip key={sub}>{sub}</SubChip>)}</div>
                {dismissed ? (
                  <span style={{ fontSize: 11.5, color: W.text3 }}>Dismissed</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button disabled={capReached}
                      title={capReached ? `A course carries at most ${MAX_IOS} Industry Outcomes` : undefined}
                      onClick={() => {
                        if (capReached) return;
                        s.state = 'added';
                        const u = getElectivesUnit(e as Course);
                        // Each added industry topic carries its own Industry Outcome (IO), mapped to it
                        const io: CO = { id: 'IO', key: ckey(), text: s.co, bloom: s.bloom, isIndustry: true };
                        e.cos = e.cos || [];
                        e.cos.push(io);
                        renumberCos(e.cos);
                        u.topics.push({ id: nid(), name: s.name, subs: s.subs ?? [], co: { text: s.co, bloom: s.bloom }, coKey: io.key, artifacts: newArtifacts() });
                        onChange();
                        forceUpdate(n => n + 1);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: 6, padding: '4px 11px', fontSize: 11.5, fontWeight: 600, fontFamily: W.fontDisplay, cursor: capReached ? 'not-allowed' : 'pointer', opacity: capReached ? 0.45 : 1 }}>
                      <span style={{ width: 12, height: 12, display: 'inline-flex' }}><IPlus /></span>Add topic + IO
                    </button>
                    <button onClick={() => { s.state = 'dismissed'; forceUpdate(n => n + 1); }} title="Dismiss"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: `1px solid ${W.border}`, background: 'var(--card)', color: W.text3, borderRadius: 6, cursor: 'pointer' }}>
                      <span style={{ width: 12, height: 12, display: 'inline-flex' }}><IX /></span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- CO Editor Modal ----
function CoEditorModal({ cos, idx, course, onClose, onChange }: {
  cos: CO[]; idx: number | null; course?: Course; onClose: () => void; onChange: () => void;
}) {
  const editing = idx !== null;
  const co = editing ? cos[idx!] : null;
  const [text, setText] = useState(co?.text ?? '');
  const [bloom, setBloom] = useState(co?.bloom ?? 'Understand');
  // Topic ids this outcome maps to (pre-filled from existing links when editing)
  const [mapped, setMapped] = useState<Set<string>>(() => {
    if (!course || !co?.key) return new Set();
    return new Set(course.units.flatMap(u => u.topics.filter(t => t.coKey === co.key).map(t => t.id)));
  });

  const toggleTopic = (tid: string) => setMapped(prev => {
    const s = new Set(prev);
    s.has(tid) ? s.delete(tid) : s.add(tid);
    return s;
  });
  const toggleUnit = (u: Unit) => setMapped(prev => {
    const s = new Set(prev);
    const all = u.topics.every(t => s.has(t.id));
    u.topics.forEach(t => all ? s.delete(t.id) : s.add(t.id));
    return s;
  });

  const save = () => {
    if (!text.trim()) return;
    let target: CO;
    if (editing) {
      target = co!;
      target.text = text; target.bloom = bloom;
      if (!target.key) target.key = ckey();
    } else {
      target = { id: 'CO' + (cos.length + 1), key: ckey(), text, bloom };
      cos.push(target);
    }
    if (course) {
      course.units.forEach(u => u.topics.forEach(t => {
        if (mapped.has(t.id)) t.coKey = target.key;
        else if (t.coKey === target.key) t.coKey = null;
      }));
    }
    onChange();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={editing ? 'Edit Course Outcome' : 'Add Course Outcome'}>
      <Field label="Outcome statement">
        <Textarea value={text} onChange={setText} placeholder="Apply... / Implement... / Analyze..." />
      </Field>
      <Field label="Bloom's level">
        <Select value={bloom} onChange={setBloom} options={[...BLOOM]} />
      </Field>
      {course && course.units.length > 0 && (
        <Field label="Maps to unit / topics">
          <div style={{ border: `1.5px solid ${W.border}`, borderRadius: 8, maxHeight: 240, overflowY: 'auto', padding: 6 }}>
            {course.units.map(u => {
              const allSelected = u.topics.length > 0 && u.topics.every(t => mapped.has(t.id));
              return (
                <div key={u.n} style={{ marginBottom: 4 }}>
                  <div onClick={() => toggleUnit(u)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', background: W.surfaceMuted }}>
                    <MapCheck checked={allSelected} />
                    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12.5, color: W.text }}>
                      Unit {u.n} — {u.title}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: W.text3 }}>{u.topics.length} topics</span>
                  </div>
                  {u.topics.map(t => (
                    <div key={t.id} onClick={() => toggleTopic(t.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px 6px 26px', borderRadius: 7, cursor: 'pointer' }}
                      onMouseEnter={e2 => (e2.currentTarget.style.background = 'var(--surface-muted)')}
                      onMouseLeave={e2 => (e2.currentTarget.style.background = 'transparent')}>
                      <MapCheck checked={mapped.has(t.id)} />
                      <span style={{ fontSize: 13, color: W.text }}>{t.name}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Field>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
          {editing ? 'Save CO' : 'Add CO'}
        </Btn>
      </div>
    </Modal>
  );
}

// ---- Small checkbox used by the mapping pickers ----
function MapCheck({ checked }: { checked: boolean }) {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
      border: `2px solid ${checked ? W.brand : W.borderStrong}`,
      background: checked ? W.brand : 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {checked && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
    </span>
  );
}

// ---- Bloom level selector (badge + explicit dropdown affordance) ----
// `industryBloom` marks the level industry expects students to reach for this
// outcome (from the pipeline's CO evaluation) — never a mechanical "next level".
function BloomSelect({ value, onChange, industryBloom }: { value: string; onChange: (b: string) => void; industryBloom?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const currentIdx = BLOOM.findIndex(x => x.toLowerCase() === value?.toLowerCase());
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} title="Change Bloom level"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'var(--card)', border: `1px solid ${open ? W.borderStrong : W.border}`, borderRadius: 7, padding: '3px 8px', transition: 'border-color var(--dur-fast) var(--ease-out)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = ''; }}>
        <BloomBadge bloom={value || 'Set level'} />
        <span style={{ fontSize: 9, color: W.text3 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 8, boxShadow: W.shadowCard, zIndex: 50, minWidth: 200, padding: 6 }}>
          {BLOOM.map(b => {
            const isCurrent = currentIdx === BLOOM.indexOf(b);
            const isIndustryTarget = industryBloom?.toLowerCase() === b.toLowerCase();
            return (
              <div key={b}
                onClick={() => { onChange(b); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', background: isCurrent ? W.surfaceMuted : 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = W.surfaceMuted)}
                onMouseLeave={e => (e.currentTarget.style.background = isCurrent ? W.surfaceMuted : 'transparent')}>
                <BloomBadge bloom={b} />
                {isIndustryTarget && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: W.blueFg, background: W.blueBg, borderRadius: 6, padding: '1px 6px', marginLeft: 6 }}>Industry target</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Inline-editable outcome text (click to edit, Enter/blur to save) ----
function InlineCoText({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  if (!editing) {
    return (
      <div title="Click to edit"
        onClick={ev => { ev.stopPropagation(); setV(value); setEditing(true); }}
        style={{ fontSize: 14, lineHeight: 1.55, cursor: 'text', borderRadius: 6, margin: '0 -6px', padding: '2px 6px', transition: 'background var(--dur-fast) var(--ease-out)' }}
        onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-muted)')}
        onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
        {value}
      </div>
    );
  }
  const commit = () => {
    const t = v.trim();
    setEditing(false);
    if (t && t !== value) onSave(t);
  };
  return (
    <textarea autoFocus value={v} rows={2}
      onChange={ev => setV(ev.target.value)}
      onClick={ev => ev.stopPropagation()}
      onBlur={commit}
      onKeyDown={ev => {
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); commit(); }
        if (ev.key === 'Escape') { ev.stopPropagation(); setEditing(false); }
      }}
      style={{ width: '100%', fontFamily: W.fontSans, fontSize: 14, lineHeight: 1.55, color: 'var(--input-fg)', background: 'var(--input-bg)', border: `1.5px solid ${W.brand}`, borderRadius: 6, padding: '4px 6px', outline: 'none', resize: 'vertical' }} />
  );
}

// ---- Elective unit tag ----
function ElectiveTag() {
  return (
    <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', color: W.blueFg, background: W.blueBg, borderRadius: 6, padding: '2px 7px' }}>
      Electives
    </span>
  );
}

// ---- Topic Editor Modal ----
function TopicEditorModal({ extracted, ui, ti, onClose, onChange }: {
  extracted: Course; ui: number; ti: number | null; onClose: () => void; onChange: () => void;
}) {
  const editing = ti !== null;
  const unit = extracted.units[ui];
  const t = editing ? unit.topics[ti!] : { name: '', subs: [], co: { text: '', bloom: 'Understand' }, artifacts: newArtifacts(), id: '' };
  const [name, setName] = useState(t.name);
  const [subs, setSubs] = useState(t.subs.join('\n'));
  const [coText, setCoText] = useState(t.co.text);
  const [bloom, setBloom] = useState(t.co.bloom);

  const save = () => {
    if (!name.trim()) return;
    const subsArr = subs.split('\n').map(s => s.trim()).filter(Boolean);
    const co = { text: coText.trim() || ('Understand ' + name + '.'), bloom };
    if (editing) {
      t.name = name; t.subs = subsArr; t.co = co;
    } else {
      const newTopic: Topic = { id: nid(), name, subs: subsArr, co, artifacts: newArtifacts() };
      // Topics added to the electives unit carry their own Industry Outcome (IO),
      // as long as the course is under the IO cap.
      if ((unit.isElective || unit.n === 'E') && (extracted.cos ?? []).filter(c => c.isIndustry).length < MAX_IOS) {
        const io: CO = { id: 'IO', key: ckey(), text: co.text, bloom: co.bloom, isIndustry: true };
        extracted.cos = extracted.cos || [];
        extracted.cos.push(io);
        renumberCos(extracted.cos);
        newTopic.coKey = io.key;
      }
      unit.topics.push(newTopic);
    }
    onChange();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`${editing ? 'Edit topic' : 'Add topic'} · Unit ${unit.n}`}>
      <Field label="Topic name"><Input value={name} onChange={setName} placeholder="e.g. Functions" /></Field>
      <Field label="Subtopics" optional><Textarea value={subs} onChange={setSubs} placeholder="One per line" /></Field>
      <Field label="Mapped course outcome"><Textarea value={coText} onChange={setCoText} placeholder="Implement... / Understand... / Analyze..." /></Field>
      <Field label="Bloom's level"><Select value={bloom} onChange={setBloom} options={[...BLOOM]} /></Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
          {editing ? 'Save topic' : 'Add topic'}
        </Btn>
      </div>
    </Modal>
  );
}

function IChevron() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
