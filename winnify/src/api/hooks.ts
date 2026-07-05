import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi }       from './auth';
import { institutesApi } from './institutes';
import { coursesApi }    from './courses';
import { uploadsApi }    from './uploads';
import { libraryApi }    from './library';
import { generationApi } from './generation';
import { dashboardApi }  from './dashboard';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.summary });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: authApi.me });

export const useInvites = () =>
  useQuery({ queryKey: ['invites'], queryFn: authApi.listInvites });

export const useSendInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role, institute_id }: { email: string; role: string; institute_id?: string }) =>
      authApi.invite(email, role as never, institute_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
};

// ── Institutes ────────────────────────────────────────────────────────────────
export const useInstitutes = () =>
  useQuery({ queryKey: ['institutes'], queryFn: institutesApi.list });

export const useInstitute = (id: string) =>
  useQuery({ queryKey: ['institutes', id], queryFn: () => institutesApi.get(id), enabled: !!id });

export const useCreateInstitute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: institutesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes'] }),
  });
};

export const useUpdateInstitute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      institutesApi.update(id, data),
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: ['institutes', id] }),
  });
};

export const useDeleteInstitute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: institutesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes'] }),
  });
};

export const usePOs = (instituteId: string) =>
  useQuery({ queryKey: ['institutes', instituteId, 'pos'], queryFn: () => institutesApi.listPOs(instituteId), enabled: !!instituteId });

export const useAddPO = (instituteId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; text: string }) => institutesApi.addPO(instituteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes', instituteId, 'pos'] }),
  });
};

export const useDeletePO = (instituteId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poId: string) => institutesApi.deletePO(instituteId, poId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes', instituteId, 'pos'] }),
  });
};

export const usePSOs = (instituteId: string) =>
  useQuery({ queryKey: ['institutes', instituteId, 'psos'], queryFn: () => institutesApi.listPSOs(instituteId), enabled: !!instituteId });

export const useAddPSO = (instituteId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; text: string; scope: string; major?: string }) =>
      institutesApi.addPSO(instituteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes', instituteId, 'psos'] }),
  });
};

export const useDeletePSO = (instituteId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (psoId: string) => institutesApi.deletePSO(instituteId, psoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutes', instituteId, 'psos'] }),
  });
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const useCourses = () =>
  useQuery({ queryKey: ['courses'], queryFn: coursesApi.list });

export const useCourse = (id: string) =>
  useQuery({ queryKey: ['courses', id], queryFn: () => coursesApi.get(id), enabled: !!id });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      coursesApi.update(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['courses', id] });
    },
  });
};

export const useSetCourseStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'active' | 'archived' }) =>
      coursesApi.setStatus(id, status),
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: ['courses', id] }),
  });
};

export const useCOs = (courseId: string) =>
  useQuery({ queryKey: ['courses', courseId, 'cos'], queryFn: () => coursesApi.listCOs(courseId), enabled: !!courseId });

export const useUnits = (courseId: string) =>
  useQuery({ queryKey: ['courses', courseId, 'units'], queryFn: () => coursesApi.listUnits(courseId), enabled: !!courseId });

export const useTopic = (courseId: string, topicId: string) =>
  useQuery({ queryKey: ['courses', courseId, 'topics', topicId], queryFn: () => coursesApi.getTopic(courseId, topicId), enabled: !!courseId && !!topicId });

export const useCourseProgress = (courseId: string) =>
  useQuery({
    queryKey: ['courses', courseId, 'gen-progress'],
    queryFn: () => generationApi.getCourseProgress(courseId),
    enabled: !!courseId,
    refetchInterval: 5000,       // live-ish while topics generate
    staleTime: 3000,
  });

export const useDashboard = () =>
  useQuery({
    queryKey: ['winteach', 'dashboard'],
    queryFn: () => generationApi.getDashboard(),
    refetchInterval: 8000,
    staleTime: 5000,
  });

export const useAddCOs = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cos: { text: string; bloom?: string }[]) => coursesApi.addCOs(courseId, cos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', courseId, 'cos'] }),
  });
};

export const useUpdateCO = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coId, data }: { coId: string; data: { text?: string; bloom?: string } }) =>
      coursesApi.updateCO(courseId, coId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', courseId, 'cos'] }),
  });
};

export const useDeleteCO = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (coId: string) => coursesApi.deleteCO(courseId, coId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', courseId, 'cos'] }),
  });
};

export const useCOMap = (courseId: string) =>
  useQuery({ queryKey: ['courses', courseId, 'co-map'], queryFn: () => coursesApi.getMap(courseId), enabled: !!courseId });

export const useSaveCOMap = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof coursesApi.saveMap>[1]) => coursesApi.saveMap(courseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', courseId, 'co-map'] }),
  });
};

// ── Uploads ───────────────────────────────────────────────────────────────────
export const useUploadSyllabus = () =>
  useMutation({ mutationFn: uploadsApi.upload });

export const useCommitUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uploadId, payload }: { uploadId: string; payload: Parameters<typeof uploadsApi.commit>[1] }) =>
      uploadsApi.commit(uploadId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

// ── Library ───────────────────────────────────────────────────────────────────
export const useLibrarySources = () =>
  useQuery({ queryKey: ['library', 'sources'], queryFn: libraryApi.listSources });

export const useCOSuggestions = (courseId?: string) =>
  useQuery({ queryKey: ['library', 'co-suggestions', courseId], queryFn: () => libraryApi.suggestions(courseId) });

export const useSearchCO = (q: string) =>
  useQuery({ queryKey: ['library', 'co', q], queryFn: () => libraryApi.searchCO(q), enabled: q.length >= 2 });

// ── Generation ────────────────────────────────────────────────────────────────
export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generationApi.createJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
};

export const useJob = (jobId: string) =>
  useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => generationApi.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'done' || status === 'failed' ? false : 3000;
    },
  });

export const useGenerateCOs = () =>
  useMutation({ mutationFn: generationApi.generateCOs });

export const useScoreComplexity = () =>
  useMutation({ mutationFn: generationApi.scoreComplexity });
