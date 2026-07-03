import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { TopicBadge, BloomBadge, ProgressBar, Card, Btn, Breadcrumb, Badge, Modal, Field, Textarea, Select } from './WinTeachUI';
import { IBack, IEdit, ISpark, IRedo, INotes, ILessonPlan, IAssess, IQuiz, IFlash, IArrow } from './WinTeachIcons';
import type { Topic } from './winteachData';
import { ART_DEFS, allTopics, topicState, newArtifacts, BLOOM } from './winteachData';
import { generationApi } from '@/api/generation';
import { useCOs, useTopic, useCourse } from '@/api/hooks';
import { coursesApi } from '@/api/courses';

// Artifact content viewer modal
function ArtifactViewer({ jobId, artifactType, label, onClose }: { jobId: string; artifactType: string; label: string; onClose: () => void }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generationApi.getArtifactContent(jobId, artifactType)
      .then(d => setContent(d?.content ?? d))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [jobId, artifactType]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 660, maxWidth: '94vw', maxHeight: '84vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 18 }}>{label}</div>
          <Btn variant="ghost" sm onClick={onClose}>✕ Close</Btn>
        </div>
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: W.text2 }}>Loading…</div>
        ) : !content ? (
          <div style={{ color: W.text2, fontSize: 14 }}>Content not available yet.</div>
        ) : (
          <pre style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: W.text }}>{JSON.stringify(content, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default function WinTeachTopicPage() {
  const navigate = useNavigate();
  const { id: courseId, topicId } = useParams<{ id: string; topicId: string }>();
  const { courses, currentCourse, setCurrentCourse, currentTopic, setCurrentTopic, toast } = useWinTeach();
  const [, forceUpdate] = useState(0);
  const [coModal, setCoModal] = useState(false);
  const [activeJobId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ jobId: string; type: string; label: string } | null>(null);

  // Fetch real COs so we can persist edits back to the API
  const { data: apiCOs = [] } = useCOs(courseId ?? '');
  const { data: apiTopic, isLoading: topicLoading } = useTopic(courseId ?? '', topicId ?? '');
  const { data: apiCourse } = useCourse(courseId ?? '');

  // Match by UUID first, fall back to code for backwards compat
  const c = currentCourse
    || courses.find(x => x.id === courseId || x.code === courseId)
    || null;

  useEffect(() => {
    if (c) {
      if (!currentCourse) setCurrentCourse(c);
      if (!currentTopic || currentTopic.id !== topicId) {
        const found = allTopics(c).find(x => x.topic.id === topicId);
        if (found) { found.topic._unit = found.unit; setCurrentTopic(found.topic); }
      }
    }
  }, [courseId, topicId]);

  // Build a synthetic topic object from DB data when local context is missing
  const dbTopic = apiTopic ? {
    id: apiTopic.id,
    name: apiTopic.title,
    title: apiTopic.title,
    bloom_level: apiTopic.bloom_level,
    subs: (apiTopic.subtopics ?? []).map((s: any) => s.title),
    subtopics: apiTopic.subtopics ?? [],
    co: {
      text: apiTopic.linked_co?.description ?? '',
      bloom: apiTopic.linked_co?.bloom_level ?? apiTopic.bloom_level ?? '',
    },
    artifacts: newArtifacts(),
    _unit: apiTopic.unit ?? null,
  } : null;

  const t = currentTopic ?? dbTopic;

  if (topicLoading && !t) {
    return (
      <>
        <WinTopbar title="Topic" />
        <WinContent><div style={{ padding: 32, color: '#888' }}>Loading…</div></WinContent>
      </>
    );
  }

  if (!t) {
    return (
      <>
        <WinTopbar title="Topic not found" />
        <WinContent><Btn onClick={() => navigate('/winteach/courses')}>← Back</Btn></WinContent>
      </>
    );
  }

  const courseCode = c?.code ?? apiCourse?.code ?? courseId ?? '';
  const unit = t._unit || (c ? c.units.find(u => u.topics.some((tp: any) => tp.id === t.id)) : null);

  const artIcons: Record<string, React.ReactNode> = {
    notes: <INotes />, lesson_plan: <ILessonPlan />, preassess: <IAssess />, quiz: <IQuiz />, flash: <IFlash />,
  };

  const artCard = (k: 'notes' | 'lesson_plan' | 'preassess' | 'quiz' | 'flash') => {
    const def = ART_DEFS.find(d => d.k === k)!;
    const p = t.artifacts[k];
    const notesReady = t.artifacts.notes >= 100;
    const locked = k !== 'notes' && k !== 'lesson_plan' && !notesReady && p === 0;
    let badgeEl: React.ReactNode;
    if (p >= 100) badgeEl = <Badge variant="green" dot>Ready</Badge>;
    else if (p > 0) badgeEl = <Badge variant="info">{p}%</Badge>;
    else if (locked) badgeEl = <Badge variant="muted">Waiting</Badge>;
    else badgeEl = <Badge variant="orange">Pending</Badge>;

    const apiType = k === 'flash' ? 'flashcards' : k;

    return (
      <div key={k} style={{ border: '1.5px solid #e9eaf2', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#efeefe', color: '#5b4bff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 36px' }}>
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}>{artIcons[k]}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>{def.label}</div>
            <div style={{ fontSize: 11, color: W.text3 }}>{def.sub}</div>
          </div>
          {badgeEl}
        </div>
        <ProgressBar value={p} />
        {p >= 100 && activeJobId && (
          <Btn sm variant="ghost" onClick={() => setViewer({ jobId: activeJobId, type: apiType, label: def.label })}>
            View content →
          </Btn>
        )}
      </div>
    );
  };

  // The real Stage-6 pipeline runs in the Generation Studio (per-unit review,
  // approvals, fan-out). This page's cards are a lightweight preview.
  const openStudio = () => navigate(`/winteach/courses/${courseId}/topic/${t.id}/generate`);
  const doGenerate = openStudio;
  const doRegenerate = openStudio;

  const state = topicState(t);

  return (
    <>
      <WinTopbar title={t.name ?? (t as any).title ?? 'Topic'} actions={
        <>
          <Btn variant="ghost" onClick={() => navigate(`/winteach/courses/${courseId}`)}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IBack /></span>Back to {courseCode}
          </Btn>
          <Btn onClick={() => setCoModal(true)}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IEdit /></span>Edit linked outcome
          </Btn>
          {state === 'pending' && (
            <Btn variant="primary" onClick={doGenerate}>
              <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ISpark /></span>Generate artifacts
            </Btn>
          )}
          {state === 'ready' && (
            <Btn onClick={doRegenerate}>
              <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IRedo /></span>Regenerate all
            </Btn>
          )}
        </>
      } />
      <WinContent>
        <Breadcrumb items={[
          { label: 'Courses', onClick: () => navigate('/winteach/courses') },
          { label: courseCode, onClick: () => navigate(`/winteach/courses/${courseId}`) },
          { label: unit ? `Unit ${unit.unit_number ?? unit.n}` : '' },
          { label: t.name ?? (t as any).title },
        ]} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0 20px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20 }}>{t.name ?? (t as any).title}</div>
                <TopicBadge topic={t} />
              </div>

              {/* Linked CO */}
              {(t.co?.text || apiCOs.length > 0) && (
                <div style={{ background: '#efeefe', borderRadius: 14, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#5b4bff', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Linked course outcome</div>
                  <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 8 }}>{t.co?.text || '—'}</div>
                  <BloomBadge bloom={(t as any).bloom_level ?? t.co?.bloom ?? ''} />
                </div>
              )}

              {/* Subtopics */}
              {(() => {
                const subs: string[] = t.subs?.length
                  ? t.subs
                  : ((t as any).subtopics ?? []).map((s: any) => s.title ?? s);
                return (
                  <>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2, marginBottom: 16 }}>Subtopics</div>
                    {subs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < subs.length - 1 ? `1px solid ${W.border}` : 'none' }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: '#efeefe', color: '#5b4bff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 12, flex: '0 0 26px' }}>{i + 1}</span>
                        <div style={{ fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 14 }}>{s}</div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </Card>

            {/* Topic info */}
            <div style={{ border: '1px solid #e9eaf2', borderRadius: 18, padding: '28px 32px', background: '#fff', boxShadow: '0 2px 10px rgba(28,32,48,.04)' }}>
              <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.14em', color: '#5b4bff', marginBottom: 3 }}>Topic</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1c2030', marginBottom: 16 }}>Topic info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                {[
                  ['Unit', unit ? `Unit ${unit.unit_number ?? unit.n} · ${unit.title}` : '—'],
                  ['Subtopics', (t.subs ?? (t as any).subtopics ?? []).length],
                  ['Course', courseCode],
                  ['Bloom level', (t as any).bloom_level ?? t.co?.bloom ?? '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12.5, color: W.text2 }}>{label}</div>
                    <div style={{ fontFamily: W.fontDisplay, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: generation flow */}
          <div>
            <Card>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2, marginBottom: 16 }}>Generation flow</div>
              <div style={{ fontSize: 12.5, color: W.text2, marginBottom: 16 }}>
                Teacher Notes and Lesson Plan generate first; the rest run in parallel once notes are ready.
              </div>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {artCard('notes')}
                  {artCard('lesson_plan')}
                </div>
                <div style={{ flex: '0 0 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: W.text3 }}>
                  <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IArrow /></span>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {artCard('preassess')}
                  {artCard('quiz')}
                  {artCard('flash')}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </WinContent>

      {coModal && (
        <CoInlineModal
          topic={t}
          courseId={courseId}
          apiCOs={apiCOs}
          onClose={() => setCoModal(false)}
          onSave={() => { forceUpdate(n => n + 1); toast('Outcome updated'); }}
          onSaveRegen={() => { t.artifacts = newArtifacts(); forceUpdate(n => n + 1); doGenerate(); toast('Outcome updated · regenerating'); }}
        />
      )}
      {viewer && (
        <ArtifactViewer
          jobId={viewer.jobId}
          artifactType={viewer.type}
          label={viewer.label}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}

function CoInlineModal({ topic, courseId, apiCOs, onClose, onSave, onSaveRegen }: {
  topic: Topic;
  courseId: string | undefined;
  apiCOs: { id: string; text?: string; description?: string; bloom_level?: string }[];
  onClose: () => void;
  onSave: () => void;
  onSaveRegen: () => void;
}) {
  const [text, setText] = useState(topic.co.text);
  const [bloom, setBloom] = useState(topic.co.bloom);
  const [saving, setSaving] = useState(false);

  // Find the matching API CO by text similarity to get its id for PATCH
  const matchedCO = apiCOs.find(c =>
    (c.text ?? c.description ?? '').trim().toLowerCase() === topic.co.text.trim().toLowerCase()
  ) ?? apiCOs[0];

  const apply = async () => {
    if (!text.trim()) return;
    // Update local state immediately
    topic.co.text = text;
    topic.co.bloom = bloom;
    // Persist to API if we have a course id and matching CO
    if (courseId && matchedCO?.id) {
      setSaving(true);
      try {
        await coursesApi.updateCO(courseId, matchedCO.id, { text, bloom });
      } catch { /* local update already applied */ }
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Edit linked outcome">
      <div style={{ fontSize: 13.5, color: W.text, lineHeight: 1.5, marginBottom: 24 }}>
        Editing the outcome for <b>{topic.name}</b>. Saving will mark artifacts stale and offer to regenerate.
      </div>
      <Field label="Outcome statement"><Textarea value={text} onChange={setText} /></Field>
      <Field label="Bloom's level"><Select value={bloom} onChange={setBloom} options={[...BLOOM]} /></Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn disabled={saving} onClick={async () => { await apply(); onClose(); onSave(); }}>
            {saving ? 'Saving…' : 'Save only'}
          </Btn>
          <Btn variant="primary" disabled={saving} onClick={async () => { await apply(); onClose(); onSaveRegen(); }}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IRedo /></span>
            {saving ? 'Saving…' : 'Save & regenerate'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
