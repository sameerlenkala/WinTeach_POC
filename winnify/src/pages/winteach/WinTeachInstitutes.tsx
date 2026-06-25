import { useState } from 'react';
import { useWinTeach } from './WinTeachContext';
import { W } from './winteachStyles';
import { WinTopbar, WinContent } from './WinTeachLayout';
import { Badge, Card, Btn, IconBtn, CoIcon, DeltaBanner, Modal, Field, Input, Select, Textarea } from './WinTeachUI';
import { IBell, IPlus, IEdit, ITrash, ICheck, IInfo } from './WinTeachIcons';
import { MAJORS } from './winteachData';
import {
  useInstitute, useCreateInstitute, useUpdateInstitute, useDeleteInstitute,
  usePOs, useAddPO, useDeletePO,
  usePSOs, useAddPSO, useDeletePSO,
} from '@/api/hooks';
import type { PO, PSO } from '@/api/types';

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: W.text3, fontFamily: W.fontDisplay, fontSize: 14 }}>
      Loading…
    </div>
  );
}

export default function WinTeachInstitutes() {
  const { institutes, institutesLoading, courses, currentInst, setCurrentInst } = useWinTeach();
  const [instModal, setInstModal] = useState<{ id: string | null } | null>(null);

  const coursesForInst = (name: string) => courses.filter(c => (c.institute || '') === name);

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (currentInst !== null) {
    return (
      <InstituteDetail
        instituteId={currentInst}
        onBack={() => setCurrentInst(null)}
        onEdit={() => setInstModal({ id: currentInst })}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <>
      <WinTopbar title="Institute PO & PSO" actions={
        <>
          <IconBtn><IBell /></IconBtn>
          <Btn variant="primary" onClick={() => setInstModal({ id: null })}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IPlus /></span>
            Add institute
          </Btn>
        </>
      } />
      <WinContent>
        <DeltaBanner>
          Program Outcomes (PO) and Program Specific Outcomes (PSO) are defined per institute.
          PSOs are either <b>common</b> (apply to all majors) or <b>major-specific</b>.
          Courses inherit the PO/PSO set of their institute &amp; major. Select an institute to view its outcomes.
        </DeltaBanner>

        {institutesLoading ? <Spinner /> : (
          <Card style={{ padding: '8px 12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Institute', 'Regulation', 'Linked courses', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: W.fontSans, fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: W.text3, padding: '0 16px 12px', borderBottom: `1px solid ${W.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {institutes.map((inst, ii) => {
                  const cc = coursesForInst(inst.name).length;
                  const isLast = ii === institutes.length - 1;
                  return (
                    <tr key={inst.id} className="wt-row"
                      onClick={e => {
                        if ((e.target as HTMLElement).closest('[data-edit]') || (e.target as HTMLElement).closest('[data-del]')) return;
                        setCurrentInst(inst.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ padding: 16, borderBottom: isLast ? 'none' : `1px solid ${W.border}`, verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: W.brandBright, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14 }}>
                            {inst.short?.slice(0, 3) || inst.name.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 15 }}>{inst.name}</div>
                            <div style={{ fontSize: 12.5, color: W.text2 }}>{inst.type || 'Institute'} · {inst.location || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 16, borderBottom: isLast ? 'none' : `1px solid ${W.border}`, verticalAlign: 'middle' }}>
                        <span style={{ fontSize: 12.5, color: W.text2 }}>{inst.regulation || '—'}</span>
                      </td>
                      <td style={{ padding: 16, borderBottom: isLast ? 'none' : `1px solid ${W.border}`, verticalAlign: 'middle' }}>
                        <span style={{ fontSize: 12.5, color: W.text2 }}>{cc} course{cc !== 1 ? 's' : ''}</span>
                      </td>
                      <td style={{ padding: 16, borderBottom: isLast ? 'none' : `1px solid ${W.border}`, verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <CoIcon data-edit onClick={() => setInstModal({ id: inst.id })} title="Edit"><IEdit /></CoIcon>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!institutes.length && (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: W.text2, fontSize: 14 }}>
                      No institutes yet. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </WinContent>

      {instModal && (
        <InstituteModal
          id={instModal.id}
          onClose={() => setInstModal(null)}
        />
      )}
    </>
  );
}

// ── Institute detail ──────────────────────────────────────────────────────────
function InstituteDetail({
  instituteId, onBack, onEdit,
}: {
  instituteId: string;
  onBack: () => void;
  onEdit: () => void;
}) {
  const { data: inst, isLoading } = useInstitute(instituteId);
  const { data: pos = [], isLoading: posLoading } = usePOs(instituteId);
  const { data: psos = [], isLoading: psosLoading } = usePSOs(instituteId);
  const { mutate: deletePO } = useDeletePO(instituteId);
  const { mutate: deletePSO } = useDeletePSO(instituteId);
  const { mutate: deleteInst } = useDeleteInstitute();
  const { setCurrentInst } = useWinTeach();

  const [poModal, setPoModal] = useState<{ id: string | null } | null>(null);
  const [psoModal, setPsoModal] = useState<{ id: string | null } | null>(null);

  if (isLoading) {
    return (
      <>
        <WinTopbar title="Institute" actions={<Btn variant="ghost" onClick={onBack}>← All institutes</Btn>} />
        <WinContent><Spinner /></WinContent>
      </>
    );
  }

  if (!inst) {
    return (
      <>
        <WinTopbar title="Not found" />
        <WinContent><Btn onClick={onBack}>← Back</Btn></WinContent>
      </>
    );
  }

  const common = psos.filter(p => p.scope === 'common');
  const byMajor: Record<string, PSO[]> = {};
  psos.filter(p => p.scope === 'major').forEach(p => {
    const k = p.major || '—';
    if (!byMajor[k]) byMajor[k] = [];
    byMajor[k].push(p);
  });

  const poRow = (p: PO) => (
    <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 8, background: '#fff' }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, flex: '0 0 56px', paddingTop: 2 }}>{p.code}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.55 }}>{p.text}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <CoIcon onClick={() => setPoModal({ id: p.id })}><IEdit /></CoIcon>
        <CoIcon danger onClick={() => { if (confirm(`Delete ${p.code}?`)) deletePO(p.id); }}><ITrash /></CoIcon>
      </div>
    </div>
  );

  const psoRow = (p: PSO) => (
    <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `1px solid ${W.border}`, borderRadius: 16, marginBottom: 8, background: '#fff' }}>
      <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 13, color: W.brand, flex: '0 0 56px', paddingTop: 2 }}>{p.code}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{p.text}</div>
        {p.scope === 'common'
          ? <Badge variant="blue">Common</Badge>
          : <Badge variant="pink">{p.major || 'Major'}</Badge>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <CoIcon onClick={() => setPsoModal({ id: p.id })}><IEdit /></CoIcon>
        <CoIcon danger onClick={() => { if (confirm(`Delete ${p.code}?`)) deletePSO(p.id); }}><ITrash /></CoIcon>
      </div>
    </div>
  );

  return (
    <>
      <WinTopbar title="Institute PO & PSO" actions={
        <>
          <Btn variant="ghost" onClick={onBack}>← All institutes</Btn>
          <Btn onClick={onEdit}>
            <span style={{ width: 16, height: 16, display: 'inline-flex' }}><IEdit /></span>Edit institute
          </Btn>
        </>
      } />
      <WinContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: W.text2, marginBottom: 18 }}>
          <a onClick={onBack} style={{ color: W.brand, textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>Institutes</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          <span>{inst.name}</span>
        </div>

        {/* Institute card */}
        <div style={{ border: `1px solid ${W.border}`, borderRadius: W.r5, background: W.card, marginBottom: 24, overflow: 'hidden', boxShadow: W.shadowCard }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 26px', background: 'linear-gradient(135deg,#F4F3FD,#FBFAFF)', borderBottom: `1px solid ${W.border}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: W.brandBright, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 17 }}>
              {inst.short_name?.slice(0, 3) || inst.name.slice(0, 3).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20 }}>{inst.name}</div>
              <div style={{ fontSize: 12.5, color: W.text2, marginTop: 8 }}>
                {inst.city && `${inst.city}, `}{inst.state} · {inst.regulation || '—'} · {inst.affiliation || '—'}
              </div>
            </div>
            <CoIcon
              danger
              onClick={() => {
                if (confirm(`Delete institute "${inst.name}"?`)) {
                  deleteInst(instituteId);
                  setCurrentInst(null);
                }
              }}
              title="Delete"
            ><ITrash /></CoIcon>
          </div>

          <div style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              {[['Program Outcomes', pos.length], ['PSOs', psos.length]].map(([label, val]) => (
                <div key={label} style={{ flex: '1 1 120px', minWidth: 120, border: `1px solid ${W.border}`, borderRadius: 16, padding: 18, textAlign: 'center', background: '#fff' }}>
                  <div style={{ fontSize: 12.5, color: W.text2 }}>{label}</div>
                  <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 20, color: W.brand }}>{val}</div>
                </div>
              ))}
            </div>

            {/* POs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Program Outcomes (PO)</div>
              <Btn sm onClick={() => setPoModal({ id: null })}>
                <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add PO
              </Btn>
            </div>
            <div style={{ marginBottom: 24 }}>
              {posLoading ? <Spinner /> : pos.length ? pos.map(poRow) : (
                <div style={{ fontSize: 12.5, color: W.text2 }}>No POs defined.</div>
              )}
            </div>

            {/* PSOs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: W.fontDisplay, fontWeight: 600, fontSize: 14, color: W.text2 }}>Program Specific Outcomes (PSO)</div>
              <Btn sm onClick={() => setPsoModal({ id: null })}>
                <span style={{ width: 14, height: 14, display: 'inline-flex' }}><IPlus /></span>Add PSO
              </Btn>
            </div>
            {psosLoading ? <Spinner /> : (
              <>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Common — all majors</div>
                {common.length ? common.map(psoRow) : <div style={{ fontSize: 12.5, color: W.text2, marginBottom: 16 }}>No common PSOs.</div>}
                {Object.keys(byMajor).sort().map(mj => (
                  <div key={mj}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Major-specific — {mj}</div>
                    {byMajor[mj].map(psoRow)}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </WinContent>

      {poModal && (
        <POModal
          instituteId={instituteId}
          existingId={poModal.id}
          existingPO={poModal.id ? pos.find(p => p.id === poModal.id) : undefined}
          nextCode={`PO${pos.length + 1}`}
          onClose={() => setPoModal(null)}
        />
      )}
      {psoModal && (
        <PSOModal
          instituteId={instituteId}
          existingId={psoModal.id}
          existingPSO={psoModal.id ? psos.find(p => p.id === psoModal.id) : undefined}
          nextCode={`PSO${psos.length + 1}`}
          onClose={() => setPsoModal(null)}
        />
      )}
    </>
  );
}

// ── Institute modal (create/edit) ─────────────────────────────────────────────
function InstituteModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { institutes } = useWinTeach();
  const { mutate: create, isPending: creating } = useCreateInstitute();
  const { mutate: update, isPending: updating } = useUpdateInstitute();

  const existing = id ? institutes.find(i => i.id === id) : null;
  const [name, setName] = useState(existing?.name || '');
  const [short, setShort] = useState(existing?.short || '');
  const [type, setType] = useState(existing?.type || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [regulation, setRegulation] = useState(existing?.regulation || '');
  const [affiliation, setAffiliation] = useState((existing as any)?.affiliation || '');

  const isBusy = creating || updating;

  const save = () => {
    if (!name.trim()) return;
    const payload = {
      name,
      short_name: short || name.slice(0, 3).toUpperCase(),
      city: location,
      state: '',
      country: 'IN',
      regulation,
      affiliation,
      contact_email: '',
    };
    if (id) {
      update({ id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal onClose={onClose} title={id ? 'Edit institute' : 'Add institute'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Institute name"><Input value={name} onChange={setName} placeholder="e.g. CIET" /></Field>
        <Field label="Short code"><Input value={short} onChange={setShort} placeholder="CIET" /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Type"><Input value={type} onChange={setType} placeholder="Engineering College" /></Field>
        <Field label="City"><Input value={location} onChange={setLocation} placeholder="Andhra Pradesh, IN" /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Regulation"><Input value={regulation} onChange={setRegulation} placeholder="CIET R24" /></Field>
        <Field label="Affiliation"><Input value={affiliation} onChange={setAffiliation} placeholder="JNTUK / Autonomous" /></Field>
      </div>
      {!id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: W.blueBg, borderRadius: W.r4, padding: '14px 16px', marginTop: 6 }}>
          <span style={{ width: 20, height: 20, color: W.blueFg, display: 'flex' }}><IInfo /></span>
          <div style={{ fontSize: 13.5, color: W.text }}>You can add POs and PSOs after creating the institute.</div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={isBusy}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
          {isBusy ? 'Saving…' : id ? 'Save institute' : 'Create institute'}
        </Btn>
      </div>
    </Modal>
  );
}

// ── PO modal ──────────────────────────────────────────────────────────────────
function POModal({ instituteId, existingId, existingPO, nextCode, onClose }: {
  instituteId: string;
  existingId: string | null;
  existingPO?: PO;
  nextCode: string;
  onClose: () => void;
}) {
  const { mutate: addPO, isPending } = useAddPO(instituteId);
  const [code, setCode] = useState(existingPO?.code || nextCode);
  const [text, setText] = useState(existingPO?.text || '');

  const save = () => {
    if (!text.trim()) return;
    addPO({ code, text }, { onSuccess: onClose });
  };

  return (
    <Modal onClose={onClose} title={existingId ? 'Edit PO' : 'Add PO'}>
      <Field label="Code"><Input value={code} onChange={setCode} placeholder="PO1" /></Field>
      <Field label="Statement"><Textarea value={text} onChange={setText} /></Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={isPending}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
          {isPending ? 'Saving…' : existingId ? 'Save PO' : 'Add PO'}
        </Btn>
      </div>
    </Modal>
  );
}

// ── PSO modal ─────────────────────────────────────────────────────────────────
function PSOModal({ instituteId, existingId, existingPSO, nextCode, onClose }: {
  instituteId: string;
  existingId: string | null;
  existingPSO?: PSO;
  nextCode: string;
  onClose: () => void;
}) {
  const { mutate: addPSO, isPending } = useAddPSO(instituteId);
  const [code, setCode] = useState(existingPSO?.code || nextCode);
  const [text, setText] = useState(existingPSO?.text || '');
  const [scope, setScope] = useState<'common' | 'major'>(existingPSO?.scope || 'common');
  const [major, setMajor] = useState(existingPSO?.major || MAJORS[0]);

  const save = () => {
    if (!text.trim()) return;
    addPSO(
      { code, text, scope, major: scope === 'major' ? major : undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal onClose={onClose} title={`${existingId ? 'Edit' : 'Add'} PSO`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Code"><Input value={code} onChange={setCode} /></Field>
        <Field label="Scope">
          <Select value={scope} onChange={v => setScope(v as 'common' | 'major')} options={['common', 'major']} />
        </Field>
      </div>
      {scope === 'major' && (
        <Field label="Major"><Select value={major} onChange={setMajor} options={MAJORS} /></Field>
      )}
      <Field label="Statement"><Textarea value={text} onChange={setText} /></Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={isPending}>
          <span style={{ width: 16, height: 16, display: 'inline-flex' }}><ICheck /></span>
          {isPending ? 'Saving…' : existingId ? 'Save PSO' : 'Add PSO'}
        </Btn>
      </div>
    </Modal>
  );
}
