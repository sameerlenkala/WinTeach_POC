import { api } from './client';
import type { Course, CourseOutcome, COMapping } from './types';

interface CourseCreatePayload {
  name: string;
  code: string;
  credits?: number;
  semester?: string;
  regulation?: string;
  status?: 'draft' | 'active' | 'archived';
  units?: { title: string; unit_number: number; hours?: number; topics?: string[] }[];
  course_outcomes?: string[];
}

interface COMappingUpdate {
  mappings: { co_id: string; po_codes: string[]; pso_codes: string[]; levels: Record<string, number> }[];
}

export const coursesApi = {
  list: () => api.get<Course[]>('/courses'),

  get: (id: string) => api.get<Course>(`/courses/${id}`),

  create: (data: CourseCreatePayload) => api.post<Course>('/courses', data),

  update: (id: string, data: Partial<CourseCreatePayload>) => api.patch<Course>(`/courses/${id}`, data),

  delete: (id: string) => api.delete<void>(`/courses/${id}`),

  setStatus: (id: string, status: 'draft' | 'active' | 'archived') =>
    api.patch<Course>(`/courses/${id}/status`, { status }),

  lockStructure: (id: string) => api.post<{ structure_locked: boolean }>(`/courses/${id}/structure/lock`),

  // Units & Topics
  listUnits: (id: string) => api.get<any[]>(`/courses/${id}/units`),
  getTopic: (courseId: string, topicId: string) => api.get<any>(`/courses/${courseId}/topics/${topicId}`),

  // Course Outcomes
  listCOs:  (id: string) => api.get<CourseOutcome[]>(`/courses/${id}/cos`),
  addCOs:   (id: string, cos: { text: string; bloom?: string }[]) =>
    api.post<CourseOutcome[]>(`/courses/${id}/cos`, cos),
  updateCO: (id: string, coId: string, data: { text?: string; bloom?: string }) =>
    api.patch<CourseOutcome>(`/courses/${id}/cos/${coId}`, data),
  deleteCO: (id: string, coId: string) => api.delete<void>(`/courses/${id}/cos/${coId}`),

  // CO ↔ PO/PSO mapping
  getMap:  (id: string) => api.get<COMapping[]>(`/courses/${id}/co-map`),
  saveMap: (id: string, data: COMappingUpdate) => api.post<COMapping[]>(`/courses/${id}/co-map`, data),
};
