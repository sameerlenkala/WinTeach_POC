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
//
// Each entry is stamped with the user it belongs to: campus machines are
// shared, and a write queued by one student must never replay under the next
// account's token — the server records progress for whoever the token says is
// calling.

const KEY = 'winnify_pending_events';
const MAX = 100;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // entries older than this are stale, not pending

export type PendingWrite = { path: string; body: unknown; at: number; uid?: string };

// The signed-in user's id, from the same record AuthContext maintains.
function currentUid(): string | null {
  try {
    const raw = localStorage.getItem('winnify_user');
    const id = raw ? JSON.parse(raw)?.id : null;
    return typeof id === 'string' && id ? id : null;
  } catch { return null; }
}

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
  const uid = currentUid();
  if (!uid) return; // no session to attribute the write to — nothing safe to replay
  write([...read(), { path, body, at: Date.now(), uid }]);
}

export function pendingCount(): number {
  return read().length;
}

// True for failures that will never succeed on replay (validation/refusal).
// 401 is NOT permanent: the session lapsed, but the write itself is fine and
// will succeed once the owner signs back in. 408 (timeout) and 429 (throttle)
// are transient despite being 4xx.
function isPermanent(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return typeof status === 'number' && status >= 400 && status < 500
    && status !== 401 && status !== 408 && status !== 429;
}

let flushing = false;

// Replay the queue oldest-first, only for the account that queued each write.
// Permanently-rejected and stale entries are dropped so they can't jam the
// queue; another account's entries are held untouched for their owner's next
// session; a transient failure stops the run and keeps the rest — an outage
// shouldn't burn through every entry against a server that is down.
export async function flushPending(post: (path: string, body: unknown) => Promise<unknown>): Promise<number> {
  if (flushing) return 0;
  const rows = read();
  if (!rows.length) return 0;
  const uid = currentUid();
  if (!uid) return 0; // signed out — keep the queue for the owner's next session
  flushing = true;
  let sent = 0;
  const keep: PendingWrite[] = [];
  let halted = false;
  try {
    for (const row of rows) {
      if (halted) { keep.push(row); continue; }
      if (Date.now() - row.at > MAX_AGE_MS) continue;      // stale — drop
      if (!row.uid) continue;                              // unattributable (pre-uid queue) — drop
      if (row.uid !== uid) { keep.push(row); continue; }   // another account's write — hold for its owner
      try {
        await post(row.path, row.body);
        sent += 1;
      } catch (err) {
        if (!isPermanent(err)) { keep.push(row); halted = true; } // transient: retry later, keep order
        // permanent: drop and move on
      }
    }
    write(keep);
  } finally {
    flushing = false;
  }
  return sent;
}
