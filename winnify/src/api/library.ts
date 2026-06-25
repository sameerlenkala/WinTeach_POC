import { api } from './client';
import type { LibrarySource, COLibraryEntry } from './types';

export const libraryApi = {
  // Sources
  listSources:  ()           => api.get<LibrarySource[]>('/library/sources'),
  getSource:    (id: string) => api.get<LibrarySource>(`/library/sources/${id}`),
  createSource: (data: Omit<LibrarySource, 'id' | 'added_by' | 'institute_id'>) =>
    api.post<LibrarySource>('/library/sources', data),
  deleteSource: (id: string) => api.delete<void>(`/library/sources/${id}`),
  getReferences:(id: string) => api.get<unknown[]>(`/library/sources/${id}/references`),

  // CO Library
  suggestions: (courseId?: string, limit = 4) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (courseId) params.set('course_id', courseId);
    return api.get<COLibraryEntry[]>(`/library/co/suggestions?${params}`);
  },
  searchCO: (q: string, limit = 20) =>
    api.get<COLibraryEntry[]>(`/library/co?q=${encodeURIComponent(q)}&limit=${limit}`),
  addCOEntry: (data: Omit<COLibraryEntry, 'id'>) =>
    api.post<COLibraryEntry>('/library/co', data),
};
