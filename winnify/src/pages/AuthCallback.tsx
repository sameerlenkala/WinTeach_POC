import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase exchanges the code in the URL for a session automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? '/home' : '/signin', { replace: true });
    });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--app-bg)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ textAlign: 'center', gap: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid var(--brand)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Signing you in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
