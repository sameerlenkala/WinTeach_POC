// Student delivery: published-content browsing + reading/quiz progress.
import { api } from './client';

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
}

export interface StudentCourseDetail {
  id: string;
  name: string;
  code?: string;
  semester?: string;
  units: { id: string; unit_number?: number; title?: string; topics: StudentTopic[] }[];
  progress: {
    topic_id: string; concept_id: string; artifact_type: string;
    status: string; quiz_score?: number; quiz_total?: number;
  }[];
}

export const studentApi = {
  courses: () => api.get<StudentCourse[]>('/student/courses'),
  course: (courseId: string) => api.get<StudentCourseDetail>(`/student/courses/${courseId}`),
  progress: (payload: {
    course_id?: string; topic_id: string; concept_id: string;
    artifact_type?: string; status?: string; quiz_score?: number; quiz_total?: number;
  }) => api.post<{ status: string }>('/student/progress', payload),
};
