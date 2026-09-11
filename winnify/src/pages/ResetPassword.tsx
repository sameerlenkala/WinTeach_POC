// Forgot-password landing — the emailed link opens /reset-password?token=…
// (plus &app=study when the request came from the mobile studio). Consumes
// the token via /auth/password-reset/confirm and sends the user back to the
// sign-in they came from. Standalone, winnify.ai-themed like /signin.
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { WfHero } from './SignIn';
import logo from '@/assets/winnify-logo.png';
import './auth/auth.css';

const MIN_LEN = 8;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const fromStudio = params.get('app') === 'study';
  const signInPath = fromStudio ? '/study/login' : '/signin';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [linkDead, setLinkDead] = useState(!token);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_LEN) { setError(`Password must be at least ${MIN_LEN} characters.`); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await authApi.confirmPasswordReset(token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 422)) {
        // 400: bad / expired / already-used token, or an account that can't be
        // reset here. 422: Supabase's password policy (character classes,
        // leaked-password check). The backend's message says which.
        setError(err.message);
        if (/invalid or has expired/i.test(err.message)) setLinkDead(true);
      } else {
        setError("Couldn't update your password right now. Please try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wf-auth">
      <WfHero />
      <div className="wf-panel">
        <div className="wf-card wf-rise">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
            <img src={logo} alt="Winnify" style={{ height: 34, width: 'auto' }} />
          </div>

          {done ? (
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <div style={{
                width: 62, height: 62, borderRadius: '50%', margin: '0 auto 14px',
                background: 'rgba(61,220,132,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={30} color="#0d8a4b" />
              </div>
              <h1 className="wf-h1" style={{ fontSize: 24 }}>Password updated</h1>
              <p className="wf-sub">You can now sign in with your new password.</p>
              <Link to={signInPath} className="wf-cta" style={{ textDecoration: 'none' }}>
                Go to sign in <ArrowRight size={17} />
              </Link>
            </div>
          ) : linkDead ? (
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <div style={{
                width: 62, height: 62, borderRadius: '50%', margin: '0 auto 14px',
                background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldAlert size={30} color="#c62828" />
              </div>
              <h1 className="wf-h1" style={{ fontSize: 24 }}>This link has expired</h1>
              <p className="wf-sub">
                Reset links are single-use and last 60 minutes. Request a new one from the sign-in page.
              </p>
              <Link to={fromStudio ? '/study/login' : '/signin?forgot=1'} className="wf-cta" style={{ textDecoration: 'none' }}>
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="wf-h1">Choose a new password</h1>
              <p className="wf-sub">At least {MIN_LEN} characters — mix upper and lower case letters, a number and a symbol.</p>

              {error && <div className="wf-error" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="wf-label" htmlFor="rp-password">New password</label>
                  <div className="wf-field">
                    <Lock size={16} />
                    <input id="rp-password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password" minLength={MIN_LEN} required autoFocus />
                    <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wf-faint)', display: 'flex', padding: 0 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="wf-label" htmlFor="rp-confirm">Confirm password</label>
                  <div className="wf-field">
                    <Lock size={16} />
                    <input id="rp-confirm" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      autoComplete="new-password" minLength={MIN_LEN} required />
                  </div>
                </div>
                <button type="submit" disabled={busy} className="wf-cta" style={{ marginTop: 4 }}>
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <>Set new password <ArrowRight size={17} /></>}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 18, font: '400 13.5px var(--wf-body)', color: 'var(--wf-muted)' }}>
                Remembered it? <Link to={signInPath} className="wf-link" style={{ fontSize: 13.5 }}>Back to sign in</Link>
              </div>
            </>
          )}
        </div>

        <div className="wf-rise" style={{ width: '100%', maxWidth: 430, marginTop: 16, font: '400 12px var(--wf-body)', color: 'var(--wf-faint)' }}>
          © 2026 Winnify · winnify.ai
        </div>
      </div>
    </div>
  );
}
