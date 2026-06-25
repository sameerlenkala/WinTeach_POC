import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, UserPlus, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import type { UserRole } from '@/api/types';

const T = { brand: '#6C5CE7', card: '#fff', border: '#E6E5F0', text: '#1A1A22', text2: 'rgba(26,26,34,0.60)', fontD: 'var(--font-display)', r5: 20, shadow: '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)' };

function RolePill({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    faculty: { bg: 'rgba(246,166,35,0.12)', color: '#D4850A' },
    student: { bg: 'rgba(0,184,148,0.12)', color: '#00B894' },
  };
  const s = map[role] || { bg: '#F5F5F8', color: T.text2 };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 48, fontSize: 12, fontWeight: 600, ...s }}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid ' + T.border, background: '#F8F7FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      {copied ? <Check size={13} color="#00B894" /> : <Copy size={13} color={T.text2} />}
    </button>
  );
}

function genPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface CreatedUser { email: string; password: string; role: string; full_name: string }

export default function CollegeAdminUsers() {
  const { user } = useAuth();

  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [role, setRole]           = useState<UserRole>('faculty');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [sending, setSending]     = useState(false);
  const [banner, setBanner]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [created, setCreated]     = useState<CreatedUser[]>([]);

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setBanner({ type: 'err', msg: 'Full name, email and password are required.' });
      return;
    }
    setSending(true);
    setBanner(null);
    try {
      await api.post('/auth/create-user', {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        institute_id: (user as any)?.institute_id ?? undefined,
      });
      setCreated(prev => [...prev, { email: email.trim(), password, role, full_name: fullName.trim() }]);
      setBanner({ type: 'ok', msg: 'User ' + email + ' created successfully.' });
      setFullName(''); setEmail(''); setPassword('');
    } catch (e: any) {
      setBanner({ type: 'err', msg: e?.message ?? 'Failed to create user.' });
    } finally {
      setSending(false);
    }
  };

  const inp: React.CSSProperties = { height: 42, borderRadius: 10, border: '1.5px solid ' + T.border, background: '#F5F5F8', padding: '0 14px', fontSize: 14, outline: 'none', color: T.text, width: '100%', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 5 };

  return (
    <div style={{ padding: '0 36px 40px' }}>
      <div style={{ height: 8 }} />
      <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 28, marginBottom: 24 }}>Users</div>

      <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: T.r5, padding: 28, marginBottom: 24, boxShadow: T.shadow }}>
        <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 17, marginBottom: 18 }}>Create user</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Priya Sharma" style={inp} />
          </div>
          <div>
            <label style={lbl}>Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="faculty@college.edu" style={inp} />
          </div>
          <div>
            <label style={lbl}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} style={inp}>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Password</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                style={{ ...inp, paddingRight: 42 }}
              />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.text2 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={() => { const p = genPassword(); setPassword(p); setShowPw(true); }}
              style={{ height: 42, padding: '0 16px', borderRadius: 10, border: '1.5px solid ' + T.border, background: '#F8F7FF', color: T.text2, fontFamily: T.fontD, fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <RefreshCw size={13} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
              Generate
            </button>
            {password && <CopyBtn text={password} />}
          </div>
        </div>

        {banner && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: banner.type === 'ok' ? 'rgba(0,184,148,0.10)' : 'rgba(220,38,38,0.08)', color: banner.type === 'ok' ? '#00B894' : '#DC2626', fontSize: 13 }}>
            {banner.msg}
          </div>
        )}

        <button onClick={handleCreate} disabled={sending}
          style={{ height: 42, padding: '0 24px', borderRadius: 10, background: T.brand, color: '#fff', border: 'none', fontFamily: T.fontD, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
          <UserPlus size={16} /> {sending ? 'Creating...' : 'Create user'}
        </button>
      </div>

      {created.length > 0 && (
        <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: T.r5, padding: '8px 12px', boxShadow: T.shadow }}>
          <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 14, color: T.text2, padding: '14px 8px 10px' }}>Created this session</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Name', 'Email', 'Role', 'Password'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(26,26,34,0.45)', padding: '0 16px 10px', borderBottom: '1px solid ' + T.border }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {created.map((u, i) => (
                <tr key={u.email}>
                  <td style={{ padding: 14, borderBottom: i < created.length - 1 ? '1px solid ' + T.border : 'none', fontFamily: T.fontD, fontWeight: 600, fontSize: 14 }}>{u.full_name}</td>
                  <td style={{ padding: 14, borderBottom: i < created.length - 1 ? '1px solid ' + T.border : 'none', fontSize: 13, color: T.text2 }}>{u.email}</td>
                  <td style={{ padding: 14, borderBottom: i < created.length - 1 ? '1px solid ' + T.border : 'none' }}><RolePill role={u.role} /></td>
                  <td style={{ padding: 14, borderBottom: i < created.length - 1 ? '1px solid ' + T.border : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{ fontSize: 12, background: '#F5F5F8', padding: '3px 8px', borderRadius: 6 }}>{u.password}</code>
                      <CopyBtn text={u.password} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
