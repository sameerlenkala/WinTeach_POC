import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import type { UserProfile } from '@/api/types';

/* Shared account page for the staff shells (WinTeach faculty, College Admin,
   Super Admin) — view/edit own name & title, and change password. Rendered
   inside each shell's <Outlet/>; styles are self-contained neutrals so it
   reads the same in all three. */

const S: Record<string, CSSProperties> = {
  page:  { maxWidth: 640, margin: '0 auto', padding: '28px 24px 48px',
           fontFamily: 'var(--font-body, ui-sans-serif, system-ui)' },
  h1:    { fontFamily: 'var(--font-display, inherit)', fontSize: 22, fontWeight: 700,
           color: 'var(--text, #1A1A22)', margin: '0 0 20px' },
  card:  { background: 'var(--surface, #fff)', border: '1px solid var(--border, #E7E7EE)',
           borderRadius: 14, padding: 20, marginBottom: 20 },
  h2:    { fontFamily: 'var(--font-display, inherit)', fontSize: 15, fontWeight: 700,
           color: 'var(--text, #1A1A22)', margin: '0 0 14px' },
  row:   { display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-3, #8A8A98)', width: 110, flexShrink: 0 },
  value: { fontSize: 14, color: 'var(--text, #1A1A22)' },
  input: { flex: 1, fontSize: 14, padding: '8px 12px', borderRadius: 9,
           border: '1px solid var(--border, #D8D8E2)', background: 'var(--surface, #fff)',
           color: 'var(--text, #1A1A22)', outline: 'none', minWidth: 0 },
  btn:   { fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 9,
           border: '1px solid transparent', cursor: 'pointer',
           background: 'var(--brand, #6C5CE7)', color: '#fff' },
  btnGhost: { fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 9,
              cursor: 'pointer', background: 'transparent',
              border: '1px solid var(--border, #D8D8E2)', color: 'var(--text-2, #55555F)' },
  note:  { fontSize: 13, marginTop: 10 },
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      {children}
    </div>
  );
}

export default function StaffAccount() {
  const { user, updateUser } = useAuth();
  const [me, setMe] = useState<UserProfile | null>(null);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fName, setFName] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password change
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    authApi.me().then(setMe).catch(() => setProfileMsg({ ok: false, text: 'Could not load your profile.' }));
  }, []);

  const displayName = me?.full_name || user?.name || '—';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const startEdit = () => {
    setFName(me?.full_name ?? '');
    setFTitle(me?.designation ?? '');
    setProfileMsg(null);
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setProfileMsg(null);
    try {
      const updated = await authApi.updateMe({ full_name: fName.trim(), designation: fTitle.trim() });
      setMe(updated);
      updateUser({ name: updated.full_name });
      setEditing(false);
      setProfileMsg({ ok: true, text: 'Profile updated.' });
    } catch (e) {
      setProfileMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    setPwBusy(true);
    try {
      await authApi.changePassword(curPw, newPw);
      setPwMsg({ ok: true, text: 'Password changed.' });
      setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      setPwMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not change password.' });
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Account</h1>

      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ ...S.h2, margin: 0 }}>Profile</h2>
          {!editing && <button style={S.btnGhost} onClick={startEdit}>Edit</button>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0 12px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: 'var(--tint-brand-bg, #EEEBFD)', color: 'var(--tint-brand-fg, #6C5CE7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-display, inherit)' }}>
            {initials}
          </div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <input style={S.input} value={fName} onChange={e => setFName(e.target.value)}
                     placeholder="Full name" aria-label="Full name" />
              <input style={S.input} value={fTitle} onChange={e => setFTitle(e.target.value)}
                     placeholder='Title — e.g. "Associate Professor, CSE"' aria-label="Title" />
            </div>
          ) : (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text, #1A1A22)',
                            fontFamily: 'var(--font-display, inherit)' }}>{displayName}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3, #8A8A98)' }}>
                {me?.designation || 'No title set'}
              </div>
            </div>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', gap: 8, paddingBottom: 12 }}>
            <button style={S.btn} onClick={saveProfile} disabled={saving || !fName.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button style={S.btnGhost} onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border, #EFEFF4)' }}>
          <Row label="Email"><span style={S.value}>{me?.email || user?.email || '—'}</span></Row>
          <Row label="Role"><span style={{ ...S.value, textTransform: 'capitalize' }}>{me?.role || user?.role || '—'}</span></Row>
          <Row label="Institute"><span style={S.value}>{me?.institute_name || '—'}</span></Row>
        </div>

        {profileMsg && (
          <p style={{ ...S.note, color: profileMsg.ok ? '#0B8A5C' : '#D63031' }}>{profileMsg.text}</p>
        )}
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>Change password</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
          <input style={S.input} type="password" value={curPw} onChange={e => setCurPw(e.target.value)}
                 placeholder="Current password" autoComplete="current-password" aria-label="Current password" />
          <input style={S.input} type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                 placeholder="New password (min 8 characters)" autoComplete="new-password" aria-label="New password" />
          <input style={S.input} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                 placeholder="Confirm new password" autoComplete="new-password" aria-label="Confirm new password" />
          <div>
            <button style={S.btn} onClick={changePassword}
                    disabled={pwBusy || !curPw || newPw.length < 8 || !confirmPw}>
              {pwBusy ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>
        {pwMsg && (
          <p style={{ ...S.note, color: pwMsg.ok ? '#0B8A5C' : '#D63031' }}>{pwMsg.text}</p>
        )}
      </div>
    </div>
  );
}
