// Durable retry queue for student progress writes.
//
// Every progress/quiz/flashcard write used to be fire-and-forget
// (`.catch(() => {})`). On campus wifi that means a student finishes a lesson,
// the request fails, and their completion is gone with no sign anything went
// wrong. Failed writes are parked in localStorage and replayed on reconnect,
// on the next studio load, and periodically while the tab is open.
//
// Writes are idempotent server-side (progress upserts on a natural key and
// never downgrades; quiz attempts keep the best score), so replaying a write
// that actually succeeded is harmless.

const KEY = 'winnify_pending_events';
const MAX = 100;

export type PendingWrite = { path: string; body: unknown; at: number };

function read(): PendingWrite[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function write(rows: PendingWrite[]) {
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-MAX))); } catch { /* quota / private mode */ }
}

export function queueWrite(path: string, body: unknown) {
  write([...read(), { path, body, at: Date.now() }]);
}

export function pendingCount(): number {
  return read().length;
}

let flushing = false;

// Replay the queue oldest-first. Stops at the first failure and keeps the rest
// queued, so an outage doesn't burn through every entry retrying against a
// server that is still down.
export async function flushPending(post: (path: string, body: unknown) => Promise<unknown>): Promise<number> {
  if (flushing) return 0;
  const rows = read();
  if (!rows.length) return 0;
  flushing = true;
  let sent = 0;
  try {
    for (const row of rows) {
      try {
        await post(row.path, row.body);
        sent += 1;
      } catch {
        break;
      }
    }
    write(rows.slice(sent));
  } finally {
    flushing = false;
  }
  return sent;
}
