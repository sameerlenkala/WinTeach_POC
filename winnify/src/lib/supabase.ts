import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const noop = () => Promise.resolve({ data: { session: null, user: null, subscription: { unsubscribe: () => {} } }, error: null });

// Stub client used when Supabase env vars aren't configured
const stubClient = {
  auth: {
    getSession:          () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange:   (_e: unknown, _cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword:  noop,
    signUp:              noop,
    signInWithOAuth:     noop,
    signOut:             noop,
  },
};

export const supabase = url && key ? createClient(url, key) : (stubClient as unknown as ReturnType<typeof createClient>);
