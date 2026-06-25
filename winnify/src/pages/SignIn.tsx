import { useState, type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECT, type UserRole } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, Building2, GraduationCap, Mic, Code2, ClipboardList, Rocket, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { GoogleIcon } from '@/components/common/SocialIcons';
import { authApi } from '@/api/auth';

type ForgotStep = 'email' | 'code' | 'reset' | 'done';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [forgotError, setForgotError] = useState('');

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

  const [resetting, setResetting] = useState(false);

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
  const PORTAL_ROLES: { role: UserRole; label: string; email: string; Icon: React.ElementType; bg: string }[] = [
    { role: 'superadmin', label: 'Super Admin', email: 'superadmin@winnify.ai', Icon: ShieldCheck, bg: '#E84393' },
    { role: 'admin',      label: 'College Admin', email: 'admin@vjit.ac.in',    Icon: Building2,   bg: '#00B894' },
    { role: 'faculty',    label: 'Faculty',        email: 'faculty@vjit.ac.in', Icon: GraduationCap, bg: '#F6A623' },
  ];

  const handlePortalLogin = async (role: UserRole, demoEmail: string) => {
    setError('');
    try {
      const resolvedRole = await signIn(demoEmail, 'demo123');
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

  /* ── shared input style ── */
  const inputWrap: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    height: 48, padding: '0 14px',
    borderRadius: 10, border: '1.5px solid #E6E5F0',
    background: '#F5F5F8', transition: 'border-color 120ms ease, box-shadow 120ms ease',
  };
  const inputEl: React.CSSProperties = {
    flex: 1, border: 'none', background: 'transparent',
    fontSize: 14, fontFamily: 'var(--font-sans)', color: '#1A1A22',
    outline: 'none',
  };
  const iconStyle: React.CSSProperties = { color: '#AAAAB5', flexShrink: 0 };

  const focusWrap = (e: React.FocusEvent<HTMLInputElement>) => {
    const wrap = e.currentTarget.closest('.input-wrap') as HTMLElement | null;
    if (wrap) { wrap.style.borderColor = '#6C5CE7'; wrap.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.12)'; wrap.style.background = '#fff'; }
  };
  const blurWrap = (e: React.FocusEvent<HTMLInputElement>) => {
    const wrap = e.currentTarget.closest('.input-wrap') as HTMLElement | null;
    if (wrap) { wrap.style.borderColor = '#E6E5F0'; wrap.style.boxShadow = 'none'; wrap.style.background = '#F5F5F8'; }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col" style={{ width: '50%', background: '#EFEEFC', padding: '48px 56px', position: 'relative', overflow: 'hidden' }}>
        {/* Top wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C5CE7' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#6C5CE7', letterSpacing: '0.12em', textTransform: 'uppercase' }}>WINNIFY</span>
        </div>

        {/* Center copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38, color: '#1A1A22', lineHeight: 1.15, margin: '0 0 14px' }}>
            Your placement journey,<br />
            <span style={{ color: '#6C5CE7' }}>all in one place.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(26,26,34,0.60)', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 380 }}>
            AI-powered tools for coding, communication, mock tests, drives and learning — built for VJIT College students.
          </p>
          {([
            { Icon: Mic,           label: 'WinSpeak',   sub: 'AI speech coaching & weekly challenges' },
            { Icon: Code2,         label: 'Code Arena',  sub: 'DSA problems with AI tutor' },
            { Icon: ClipboardList, label: 'Mock Tests',  sub: 'Aptitude, technical & company OAs' },
            { Icon: Rocket,        label: 'Drives',      sub: 'Live placement drives & apply tracker' },
          ] as const).map(({ Icon, label, sub }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '11px 14px', borderRadius: 14, marginBottom: 8,
              background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(108,92,231,0.12)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#6C5CE7" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1A1A22' }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(26,26,34,0.55)', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

{/* Bottom footer */}
        <div style={{ fontSize: 12, color: 'rgba(26,26,34,0.40)' }}>
          Powered by Winnify · campx.in
        </div>

        {/* Version badge */}
        <div style={{ position: 'absolute', bottom: 24, right: 56, fontSize: 11, color: 'rgba(26,26,34,0.30)', fontFamily: 'var(--font-mono)' }}>v1.0 · MVP</div>
      </div>

      {/* ── Forgot password overlay ── */}
      {forgotStep && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,26,34,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, padding: '32px 28px', boxShadow: '0 24px 64px rgba(26,26,34,0.18)' }}>

            {/* Step: email */}
            {forgotStep === 'email' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFEEFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={18} color="#6C5CE7" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#1A1A22' }}>Reset password</div>
                    <div style={{ fontSize: 13, color: '#AAAAB5' }}>Enter your registered email</div>
                  </div>
                </div>
                {forgotError && <div style={{ background: 'rgba(220,33,51,0.08)', color: '#DC2133', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{forgotError}</div>}
                <form onSubmit={handleForgotEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="input-wrap" style={inputWrap}>
                    <Mail size={15} style={iconStyle} />
                    <input type="email" placeholder="you@institution.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required style={inputEl} onFocus={focusWrap} onBlur={blurWrap} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={cancelForgot} style={{ flex: 1, height: 44, borderRadius: 10, background: '#F5F5F8', border: '1.5px solid #E6E5F0', color: '#4B4B57', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <ArrowLeft size={14} /> Cancel
                    </button>
                    <button type="submit" style={{ flex: 1, height: 44, borderRadius: 10, background: '#6C5CE7', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                      Send Code
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step: code */}
            {forgotStep === 'code' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFEEFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={18} color="#6C5CE7" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#1A1A22' }}>Enter your code</div>
                    <div style={{ fontSize: 13, color: '#AAAAB5' }}>Sent to {forgotEmail}</div>
                  </div>
                </div>
                <div style={{ background: '#EFEEFC', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#6C5CE7', fontWeight: 500, marginBottom: 16 }}>
                  Use the unique reset code provided by your institution.
                </div>
                {forgotError && <div style={{ background: 'rgba(220,33,51,0.08)', color: '#DC2133', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{forgotError}</div>}
                <form onSubmit={handleForgotCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    type="text" placeholder="Enter code" value={forgotCode}
                    onChange={e => setForgotCode(e.target.value)} maxLength={4} required
                    style={{ height: 52, borderRadius: 10, border: '1.5px solid #E6E5F0', background: '#F5F5F8', textAlign: 'center', fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.4em', color: '#1A1A22', outline: 'none', width: '100%' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#6C5CE7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E6E5F0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setForgotStep('email')} style={{ flex: 1, height: 44, borderRadius: 10, background: '#F5F5F8', border: '1.5px solid #E6E5F0', color: '#4B4B57', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button type="submit" style={{ flex: 1, height: 44, borderRadius: 10, background: '#6C5CE7', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                      Verify
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step: reset */}
            {forgotStep === 'reset' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFEEFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={18} color="#6C5CE7" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#1A1A22' }}>New password</div>
                    <div style={{ fontSize: 13, color: '#AAAAB5' }}>Choose a strong password</div>
                  </div>
                </div>
                {forgotError && <div style={{ background: 'rgba(220,33,51,0.08)', color: '#DC2133', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{forgotError}</div>}
                <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="input-wrap" style={inputWrap}>
                    <Lock size={15} style={iconStyle} />
                    <input type={showNewPw ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={inputEl} onFocus={focusWrap} onBlur={blurWrap} />
                    <button type="button" onClick={() => setShowNewPw(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAB5', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="input-wrap" style={inputWrap}>
                    <Lock size={15} style={iconStyle} />
                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputEl} onFocus={focusWrap} onBlur={blurWrap} />
                  </div>
                  <button type="submit" disabled={resetting} style={{ height: 44, borderRadius: 10, background: '#6C5CE7', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {resetting && <Loader2 size={15} className="animate-spin" />}
                    Set New Password
                  </button>
                </form>
              </>
            )}

            {/* Step: done */}
            {forgotStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <CheckCircle2 size={48} color="#00B894" style={{ marginBottom: 16 }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#1A1A22', marginBottom: 8 }}>Password updated!</div>
                <div style={{ fontSize: 14, color: '#6B6B7A', marginBottom: 24 }}>You can now sign in with your new password.</div>
                <button onClick={() => { cancelForgot(); setPassword(newPassword); }} style={{ height: 44, borderRadius: 10, background: '#6C5CE7', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%' }}>
                  Back to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '48px 32px', position: 'relative' }}>

        {/* Top-right domain pill */}
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 6, background: '#F5F5F8', border: '1px solid #E6E5F0', borderRadius: 48, padding: '5px 12px 5px 8px' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FBE7DA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🏛️</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#4B4B57' }}>student.vjit.winnify.in</span>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo + college */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, color: '#F6A623', letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 8 }}>
              WINNIFY
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 10, verticalAlign: 'middle' }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFEEFC', color: '#6C5CE7', border: '1.5px solid rgba(108,92,231,0.25)', borderRadius: 48, padding: '3px 10px', fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}>
                  ● Student Portal
                </span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#AAAAB5', margin: 0 }}>VJIT College</p>
          </div>

          {/* Portal Access */}
          <div style={{ background: 'rgba(108,92,231,0.06)', border: '1.5px solid rgba(108,92,231,0.18)', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
              Portal Access
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PORTAL_ROLES.map(({ role, label, email: demoEmail, Icon, bg }) => (
                <button key={role} onClick={() => handlePortalLogin(role, demoEmail)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #E6E5F0', cursor: 'pointer', transition: 'border-color 120ms ease, transform 120ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = bg; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E6E5F0'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#fff" />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A1A22' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#1A1A22', margin: '0 0 4px' }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#AAAAB5', margin: 0 }}>Sign in to continue.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(220,33,51,0.08)', color: '#DC2133', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A22', fontFamily: 'var(--font-sans)' }}>Email or Username</label>
              <div className="input-wrap" style={inputWrap}>
                <Mail size={15} style={iconStyle} />
                <input
                  type="email" placeholder="you@institution.edu"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" required
                  style={inputEl}
                  onFocus={focusWrap} onBlur={blurWrap}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A22', fontFamily: 'var(--font-sans)' }}>Password</label>
              <div className="input-wrap" style={inputWrap}>
                <Lock size={15} style={iconStyle} />
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required
                  style={inputEl}
                  onFocus={focusWrap} onBlur={blurWrap}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAB5', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={startForgot} style={{ fontSize: 13, color: '#6C5CE7', textDecoration: 'none', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Forgot password?</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              style={{ height: 48, borderRadius: 12, background: '#6C5CE7', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isLoading ? 0.75 : 1, transition: 'background 120ms ease', marginTop: 4 }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#5B4BDB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#6C5CE7'; }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#E6E5F0' }} />
              <span style={{ fontSize: 12, color: '#AAAAB5', whiteSpace: 'nowrap' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#E6E5F0' }} />
            </div>

            {/* Google */}
            <button
              type="button" onClick={handleGoogleLogin} disabled={googleLoading}
              style={{ height: 48, borderRadius: 12, background: '#fff', border: '1.5px solid #E6E5F0', color: '#1A1A22', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, cursor: googleLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: googleLoading ? 0.75 : 1, transition: 'border-color 120ms ease, background 120ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6C5CE7'; (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E6E5F0'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
              Continue with Google
            </button>
          </form>

          {/* Info notice */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#F5F5F8', borderRadius: 10, padding: '12px 14px', marginTop: 20 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E6E5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: '#6C5CE7', fontWeight: 700, marginTop: 1 }}>i</div>
            <p style={{ fontSize: 12.5, color: '#6B6B7A', margin: 0, lineHeight: 1.5 }}>
              Accounts are created by your institution. If you can't sign in, contact <span style={{ color: '#6C5CE7', fontWeight: 600, cursor: 'pointer' }}>support</span>.
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
            <span style={{ fontSize: 12, color: '#AAAAB5' }}>© 2026 Winnify · Campx Edutech</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="#" style={{ fontSize: 12, color: '#AAAAB5', textDecoration: 'none' }}>Privacy</Link>
              <Link to="#" style={{ fontSize: 12, color: '#AAAAB5', textDecoration: 'none' }}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
