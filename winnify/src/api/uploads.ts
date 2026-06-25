import { api } from './client';
import type { UploadResult } from './types';

// Re-export so callers don't need to import from types separately
export type { UploadResult };

interface ExtractionStatus {
  upload_id: string;
  status: 'processing' | 'done' | 'failed';
  extraction?: Record<string, unknown>;
  ai_extraction?: Record<string, unknown>;
  error?: string;
}

interface CommitPayload {
  course_id: string;
  cos?: { text: string; bloom?: string }[];
  topics?: { unit_index: number; title: string; subtopics?: string[]; co_text?: string; bloom?: string }[];
  replace_cos?: boolean;
  replace_topics?: boolean;
}

interface CommitResult {
  upload_id: string;
  course_id: string;
  cos_committed: number;
  topics_committed: number;
}

export const uploadsApi = {
  upload: (file: File) => api.upload<UploadResult>('/uploads', file),

  getExtraction: (uploadId: string) =>
    api.get<ExtractionStatus>(`/uploads/${uploadId}/extraction`),

  commit: (uploadId: string, payload: CommitPayload) =>
    api.post<CommitResult>(`/uploads/${uploadId}/commit`, payload),
};
