import { useState, type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECT, type UserRole } from '@/contexts/AuthContext';
import {
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, Building2, GraduationCap,
  Mic, Code2, ClipboardList, Rocket, ArrowLeft, KeyRound, CheckCircle2,
} from 'lucide-react';
import { GoogleIcon } from '@/components/common/SocialIcons';
import { authApi } from '@/api/auth';

type ForgotStep = 'email' | 'code' | 'reset' | 'done';

/* Demo accounts seed themselves server-side with this password on first login. */
const DEMO_PASSWORD = 'demo@123';

const rise = (i: number): React.CSSProperties => ({ animationDelay: `${i * 80}ms` });

/* ── small shared pieces ─────────────────────────────────────────────────── */

function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" style={{
      background: 'var(--tint-red-bg)', color: 'var(--tint-red-fg)',
      border: '1px solid color-mix(in oklab, var(--tint-red-fg) 25%, transparent)',
      borderRadius: 'var(--w-r4)', padding: '10px 14px',
      fontSize: 'var(--fs-small)', fontFamily: 'var(--font-sans)', marginBottom: 14,
    }}>{children}</div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 'var(--fs-small)', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
      {children}
    </label>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, isLoading } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  // Create-account state (open signup: faculty/student, org-code gated)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [suRole, setSuRole] = useState<'faculty' | 'student' | null>(null);
  const [orgCode, setOrgCode] = useState('');

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetting, setResetting] = useState(false);

  const startForgot = () => { setForgotStep('email'); setForgotEmail(email); setForgotError(''); };
  const cancelForgot = () => { setForgotStep(null); setForgotCode(''); setNewPassword(''); setConfirmPassword(''); setForgotError(''); };

  const handleForgotEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotError('Enter your email.'); return; }
    setForgotError('');
    setForgotStep('code');
  };

  const handleForgotCode = (e: FormEvent) => {
    e.preventDefault();
    if (forgotCode !== '0000') { setForgotError('Invalid code. Please try again.'); return; }
    setForgotError('');
    setForgotStep('reset');
  };

  const handleForgotReset = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setForgotError('Passwords do not match.'); return; }
    setForgotError('');
    setResetting(true);
    try {
      await authApi.resetPassword(forgotEmail, newPassword);
      setForgotStep('done');
    } catch {
      setForgotError('Failed to update password. Please try again.');
    } finally {
      setResetting(false);
    }
  }, [newPassword, confirmPassword, forgotEmail]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setError('');
    try { await signInWithGoogle(); }
    catch { setError('Failed to sign in with Google.'); setGoogleLoading(false); }
  };

  // Quick-login buttons for non-student roles
  const PORTAL_ROLES: { role: UserRole; label: string; email: string; Icon: React.ElementType; tone: string }[] = [
    { role: 'superadmin', label: 'Super Admin',   email: 'superadmin@winnify.ai', Icon: ShieldCheck,   tone: 'pink' },
    { role: 'admin',      label: 'College Admin', email: 'admin@ciet.ac.in',      Icon: Building2,     tone: 'teal' },
    { role: 'faculty',    label: 'Faculty',       email: 'faculty@ciet.ac.in',    Icon: GraduationCap, tone: 'orange' },
  ];

  const handlePortalLogin = async (role: UserRole, demoEmail: string) => {
    setError('');
    try {
      const resolvedRole = await signIn(demoEmail, DEMO_PASSWORD);
      navigate(ROLE_REDIRECT[resolvedRole] ?? ROLE_REDIRECT[role]);
    } catch {
      setError(`Failed to sign in as ${role}.`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    try {
      const role = await signIn(email, password);
      navigate(ROLE_REDIRECT[role] ?? '/home');
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (!suRole) { setError('Choose whether you are joining as Faculty or Student.'); return; }
    if (!orgCode.trim()) { setError('Enter your organization code.'); return; }
    try {
      const role = await signUp(fullName, email, password, { role: suRole, orgCode: orgCode.trim() });
      navigate(ROLE_REDIRECT[role] ?? '/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account. Please try again.');
    }
  };

  const switchMode = (m: 'signin' | 'signup') => { setMode(m); setError(''); };

  const modalHeader = (Icon: React.ElementType, title: string, sub: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 42, height: 42, borderRadius: 'var(--w-r4)', background: 'var(--tint-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="var(--tint-brand-fg)" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h3)', color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 'var(--fs-small)', color: 'var(--text-2)', fontFamily: 'var(--font-sans)' }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)', background: 'var(--card)' }}>

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col" style={{
        width: '46%', background: 'var(--app-bg-grad)', padding: '48px 56px',
        position: 'relative', overflow: 'hidden', color: '#fff',
      }}>
        {/* decorative rings */}
        <div aria-hidden style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.10)', top: -160, right: -120 }} />
        <div aria-hidden style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', bottom: -90, left: -60 }} />

        {/* wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#F6A623', letterSpacing: '0.02em' }}>Winnify</span>
          <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)', borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: 10 }}>
            Student Portal
          </span>
        </div>

        {/* center copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40, position: 'relative' }}>
          <h1 className="ds-rise" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(30px, 3vw, 38px)', color: '#fff', lineHeight: 1.15, margin: '0 0 14px', ...rise(0) }}>
            Your placement journey,<br />all in one place.
          </h1>
          <p className="ds-rise" style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 380, ...rise(1) }}>
            AI-powered tools for coding, communication, mock tests, drives and learning — built for CIET College students.
          </p>
          {([
            { Icon: Mic,           label: 'WinSpeak',   sub: 'AI speech coaching & weekly challenges' },
            { Icon: Code2,         label: 'Code Arena', sub: 'DSA problems with AI tutor' },
            { Icon: ClipboardList, label: 'Mock Tests', sub: 'Aptitude, technical & company OAs' },
            { Icon: Rocket,        label: 'Drives',     sub: 'Live placement drives & apply tracker' },
          ] as const).map(({ Icon, label, sub }, i) => (
            <div key={label} className="ds-rise" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '11px 14px', borderRadius: 'var(--w-r4)', marginBottom: 8,
              background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
              ...rise(i + 2),
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--w-r3)', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body)', color: '#fff' }}>{label}</div>
                <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>
          Powered by Winnify · campx.in
        </div>
      </div>

      {/* ── Forgot password overlay ── */}
      {forgotStep && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,32,48,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="ds-pop" style={{ background: 'var(--card)', borderRadius: 'var(--w-r5)', width: '100%', maxWidth: 400, padding: '32px 28px', boxShadow: 'var(--shadow-pop)', border: '1px solid var(--border)' }}>

            {forgotStep === 'email' && (
              <>
                {modalHeader(Mail, 'Reset password', 'Enter your registered email')}
                {forgotError && <ErrorAlert>{forgotError}</ErrorAlert>}
                <form onSubmit={handleForgotEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="w-field">
                    <Mail size={15} />
                    <input type="email" placeholder="you@institution.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={cancelForgot} className="w-btn-ghost" style={{ flex: 1, height: 44 }}>
                      <ArrowLeft size={14} /> Cancel
                    </button>
                    <button type="submit" className="w-btn-primary" style={{ flex: 1, height: 44 }}>
                      Send Code
                    </button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 'code' && (
              <>
                {modalHeader(KeyRound, 'Enter your code', `Sent to ${forgotEmail}`)}
                <div style={{ background: 'var(--tint-brand-bg)', borderRadius: 'var(--w-r4)', padding: '10px 14px', fontSize: 'var(--fs-small)', color: 'var(--tint-brand-fg)', fontWeight: 500, marginBottom: 16 }}>
                  Use the unique reset code provided by your institution.
                </div>
                {forgotError && <ErrorAlert>{forgotError}</ErrorAlert>}
                <form onSubmit={handleForgotCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    type="text" placeholder="0000" value={forgotCode}
                    onChange={e => setForgotCode(e.target.value)} maxLength={4} required
                    style={{
                      height: 56, borderRadius: 'var(--w-r4)', border: '1.5px solid var(--border)',
                      background: 'var(--input-bg)', textAlign: 'center', fontSize: 28,
                      fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.4em',
                      color: 'var(--text)', width: '100%', fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setForgotStep('email')} className="w-btn-ghost" style={{ flex: 1, height: 44 }}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button type="submit" className="w-btn-primary" style={{ flex: 1, height: 44 }}>
                      Verify
                    </button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 'reset' && (
              <>
                {modalHeader(Lock, 'New password', 'Choose a strong password')}
                {forgotError && <ErrorAlert>{forgotError}</ErrorAlert>}
                <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="w-field">
                    <Lock size={15} />
                    <input type={showNewPw ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowNewPw(p => !p)} aria-label={showNewPw ? 'Hide password' : 'Show password'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="w-field">
                    <Lock size={15} />
                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={resetting} className="w-btn-primary" style={{ height: 44 }}>
                    {resetting && <Loader2 size={15} className="animate-spin" />}
                    Set New Password
                  </button>
                </form>
              </>
            )}

            {forgotStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div className="ds-pop" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--tint-teal-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} color="var(--tint-teal-fg)" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h2)', color: 'var(--text)', marginBottom: 8 }}>Password updated!</div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', marginBottom: 24 }}>You can now sign in with your new password.</div>
                <button onClick={() => { cancelForgot(); setPassword(newPassword); }} className="w-btn-primary" style={{ width: '100%', height: 44 }}>
                  Back to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', position: 'relative' }}>

        <div style={{ width: '100%', maxWidth: 384 }}>

          {/* heading */}
          <div className="ds-rise" style={{ marginBottom: 24, ...rise(0) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: '#F6A623', lineHeight: 1 }}>Winnify</span>
              <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, background: 'var(--tint-brand-bg)', color: 'var(--tint-brand-fg)', borderRadius: 999, padding: '4px 10px', letterSpacing: '0.04em' }}>
                CIET College
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h1)', color: 'var(--text)', margin: '0 0 4px', lineHeight: 'var(--lh-h1)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-2)', margin: 0 }}>
              {mode === 'signin' ? 'Sign in to continue your placement prep.' : 'Join with your organization code as faculty or student.'}
            </p>
          </div>

          {error && <ErrorAlert>{error}</ErrorAlert>}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="ds-rise" style={{ display: 'flex', flexDirection: 'column', gap: 16, ...rise(1) }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>I am joining as</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { value: 'faculty' as const, label: 'Faculty', Icon: GraduationCap, tone: 'orange' },
                    { value: 'student' as const, label: 'Student', Icon: Rocket, tone: 'teal' },
                  ]).map(({ value, label, Icon, tone }) => (
                    <button key={value} type="button" onClick={() => setSuRole(value)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                      borderRadius: 'var(--w-r4)', cursor: 'pointer',
                      background: suRole === value ? `var(--tint-${tone}-bg)` : 'var(--card)',
                      border: suRole === value ? `1.5px solid var(--tint-${tone}-fg)` : '1.5px solid var(--border)',
                    }}>
                      <Icon size={16} color={`var(--tint-${tone}-fg)`} />
                      <span style={{ fontSize: 'var(--fs-small)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)' }}>Admin accounts are created by invitation only.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>Full name</FieldLabel>
                <div className="w-field">
                  <GraduationCap size={15} />
                  <input type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>Email</FieldLabel>
                <div className="w-field">
                  <Mail size={15} />
                  <input type="email" placeholder="you@institution.edu" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>Password</FieldLabel>
                <div className="w-field">
                  <Lock size={15} />
                  <input type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
                  <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>Organization code</FieldLabel>
                <div className="w-field">
                  <KeyRound size={15} />
                  <input type="text" placeholder="e.g. MAVIGUN" value={orgCode} onChange={e => setOrgCode(e.target.value.toUpperCase())} required
                    style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                </div>
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)' }}>Provided by your institution.</span>
              </div>

              <button type="submit" disabled={isLoading} className="w-btn-primary" style={{ marginTop: 4 }}>
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Create account
              </button>

              <div style={{ textAlign: 'center', fontSize: 'var(--fs-small)', color: 'var(--text-2)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tint-brand-fg)', fontWeight: 600, padding: 0, fontSize: 'var(--fs-small)', fontFamily: 'var(--font-sans)' }}>
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* form */}
          {mode === 'signin' && (
          <form onSubmit={handleSubmit} className="ds-rise" style={{ display: 'flex', flexDirection: 'column', gap: 16, ...rise(1) }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <FieldLabel>Email or Username</FieldLabel>
              <div className="w-field">
                <Mail size={15} />
                <input
                  type="email" placeholder="you@institution.edu"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FieldLabel>Password</FieldLabel>
                <button type="button" onClick={startForgot} style={{ fontSize: 'var(--fs-small)', color: 'var(--tint-brand-fg)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}>
                  Forgot password?
                </button>
              </div>
              <div className="w-field">
                <Lock size={15} />
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required
                />
                <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-btn-primary" style={{ marginTop: 4 }}>
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="w-btn-ghost">
              {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', fontSize: 'var(--fs-small)', color: 'var(--text-2)' }}>
              New here?{' '}
              <button type="button" onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tint-brand-fg)', fontWeight: 600, padding: 0, fontSize: 'var(--fs-small)', fontFamily: 'var(--font-sans)' }}>
                Create an account
              </button>
            </div>
          </form>
          )}

          {/* portal access */}
          {mode === 'signin' && (
          <div className="ds-rise" style={{ marginTop: 24, ...rise(2) }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-caption)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
              Staff portal access
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PORTAL_ROLES.map(({ role, label, email: demoEmail, Icon, tone }) => (
                <button key={role} onClick={() => handlePortalLogin(role, demoEmail)} className="lift" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '12px 8px', borderRadius: 'var(--w-r4)',
                  background: 'var(--card)', border: '1.5px solid var(--border)', cursor: 'pointer',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--w-r3)', background: `var(--tint-${tone}-bg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={`var(--tint-${tone}-fg)`} />
                  </div>
                  <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)' }}>© 2026 Winnify · Campx Edutech</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="#" style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', textDecoration: 'none' }}>Privacy</Link>
              <Link to="#" style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-3)', textDecoration: 'none' }}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
