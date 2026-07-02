import { useState } from 'react';
import { BookOpen, Plus, Trash2, ExternalLink } from 'lucide-react';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { BloomBadge, IconBtn, Card, Btn } from './WinTeachUI';
import { IBell } from './WinTeachIcons';
import { useLibrarySources, useCOSuggestions } from '@/api/hooks';
import { libraryApi } from '@/api/library';
import { useQueryClient } from '@tanstack/react-query';

type Tab = 'sources' | 'co';

export default function WinTeachLibrary() {
  const [tab, setTab] = useState<Tab>('sources');
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [edition, setEdition] = useState('');
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data: sources = [], isLoading: srcLoading } = useLibrarySources();
  const { data: coEntries = [], isLoading: coLoading } = useCOSuggestions();

  const addSource = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await libraryApi.createSource({ title, authors: authors ? authors.split(',').map(a => a.trim()) : [], url: '', description: '', tags: [], source_type: 'textbook' });
      qc.invalidateQueries({ queryKey: ['library', 'sources'] });
      setTitle(''); setAuthors(''); setEdition('');
      setAddOpen(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Remove this source?')) return;
    try {
      await libraryApi.deleteSource(id);
      qc.invalidateQueries({ queryKey: ['library', 'sources'] });
    } catch { /* ignore */ }
  };

  return (
    <>
      <WinTopbar title="Library" actions={<IconBtn><IBell /></IconBtn>} />
      <WinContent>
        {/* Tabs — ce-top__btn style */}
        <div style={{ display: 'flex', gap: 4, background: '#f6f7fb', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 24 }}>
          {([['sources', 'Source catalog'], ['co', 'CO Library']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              height: 34, padding: '0 18px', borderRadius: 9, border: 'none',
              background: tab === key ? '#fff' : 'transparent',
              boxShadow: tab === key ? '0 1px 4px rgba(28,32,48,.08)' : 'none',
              fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13,
              color: tab === key ? '#5b4bff' : '#6b7080', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        {/* Source catalog tab */}
        {tab === 'sources' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>
                {srcLoading ? 'Loading…' : `${sources.length} source${sources.length !== 1 ? 's' : ''}`}
              </div>
              <Btn sm onClick={() => setAddOpen(o => !o)}>
                <Plus size={14} /> Add source
              </Btn>
            </div>

            {addOpen && (
              <Card compact style={{ marginBottom: 16, border: '1.5px solid #e9eaf2' }}>
                <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Add reference book / source</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  {[
                    { label: 'Title', val: title, set: setTitle, ph: 'e.g. Operating System Concepts' },
                    { label: 'Author(s)', val: authors, set: setAuthors, ph: 'e.g. Silberschatz, Galvin' },
                    { label: 'Edition', val: edition, set: setEdition, ph: 'e.g. 10th' },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: W.text2, marginBottom: 6 }}>{label}</div>
                      <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                        style={{ width: '100%', height: 38, borderRadius: 8, border: `1.5px solid ${W.border}`, background: W.surfaceMuted, padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Btn variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Btn>
                  <Btn variant="primary" onClick={addSource} disabled={saving || !title.trim()}>
                    {saving ? 'Adding…' : 'Add source'}
                  </Btn>
                </div>
              </Card>
            )}

            {srcLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: W.text2, fontSize: 14 }}>Loading sources…</div>
            ) : sources.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <BookOpen size={36} color={W.text3} style={{ margin: '0 auto 14px', display: 'block' }} />
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No sources yet</div>
                  <div style={{ fontSize: 14, color: W.text2, marginBottom: 18 }}>Add the textbooks and references your courses use.</div>
                  <Btn onClick={() => setAddOpen(true)}><Plus size={14} /> Add first source</Btn>
                </div>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {(sources as any[]).map((src) => (
                  <div key={src.id} style={{ border: '1px solid #e9eaf2', borderRadius: 14, padding: '15px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: '#efeefe', color: '#5b4bff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 40px' }}>
                        <BookOpen size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: W.fontDisplay, fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{src.title}</div>
                        {src.authors && <div style={{ fontSize: 12.5, color: W.text2, marginTop: 3 }}>{src.authors}</div>}
                        {src.edition && <div style={{ fontSize: 12, color: W.text3, marginTop: 2 }}>{src.edition}</div>}
                      </div>
                      <button onClick={() => deleteSource(src.id)} style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid rgba(220,38,38,0.2)`, background: 'rgba(220,38,38,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: '0 0 28px' }}>
                        <Trash2 size={13} color="#DC2626" />
                      </button>
                    </div>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: W.brand, textDecoration: 'none' }}>
                        <ExternalLink size={12} /> View source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CO Library tab */}
        {tab === 'co' && (
          <>
            <div style={{ fontSize: 14, color: W.text2, marginBottom: 16 }}>
              {coLoading ? 'Loading…' : `${coEntries.length} reusable outcomes — pulled into the create wizard when starting a new course.`}
            </div>
            {coLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: W.text2 }}>Loading…</div>
            ) : coEntries.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 20px', color: W.text2, fontSize: 14 }}>
                  No CO Library entries yet. They populate automatically as you finalize course plans.
                </div>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {(coEntries as any[]).map((item, i) => (
                  <div key={item.id ?? i} style={{ border: '1px solid #e9eaf2', borderRadius: 14, padding: '15px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '.68rem', textTransform: 'uppercase' as const, letterSpacing: '.08em', color: '#5b4bff', background: '#efeefe', borderRadius: 6, padding: '2px 8px' }}>CO Library</span>
                      <BloomBadge bloom={item.bloom_level ?? item.bloom ?? 'Apply'} />
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, color: W.text }}>{item.text ?? item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </WinContent>
    </>
  );
}
