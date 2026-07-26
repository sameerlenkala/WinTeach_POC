// Student Course Login — standalone, mobile-only. Uses the shared backend
// auth (JWT in winnify_token) via useAuth, but with the studio's own visual
// language. Students land in /study (or ?next=<interrupted page>); other
// roles are routed to their console. Includes an inline forgot-password flow
// (code-verified, matching the main sign-in).
// Google OAuth is intentionally absent: it creates a Supabase session only,
// not the backend JWT the student APIs authenticate with.
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { useAuth, ROLE_REDIRECT } from '@/contexts/AuthContext';
import StudioFrame from './StudioFrame';

type View = 'login' | 'forgot-email';

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

  const backToLogin = () => { setView('login'); setError(''); };

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

        {/* ── FORGOT ──
            Self-serve reset needs Supabase email recovery plus a route that
            consumes the recovery session; neither exists yet, and the backend's
            /auth/reset-password is demo-gated (404s in any real deployment).
            Rather than walk a student through screens that end in a failure,
            point them at the person who can actually reset it. */}
        {view === 'forgot-email' && (
          <ForgotShell
            title="Reset your password"
            sub="Password resets are handled by your institution."
            onBack={backToLogin}
            error={error}
          >
            <div className="st-card" style={{ padding: '18px 18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <KeyRound size={16} color="var(--st-aqua)" />
                <span className="st-eyebrow">What to do</span>
              </div>
              <p style={{ font: '500 14px/1.65 var(--st-sans)', color: 'var(--st-text-2)', margin: 0 }}>
                Message your training &amp; placement office or course faculty with the email you
                sign in with. They can issue you a new password right away.
              </p>
            </div>
            <button className="st-cta" onClick={backToLogin} style={{ marginTop: 16 }}>
              Back to sign in
            </button>
          </ForgotShell>
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
