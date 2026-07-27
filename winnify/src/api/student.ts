// Student delivery: published-content browsing + reading/quiz progress.
import { api } from './client';
import { flushPending, queueWrite } from './pendingWrites';

export interface StudentCourse {
  id: string;
  name: string;
  code?: string;
  semester?: string;
  status?: string;
  unit_count: number;
  topic_count: number;
  published_lessons: number;
}

export interface StudentTopic {
  id: string;
  title: string;
  bloom_level?: string;
  published_lessons: number;
  published_slides: number;
  published_quizzes: number;
  first_concept_id: string | null;
  // Summed time budget of the published lessons; null on plans generated
  // before time budgets existed, so callers must hide the estimate.
  est_minutes?: number | null;
}

export interface StudentProgressRow {
  topic_id: string; concept_id: string; artifact_type: string;
  status: string; quiz_score?: number; quiz_total?: number;
  scroll_pct?: number; dwell_sec?: number;
}

export interface StudentCourseDetail {
  id: string;
  name: string;
  code?: string;
  semester?: string;
  units: { id: string; unit_number?: number; title?: string; topics: StudentTopic[] }[];
  progress: StudentProgressRow[];
}

export interface StudentSubtopic {
  concept_id: string;
  title: string;
  // false → still on the roadmap but not faculty-approved; render locked.
  published: boolean;
  has_notes: boolean;
  has_slides: boolean;
  has_quiz: boolean;
  est_minutes?: number | null;
}

export interface StudentTopicDetail {
  course_id: string;
  course_name: string;
  code?: string;
  topic_id: string;
  title: string;
  bloom_level?: string;
  subtopics: StudentSubtopic[];
  first_concept_id: string | null;
  est_minutes?: number | null;
  // This student's rows for this topic — served here so the lesson list can
  // show read state without a second request to the course endpoint.
  progress: StudentProgressRow[];
  // Which topic-level artifacts are published (ready) for this topic.
  artifacts: { summary: boolean; assignment: boolean; flashcards: boolean };
}

export interface StudentTopicArtifact {
  kind: 'summary' | 'assignment' | 'flashcards';
  content: any;
  topic_title: string;
  code?: string;
}

export interface LearnHome {
  resume: {
    course_id: string; course_name: string; topic_id: string;
    topic_title: string; concept_id: string; scroll_pct: number;
  } | null;
  due_cards: number;
  // The single course the Revision chip opens, and its due count — so the
  // number shown always matches the deck the tap lands on.
  revision: { course_id: string; due_cards: number } | null;
  week: { lessons_completed: number; active_days: number; streak_days: number };
  courses: {
    id: string; name: string; code?: string; semester?: string;
    published_lessons: number; read_lessons: number; mastery_pct: number;
    due_cards: number;
  }[];
}

export interface RevisionPayload {
  course_id: string; name: string;
  due_cards: { card_key: string; front: string; back: string;
    concept_id: string; topic_id: string; topic_title: string; bucket: number }[];
  formulas: { topic_title: string; formula: string }[];
  pyq: Record<'easy' | 'medium' | 'hard',
    { topic_title: string; question: string; answer: string; bloom_level?: string }[]>;
  weak_topics: { id: string; title: string; published_lessons: number; read: number; mastery_pct: number }[];
}

export interface MasteryPayload {
  course_id: string; name: string; mastery_pct: number;
  topics: { id: string; title: string; published_lessons: number; read: number; mastery_pct: number }[];
  weak_topics: { id: string; title: string; mastery_pct: number }[];
}

// Writes that carry a student's earned progress. If the network drops these
// are parked in localStorage and replayed later rather than lost silently —
// all three endpoints are idempotent, so a duplicate replay is harmless.
function durablePost<T>(path: string, body: unknown, init?: RequestInit): Promise<T | null> {
  return api.post<T>(path, body, init).catch(() => {
    // Queue on any failure — entries are stamped with the signed-in user and
    // replay only under that account, so even a 401 (session lapsed mid-write)
    // is safe to park: it completes when the owner signs back in.
    queueWrite(path, body);
    return null;
  });
}

export const studentApi = {
  courses: () => api.get<StudentCourse[]>('/student/courses'),
  course: (courseId: string) => api.get<StudentCourseDetail>(`/student/courses/${courseId}`),
  topic: (courseId: string, topicId: string) =>
    api.get<StudentTopicDetail>(`/student/courses/${courseId}/topic/${topicId}`),
  topicArtifact: (courseId: string, topicId: string, kind: 'summary' | 'assignment' | 'flashcards') =>
    api.get<StudentTopicArtifact>(`/student/courses/${courseId}/topic/${topicId}/artifact/${kind}`),
  home: () => api.get<LearnHome>('/student/home'),
  mastery: (courseId: string) => api.get<MasteryPayload>(`/student/courses/${courseId}/mastery`),
  revision: (courseId: string) => api.get<RevisionPayload>(`/student/revision/${courseId}`),
  progress: (payload: {
    course_id?: string; topic_id: string; concept_id: string;
    artifact_type?: string; status?: string; quiz_score?: number; quiz_total?: number;
    scroll_pct?: number; dwell_sec?: number;
  }, init?: RequestInit) => durablePost<{ status: string }>('/student/progress', payload, init),
  quizAttempt: (payload: {
    course_id?: string; topic_id: string; concept_id: string;
    score: number; total: number; answers?: unknown[]; duration_sec?: number;
  }) => durablePost<{ attempt_no: number }>('/student/quiz/attempts', payload),
  reviewCard: (payload: {
    course_id?: string; topic_id: string; concept_id: string;
    card_key: string; result: 'again' | 'hard' | 'got_it';
  }) => durablePost<{ bucket: number; due_at: string }>('/student/flashcards/review', payload),
  events: (events: Record<string, unknown>[]) =>
    api.post<{ accepted: number }>('/student/events', { events }),
};

// Fire-and-forget analytics: batch events, flush on a timer / tab hide.
let _evtQueue: Record<string, unknown>[] = [];
let _evtTimer: ReturnType<typeof setTimeout> | null = null;
function _flush() {
  if (!_evtQueue.length) return;
  const batch = _evtQueue; _evtQueue = [];
  studentApi.events(batch).catch(() => {});
}
export function track(event: string, props: Record<string, unknown> = {}) {
  _evtQueue.push({ event, ...props, ts: new Date().toISOString() });
  if (_evtTimer) clearTimeout(_evtTimer);
  _evtTimer = setTimeout(_flush, 4000);
  if (_evtQueue.length >= 12) _flush();
}
// Replay any progress writes stranded by an earlier network failure: on load,
// when the browser reports it is back online, and when the tab is refocused
// (covers a phone that slept through the online event).
const replay = () => { flushPending((p, b) => api.post(p, b)).catch(() => {}); };

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) _flush();
    else replay();
  });
  window.addEventListener('online', replay);
  setTimeout(replay, 2000);
}
