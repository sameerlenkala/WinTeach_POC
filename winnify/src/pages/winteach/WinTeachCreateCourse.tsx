import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useWinTeach } from './WinTeachContext';
import { W, bloomStyle } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import {
  Card, Btn, Breadcrumb, Stepper, Field, Input, Select, Textarea,
  CoIcon, BloomBadge, SubChip, Modal,
} from './WinTeachUI';
import {
  IBack, IPlus, IUpload, IText, IFile,
  ISpark, ICheck, IX, IEdit, ITrash,
} from './WinTeachIcons';
import type { Course, CO, Topic, Unit } from './winteachData';
import {
  MAJORS, BLOOM,
  nid, newArtifacts, renumberCos,
  normCo, allTopics, getElectivesUnit,
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

  if (!draft) return null;

  const cancelPath = editId ? `/winteach/courses/${editId}` : '/winteach/courses';
  const instNames = institutes.map(i => i.name);
  const stepLabels = draft.mode === 'edit'
    ? ['Course details', 'Syllabus', 'Edit course plan']
    : ['Course details', 'Upload & extract', 'Finalize COs'];

  if (draft.step === 1) return <Step1 />;
  if (draft.step === 2) return <Step2 />;
  if (draft.step === 3) return draft.mode === 'edit' ? <EditPlanStep /> : <FinalizeCoStep />;
  return null;

  // ===== Step 1 =====
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
    const [regulation, setRegulation] = useState(d.regulation || '');
    const [sem, setSem] = useState(String(d.sem || ''));
    const [credits, setCredits] = useState(String(d.credits || ''));

    const PROGRAMS = [
      '', 'B.Tech', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'B.Sc', 'M.Sc',
      'MBA', 'BBA', 'B.Com', 'M.Com', 'B.Arch', 'Ph.D',
    ];
    const [majorOpen, setMajorOpen] = useState(false);
    const toggleMajor = (m: string) =>
      setMajors(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const next = () => {
      const errs: Record<string, string> = {};
      if (!code.trim()) errs.code = 'Required';
      if (!name.trim()) errs.name = 'Required';
      if (!program) errs.program = 'Required';
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
              <Field label="Major" optional>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setMajorOpen(o => !o)}
                    style={{ width: '100%', background: '#F1F2F7', border: `1px solid ${majorOpen ? W.brand : 'transparent'}`, borderRadius: 12, padding: '11px 14px', fontFamily: W.fontSans, fontSize: 14, color: majors.length ? W.text : W.text3, outline: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: majorOpen ? '0 0 0 3px rgba(108,92,231,0.12)' : 'none' }}>
                    <span>{majors.length ? majors.join(', ') : 'Select majors…'}</span>
                    <span style={{ fontSize: 10, color: W.text3 }}>▾</span>
                  </button>
                  {majorOpen && (
                    <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: `1px solid ${W.border}`, borderRadius: 12, boxShadow: '0 4px 16px rgba(60,50,140,.12)', padding: 8, maxHeight: 220, overflowY: 'auto' }}>
                      {MAJORS.map(m => (
                        <div key={m} onClick={() => toggleMajor(m)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: majors.includes(m) ? W.collegePill : 'transparent' }}>
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
              <Field label="Regulation"><Input value={regulation} onChange={setRegulation} placeholder="e.g. R24" /></Field>
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
      draft!.extracted ? 'done' : 'idle'
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

        const strVal = (f: { value: string | string[] | null } | undefined) =>
          Array.isArray(f?.value) ? f!.value.join(', ') : (f?.value ?? '');

        const ai = result.ai_extraction;
        const ex = result.extraction;
        const pipelineSuggested: any[] = result.extraction?.pipeline_result?.p4_co_evaluation?.suggested_cos ?? [];
        const p3 = result.extraction?.pipeline_result?.p3_industry_skills;
        const pipelineIndustryTopics: any[] = Array.isArray(p3?.industry_skills) ? p3.industry_skills : (Array.isArray(p3) ? p3 : []);
        let extracted: Course;

        if (ai && (ai.units?.length || ai.course_outcomes?.length)) {
          setStage('Building course structure…');
          const units: Unit[] = (ai.units ?? []).map((u: any, ui: number) => ({
            n: String(u.unit_number ?? ui + 1),
            title: u.title ?? `Unit ${ui + 1}`,
            hours: u.hours ?? 0,
            topics: (u.topics ?? []).map((t: any) => ({
              id: nid(),
              name: t.title,
              subs: (t.subtopics ?? []).map((s: any) => s.title ?? s),
              co: { text: '', bloom: t.bloom_level ?? 'Understand' },
              coNumber: t.co_number ?? null,
              artifacts: newArtifacts(),
            })),
          }));
          const cos: CO[] = (ai.course_outcomes ?? []).map((c: any, i: number) => ({
            id: `CO${i + 1}`,
            text: c.text,
            bloom: c.bloom_level ?? 'Understand',
          }));
          extracted = {
            id: '', code: ai.course_code || draft!.details.code,
            name: ai.course_name || draft!.details.name,
            credits: ai.credits || draft!.details.credits,
            sem: ai.semester || draft!.details.sem,
            regulation: ai.regulation || draft!.details.regulation,
            institute: draft!.details.institute, program: draft!.details.program,
            major: draft!.details.major, status: 'draft', cos, units,
            _pipelineSuggested: pipelineSuggested,
            _pipelineIndustryTopics: pipelineIndustryTopics,
          } as any;
        } else {
          setStage('Applying extracted fields…');
          const coStrings: string[] = Array.isArray(ex?.course_outcomes?.value) ? ex.course_outcomes.value : [];
          extracted = {
            id: '',
            code:      strVal(ex?.course_code)  || draft!.details.code,
            name:      strVal(ex?.course_name)  || draft!.details.name,
            credits:   strVal(ex?.credits)      || draft!.details.credits,
            sem:       strVal(ex?.semester)     || draft!.details.sem,
            regulation: draft!.details.regulation,
            institute: draft!.details.institute, program: draft!.details.program,
            major: draft!.details.major, status: 'draft',
            cos: coStrings.map((text, i) => ({ id: `CO${i + 1}`, text, bloom: 'Understand' as string })),
            units: [],
          } as Course;
        }

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
          <div style={{ maxWidth: 760, margin: '0 auto' }}><Stepper steps={stepLabels} current={2} /></div>
          <Card style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Upload syllabus</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              Upload your syllabus, then click <strong>Continue to finalize COs</strong> — AI will parse it into units, topics and outcomes.
            </div>

            {/* Upload tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {(['upload', 'paste'] as const).map(m => (
                <button key={m} onClick={() => { if (!busy) setMethod(m); }} style={{
                  height: 36, padding: '0 16px', borderRadius: 10,
                  border: `1px solid ${method === m ? W.brandBright : W.borderStrong}`,
                  background: method === m ? W.brandBright : 'transparent',
                  fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 13,
                  color: method === m ? '#fff' : W.text2,
                  display: 'inline-flex', alignItems: 'center', gap: 7, cursor: busy ? 'not-allowed' : 'pointer',
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
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: W.collegePill, color: W.brand, borderRadius: W.r4, padding: '10px 14px', fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14, marginTop: 14 }}>
                    <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IFile /></span>
                    {(pendingFile?.name || draft!.fileName)}
                    {(phase === 'ready' || phase === 'done') && (
                      <span style={{ width: 16, height: 16, display: 'inline-flex', color: '#16A34A' }}><ICheck /></span>
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
                  <div key={u} style={{ border: `1px solid ${W.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
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
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(220,38,38,0.08)', color: '#DC2626', fontSize: 13 }}>
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

  // ===== Finalize CO Step =====
  function FinalizeCoStep() {
    const e = draft!.extracted;
    const [, forceUpdate] = useState(0);

    useEffect(() => {
      // Auto-inject pipeline suggested COs as Winnify Industry Outcomes if not already added
      const pipelineSugs: any[] = (e as any)._pipelineSuggested ?? [];
      if (pipelineSugs.length > 0 && !e.cos.some(c => (c as any).isIndustry)) {
        const existing = new Set(e.cos.map(c => normCo(c.text)));
        pipelineSugs.forEach((s: any) => {
          const text = s.text ?? '';
          if (text && !existing.has(normCo(text))) {
            e.cos.push({
              id: 'CO' + (e.cos.length + 1),
              text,
              bloom: s.bloom_name ?? s.bloom_level ?? 'Apply',
              isIndustry: true,
            } as any);
            existing.add(normCo(text));
          }
        });
        renumberCos(e.cos);
        forceUpdate(n => n + 1);
      }
    }, [(e as any)._pipelineSuggested?.length]);
    const [coModal, setCoModal] = useState<{ idx: number | null } | null>(null);
    const [saving, setSaving] = useState(false);
    const [bloomDropIdx, setBloomDropIdx] = useState<number | null>(null);

    if (!e) return null;
    const cos = e.cos || [];
    const bloomCounts: Record<string, number> = {};
    cos.forEach(c => { bloomCounts[c.bloom] = (bloomCounts[c.bloom] || 0) + 1; });

    const finalize = async () => {
      if (!cos.length) { toast('Add at least one course outcome'); return; }
      setSaving(true);
      try {
        const d = draft!.details;

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
            topics: u.topics.map(t => t.name),
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

        // 3. Optimistically add to local state so the list shows immediately
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
            <div style={{ width: 64, height: 64, borderRadius: 20, background: W.collegePill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/winteach/courses') }, { label: `${draft!.details.code} · Finalize COs` }]} />
          <div style={{ maxWidth: 900, margin: '0 auto' }}><Stepper steps={stepLabels} current={3} /></div>
          <Card style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Finalize Course Outcomes</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              Review the outcomes extracted from the syllabus. Add, edit or delete COs, or pull from the CO Library.
            </div>

            {/* CO summary */}
            <div style={{ background: W.collegePill, borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 30, color: W.brand, lineHeight: 1 }}>{cos.length}</div>
                <div style={{ fontSize: 12.5, color: W.brand, fontWeight: 600 }}>Outcomes</div>
              </div>
              <div style={{ width: 1, height: 38, background: W.borderStrong }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Bloom coverage</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {BLOOM.filter(b => bloomCounts[b]).map(b => (
                    <BloomBadge key={b} bloom={`${bloomCounts[b]} ${b}`} />
                  ))}
                  {!cos.length && <span style={{ fontSize: 12.5, color: W.text2 }}>No outcomes yet</span>}
                </div>
              </div>
            </div>

            {/* CO list */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Course Outcomes</div>
              <Btn sm onClick={() => setCoModal({ idx: null })}>
                <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add CO
              </Btn>
            </div>

            {cos.length ? cos.map((co, i) => {
              const isIndustry = (co as any).isIndustry;
              return (
              <div key={co.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `1px solid ${isIndustry ? W.blueFg : W.border}`, borderRadius: 16, marginBottom: 8, background: isIndustry ? 'rgba(37,99,235,.03)' : '#fff' }}>
                <div style={{ flex: '0 0 56px', paddingTop: 2 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: isIndustry ? W.blueFg : W.brand }}>{co.id}</div>
                  {isIndustry && <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: W.blueFg, marginTop: 2 }}>Industry</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{co.text}</div>
                  {/* Inline bloom editor */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => setBloomDropIdx(bloomDropIdx === i ? null : i)}>
                      <BloomBadge bloom={co.bloom || 'Set level'} />
                    </span>
                    {bloomDropIdx === i && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: `1px solid ${W.border}`, borderRadius: 12, boxShadow: W.shadowCard, zIndex: 50, minWidth: 180, padding: 6 }}>
                        {BLOOM.map(b => {
                          const isCurrentLevel = co.bloom?.toLowerCase() === b.toLowerCase();
                          const currentIdx = BLOOM.findIndex(x => x.toLowerCase() === co.bloom?.toLowerCase());
                          const isNextLevel = currentIdx >= 0 && BLOOM.indexOf(b) === currentIdx + 1;
                          return (
                            <div
                              key={b}
                              onClick={() => { co.bloom = b; setBloomDropIdx(null); forceUpdate(n => n + 1); }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                                background: isCurrentLevel ? W.surfaceMuted : 'transparent',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = W.surfaceMuted)}
                              onMouseLeave={e => (e.currentTarget.style.background = isCurrentLevel ? W.surfaceMuted : 'transparent')}
                            >
                              <BloomBadge bloom={b} />
                              {isNextLevel && (
                                <span style={{ fontSize: 10, fontWeight: 600, color: W.brand, background: W.collegePill, borderRadius: 6, padding: '1px 6px', marginLeft: 6 }}>↑ Upgrade</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: W.text2 }}>Maps to:</span>
                    {(e.units[i]?.topics || []).map(t => (
                      <span key={t.name} style={{ display: 'inline-block', fontSize: 11, color: W.text2, background: W.surfaceMuted, borderRadius: 6, padding: '2px 8px' }}>{t.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <CoIcon onClick={() => setCoModal({ idx: i })} title="Edit CO"><IEdit /></CoIcon>
                  <CoIcon danger onClick={() => {
                    e.cos.splice(i, 1); renumberCos(e.cos); forceUpdate(n => n + 1);
                  }} title="Delete CO"><ITrash /></CoIcon>
                </div>
              </div>
            );}) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16, border: `1px dashed ${W.border}`, borderRadius: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, color: W.text2 }}>No course outcomes yet — add one above.</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <Btn variant="ghost" onClick={() => setDraft(prev => prev ? { ...prev, step: 2 } : prev)}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back
              </Btn>
              <Btn variant="primary" onClick={finalize} disabled={saving}>
                <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>
                {saving ? 'Saving course…' : 'Generate course plan'}
              </Btn>
            </div>
          </Card>
        </WinContent>

        {coModal && (
          <CoEditorModal
            cos={cos}
            idx={coModal.idx}
            onClose={() => setCoModal(null)}
            onChange={() => { renumberCos(e.cos); forceUpdate(n => n + 1); }}
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
          <div style={{ maxWidth: 900, margin: '0 auto' }}><Stepper steps={stepLabels} current={3} /></div>
          <Card style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Edit course plan</div>
            <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>
              Each topic carries one mapped course outcome (Bloom-tagged). Edit topics or their outcomes, add a topic.
            </div>
            {e.units.map((u, ui) => (
              <div key={u.n} style={{ border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 14, overflow: 'hidden', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: W.surfaceMuted }}>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>Unit {u.n}</span>
                  <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{u.title}</span>
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

// ---- Extracted view sub-component ----
function ExtractedView({ extracted, onChange }: {
  extracted: Course;
  onChange: () => void;
}) {
  const e = extracted;
  const [coModal, setCoModal] = useState<{ idx: number | null } | null>(null);
  const [topicModal, setTopicModal] = useState<{ ui: number; ti: number | null } | null>(null);
  const [, forceUpdate] = useState(0);
  const nt = e.units.reduce((s, u) => s + u.topics.length, 0);
  const ns = e.units.reduce((s, u) => s + u.topics.reduce((a, t) => a + t.subs.length, 0), 0);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: W.greenBg, borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, borderRadius: W.r6, padding: '3px 11px', background: W.greenBg, color: W.greenFg }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />Extracted
        </span>
        <span style={{ fontSize: 12.5, color: W.text }}>{e.units.length} units · {nt} topics · {ns} subtopics · {(e.cos || []).length} course outcomes</span>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: W.text2 }}>Review & edit before continuing</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Course Outcomes — {(e.cos || []).length} extracted</div>
        <Btn sm onClick={() => setCoModal({ idx: null })}><span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add CO</Btn>
      </div>
      {(e.cos || []).map((co, i) => (
        <div key={co.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 8, background: '#fff' }}>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, flex: '0 0 56px' }}>{co.id}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{co.text}</div><BloomBadge bloom={co.bloom} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            <CoIcon onClick={() => setCoModal({ idx: i })}><IEdit /></CoIcon>
            <CoIcon danger onClick={() => { e.cos!.splice(i, 1); renumberCos(e.cos!); onChange(); forceUpdate(n => n + 1); }}><ITrash /></CoIcon>
          </div>
        </div>
      ))}

      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2, marginTop: 24, marginBottom: 16 }}>
        Detected structure — {e.name} ({e.code})
      </div>
      {e.units.map((u, ui) => (
        <div key={u.n} style={{ border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 14, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: W.surfaceMuted }}>
            <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand }}>Unit {u.n}</span>
            <span style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{u.title}</span>
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
                      {t.coNumber != null ? `CO${t.coNumber} · ` : ''}{t.co.bloom}
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

      <AddIndustryTopicsSection extracted={e} onChange={() => { onChange(); forceUpdate(n => n + 1); }} />

      {coModal && <CoEditorModal cos={e.cos || []} idx={coModal.idx} onClose={() => setCoModal(null)} onChange={() => { renumberCos(e.cos!); onChange(); forceUpdate(n => n + 1); }} />}
      {topicModal && <TopicEditorModal extracted={e} ui={topicModal.ui} ti={topicModal.ti} onClose={() => setTopicModal(null)} onChange={() => { onChange(); forceUpdate(n => n + 1); }} />}
    </div>
  );
}

// ---- Add Industry & AI Topics Section ----
function AddIndustryTopicsSection({ extracted, onChange }: { extracted: Course; onChange: () => void }) {
  const e = extracted as any;
  const [open, setOpen] = useState(false);
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

  if (!suggestions.length) return null;

  return (
    <>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 8, cursor: 'pointer', userSelect: 'none', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}
      >
        <span style={{ width: 18, height: 18, display: 'inline-flex', color: W.brand }}><ISpark /></span>
        Add industry &amp; AI topics
        <span style={{ fontWeight: 500, color: W.text3 ?? W.text2, fontSize: 12 }}>{addCount} suggestions</span>
        <span style={{ marginLeft: 'auto', width: 18, height: 18, display: 'inline-flex', transition: 'transform .15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}><IChevron /></span>
      </div>
      {open && (
        <div>
          <div style={{ fontSize: 13, color: W.text2, marginBottom: 16 }}>
            AI-suggested industry topics based on your syllabus. Add the ones relevant — they go into an <strong>Industry &amp; AI Electives</strong> unit.
          </div>
          {addCount === 0 ? (
            <div style={{ fontSize: 13, color: W.text2, padding: '8px 2px' }}>All suggested topics added.</div>
          ) : suggestions.map((s: any, i: number) => {
            if (s.state === 'added') return null;
            const dismissed = s.state === 'dismissed';
            const catColor = s.cat === 'AI'
              ? { background: '#F0EBFF', color: '#6C5CE7' }
              : { background: 'rgba(73,169,190,.14)', color: '#3895AD' };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 8, background: '#fff', opacity: dismissed ? 0.5 : 1 }}>
                <div style={{ flex: '0 0 76px' }}>
                  <span style={{ display: 'inline-flex', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', borderRadius: 6, padding: '2px 8px', ...catColor }}>
                    {s.cat}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ marginBottom: 8 }}><BloomBadge bloom={s.bloom} /></div>
                  <div>{(s.subs ?? []).map((sub: string) => <SubChip key={sub}>{sub}</SubChip>)}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {dismissed ? (
                    <span style={{ fontSize: 12, color: W.text2 }}>Dismissed</span>
                  ) : (
                    <>
                      <Btn sm onClick={() => {
                        s.state = 'added';
                        const u = getElectivesUnit(e as Course);
                        u.topics.push({ id: nid(), name: s.name, subs: s.subs ?? [], co: { text: s.co, bloom: s.bloom }, artifacts: newArtifacts() });
                        onChange();
                        forceUpdate(n => n + 1);
                      }}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add topic
                      </Btn>
                      <CoIcon onClick={() => { s.state = 'dismissed'; forceUpdate(n => n + 1); }}><IX /></CoIcon>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---- CO Editor Modal ----
function CoEditorModal({ cos, idx, onClose, onChange }: { cos: CO[]; idx: number | null; onClose: () => void; onChange: () => void }) {
  const editing = idx !== null;
  const co = editing ? cos[idx!] : { id: 'CO' + (cos.length + 1), text: '', bloom: 'Understand' };
  const [text, setText] = useState(co.text);
  const [bloom, setBloom] = useState(co.bloom);

  const save = () => {
    if (!text.trim()) return;
    if (editing) { co.text = text; co.bloom = bloom; }
    else cos.push({ id: 'CO' + (cos.length + 1), text, bloom });
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
      unit.topics.push({ id: nid(), name, subs: subsArr, co, artifacts: newArtifacts() });
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
