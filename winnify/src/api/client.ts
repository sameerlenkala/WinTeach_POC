// When the app is opened from another device on the LAN (e.g. a phone),
// a localhost backend URL would point at that device — rewrite it to the
// host that is serving the frontend (the dev machine).
export const BACKEND_URL = (() => {
  const raw = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
  try {
    const u = new URL(raw);
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const pageRemote = !['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (local && pageRemote) u.hostname = window.location.hostname;
    return u.origin;
  } catch {
    return raw;
  }
})();

const BASE = BACKEND_URL;

function getToken(): string | null {
  return localStorage.getItem('winnify_token');
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// On a 401, try once to refresh the Supabase session before giving up — the
// proactive refresh timer doesn't fire while the laptop/tab was asleep, so
// the first request after waking can carry an expired token even though the
// refresh token is still perfectly valid.
let refreshing: Promise<string | null> | null = null;
async function tryRefreshToken(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.refreshSession();
      const fresh = data.session?.access_token ?? null;
      if (fresh) localStorage.setItem('winnify_token', fresh);
      return fresh;
    } catch {
      return null;
    } finally {
      setTimeout(() => { refreshing = null; }, 0);
    }
  })();
  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    const fresh = await tryRefreshToken();
    if (fresh && fresh !== token) {
      headers['Authorization'] = `Bearer ${fresh}`;
      res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers });
    }
  }

  if (res.status === 401) {
    localStorage.removeItem('winnify_token');
    // Studio sessions re-enter through the studio's own login, and carry the
    // interrupted location so sign-in returns the student to where they were.
    window.location.href = window.location.pathname.startsWith('/study')
      ? `/study/login?next=${encodeURIComponent(window.location.pathname)}`
      : '/signin';
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                      => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body?: unknown)      => request<T>(path, { method: 'POST',  body: body ? JSON.stringify(body) : undefined }),
  patch:  <T>(path: string, body?: unknown)      => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body?: unknown)      => request<T>(path, { method: 'PUT',   body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                      => request<T>(path, { method: 'DELETE' }),

  upload: async <T>(path: string, file: File, extraFields?: Record<string, string>): Promise<T> => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    if (extraFields) Object.entries(extraFields).forEach(([k, v]) => form.append(k, v));
    const res = await fetch(`${BASE}/api/v1${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, body.detail ?? 'Upload failed');
    }
    return res.json() as Promise<T>;
  },

  stream: (path: string): EventSource => {
    const token = getToken();
    const url = `${BASE}/api/v1${path}${token ? `?token=${token}` : ''}`;
    return new EventSource(url);
  },

  // Authenticated file download: fetches as a blob and triggers a browser
  // save, using the server's Content-Disposition filename when exposed.
  download: async (path: string, fallbackName: string): Promise<void> => {
    const token = getToken();
    const res = await fetch(`${BASE}/api/v1${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, body.detail ?? 'Download failed');
    }
    const blob = await res.blob();
    const name = res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] ?? fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  },
};
