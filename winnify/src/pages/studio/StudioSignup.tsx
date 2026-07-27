// Student Course Signup — self-serve student account creation for the studio.
// Org-code gated (same open-signup endpoint the main app uses), role locked
// to student. Registration signs the account in server-side, so success goes
// straight into the studio (honoring ?next=).
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth, ROLE_REDIRECT } from '@/contexts/AuthContext';
import StudioFrame from './StudioFrame';
import { StField, StEye } from './StudioLogin';

export default function StudioSignup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signUp, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  const rawNext = params.get('next');
  const next = rawNext && rawNext.startsWith('/study') ? rawNext : '/study';

  // Already signed in — no reason to create an account.
  if (isAuthenticated && !isLoading && !busy) return <Navigate to={next} replace />;

  const fail = (msg: string) => { setError(msg); setShake(s => s + 1); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 6) { fail('Password must be at least 6 characters.'); return; }
    if (!orgCode.trim()) { fail('Enter your organization code.'); return; }
    setError('');
    setBusy(true);
    try {
      const role = await signUp(name.trim(), email.trim(), password, { role: 'student', orgCode: orgCode.trim() });
      navigate(role === 'student' ? next : ROLE_REDIRECT[role], { replace: true });
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not create your account.');
      setBusy(false);
    }
  };

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
            <div className="st-eyebrow" style={{ marginTop: 1 }}>Student · Course Signup</div>
          </div>
        </div>

        {/* Headline */}
        <div className="st-rise st-d1" style={{ margin: '5vh 0 26px' }}>
          <h1 style={{ font: '700 34px/1.12 var(--st-display)', letterSpacing: '-0.03em', margin: 0, color: 'var(--st-text)' }}>
            Start learning
            <br />
            <span style={{
              background: 'linear-gradient(90deg, var(--st-lime), var(--st-aqua), var(--st-violet))',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              in minutes.
            </span>
          </h1>
          <p style={{ margin: '12px 0 0', font: '500 14.5px/1.55 var(--st-sans)', color: 'var(--st-text-2)' }}>
            Create your student account with the organization code from your institution.
          </p>
        </div>

        {/* Form */}
        <form key={shake} onSubmit={submit} className={shake ? 'st-shake' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="st-rise st-d2" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <StField id="su-name" label="Full name" value={name} onChange={setName} autoComplete="name" autoFocus />
            <StField id="su-email" label="Email" type="email" inputMode="email" value={email} onChange={setEmail} autoComplete="email" />
            <StField
              id="su-password" label="Password (6+ characters)" type={showPw ? 'text' : 'password'} value={password}
              onChange={setPassword} autoComplete="new-password"
              right={<StEye show={showPw} onToggle={() => setShowPw(v => !v)} />}
            />
            <div className={`st-field ${orgCode ? 'filled' : ''}`}>
              <label htmlFor="su-org">Organization code</label>
              <input
                id="su-org" type="text" value={orgCode} required spellCheck={false} autoCapitalize="characters"
                onChange={e => setOrgCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
              />
            </div>
            <div style={{ font: '500 12px var(--st-sans)', color: 'var(--st-text-3)', margin: '-6px 6px 0' }}>
              Provided by your faculty or institution.
            </div>
          </div>

          {error && (
            <div role="alert" style={{ font: '600 13.5px var(--st-sans)', color: 'var(--st-red)', padding: '0 6px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="st-cta st-rise st-d3" disabled={busy || !name || !email || !password || !orgCode} style={{ marginTop: 2 }}>
            {busy ? <Loader2 size={20} className="st-spin" /> : (
              <>
                Create account
                <ArrowRight size={19} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="st-rise st-d4" style={{ textAlign: 'center', marginTop: 18, font: '500 13.5px var(--st-sans)', color: 'var(--st-text-2)' }}>
          Already have an account?{' '}
          <Link to={`/study/login${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ''}`} style={{ color: 'var(--st-lime-text)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

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
