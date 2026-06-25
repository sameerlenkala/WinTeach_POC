import { api } from './client';
import type { Institute, PO, PSO } from './types';

export const institutesApi = {
  list: () => api.get<Institute[]>('/institutes'),

  get: (id: string) => api.get<Institute>(`/institutes/${id}`),

  create: (data: Omit<Institute, 'id'>) => api.post<Institute>('/institutes', data),

  update: (id: string, data: Partial<Institute>) => api.patch<Institute>(`/institutes/${id}`, data),

  delete: (id: string) => api.delete<void>(`/institutes/${id}`),

  // Program Outcomes
  listPOs: (id: string) => api.get<PO[]>(`/institutes/${id}/pos`),
  addPO:   (id: string, data: { code: string; text: string }) => api.post<PO>(`/institutes/${id}/pos`, data),
  deletePO:(id: string, poId: string) => api.delete<void>(`/institutes/${id}/pos/${poId}`),

  // PSOs
  listPSOs: (id: string) => api.get<PSO[]>(`/institutes/${id}/psos`),
  addPSO:   (id: string, data: { code: string; text: string; scope: string; major?: string }) =>
    api.post<PSO>(`/institutes/${id}/psos`, data),
  deletePSO:(id: string, psoId: string) => api.delete<void>(`/institutes/${id}/psos/${psoId}`),
};
