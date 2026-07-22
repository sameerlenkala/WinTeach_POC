import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

import { BACKEND_URL } from '@/api/client';

const BACKEND = BACKEND_URL;

export type UserRole = 'student' | 'superadmin' | 'admin' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institute_id?: string | null;
  avatar?: string;
}

export const ROLE_REDIRECT: Record<UserRole, string> = {
  student:    '/home',
  superadmin: '/superadmin',
  admin:      '/admin',
  faculty:    '/winteach',
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signUp: (name: string, email: string, password: string,
           opts?: { role?: 'faculty' | 'student'; orgCode?: string; inviteToken?: string }) => Promise<UserRole>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Merge fields into the cached user (after a profile edit). */
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



async function callBackend(path: string, body: object, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BACKEND}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Hydrate synchronously so a hard reload on a protected route doesn't
  // bounce to /signin before the stored session is read.
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('winnify_user') ?? 'null'); }
    catch { return null; }
  });
  const [isLoading, setLoading] = useState(true);

  // Hydrate on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        // Keep the API token in step with the supabase-js session — this is
        // what the backend actually validates.
        localStorage.setItem('winnify_token', session.access_token);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      // TOKEN_REFRESHED fires here every ~hour: without this sync the stored
      // token expired while supabase-js silently held a fresh one, and every
      // request 401'd into a forced logout.
      if (session?.access_token) localStorage.setItem('winnify_token', session.access_token);
      if (!session && !localStorage.getItem('winnify_user')) setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const persistUser = (u: User) => {
    localStorage.setItem('winnify_user', JSON.stringify(u));
    setUser(u);
  };

  const signIn = useCallback(async (email: string, password: string): Promise<UserRole> => {
    setLoading(true);
    try {
      const data = await callBackend('/api/v1/auth/login', { email, password });
      persistUser({
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        institute_id: data.user.institute_id,
        avatar: data.user.avatar_url,
      });
      localStorage.setItem('winnify_token', data.access_token);
      // Hand the session to supabase-js so it persists it and auto-refreshes
      // the hourly-expiring access token (synced back via onAuthStateChange).
      // Backend-signed demo JWTs carry no refresh token — skip for those.
      if (data.refresh_token) {
        supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        }).catch(() => { /* session still works until the token expires */ });
      }
      return data.user.role as UserRole;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (
    name: string, email: string, password: string,
    opts?: { role?: 'faculty' | 'student'; orgCode?: string; inviteToken?: string },
  ): Promise<UserRole> => {
    setLoading(true);
    try {
      const data = await callBackend('/api/v1/auth/register', {
        full_name: name, email, password,
        invite_token: opts?.inviteToken, role: opts?.role, org_code: opts?.orgCode,
      });
      // Register signs the user in server-side — persist session like signIn.
      persistUser({
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        institute_id: data.user.institute_id,
        avatar: data.user.avatar_url,
      });
      localStorage.setItem('winnify_token', data.access_token);
      if (data.refresh_token) {
        supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        }).catch(() => { /* session still works until the token expires */ });
      }
      return (data.user.role ?? data.role) as UserRole;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('winnify_user');
    localStorage.removeItem('winnify_token');
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem('winnify_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session,
      isAuthenticated: !!user || !!session,
      isLoading, signIn, signUp, signInWithGoogle, signOut, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
