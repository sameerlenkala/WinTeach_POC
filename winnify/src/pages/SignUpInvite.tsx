import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import WinnifyLogo from '@/components/common/WinnifyLogo';
import { authApi } from '@/api/auth';

export default function SignUpInvite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Backend generates /signup?invite=<uuid-token>
  const token = params.get('invite') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)', padding: '24px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px -8px rgba(60,50,140,.16)' }}>
          <AlertCircle size={40} color="#C0392B" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No invite token</div>
          <div style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
            This page requires an invite link. Ask your admin for a new invite.
          </div>
          <Link to="/signin" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Go to Sign In</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px -8px rgba(60,50,140,.16)' }}>
          <CheckCircle2 size={48} color="#00B894" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Account created!</div>
          <div style={{ color: 'var(--text-2)', fontSize: 15 }}>Redirecting to sign in…</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await authApi.register(email.trim(), password, name.trim(), token);
      setDone(true);
      setTimeout(() => navigate('/signin'), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Could not create account. The invite may have expired.';
      setError(typeof msg === 'string' ? msg : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)', padding: '24px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 460, width: '100%', boxShadow: '0 8px 40px -8px rgba(60,50,140,.16)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <WinnifyLogo size="md" />
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 6 }}>
          You've been invited
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>
          Complete your account to get started on Winnify.
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Full name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Email address</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Confirm password</label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
          </div>

          {error && (
            <div style={{ background: '#FFE4E4', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#C0392B', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <Button type="submit" disabled={loading} style={{ marginTop: 4, height: 44, fontSize: 15, fontWeight: 600 }}>
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Creating account…</> : 'Create account'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
