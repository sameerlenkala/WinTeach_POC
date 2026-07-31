import { api } from './client';
import type { GenerationJob } from './types';

interface COGenerateRequest {
  course_id: string;
  unit_titles: string[];
  bloom_target?: string;
  count?: number;
}

interface ComplexityRequest {
  topic: string;
  subtopics?: string[];
  bloom_level?: string;
  hours?: number;
}

// The eight Stage-6 artifact types (byte-identical to the backend enum, §8.1).
export type ArtifactType =
  | 'topic_plan' | 'student_notes' | 'slides' | 'summary'
  | 'quiz' | 'assignment' | 'faculty_diagnostic' | 'flashcards';

export const FANOUT_TYPES: ArtifactType[] = [
  'slides', 'summary', 'quiz', 'assignment', 'faculty_diagnostic', 'flashcards',
];

export type JobPhase =
  | 'generating_topic_plan' | 'topic_plan_validate' | 'plan_ready' | 'error';

export type ConceptArtType = 'student_notes' | 'slides' | 'quiz';
export const CONCEPT_TYPES: ConceptArtType[] = ['student_notes', 'slides', 'quiz'];

export type TopicArtType = 'summary' | 'assignment' | 'faculty_diagnostic' | 'flashcards';
export const TOPIC_ART_TYPES: TopicArtType[] = ['summary', 'assignment', 'faculty_diagnostic', 'flashcards'];

export type ArtStatus = 'not_generated' | 'generating' | 'ready' | 'error';

export interface ConceptArtifactState {
  concept_id: string;
  artifact_type: ConceptArtType;
  status: ArtStatus;
  approval_status: 'pending' | 'approved';
  cost_usd?: number;
  token_count?: number;
  error?: string | null;
  /** Model that authored the stored content (e.g. gpt-5.6-luna, or gpt-5.6-terra after escalation). */
  model_used?: string | null;
  /** Blocking-gate verdict from content.validation.all_pass; false blocks Approve. Null on pre-validation artifacts. */
  gate_passed?: boolean | null;
  /** Grounding provenance: which materials/chunks fed this artifact's prompt. */
  grounded_in?: { material_id: string; content_hash?: string | null; chunk_ids?: string[] }[] | null;
}

export interface GenJobArtifact {
  id: string;
  type: ArtifactType;
  review_status: string;               // ready | generating | error | ...
  is_stale?: boolean;
  artifact_version?: string | null;
  cost_usd?: number;
  error?: string | null;               // failure reason (e.g. notes-completeness gate)
}

export interface DashboardRecentCourse {
  id: string; code?: string; name: string; status?: string; semester?: string;
  artifact_ready: number; artifact_total: number; pct: number;
  topics_complete: number; topics_total: number;
}
export interface DashboardSummary {
  courses: { total: number; active: number; draft: number };
  topics: { total: number; complete: number; in_progress: number; not_started: number };
  artifacts: { ready: number; total: number; pct: number };
  pending_approval: number;
  running: number;
  failed: number;
  cost_usd: number;
  targets: {
    failed: { course_id: string; topic_id: string } | null;
    approval: { course_id: string; topic_id: string } | null;
    draft: { course_id: string } | null;
  };
  students: {
    published_lessons: number; learners: number; lessons_read: number;
    quiz_attempts: number; avg_quiz_pct: number;
  };
  recent_courses: DashboardRecentCourse[];
}

export interface TopicProgress {
  topic_id: string;
  phase?: string | null;
  status?: string | null;
  has_plan: boolean;
  concept_total: number;
  notes_ready: number;
  notes_approved: number;
  artifact_total: number;   // concepts × 3 (notes/slides/quiz)
  artifact_ready: number;   // generated artifacts across all three types
  cost_usd: number;
  est_cost_usd?: number | null;
}

export interface GenJob {
  id: string;
  topic_id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  phase: JobPhase;
  error_msg?: string | null;
  token_count?: number;
  cost_usd?: number;
  est_cost_usd?: number | null;
  artifacts: GenJobArtifact[];         // topic-level (topic_plan + summary/…)
  concept_artifacts: ConceptArtifactState[];
}

export interface ArtifactPayload {
  content: any;
  status: string;
  validation?: { all_pass?: boolean; failures?: { name: string; detail: string }[] } | null;
  version?: string | null;
  derived_from?: { notes_version?: string | null; content_hash?: string | null };
}

type FinalizeDecision = 'approve' | 'revise' | 'ship' | 'release';

interface JobCreatePayload {
  course_id: string;
  topic_id: string;
  artifact_types?: ArtifactType[];
  /** Optional grounding: restrict to these attached materials. Omitted/empty →
   * the backend grounds in whatever is attached to the topic (none = ungrounded). */
  material_ids?: string[];
}

export const generationApi = {
  generateCOs: (data: COGenerateRequest) =>
    api.post<{ course_outcomes: string[]; bloom_level: string }>('/generate/cos', data),

  scoreComplexity: (data: ComplexityRequest) =>
    api.post<{ topic: string; score: number; label: string; signals: Record<string, number> }>(
      '/generate/complexity', data,
    ),

  createJob: (data: JobCreatePayload) => api.post<GenerationJob>('/generate/jobs', data),

  // ── Stage-6 studio (real pipeline) ──
  startJob: (data: JobCreatePayload) => api.post<GenJob>('/generate/jobs', data),

  getGenJob: (jobId: string) => api.get<GenJob>(`/generate/jobs/${jobId}`),

  /** Latest job for a topic (to resume the studio after reload). Throws 404 if none. */
  getTopicJob: (topicId: string) => api.get<GenJob>(`/generate/topics/${topicId}/job`),

  /** Live per-topic generation progress for a whole course (course board). */
  getCourseProgress: (courseId: string) =>
    api.get<TopicProgress[]>(`/generate/courses/${courseId}/progress`),

  getArtifact: (jobId: string, type: ArtifactType) =>
    api.get<ArtifactPayload>(`/generate/jobs/${jobId}/artifact/${type}`),

  // ── interactive studio ──
  savePlan: (jobId: string, concepts: any[]) =>
    api.put<any>(`/generate/jobs/${jobId}/plan`, { concepts }),

  /** Persist edited whole plan sections (TLOs, session plan) from the plan modal. */
  savePlanSections: (jobId: string, sections: { tlo_set?: any[]; session_plan?: any[] }) =>
    api.put<any>(`/generate/jobs/${jobId}/plan/sections`, sections),

  /** Re-run the Topic Plan node on the existing job (concept ids re-derived). */
  regeneratePlan: (jobId: string) =>
    api.post<any>(`/generate/jobs/${jobId}/plan/regenerate`),

  genConcept: (jobId: string, conceptId: string, type: ConceptArtType) =>
    api.post<any>(`/generate/jobs/${jobId}/concepts/${conceptId}/${type}/generate`),

  approveConcept: (jobId: string, conceptId: string, type: ConceptArtType) =>
    api.post<any>(`/generate/jobs/${jobId}/concepts/${conceptId}/${type}/approve`),

  getConcept: (jobId: string, conceptId: string, type: ConceptArtType) =>
    api.get<{ content: any; status: ArtStatus; approval_status: string; cost_usd?: number; error?: string }>(
      `/generate/jobs/${jobId}/concepts/${conceptId}/${type}`),

  getDashboard: () => api.get<DashboardSummary>('/generate/dashboard'),

  // Notes/quiz download as .docx, slides as .pptx (with speaker notes).
  exportConcept: (jobId: string, conceptId: string, type: ConceptArtType, fallbackName: string) =>
    api.download(`/generate/jobs/${jobId}/concepts/${conceptId}/${type}/export`, fallbackName),

  // Targeted revision + version history (outgoing content is snapshotted first).
  reviseConcept: (jobId: string, conceptId: string, type: ConceptArtType, instruction: string) =>
    api.post<any>(`/generate/jobs/${jobId}/concepts/${conceptId}/${type}/revise`, { instruction }),

  listVersions: (jobId: string, conceptId: string, type: ConceptArtType) =>
    api.get<{ version_no: number; note?: string; created_at: string }[]>(
      `/generate/jobs/${jobId}/concepts/${conceptId}/${type}/versions`),

  restoreVersion: (jobId: string, conceptId: string, type: ConceptArtType, versionNo: number) =>
    api.post<any>(`/generate/jobs/${jobId}/concepts/${conceptId}/${type}/versions/${versionNo}/restore`),

  genTopicArtifact: (jobId: string, type: TopicArtType) =>
    api.post<any>(`/generate/jobs/${jobId}/topic/${type}/generate`),

  finalize: (jobId: string, type: ArtifactType, body: { decision: FinalizeDecision; unit_id?: string; instruction?: string }) =>
    api.post<any>(`/generate/jobs/${jobId}/artifact/${type}/finalize`, body),

  getJob: (jobId: string) => api.get<GenerationJob>(`/generate/jobs/${jobId}`),

  streamJob: (jobId: string): EventSource => api.stream(`/generate/jobs/${jobId}/stream`),

  getArtifactContent: (jobId: string, artifactType: string) =>
    api.get<{ content: any; status: string }>(`/generate/jobs/${jobId}/artifact/${artifactType}`),

  allocateHours: (unitTotalHours: number, topics: { title: string; complexity_score?: number; co_importance?: string }[]) =>
    api.post<{ topics: { title: string; allocated_hours: number; below_floor: boolean }[] }>(
      '/generate/hours/allocate', { unit_total_hours: unitTotalHours, topics },
    ),

  suggestGranularity: (unitTotalHours: number, topics: { title: string; hours?: number }[]) =>
    api.post<{ suggestions: { title: string; suggestion: string; reason: string }[] }>(
      '/generate/granularity/suggest', { unit_total_hours: unitTotalHours, topics },
    ),
};
