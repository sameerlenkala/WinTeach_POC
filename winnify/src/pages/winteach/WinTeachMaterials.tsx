import React, { useState, useEffect } from 'react';
import { W } from './winteachStyles';
import { Card, Btn, Badge, ConfirmModal, Modal } from './WinTeachUI';
import { materialsApi, type Material } from '@/api/materials';

// Optional grounding: reference PDFs/DOCX whose content generation grounds
// its prompts in. Two scopes:
//   - topic mode (Generation Studio): uploads attach to the current topic;
//     a checkbox can instead share the file with the whole course.
//   - course mode (Course page): uploads are course-wide by default and
//     ground every topic in the course.
export function ReferenceMaterials({ courseId, topicId, mode = 'topic', toast, onReadyCount, collapseWhenIdle, topics }: {
  courseId: string;
  topicId?: string;
  mode?: 'topic' | 'course';
  toast: (m: string) => void;
  /** Reports how many materials are Ready (drives the studio's Grounded badge). */
  onReadyCount?: (n: number) => void;
  /** Start collapsed when materials exist and none are processing (studio). */
  collapseWhenIdle?: boolean;
  /** Course mode: the course's topics, so uploads can target a specific topic. */
  topics?: { id: string; title: string }[];
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploading, setUploading] = useState(false);
  const [courseWide, setCourseWide] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean | null>(null); // null = undecided until first fetch
  const fileRef = React.useRef<HTMLInputElement>(null);
  // Course-mode upload scope, chosen in a modal before the file picker opens.
  const [scopeOpen, setScopeOpen] = useState(false);
  const [scopeKind, setScopeKind] = useState<'course' | 'topics'>('course');
  const [pickedTopics, setPickedTopics] = useState<string[]>([]);

  const refresh = React.useCallback(async () => {
    if (!courseId && !topicId) return;
    try {
      const ms = mode === 'topic' && topicId
        ? await materialsApi.listForTopic(topicId)
        : await materialsApi.listForCourse(courseId);
      setMaterials(ms);
      onReadyCount?.(ms.filter(m => m.status === 'ready').length);
      setCollapsed(prev => prev !== null ? prev
        : Boolean(collapseWhenIdle) && ms.length > 0 && ms.every(m => m.status !== 'processing'));
    } catch (e) { console.warn('materials refresh failed', e); /* backend not migrated yet */ }
  }, [courseId, topicId, mode, onReadyCount, collapseWhenIdle]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll while extraction is running so status chips go Processing → Ready.
  useEffect(() => {
    if (!materials.some(m => m.status === 'processing')) return;
    const id = setInterval(refresh, 2500);
    return () => clearInterval(id);
  }, [materials, refresh]);

  const onFile = async (f: File | null | undefined) => {
    if (!f || !courseId) return;
    setUploading(true);
    setCollapsed(false);
    try {
      if (mode === 'topic') {
        await materialsApi.upload(f, courseId, { topicId, isCourseWide: courseWide });
      } else if (scopeKind === 'course') {
        await materialsApi.upload(f, courseId, { isCourseWide: true });
      } else {
        // Specific topics: upload attached to the first, link the rest.
        const [first, ...rest] = pickedTopics;
        const mat = await materialsApi.upload(f, courseId, { topicId: first });
        for (const t of rest) await materialsApi.linkToTopic(t, mat.id);
      }
      toast('Material uploaded · extracting text…');
      setScopeOpen(false);
      await refresh();
    } catch (e: any) {
      toast(e?.message ?? 'Upload failed');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  const togglePicked = (id: string) =>
    setPickedTopics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const [pendingDelete, setPendingDelete] = useState<Material | null>(null);
  // Deleting destroys the file everywhere it's used — name the blast radius.
  const deleteWarning = (m: Material) => {
    const linked = m.linked_topics ?? [];
    return m.is_course_wide
      ? <>“{m.filename}” grounds <b>every topic</b> in this course. Delete it for the whole course?</>
      : linked.length > 1 || (linked.length === 1 && linked[0].id !== topicId)
        ? <>“{m.filename}” grounds <b>{linked.map(t => t.title).join(', ')}</b>. Delete it for all of them?</>
        : <>Remove “{m.filename}”? Content already generated from it keeps its record.</>;
  };
  const remove = async (m: Material) => {
    try { await materialsApi.remove(m.id); toast('Material removed'); await refresh(); }
    catch (e: any) { toast(e?.message ?? 'Remove failed'); }
  };

  const statusBadge = (m: Material) =>
    m.status === 'ready' ? <Badge variant="green" dot>Ready</Badge>
      : m.status === 'processing' ? <Badge variant="info">Processing…</Badge>
        : <Badge variant="red">Error</Badge>;

  // Scope comes from the material's own course-wide flag — never from how it
  // reaches this topic (a course-wide file can also be topic-linked, and the
  // link must not relabel it "topic only"). Topic-scoped files NAME their
  // topics; a scoped file linked to nothing grounds nothing, and says so.
  const scopeLabel = (m: Material) => {
    if (m.is_course_wide) return 'Whole course';
    const linked = m.linked_topics ?? [];
    if (linked.length === 0) return 'Not linked to any topic — grounds nothing';
    if (mode === 'topic') {
      const others = linked.filter(t => t.id !== topicId);
      return others.length === 0 ? 'This topic only'
        : `This topic + ${others.map(t => t.title).join(', ')}`;
    }
    return `Topic: ${linked.map(t => t.title).join(', ')}`;
  };

  const readyCount = materials.filter(m => m.status === 'ready').length;
  const isCollapsed = collapsed === true;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        onClick={() => setCollapsed(v => !(v === true))}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>
          Reference materials
        </div>
        {/* topic mode shows what grounds THIS topic; course mode is the whole
            course's file inventory (incl. topic-specific ones) */}
        <Badge variant="muted">{mode === 'topic' ? 'Grounding this topic' : 'Course library'}</Badge>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isCollapsed && materials.length > 0 && (
            <span style={{ fontSize: 12.5, color: W.text3 }}>
              {materials.length} attached{readyCount > 0 ? `, grounding ${mode === 'topic' ? 'this topic' : 'every topic in the course'}` : ''}
            </span>
          )}
        </div>
        {readyCount > 0 && (
          <span title="Applies to NEW generations from now on. Artifacts generated earlier are unaffected — each shows its own Grounded chip.">
            <Badge variant="green" dot>Grounding active</Badge>
          </span>
        )}
        <span style={{ fontSize: 11, color: W.text3 }}>{isCollapsed ? '▸' : '▾'}</span>
      </div>

      {!isCollapsed && <>
        <div style={{ fontSize: 12.5, color: W.text2, margin: '8px 0 14px' }}>
          {mode === 'topic'
            ? 'Optional. Upload a textbook chapter or lecture notes (PDF/DOCX) and generation will ground this topic’s content in it.'
            : 'Optional. Files uploaded here ground content generation for every topic in this course.'}
        </div>

        {materials.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${W.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                onClick={() => m.status === 'ready' && materialsApi.view(m.id, m.filename).catch(() => toast('File is not stored — re-upload to enable viewing'))}
                title={m.status === 'ready' ? 'Open the original file' : undefined}
                style={{
                  fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 13,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  cursor: m.status === 'ready' ? 'pointer' : 'default',
                  color: m.status === 'ready' ? 'var(--brand)' : W.text,
                }}
              >{m.filename}</div>
              <div title={scopeLabel(m)} style={{ fontSize: 11, color: W.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scopeLabel(m)}
                {m.status === 'ready' && m.page_count ? ` · ${m.page_count} pages` : ''}
                {m.status === 'error' && m.error_message ? ` · ${m.error_message}` : ''}
              </div>
            </div>
            {statusBadge(m)}
            <Btn sm variant="ghost" onClick={() => setPendingDelete(m)}>✕</Btn>
          </div>
        ))}

        <input
          ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
          onChange={e => onFile(e.target.files?.[0])}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <Btn sm disabled={uploading}
            onClick={() => mode === 'course' ? setScopeOpen(true) : fileRef.current?.click()}>
            {uploading ? 'Uploading…' : '+ Upload PDF / DOCX'}
          </Btn>
          {mode === 'topic' && (
            <label title="Unchecked: the file grounds only this topic. Checked: it grounds every topic in the course."
                   style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: W.text2, cursor: 'pointer' }}>
              <input type="checkbox" checked={courseWide} onChange={e => setCourseWide(e.target.checked)} />
              Use for the whole course, not just this topic
            </label>
          )}
        </div>
      </>}

      {/* Course-level upload: choose scope (whole course, or one/many topics)
          before the file picker opens. */}
      {scopeOpen && (
        <Modal onClose={() => setScopeOpen(false)} title="Add reference material"
          subtitle="Where should this document ground content generation?" maxWidth={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {([['course', 'Whole course', 'Grounds every topic in this course.'],
               ['topics', 'Specific topics', 'Grounds only the topics you select below.']] as const).map(([k, label, help]) => (
              <label key={k} style={{
                display: 'flex', gap: 10, padding: '11px 13px', borderRadius: 9, cursor: 'pointer',
                border: `1.5px solid ${scopeKind === k ? W.brand : W.border}`,
                background: scopeKind === k ? 'var(--tint-brand-bg)' : 'var(--card)',
              }}>
                <input type="radio" name="upl-scope" checked={scopeKind === k} onChange={() => setScopeKind(k)} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13.5, color: W.text }}>{label}</div>
                  <div style={{ fontSize: 12, color: W.text2 }}>{help}</div>
                </div>
              </label>
            ))}
          </div>

          {scopeKind === 'topics' && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: W.text3, flex: 1 }}>
                  Topics ({pickedTopics.length} selected)
                </div>
                <button onClick={() => setPickedTopics(pickedTopics.length === (topics?.length ?? 0) ? [] : (topics ?? []).map(t => t.id))}
                  style={{ background: 'none', border: 'none', color: W.brandTintFg, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: W.fontDisplay }}>
                  {pickedTopics.length === (topics?.length ?? 0) ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto', border: `1px solid ${W.border}`, borderRadius: 8, padding: 6 }}>
                {(topics ?? []).length === 0 && <div style={{ fontSize: 12.5, color: W.text3, padding: '8px 10px' }}>This course has no topics yet.</div>}
                {(topics ?? []).map(t => (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, cursor: 'pointer', background: pickedTopics.includes(t.id) ? 'var(--tint-brand-bg)' : 'transparent' }}>
                    <input type="checkbox" checked={pickedTopics.includes(t.id)} onChange={() => togglePicked(t.id)} />
                    <span style={{ fontSize: 13, color: W.text }}>{t.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="ghost" onClick={() => setScopeOpen(false)}>Cancel</Btn>
            <Btn variant="primary" disabled={uploading || (scopeKind === 'topics' && pickedTopics.length === 0)}
              onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : 'Choose file & upload'}
            </Btn>
          </div>
        </Modal>
      )}
      {pendingDelete && (
        <ConfirmModal
          title="Delete material" danger confirmLabel="Delete"
          body={deleteWarning(pendingDelete)}
          onConfirm={() => remove(pendingDelete)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </Card>
  );
}
