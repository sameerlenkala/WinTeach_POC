import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'hod' | 'faculty' | 'winteach';

const ROLES: { id: Role; label: string; sub: string; Icon: React.ElementType; email: string; dest: string }[] = [
  { id: 'winteach', Icon: Sparkles,      label: 'WinTeach Console',   sub: 'Content author · AI generation',   email: 'content@winnify.in', dest: '/winteach' },
  { id: 'hod',      Icon: Users,         label: 'Head of Department', sub: 'Approvals · Analytics · Faculty',  email: 'hod@vjit.ac.in',     dest: '/academic/hod' },
  { id: 'faculty',  Icon: GraduationCap, label: 'Faculty',            sub: 'Courses · Lectures · Attendance',  email: 'faculty@vjit.ac.in', dest: '/academic/faculty' },
];

/* Demo accounts seed themselves server-side with this password on first login. */
const DEMO_PASSWORD = 'demo@123';

const rise = (i: number): React.CSSProperties => ({ animationDelay: `${i * 80}ms` });

export default function AcademicLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [role,      setRole]      = useState<Role>('winteach');
  const [email,     setEmail]     = useState('content@winnify.in');
  const [password,  setPassword]  = useState(DEMO_PASSWORD);
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
      background: 'var(--app-bg)', fontFamily: 'var(--font-sans)', padding: 24,
    }}>
      <div className="ds-rise" style={{
        display: 'flex', width: '100%', maxWidth: 920, borderRadius: 'var(--w-r5)',
        boxShadow: 'var(--shadow-pop)', overflow: 'hidden', background: 'var(--card)',
        border: '1px solid var(--border)', minHeight: 560,
      }}>

        {/* ── Left brand panel ── */}
        <div className="hidden md:flex" style={{
          flex: '0 0 320px', background: 'var(--app-bg-grad)',
          padding: '36px 28px', flexDirection: 'column', color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative rings */}
          <div aria-hidden style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.12)', top: -110, right: -90 }} />
          <div aria-hidden style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', bottom: -60, left: -50 }} />

          {/* wordmark */}
          <div style={{ marginBottom: 32, position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: '#F6A623', letterSpacing: '0.02em' }}>
              Winnify
            </div>
            <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
              Academic Console
            </div>
          </div>

          {/* role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, position: 'relative' }} role="tablist" aria-label="Sign in as">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-caption)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
              Sign in as
            </div>
            {ROLES.map((r, i) => {
              const isActive = role === r.id;
              return (
                <button key={r.id} onClick={() => handleRoleSwitch(r)} role="tab" aria-selected={isActive}
                  className="ds-rise"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, minHeight: 60,
                    padding: '12px 14px', borderRadius: 'var(--w-r4)', border: 'none', cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                    boxShadow: isActive ? 'inset 0 0 0 1.5px rgba(255,255,255,0.40)' : 'none',
                    transition: 'background var(--dur-fast) var(--ease-out)',
                    textAlign: 'left', ...rise(i + 1),
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--w-r3)', flexShrink: 0,
                    background: isActive ? '#fff' : 'rgba(255,255,255,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background var(--dur-fast) var(--ease-out)',
                  }}>
                    <r.Icon size={17} color={isActive ? '#5b4bff' : '#fff'} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: '#fff', lineHeight: 1.2 }}>{r.label}</div>
                    <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.62)', marginTop: 2 }}>{r.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.45)', marginTop: 32, position: 'relative' }}>
            Powered by Winnify · campx.in
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{ flex: 1, padding: 'clamp(28px, 5vw, 44px) clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--tint-brand-bg)', borderRadius: 999, padding: '4px 14px',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-small)',
              color: 'var(--tint-brand-fg)', marginBottom: 14,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-2)' }} />
              {active.label}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text)', lineHeight: 'var(--lh-h1)', margin: '0 0 6px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', margin: 0 }}>Sign in to your {active.label} account</p>
          </div>

          {error && (
            <div role="alert" style={{
              background: 'var(--tint-red-bg)', color: 'var(--tint-red-fg)',
              border: '1px solid color-mix(in oklab, var(--tint-red-fg) 25%, transparent)',
              borderRadius: 'var(--w-r4)', padding: '10px 14px',
              fontSize: 'var(--fs-small)', marginBottom: 18,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--text)' }}>
                Email address
              </label>
              <div className="w-field">
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--text)' }}>Password</label>
                <button type="button" style={{ fontSize: 'var(--fs-small)', color: 'var(--tint-brand-fg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div className="w-field">
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* submit */}
            <button type="submit" disabled={isLoading} className="w-btn-primary" style={{ marginTop: 4 }}>
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          {/* demo notice */}
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'var(--tint-brand-bg)', borderRadius: 'var(--w-r4)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--tint-brand-fg)' }}>Demo credentials pre-filled</div>
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)' }}>
              Switch role on the left to auto-fill the matching account.
            </div>
          </div>

          {/* back link */}
          <div style={{ marginTop: 28, fontSize: 'var(--fs-small)', color: 'var(--text-3)' }}>
            Student?{' '}
            <a href="/signin" style={{ color: 'var(--tint-brand-fg)', textDecoration: 'none', fontWeight: 500 }}>
              Go to student login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
