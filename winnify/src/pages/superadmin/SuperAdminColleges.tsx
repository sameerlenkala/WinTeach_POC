import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useInstitutes, useCreateInstitute, useUpdateInstitute, useDeleteInstitute } from '@/api/hooks';
import type { Institute } from '@/api/types';

const T = { brand: '#E84393', brandBg: 'rgba(232,67,147,0.10)', card: '#fff', border: '#E6E5F0', text: '#1A1A22', text2: 'rgba(26,26,34,0.60)', fontD: 'var(--font-display)', r5: 20, shadow: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)' };

function Inp({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ height: 42, borderRadius: 10, border: `1.5px solid ${T.border}`, background: '#F5F5F8', padding: '0 14px', fontSize: 14, outline: 'none', color: T.text }} />
    </div>
  );
}

function CollegeModal({ editing, onClose }: { editing: Institute | null; onClose: () => void }) {
  const { mutate: create, isPending: creating } = useCreateInstitute();
  const { mutate: update, isPending: updating } = useUpdateInstitute();

  const [name, setName] = useState(editing?.name || '');
  const [shortName, setShortName] = useState(editing?.short_name || '');
  const [city, setCity] = useState(editing?.city || '');
  const [state, setState] = useState(editing?.state || '');
  const [regulation, setRegulation] = useState(editing?.regulation || '');
  const [affiliation, setAffiliation] = useState(editing?.affiliation || '');
  const [email, setEmail] = useState(editing?.contact_email || '');

  const isBusy = creating || updating;

  const save = () => {
    if (!name.trim()) return;
    const payload = { name, short_name: shortName || name.slice(0, 4).toUpperCase(), city, state, country: 'IN', regulation, affiliation, contact_email: email };
    if (editing) {
      update({ id: editing.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: T.card, borderRadius: 20, padding: 32, width: 560, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(60,50,140,0.22)' }}>
        <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
          {editing ? 'Edit college' : 'Add college'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Inp label="College name" value={name} onChange={setName} placeholder="e.g. VJIT" />
          <Inp label="Short code" value={shortName} onChange={setShortName} placeholder="VJIT" />
          <Inp label="City" value={city} onChange={setCity} placeholder="Hyderabad" />
          <Inp label="State" value={state} onChange={setState} placeholder="Telangana" />
          <Inp label="Regulation" value={regulation} onChange={setRegulation} placeholder="JNTUH R22" />
          <Inp label="Affiliation" value={affiliation} onChange={setAffiliation} placeholder="JNTUH / Autonomous" />
        </div>
        <div style={{ marginTop: 16 }}>
          <Inp label="Contact email" value={email} onChange={setEmail} placeholder="principal@college.edu" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={onClose} style={{ height: 42, padding: '0 20px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'transparent', fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: T.text2 }}>Cancel</button>
          <button onClick={save} disabled={isBusy} style={{ height: 42, padding: '0 24px', borderRadius: 10, background: T.brand, color: '#fff', border: 'none', fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: isBusy ? 0.7 : 1 }}>
            {isBusy ? 'Saving…' : editing ? 'Save changes' : 'Add college'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminColleges() {
  const { data: institutes = [], isLoading } = useInstitutes();
  const { mutate: deleteInst } = useDeleteInstitute();
  const [modal, setModal] = useState<{ open: true; editing: Institute | null } | null>(null);

  return (
    <div style={{ padding: '0 36px 40px' }}>
      <div style={{ height: 8 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 28 }}>Colleges</div>
        <button onClick={() => setModal({ open: true, editing: null })} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', borderRadius: 10, background: T.brand, color: '#fff', border: 'none', fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> Add college
        </button>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r5, padding: '8px 12px', boxShadow: T.shadow }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text2, fontSize: 14 }}>Loading…</div>
        ) : institutes.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Building2 size={40} color="rgba(26,26,34,0.2)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>No colleges yet</div>
            <div style={{ fontSize: 14, color: T.text2, marginBottom: 20 }}>Add a college to get started.</div>
            <button onClick={() => setModal({ open: true, editing: null })} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', borderRadius: 10, background: T.brand, color: '#fff', border: 'none', fontFamily: T.fontD, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              <Plus size={16} /> Add first college
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['College', 'City · State', 'Regulation', 'Affiliation', 'Contact', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(26,26,34,0.45)', padding: '0 16px 12px', borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {institutes.map((inst, i) => (
                <tr key={inst.id} style={{ cursor: 'default' }}>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: T.brandBg, color: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontD, fontWeight: 700, fontSize: 13, flex: '0 0 38px' }}>
                        {inst.short_name?.slice(0, 3) || inst.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily: T.fontD, fontWeight: 700, fontSize: 14 }}>{inst.name}</div>
                        <div style={{ fontSize: 12, color: T.text2 }}>{inst.short_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2, verticalAlign: 'middle' }}>
                    {[inst.city, inst.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2, verticalAlign: 'middle' }}>{inst.regulation || '—'}</td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2, verticalAlign: 'middle' }}>{inst.affiliation || '—'}</td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 13, color: T.text2, verticalAlign: 'middle' }}>{inst.contact_email || '—'}</td>
                  <td style={{ padding: 16, borderBottom: i < institutes.length - 1 ? `1px solid ${T.border}` : 'none', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setModal({ open: true, editing: inst })} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Pencil size={14} color={T.text2} />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${inst.name}"?`)) deleteInst(inst.id); }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && <CollegeModal editing={modal.editing} onClose={() => setModal(null)} />}
    </div>
  );
}
