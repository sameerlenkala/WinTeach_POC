// Student Course Login — standalone, mobile-only. Uses the shared backend
// auth (JWT in winnify_token) via useAuth, but with the studio's own visual
// language. Students land in /study (or ?next=<interrupted page>); other
// roles are routed to their console. Includes an inline forgot-password flow
// (code-verified, matching the main sign-in).
// Google OAuth is intentionally absent: it creates a Supabase session only,
// not the backend JWT the student APIs authenticate with.
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { useAuth, ROLE_REDIRECT } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import StudioFrame from './StudioFrame';

type View = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-reset' | 'forgot-done';

export function StField({ id, label, type = 'text', value, onChange, autoComplete, autoFocus, right, inputMode }: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; autoFocus?: boolean; right?: React.ReactNode; inputMode?: 'email' | 'text';
}) {
  return (
    <div className={`st-field ${value ? 'filled' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type={type} value={value} autoComplete={autoComplete} autoFocus={autoFocus}
        inputMode={inputMode} autoCapitalize="none" spellCheck={false} required
        onChange={e => onChange(e.target.value)}
        style={right ? { paddingRight: 56 } : undefined}
      />
      {right}
    </div>
  );
}

export function StEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="st-eye" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  );
}

export default function StudioLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);
  // Forgot-password state
  const [fCode, setFCode] = useState('');
  const [fNewPw, setFNewPw] = useState('');
  const [fBusy, setFBusy] = useState(false);

  // Where to land after sign-in: an interrupted studio location (?next=) or home.
  const rawNext = params.get('next');
  const next = rawNext && rawNext.startsWith('/study') ? rawNext : '/study';

  // Already signed in (e.g. hard reload) — straight to the studio.
  if (isAuthenticated && !isLoading && !busy) return <Navigate to={next} replace />;

  const fail = (msg: string) => { setError(msg); setShake(s => s + 1); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const role = await signIn(email.trim(), password);
      navigate(role === 'student' ? next : ROLE_REDIRECT[role], { replace: true });
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not sign you in.');
      setBusy(false);
    }
  };

  const submitForgotReset = async (e: FormEvent) => {
    e.preventDefault();
    if (fNewPw.length < 6) { fail('Password must be at least 6 characters.'); return; }
    setError('');
    setFBusy(true);
    try {
      await authApi.resetPassword(email.trim(), fNewPw);
      setPassword(fNewPw);
      setView('forgot-done');
    } catch {
      fail('Could not update the password. Try again.');
    } finally {
      setFBusy(false);
    }
  };

  const backToLogin = () => { setView('login'); setError(''); setFCode(''); setFNewPw(''); };

  return (
    <StudioFrame>
      <div
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 'calc(28px + env(safe-area-inset-top)) 24px 8px',
        }}
      >
        {/* Brand mark */}
        <div className="st-rise" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--st-lime), var(--st-aqua))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--st-ink-on-lime)',
              boxShadow: '0 8px 28px rgba(94,234,212,.28)',
            }}
          >
            <Sparkles size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ font: '700 16px var(--st-display)', letterSpacing: '-0.01em' }}>WinTeach</div>
            <div className="st-eyebrow" style={{ marginTop: 1 }}>Student · Course Login</div>
          </div>
        </div>

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <>
            <div className="st-rise st-d1" style={{ margin: '9vh 0 30px' }}>
              <h1 style={{ font: '700 40px/1.08 var(--st-display)', letterSpacing: '-0.03em', margin: 0, color: 'var(--st-text)' }}>
                Your courses,
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, var(--st-lime), var(--st-aqua), var(--st-violet))',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>
                  one studio.
                </span>
              </h1>
              <p style={{ margin: '14px 0 0', font: '500 15px/1.5 var(--st-sans)', color: 'var(--st-text-2)' }}>
                Sign in to keep learning where you left off.
              </p>
            </div>

            <form key={shake} onSubmit={submit} className={shake ? 'st-shake' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="st-rise st-d2" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <StField id="st-email" label="Email" type="email" inputMode="email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
                <StField
                  id="st-password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={setPassword} autoComplete="current-password"
                  right={<StEye show={showPw} onToggle={() => setShowPw(v => !v)} />}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-4px 4px 0' }}>
                <button
                  type="button"
                  onClick={() => { setView('forgot-email'); setError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: '600 13px var(--st-sans)', color: 'var(--st-text-2)' }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div role="alert" style={{ font: '600 13.5px var(--st-sans)', color: 'var(--st-red)', padding: '0 6px' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="st-cta st-rise st-d3" disabled={busy || !email || !password} style={{ marginTop: 2 }}>
                {busy ? <Loader2 size={20} className="st-spin" /> : (
                  <>
                    Enter the studio
                    <ArrowRight size={19} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <div className="st-rise st-d4" style={{ textAlign: 'center', marginTop: 22, font: '500 13.5px var(--st-sans)', color: 'var(--st-text-2)' }}>
              New here?{' '}
              <Link to={`/study/signup${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ''}`} style={{ color: 'var(--st-lime)', fontWeight: 700, textDecoration: 'none' }}>
                Create your account
              </Link>
            </div>
          </>
        )}

        {/* ── FORGOT: email ── */}
        {view === 'forgot-email' && (
          <ForgotShell title="Reset your password" sub="We'll verify it's you, then you set a new one." onBack={backToLogin} error={error}>
            <form onSubmit={e => { e.preventDefault(); if (email.trim()) { setError(''); setView('forgot-code'); } else fail('Enter your email first.'); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StField id="st-femail" label="Email" type="email" inputMode="email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
              <button type="submit" className="st-cta">Send reset code</button>
            </form>
          </ForgotShell>
        )}

        {/* ── FORGOT: code ── */}
        {view === 'forgot-code' && (
          <ForgotShell title="Enter your code" sub={`Use the reset code from your institution.`} onBack={() => setView('forgot-email')} error={error}>
            <form onSubmit={e => { e.preventDefault(); if (fCode === '0000') { setError(''); setView('forgot-reset'); } else fail('Invalid code. Try again.'); }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                value={fCode} onChange={e => setFCode(e.target.value)} maxLength={4} required autoFocus
                inputMode="numeric" placeholder="0000" aria-label="Reset code"
                style={{
                  minHeight: 64, borderRadius: 18, border: '1px solid var(--st-border-2)',
                  background: 'var(--st-glass)', textAlign: 'center', outline: 'none',
                  font: '700 30px var(--st-display)', letterSpacing: '0.4em',
                  color: 'var(--st-text)', width: '100%', caretColor: 'var(--st-lime)',
                }}
              />
              <button type="submit" className="st-cta"><KeyRound size={18} /> Verify code</button>
            </form>
          </ForgotShell>
        )}

        {/* ── FORGOT: new password ── */}
        {view === 'forgot-reset' && (
          <ForgotShell title="Set a new password" sub="At least 6 characters." onBack={() => setView('forgot-code')} error={error}>
            <form onSubmit={submitForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StField
                id="st-fnewpw" label="New password" type={showPw ? 'text' : 'password'} value={fNewPw}
                onChange={setFNewPw} autoComplete="new-password" autoFocus
                right={<StEye show={showPw} onToggle={() => setShowPw(v => !v)} />}
              />
              <button type="submit" className="st-cta" disabled={fBusy}>
                {fBusy ? <Loader2 size={20} className="st-spin" /> : 'Save new password'}
              </button>
            </form>
          </ForgotShell>
        )}

        {/* ── FORGOT: done ── */}
        {view === 'forgot-done' && (
          <div className="st-rise" style={{ margin: '10vh 0 0', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--st-lime), var(--st-aqua))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 40px rgba(205,244,99,.3)',
            }}>
              <Check size={32} color="var(--st-ink-on-lime)" strokeWidth={3} />
            </div>
            <div style={{ font: '700 24px var(--st-display)', letterSpacing: '-0.02em' }}>Password updated</div>
            <p style={{ font: '500 14px/1.6 var(--st-sans)', color: 'var(--st-text-2)', margin: '8px 0 24px' }}>
              You're all set — sign in with your new password.
            </p>
            <button className="st-cta" onClick={backToLogin}>Back to sign in</button>
          </div>
        )}

        {/* Footer */}
        <div
          className="st-rise st-d4"
          style={{
            marginTop: 'auto', paddingTop: 28, textAlign: 'center',
            font: '500 13px var(--st-sans)', color: 'var(--st-text-3)',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          }}
        >
          Faculty or admin?{' '}
          <a href="/signin" style={{ color: 'var(--st-text-2)', fontWeight: 700, textDecoration: 'none' }}>
            Use the main sign-in
          </a>
        </div>
      </div>
    </StudioFrame>
  );
}

function ForgotShell({ title, sub, onBack, error, children }: {
  title: string; sub: string; onBack: () => void; error: string; children: React.ReactNode;
}) {
  return (
    <div className="st-rise" style={{ margin: '7vh 0 0' }}>
      <button
        onClick={onBack} className="st-chip st-press" type="button"
        style={{ marginBottom: 22 }}
      >
        <ArrowLeft size={13} /> Back
      </button>
      <h1 style={{ font: '700 28px/1.15 var(--st-display)', letterSpacing: '-0.025em', margin: '0 0 6px', color: 'var(--st-text)' }}>{title}</h1>
      <p style={{ font: '500 14px/1.55 var(--st-sans)', color: 'var(--st-text-2)', margin: '0 0 22px' }}>{sub}</p>
      {error && (
        <div role="alert" style={{ font: '600 13.5px var(--st-sans)', color: 'var(--st-red)', margin: '0 0 12px' }}>{error}</div>
      )}
      {children}
    </div>
  );
}
