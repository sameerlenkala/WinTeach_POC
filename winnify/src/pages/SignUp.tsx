// Create account — the single self-serve signup for faculty and students,
// themed to winnify.ai. Org-code gated (backend register_open); registration
// signs in server-side and routes by role. Admin accounts are invite-only
// (/signup/invite). Replaces the old mock-social signup page.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECT } from '@/contexts/AuthContext';
import {
  ArrowRight, Eye, EyeOff, GraduationCap, KeyRound, Loader2, Lock, Mail, Rocket, User,
} from 'lucide-react';
import { WfHero } from './SignIn';
import './auth/auth.css';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<'faculty' | 'student' | null>(null);
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (!role) { setError('Choose whether you are joining as Faculty or Student.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!orgCode.trim()) { setError('Enter your organization code.'); return; }
    try {
      const resolved = await signUp(fullName, email, password, { role, orgCode: orgCode.trim() });
      navigate(ROLE_REDIRECT[resolved] ?? '/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account. Please try again.');
    }
  };

  return (
    <div className="wf-auth">
      <WfHero />

      <div className="wf-panel">
        <div className="wf-card wf-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
            <span className="wf-mark" style={{ width: 38, height: 38, borderRadius: 12, fontSize: 19 }}>W</span>
            <span className="wf-wordmark" style={{ fontSize: 21 }}>Winnify</span>
          </div>

          <h1 className="wf-h1">Create your account</h1>
          <p className="wf-sub">Join with the organization code from your institution.</p>

          {error && <div className="wf-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="wf-label">I am joining as</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {([
                  { value: 'faculty' as const, label: 'Faculty', Icon: GraduationCap },
                  { value: 'student' as const, label: 'Student', Icon: Rocket },
                ]).map(({ value, label, Icon }) => (
                  <button key={value} type="button" className="wf-role" aria-pressed={role === value} onClick={() => setRole(value)}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
              <div style={{ font: '400 11.5px var(--wf-body)', color: 'var(--wf-faint)', marginTop: 6 }}>
                Admin accounts are created by invitation only.
              </div>
            </div>

            <div>
              <label className="wf-label" htmlFor="wf-su-name">Full name</label>
              <div className="wf-field">
                <User size={16} />
                <input id="wf-su-name" type="text" placeholder="Your full name" value={fullName}
                  onChange={e => setFullName(e.target.value)} autoComplete="name" required />
              </div>
            </div>

            <div>
              <label className="wf-label" htmlFor="wf-su-email">Email</label>
              <div className="wf-field">
                <Mail size={16} />
                <input id="wf-su-email" type="email" placeholder="you@institution.edu" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div>
              <label className="wf-label" htmlFor="wf-su-password">Password</label>
              <div className="wf-field">
                <Lock size={16} />
                <input id="wf-su-password" type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wf-faint)', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="wf-label" htmlFor="wf-su-org">Organization code</label>
              <div className="wf-field">
                <KeyRound size={16} />
                <input id="wf-su-org" type="text" placeholder="Ask your admin" value={orgCode}
                  onChange={e => setOrgCode(e.target.value.toUpperCase())} required
                  style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }} />
              </div>
              <div style={{ font: '400 11.5px var(--wf-body)', color: 'var(--wf-faint)', marginTop: 6 }}>
                Provided by your institution.
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="wf-cta" style={{ marginTop: 4 }}>
              {isLoading ? <Loader2 size={17} className="animate-spin" /> : <>Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, font: '400 13.5px var(--wf-body)', color: 'var(--wf-muted)' }}>
            Already have an account? <Link to="/signin" className="wf-link" style={{ fontSize: 13.5 }}>Sign in</Link>
          </div>
        </div>

        <div className="wf-rise" style={{ width: '100%', maxWidth: 430, marginTop: 16, textAlign: 'center', font: '400 12px var(--wf-body)', color: 'var(--wf-faint)' }}>
          Student joining for courses only? <Link to="/study/signup" className="wf-link" style={{ fontSize: 12 }}>Use the Course signup</Link>
        </div>
      </div>
    </div>
  );
}
