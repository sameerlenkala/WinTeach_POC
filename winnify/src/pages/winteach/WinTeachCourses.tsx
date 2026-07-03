import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWinTeach } from './WinTeachContext';
import { allTopics, topicState, coursePct } from './winteachData';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { StatusBadge, XpBar, Card, Btn, IconBtn, CoIcon, Modal } from './WinTeachUI';
import { IBell, IPlus, IEdit, IEmpty, ITrash } from './WinTeachIcons';
import { coursesApi } from '@/api/courses';

export default function WinTeachCourses() {
  const navigate = useNavigate();
  const { courses, setCourses, coursesLoading } = useWinTeach();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await coursesApi.delete(confirmDelete.id);
      setCourses(prev => prev.filter(c => c.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message ?? 'Failed to delete course. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (coursesLoading) {
    return (
      <>
        <WinTopbar title="Courses" actions={<IconBtn><IBell /></IconBtn>} />
        <WinContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: W.text3, fontFamily: W.fontDisplay, fontSize: 15 }}>
            Loading courses…
          </div>
        </WinContent>
      </>
    );
  }

  return (
    <>
      <WinTopbar title="Courses" actions={
        <>
          <IconBtn><IBell /></IconBtn>
          <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
            Create new course
          </Btn>
        </>
      } />
      <WinContent>
        {!courses.length ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: W.text2 }}>
              <div style={{ width: 48, height: 48, color: W.text3, margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <IEmpty />
              </div>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>No courses yet</div>
              <div style={{ fontSize: 15, color: W.text2, marginBottom: 24 }}>Upload a syllabus to generate your first course plan.</div>
              <Btn variant="primary" onClick={() => navigate('/winteach/courses/new')}>
                <span style={{ width: 18, height: 18, display: 'inline-flex' }}><IPlus /></span>
                Create new course
              </Btn>
            </div>
          </Card>
        ) : (
          <>
            {/* ce-card with 0 padding for full-bleed table */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 0' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--brand)', marginBottom: 3 }}>My workspace</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                    Courses <span style={{ fontSize: '.92rem', fontWeight: 500, color: 'var(--text-2)', marginLeft: 6 }}>{courses.length} total</span>
                  </div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr>
                    {['Course', 'Structure', 'Generation', 'Status', ''].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 700, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0 24px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => {
                    const ts = allTopics(c);
                    const readyCount = ts.filter(x => topicState(x.topic) === 'ready').length;
                    const isLast = i === courses.length - 1;
                    return (
                      <tr key={c.id} className="wt-row"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('[data-edit]')) return;
                          navigate(`/winteach/courses/${c.id}`);
                        }}
                        style={{ cursor: 'pointer', transition: 'background .12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--row-hover)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                      >
                        <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--brand)', marginBottom: 2 }}>{c.code}</div>
                          <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: '.98rem', color: 'var(--text)' }}>{c.name}</div>
                          <div style={{ fontSize: '.8rem', color: 'var(--text-2)', marginTop: 1 }}>
                            {(c as any).semester ? `Sem ${(c as any).semester}` : '—'} · {c.credits ?? '—'} credits · {c.regulation || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                            {c.units?.length ?? 0} units · {ts.length} topics
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'middle', minWidth: 160 }}>
                          <div style={{ marginBottom: 6 }}><XpBar value={coursePct(c)} /></div>
                          <span style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>{readyCount}/{ts.length} topics · {coursePct(c)}%</span>
                        </td>
                        <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <StatusBadge status={c.status} />
                        </td>
                        <td style={{ padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <CoIcon data-edit onClick={() => navigate(`/winteach/courses/${c.id}`)} title="Open course">
                              <IEdit />
                            </CoIcon>
                            <CoIcon data-edit danger onClick={() => setConfirmDelete({ id: c.id ?? '', name: c.name })} title="Delete course">
                              <ITrash />
                            </CoIcon>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </WinContent>

      {confirmDelete && (
        <Modal onClose={() => !deleting && setConfirmDelete(null)} title="Delete course">
          <div style={{ fontSize: 14, color: W.text, lineHeight: 1.6, marginBottom: 24 }}>
            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
            <br />This will permanently remove the course and all its topics, COs, and generated content.
          </div>
          {deleteError && (
            <div style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--status-red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {deleteError}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Btn variant="ghost" onClick={() => { setConfirmDelete(null); setDeleteError(''); }} disabled={deleting}>Cancel</Btn>
            <Btn variant="primary" onClick={handleDelete} disabled={deleting}
              style={{ background: 'var(--status-red)', borderColor: 'var(--status-red)' }}>
              {deleting ? 'Deleting…' : 'Delete course'}
            </Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
