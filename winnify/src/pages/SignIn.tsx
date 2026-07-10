// Sign in — the single entry point for every role, themed to winnify.ai
// (violet/lavender, Fredoka + Inter, pill CTAs). Standalone page: no app
// navbar/footer. Students land on /home (placement portal); the Student —
// Course login card hands off to the mobile studio (/study/login); staff
// roles route to their consoles. Account creation lives at /signup.
import { useState, type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECT, type UserRole } from '@/contexts/AuthContext';
import {
  ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff,
  GraduationCap, KeyRound, Loader2, Lock, Mail, Rocket, ShieldCheck, Sparkles,
} from 'lucide-react';
import { GoogleIcon } from '@/components/common/SocialIcons';
import { authApi } from '@/api/auth';
import './auth/auth.css';

type ForgotStep = 'email' | 'code' | 'reset' | 'done';

/* Demo accounts seed themselves server-side with this password on first login. */
const DEMO_PASSWORD = 'demo@123';

export function WfHero() {
  return (
    <aside className="wf-hero">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <span className="wf-mark">W</span>
        <span className="wf-wordmark">Winnify</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div className="wf-hero-tagline">The Career Intelligence Layer for Talent</div>
        <h2>Where talent gets its bridge to opportunity.</h2>
        <p>From awareness to readiness to placement — AI-powered courses, communication coaching and mock tests, in one campus platform.</p>
        <div style={{ marginTop: 26 }}>
          {([
            { t: 'WinTeach Courses', s: 'AI lessons, quizzes & revision for every subject' },
            { t: 'WinSpeak', s: 'AI speech coaching — the skill employers rank first' },
            { t: 'Mock Tests & Drives', s: 'Company OAs, aptitude practice and live drives' },
          ] as const).map(({ t, s }) => (
            <div key={t} className="wf-hero-item">
              <span className="ic"><Sparkles size={16} /></span>
              <div><b>{t}</b><span>{s}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', font: '400 12px Inter, sans-serif', color: 'rgba(255,255,255,.45)' }}>
        © 2026 Winnify · winnify.ai
      </div>
    </aside>
  );
}

/* Personas: who is signing in. Chosen alongside credentials — the account's
   actual role must match, so nobody drops into the wrong console. */
const PERSONAS: { role: UserRole; label: string; Icon: React.ElementType; sub: string }[] = [
  { role: 'student', label: 'Student', Icon: Rocket, sub: 'placement prep' },
  { role: 'faculty', label: 'Faculty', Icon: GraduationCap, sub: 'WinTeach console' },
  { role: 'admin', label: 'College Admin', Icon: Building2, sub: 'college console' },
  { role: 'superadmin', label: 'Super Admin', Icon: ShieldCheck, sub: 'platform console' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Student', faculty: 'Faculty', admin: 'College Admin', superadmin: 'Super Admin',
};

/* Demo account per persona — filled only on explicit request, never automatically. */
const DEMO_EMAIL: Record<UserRole, string> = {
  student: 'student@gmail.com',
  faculty: 'faculty@ciet.ac.in',
  admin: 'admin@ciet.ac.in',
  superadmin: 'superadmin@winnify.ai',
};

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signOut, isLoading } = useAuth();
  const [persona, setPersona] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password
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

  const switchPersona = (role: UserRole) => {
    setPersona(role);
    setError('');
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL[persona]);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    try {
      const role = await signIn(email, password);
      // The chosen persona is part of the login: a mismatch never silently
      // drops the user into a different console.
      if (role !== persona) {
        await signOut();
        setError(`These credentials belong to a ${ROLE_LABEL[role]} account — select the ${ROLE_LABEL[role]} persona above to sign in.`);
        return;
      }
      navigate(ROLE_REDIRECT[role] ?? '/home');
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="wf-auth">
      <WfHero />

      {/* Forgot password modal */}
      {forgotStep && (
        <div className="wf-overlay">
          <div className="wf-modal wf-rise">
            {forgotStep === 'email' && (
              <>
                <h2 className="wf-h1" style={{ fontSize: 22 }}>Reset password</h2>
                <p className="wf-sub">Enter your registered email.</p>
                {forgotError && <div className="wf-error" role="alert">{forgotError}</div>}
                <form onSubmit={handleForgotEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="wf-field">
                    <Mail size={16} />
                    <input type="email" placeholder="you@institution.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={cancelForgot} className="wf-ghost" style={{ flex: 1 }}>
                      <ArrowLeft size={15} /> Cancel
                    </button>
                    <button type="submit" className="wf-cta" style={{ flex: 1 }}>Send code</button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 'code' && (
              <>
                <h2 className="wf-h1" style={{ fontSize: 22 }}>Enter your code</h2>
                <p className="wf-sub">Use the unique reset code provided by your institution.</p>
                {forgotError && <div className="wf-error" role="alert">{forgotError}</div>}
                <form onSubmit={handleForgotCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    className="wf-code-input" type="text" inputMode="numeric" placeholder="0000"
                    value={forgotCode} onChange={e => setForgotCode(e.target.value)} maxLength={4} required autoFocus
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setForgotStep('email')} className="wf-ghost" style={{ flex: 1 }}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button type="submit" className="wf-cta" style={{ flex: 1 }}><KeyRound size={16} /> Verify</button>
                  </div>
                </form>
              </>
            )}

            {forgotStep === 'reset' && (
              <>
                <h2 className="wf-h1" style={{ fontSize: 22 }}>New password</h2>
                <p className="wf-sub">At least 6 characters.</p>
                {forgotError && <div className="wf-error" role="alert">{forgotError}</div>}
                <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="wf-field">
                    <Lock size={16} />
                    <input type={showNewPw ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus />
                    <button type="button" onClick={() => setShowNewPw(p => !p)} aria-label={showNewPw ? 'Hide password' : 'Show password'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wf-faint)', display: 'flex', padding: 0 }}>
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="wf-field">
                    <Lock size={16} />
                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={resetting} className="wf-cta">
                    {resetting && <Loader2 size={16} className="animate-spin" />}
                    Set new password
                  </button>
                </form>
              </>
            )}

            {forgotStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{
                  width: 62, height: 62, borderRadius: '50%', margin: '0 auto 14px',
                  background: 'rgba(61,220,132,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={30} color="#0d8a4b" />
                </div>
                <h2 className="wf-h1" style={{ fontSize: 22 }}>Password updated!</h2>
                <p className="wf-sub">You can now sign in with your new password.</p>
                <button onClick={() => { cancelForgot(); setPassword(newPassword); }} className="wf-cta">
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="wf-panel">
        <div className="wf-card wf-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
            <span className="wf-mark" style={{ width: 38, height: 38, borderRadius: 12, fontSize: 19 }}>W</span>
            <span className="wf-wordmark" style={{ fontSize: 21 }}>Winnify</span>
          </div>

          <h1 className="wf-h1">Welcome back</h1>
          <p className="wf-sub">
            {persona === 'student'
              ? 'Sign in to continue your placement prep.'
              : `Sign in to your ${ROLE_LABEL[persona]} console.`}
          </p>

          {/* Persona — part of the login, alongside credentials */}
          <div className="wf-label" style={{ marginBottom: 8 }}>Sign in as</div>
          <div className="wf-personas" role="radiogroup" aria-label="Sign in as">
            {PERSONAS.map(({ role, label, Icon }) => (
              <button key={role} type="button" className="wf-persona" aria-pressed={persona === role}
                onClick={() => switchPersona(role)}>
                <span className="ic"><Icon size={14} /></span>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="wf-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="wf-label" htmlFor="wf-email">Email</label>
              <div className="wf-field">
                <Mail size={16} />
                <input id="wf-email" type="email" placeholder="you@institution.edu" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus required />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <label className="wf-label" htmlFor="wf-password">Password</label>
                <button type="button" onClick={startForgot} className="wf-link">Forgot password?</button>
              </div>
              <div className="wf-field">
                <Lock size={16} />
                <input id="wf-password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wf-faint)', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="wf-cta" style={{ marginTop: 4 }}>
              {isLoading ? <Loader2 size={17} className="animate-spin" /> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          {/* Quiet demo affordance — nothing is ever pre-filled */}
          <div className="wf-demo-hint">
            Exploring the {ROLE_LABEL[persona]} demo?
            <button type="button" className="wf-link" style={{ fontSize: 12 }} onClick={fillDemo}>
              Fill demo credentials
            </button>
          </div>

          {persona === 'student' && (
            <>
              <div className="wf-divider"><span>or</span></div>

              <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="wf-ghost">
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon className="h-[17px] w-[17px]" />}
                Continue with Google
              </button>

              {/* Student — Course login: the mobile learning studio has its own sign-in */}
              <button type="button" className="wf-course-card" onClick={() => navigate('/study/login')}>
                <span className="ic"><Sparkles size={18} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>Student — Course login</b>
                  <span>Course lessons, quizzes & revision in the mobile studio</span>
                </span>
                <ArrowRight size={16} color="rgba(255,255,255,.6)" style={{ flexShrink: 0 }} />
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 18, font: '400 13.5px var(--wf-body)', color: 'var(--wf-muted)' }}>
            New here? <Link to="/signup" className="wf-link" style={{ fontSize: 13.5 }}>Create your account</Link>
          </div>
        </div>

        <div className="wf-rise" style={{ width: '100%', maxWidth: 430, marginTop: 16, display: 'flex', justifyContent: 'space-between', font: '400 12px var(--wf-body)', color: 'var(--wf-faint)' }}>
          <span>© 2026 Winnify · winnify.ai</span>
          <span style={{ display: 'flex', gap: 14 }}>
            <Link to="#" className="wf-link" style={{ color: 'var(--wf-faint)', fontSize: 12 }}>Privacy</Link>
            <Link to="#" className="wf-link" style={{ color: 'var(--wf-faint)', fontSize: 12 }}>Terms</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
