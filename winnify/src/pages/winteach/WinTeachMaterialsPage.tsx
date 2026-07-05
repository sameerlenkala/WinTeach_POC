import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Card, Btn, Badge, ConfirmModal } from './WinTeachUI';
import { materialsApi, type Material } from '@/api/materials';

// Grounding repository: every reference material across the user's courses —
// where each file applies, its extraction status, and how big its chunk pool
// is. Uploads happen in context (course page / studio); this page is the
// overview + housekeeping surface.
export default function WinTeachMaterialsPage() {
  const navigate = useNavigate();
  const { toast } = useWinTeach();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { setMaterials(await materialsApi.listMine()); } catch { /* not migrated */ }
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  // Poll while any file is still extracting.
  useEffect(() => {
    if (!materials.some(m => m.status === 'processing')) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [materials, refresh]);

  const [pendingDelete, setPendingDelete] = useState<Material | null>(null);
  const scopeOfMaterial = (m: Material) => m.is_course_wide
    ? `every topic in ${m.course?.code ?? 'its course'}`
    : (m.linked_topics ?? []).map(t => t.title).join(', ') || 'nothing (not linked)';
  const remove = async (m: Material) => {
    try { await materialsApi.remove(m.id); toast('Material removed'); await refresh(); }
    catch (e: any) { toast(e?.message ?? 'Remove failed'); }
  };

  const ready = materials.filter(m => m.status === 'ready').length;
  const processing = materials.filter(m => m.status === 'processing').length;
  const errored = materials.filter(m => m.status === 'error').length;
  const courseCount = new Set(materials.map(m => m.course_id)).size;

  const scopeOf = (m: Material) =>
    m.is_course_wide ? 'Whole course'
      : (m.linked_topics ?? []).length
        ? `Topic: ${m.linked_topics!.map(t => t.title).join(', ')}`
        : 'Not linked — grounds nothing';

  return (
    <>
      <WinTopbar title="Reference Materials" />
      <WinContent>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* summary strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {([
            ['Files', materials.length], ['Ready', ready],
            ['Processing', processing], ['Errors', errored], ['Courses', courseCount],
          ] as [string, number][]).map(([l, v]) => (
            <div key={l} style={{ background: 'var(--card)', border: `1px solid ${W.border}`, borderRadius: 10, padding: '12px 20px', minWidth: 96, textAlign: 'center' }}>
              <div style={{ fontFamily: W.fontDisplay, fontSize: '.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: W.text3, marginBottom: 3 }}>{l}</div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '1.15rem', color: l === 'Errors' && v > 0 ? W.redFg : W.text }}>{v}</div>
            </div>
          ))}
        </div>

        <Card>
          <div style={{ fontSize: 12.5, color: W.text2, marginBottom: 14 }}>
            Every reference document grounding content generation across your courses.
            Upload new files from a course page (course-wide or per topic) or from a topic's Generation Studio.
          </div>

          {loading && <div style={{ padding: '18px 0', color: W.text2, fontSize: 13 }}>Loading…</div>}
          {!loading && materials.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: W.text2, fontSize: 13.5 }}>
              No reference materials yet. Open a course and upload a textbook chapter or
              lecture notes to start grounding generation.
              <div style={{ marginTop: 12 }}>
                <Btn sm onClick={() => navigate('/winteach/courses')}>Go to courses →</Btn>
              </div>
            </div>
          )}

          {materials.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${W.border}` }}>
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div
                  onClick={() => m.status === 'ready' && materialsApi.view(m.id, m.filename).catch(() => toast('File is not stored — re-upload to enable viewing'))}
                  title={m.status === 'ready' ? 'Open the original file' : undefined}
                  style={{
                    fontFamily: W.fontDisplay, fontWeight: 500, fontSize: 13.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    cursor: m.status === 'ready' ? 'pointer' : 'default',
                    color: m.status === 'ready' ? 'var(--brand)' : W.text,
                  }}
                >{m.filename}</div>
                <div title={scopeOf(m)} style={{ fontSize: 11, color: W.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {scopeOf(m)}
                  {m.status === 'ready' && m.page_count ? ` · ${m.page_count} pages` : ''}
                  {m.status === 'ready' && m.chunk_count ? ` · ${m.chunk_count} excerpts` : ''}
                  {m.status === 'error' && m.error_message ? ` · ${m.error_message}` : ''}
                </div>
              </div>
              {m.course && (
                <button
                  onClick={() => navigate(`/winteach/courses/${m.course!.id}`)}
                  title={m.course.name}
                  style={{ background: W.surfaceMuted, border: `1px solid ${W.border}`, borderRadius: 99, padding: '3px 11px', fontSize: 11.5, fontFamily: W.fontDisplay, fontWeight: 600, color: W.text2, cursor: 'pointer', flexShrink: 0 }}
                >{m.course.code}</button>
              )}
              {m.status === 'ready' ? <Badge variant="green" dot>Ready</Badge>
                : m.status === 'processing' ? <Badge variant="info">Processing…</Badge>
                  : <Badge variant="red">Error</Badge>}
              <Btn sm variant="ghost" onClick={() => setPendingDelete(m)}>✕</Btn>
            </div>
          ))}
        </Card>
        </div>
      </WinContent>
      {pendingDelete && (
        <ConfirmModal
          title="Delete material" danger confirmLabel="Delete"
          body={<>“{pendingDelete.filename}” grounds <b>{scopeOfMaterial(pendingDelete)}</b>. Delete it?</>}
          onConfirm={() => remove(pendingDelete)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
