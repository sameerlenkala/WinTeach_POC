import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
type Role = 'hod' | 'faculty' | 'winteach';

const ROLES: { id: Role; label: string; sub: string; initials: string; email: string; dest: string }[] = [
  { id: 'winteach', label: 'WinTeach Console', sub: 'Content author · AI generation',   initials: 'WT', email: 'content@winnify.in',  dest: '/winteach' },
  { id: 'hod',      label: 'Head of Department', sub: 'Approvals · Analytics · Faculty', initials: 'HD', email: 'hod@vjit.ac.in',      dest: '/academic/hod' },
  { id: 'faculty',  label: 'Faculty',             sub: 'Courses · Lectures · Attendance', initials: 'FC', email: 'faculty@vjit.ac.in',  dest: '/academic/faculty' },
];

/* ── token shortcuts matching winteach_3.html :root ── */
const T = {
  brand:      '#5B4BDB',
  brandBright:'#6C5CE7',
  wordmark:   '#F6A623',
  bg:         '#EFEEFC',
  card:       '#FFFFFF',
  surface:    '#F1F2F7',
  border:     '#E6E5F0',
  borderStr:  '#D8D7E6',
  text:       '#1A1A22',
  text2:      'rgba(26,26,34,.66)',
  text3:      'rgba(26,26,34,.45)',
  pillBg:     '#E5E2FB',
  green:      '#3DA35D',
  greenBg:    '#E5F4E9',
  shadow:     '0 1px 2px rgba(20,20,50,.04),0 8px 24px -12px rgba(60,50,140,.12)',
  shadowPop:  '0 12px 32px -8px rgba(60,50,140,.22)',
  fontD:      "'Fredoka',system-ui,sans-serif",
  fontS:      "'DM Sans',system-ui,sans-serif",
  r4:         '12px',
  r5:         '20px',
  r6:         '48px',
};

export default function AcademicLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [role,    setRole]    = useState<Role>('winteach');
  const [email,   setEmail]   = useState('content@winnify.in');
  const [password,setPassword]= useState('demo123');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const active = ROLES.find(r => r.id === role)!;

  const handleRoleSwitch = (r: typeof ROLES[0]) => {
    setRole(r.id);
    setEmail(r.email);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate(active.dest);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, fontFamily: T.fontS, padding: '24px',
    }}>
      <div style={{
        display: 'flex', width: '100%', maxWidth: 920, borderRadius: T.r5,
        boxShadow: T.shadowPop, overflow: 'hidden', background: T.card,
        minHeight: 560,
      }}>

        {/* ── Left brand panel ── */}
        <div style={{
          flex: '0 0 300px', background: `linear-gradient(160deg,#6E5EE6 0%,${T.brand} 100%)`,
          padding: '36px 28px', display: 'flex', flexDirection: 'column', color: '#fff',
        }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 26, color: T.wordmark, letterSpacing: '.2px' }}>
              Winnify
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 1 }}>
              Academic Console
            </div>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
              Sign in as
            </div>
            {ROLES.map(r => {
              const isActive = role === r.id;
              return (
                <button key={r.id} onClick={() => handleRoleSwitch(r)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: T.r4, border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,.18)' : 'transparent',
                  boxShadow: isActive ? '0 0 0 1.5px rgba(255,255,255,.35)' : 'none',
                  transition: 'background .12s',
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.fontD, fontWeight: 600, fontSize: 13, color: '#fff',
                  }}>{r.initials}</div>
                  <div>
                    <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{r.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 32 }}>
            Powered by Winnify · campx.in
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{ flex: 1, padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: T.pillBg, borderRadius: T.r6, padding: '4px 14px',
              fontFamily: T.fontD, fontWeight: 500, fontSize: 13, color: T.brand, marginBottom: 14,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.brandBright }} />
              {active.label}
            </div>
            <h1 style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 26, color: T.text, lineHeight: 1.15, marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: T.text2 }}>Sign in to your {active.label} account</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(220,33,51,.08)', border: '1px solid rgba(220,33,51,.2)',
              borderRadius: T.r4, padding: '10px 14px', fontSize: 13,
              color: '#DC2133', marginBottom: 18,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 13, color: T.text, display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                style={{
                  width: '100%', height: 46, padding: '0 14px',
                  background: T.surface, border: '1px solid transparent',
                  borderRadius: T.r4, fontFamily: T.fontS, fontSize: 14,
                  color: T.text, outline: 'none', transition: 'border .12s, background .12s',
                }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = T.brandBright; }}
                onBlur={e => { e.target.style.background = T.surface; e.target.style.borderColor = 'transparent'; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 13, color: T.text }}>Password</label>
                <button type="button" style={{ fontSize: 12.5, color: T.brandBright, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.fontS }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 46, padding: '0 44px 0 14px',
                    background: T.surface, border: '1px solid transparent',
                    borderRadius: T.r4, fontFamily: T.fontS, fontSize: 14,
                    color: T.text, outline: 'none', transition: 'border .12s, background .12s',
                  }}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = T.brandBright; }}
                  onBlur={e => { e.target.style.background = T.surface; e.target.style.borderColor = 'transparent'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: T.text3,
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{
              height: 46, borderRadius: T.r4, background: T.brandBright, color: '#fff',
              border: 'none', fontFamily: T.fontD, fontWeight: 500, fontSize: 15,
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.75 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .12s', marginTop: 4,
            }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#5f50d8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = T.brandBright; }}
            >
              {isLoading ? <><Loader2 size={16} style={{ animation: 'spin .8s linear infinite' }} /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials notice */}
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: T.pillBg, borderRadius: T.r4,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontFamily: T.fontD, fontWeight: 600, fontSize: 12.5, color: T.brand }}>Demo credentials pre-filled</div>
            <div style={{ fontSize: 12, color: T.text2 }}>
              Switch role on the left to auto-fill the matching account.
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 28, fontSize: 13, color: T.text3 }}>
            Student?{' '}
            <a href="/signin" style={{ color: T.brandBright, textDecoration: 'none', fontWeight: 500 }}>
              Go to student login →
            </a>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
