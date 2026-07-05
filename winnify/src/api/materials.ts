import { api } from './client';

// Reference materials (Phase 1 grounding): faculty-uploaded PDFs/DOCX that
// generation grounds its prompts in. Attached to a topic explicitly, or to
// every topic in the course via is_course_wide.

export interface Material {
  id: string;
  course_id: string;
  filename: string;
  file_type: 'pdf' | 'docx';
  status: 'processing' | 'ready' | 'error';
  is_course_wide: boolean;
  page_count?: number | null;
  chunk_count?: number | null;
  error_message?: string | null;
  created_at?: string;
  /** Set on topic listings: how the material reaches the topic. */
  tier?: 'topic' | 'course';
  /** Topics this material is explicitly linked to (empty for course-wide-only files). */
  linked_topics?: { id: string; title: string }[];
  /** Set on the repository listing: the owning course. */
  course?: { id: string; name: string; code: string } | null;
}

export const materialsApi = {
  /** Upload + background extraction. Poll get() until status is ready|error. */
  upload: (file: File, courseId: string, opts?: { topicId?: string; isCourseWide?: boolean }) =>
    api.upload<Material>('/materials', file, {
      course_id: courseId,
      ...(opts?.topicId ? { topic_id: opts.topicId } : {}),
      ...(opts?.isCourseWide ? { is_course_wide: 'true' } : {}),
    }),

  get: (materialId: string) => api.get<Material>(`/materials/${materialId}`),

  /** Repository view: every material across the user's courses. */
  listMine: () => api.get<Material[]>('/materials'),

  /** Resolve grounded_in chunk ids to display metadata for the coverage popover. */
  chunks: (ids: string[]) =>
    api.get<{ id: string; material_id: string; filename?: string; heading?: string | null;
              page_start?: number | null; page_end?: number | null; token_count?: number }[]>(
      `/material-chunks?ids=${ids.join(',')}`),

  listForCourse: (courseId: string) => api.get<Material[]>(`/courses/${courseId}/materials`),

  /** Explicitly linked (tier 'topic') + course-wide pool (tier 'course'). */
  listForTopic: (topicId: string) => api.get<Material[]>(`/topics/${topicId}/materials`),

  setCourseWide: (materialId: string, isCourseWide: boolean) =>
    api.patch<Material>(`/materials/${materialId}`, { is_course_wide: isCourseWide }),

  remove: (materialId: string) => api.delete<void>(`/materials/${materialId}`),

  /** Download the original uploaded file from Supabase Storage. */
  download: (materialId: string, filename: string) =>
    api.download(`/materials/${materialId}/download`, filename),

  /** Open the original in a new tab (PDFs render inline; DOCX falls back to save).
   * `page` jumps a PDF to that page via the viewer's #page fragment. */
  view: async (materialId: string, filename: string, page?: number): Promise<void> => {
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return api.download(`/materials/${materialId}/download`, filename);
    }
    const token = localStorage.getItem('winnify_token');
    const base = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
    const res = await fetch(`${base}/api/v1/materials/${materialId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('File not available');
    const blob = await res.blob();
    // Re-type the blob so the browser's PDF viewer takes it.
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    window.open(page ? `${url}#page=${page}` : url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  linkToTopic: (topicId: string, materialId: string) =>
    api.post<{ linked: boolean }>(`/topics/${topicId}/materials/${materialId}`),

  unlinkFromTopic: (topicId: string, materialId: string) =>
    api.delete<void>(`/topics/${topicId}/materials/${materialId}`),
};
