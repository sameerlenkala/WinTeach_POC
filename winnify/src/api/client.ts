const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem('winnify_token');
    window.location.href = '/signin';
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
};
