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

interface JobCreatePayload {
  course_id: string;
  topic_id: string;
  artifact_types?: ('notes' | 'preassess' | 'quiz' | 'flashcards')[];
}

export const generationApi = {
  generateCOs: (data: COGenerateRequest) =>
    api.post<{ course_outcomes: string[]; bloom_level: string }>('/generate/cos', data),

  scoreComplexity: (data: ComplexityRequest) =>
    api.post<{ topic: string; score: number; label: string; signals: Record<string, number> }>(
      '/generate/complexity', data,
    ),

  createJob: (data: JobCreatePayload) => api.post<GenerationJob>('/generate/jobs', data),

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
