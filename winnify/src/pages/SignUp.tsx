import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import WinnifyLogo from '@/components/common/WinnifyLogo';
import { GoogleIcon, GitHubIcon } from '@/components/common/SocialIcons';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    try { await signUp(name, email, password); navigate('/home'); }
    catch { setError('Something went wrong. Please try again.'); }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');
    try {
      const mockName = provider === 'google' ? 'Student' : 'Student';
      const mockEmail = provider === 'google' ? 'student@gmail.com' : 'student@github.com';
      await signUp(mockName, mockEmail, 'social-auth');
      navigate('/home');
    } catch {
      setError(`Failed to sign up with ${provider}. Please try again.`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--app-bg)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-[420px] shrink-0 p-12 text-white"
        style={{ background: 'linear-gradient(160deg, var(--sidebar) 0%, var(--sidebar-active) 100%)' }}
      >
        <div className="mb-8">
          <div
            className="text-4xl font-bold tracking-wide mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--wordmark)' }}
          >
            Winnify
          </div>
          <p className="text-sm opacity-70 leading-relaxed">Join thousands of students who got placed</p>
        </div>
        <div className="space-y-4 w-full">
          {['90-day structured roadmap', 'Real company OA practice', 'AI communication coaching', 'Campus drive notifications'].map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm opacity-80">
              <div className="h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo + Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-5">
              <WinnifyLogo size="lg" />
            </Link>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
              Create your account
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start your placement journey</p>
          </div>

          {/* Social buttons */}
          <div className="space-y-2.5 mb-6">
            {[
              { provider: 'google' as const, Icon: GoogleIcon, label: 'Continue with Google' },
              { provider: 'github' as const, Icon: GitHubIcon, label: 'Continue with GitHub' },
            ].map(({ provider, Icon, label }) => (
              <button
                key={provider}
                onClick={() => handleSocialSignUp(provider)}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
              >
                {socialLoading === provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-[18px] w-[18px]" />}
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--app-bg)', color: 'var(--text-subtle)' }}>
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="rounded-lg text-sm px-4 py-2.5 font-medium"
                style={{ background: 'rgba(220,33,51,0.10)', color: '#DC2133' }}
                role="alert"
              >
                {error}
              </div>
            )}

            {[
              { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', value: name, onChange: setName, autoComplete: 'name' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', value: email, onChange: setEmail, autoComplete: 'email' },
              { id: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters', value: password, onChange: setPassword, autoComplete: 'new-password' },
              { id: 'confirm-password', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password', value: confirmPassword, onChange: setConfirmPassword, autoComplete: 'new-password' },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label htmlFor={field.id} className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{field.label}</label>
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  autoComplete={field.autoComplete}
                  required
                />
              </div>
            ))}

            <Button type="submit" className="w-full h-11" loading={isLoading}>
              Create Account
            </Button>

            <p className="text-[11px] text-center leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
              By signing up, you agree to our{' '}
              <Link to="#" className="hover:underline" style={{ color: 'var(--brand)' }}>Terms</Link> and{' '}
              <Link to="#" className="hover:underline" style={{ color: 'var(--brand)' }}>Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
