export type UserRole = 'student' | 'faculty' | 'admin' | 'superadmin';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  redirect: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institute_id?: string;
  institute_name?: string;
}

export interface Institute {
  id: string;
  name: string;
  short_name: string;
  city: string;
  state: string;
  country: string;
  regulation: string;
  affiliation: string;
  contact_email: string;
}

export interface PO { id: string; code: string; text: string; institute_id: string; }
export interface PSO { id: string; code: string; text: string; scope: 'common' | 'major'; major?: string; institute_id: string; }

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  regulation: string;
  status: 'draft' | 'active' | 'archived';
  faculty_id: string;
  institute_id?: string;
  created_at: string;
  units?: Unit[];
  course_outcomes?: CourseOutcome[];
}

export interface Unit {
  id: string;
  course_id: string;
  title: string;
  unit_number: number;
  hours: number;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  unit_id: string;
  title: string;
  bloom_level?: string;
  order: number;
  subtopics?: Subtopic[];
  artifacts?: Artifact[];
}

export interface Subtopic {
  id: string;
  topic_id: string;
  title: string;
  order: number;
}

export interface CourseOutcome {
  id: string;
  course_id: string;
  co_number: number;
  number?: number;       // alias used in some local paths
  description: string;
  text?: string;         // alias used in some local paths
  bloom_level?: string;
}

export interface COMapping {
  id: string;
  course_id: string;
  co_id: string;
  po_code?: string;
  pso_code?: string;
  level: number;
}

export interface LibrarySource {
  id: string;
  title: string;
  authors: string[];
  source_type: string;
  url: string;
  description: string;
  tags: string[];
  institute_id?: string;
  added_by: string;
}

export interface COLibraryEntry {
  id: string;
  description: string;
  bloom_level: string;
  domain: string;
  tags: string[];
}

export interface GenerationJob {
  id: string;
  topic_id: string;
  course_id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  artifact_types: string[];
  progress?: Record<string, number>;
  artifacts?: Artifact[];
}

export interface Artifact {
  id: string;
  job_id: string;
  topic_id: string;
  artifact_type: 'notes' | 'preassess' | 'quiz' | 'flashcards';
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  content?: string;
}

export type ExtractionStatus = 'processing' | 'done' | 'failed';

export interface UploadResult {
  upload_id: string;
  filename: string;
  status: string;
  extraction: SyllabusExtraction;
}

export interface ExtractedField {
  value: string | string[] | null;
  confidence: 'High' | 'Low' | 'Missing';
}

export interface SyllabusExtraction {
  course_name: ExtractedField;
  course_code: ExtractedField;
  credits: ExtractedField;
  semester: ExtractedField;
  course_outcomes: ExtractedField;
  modules: ExtractedField;
  total_hours: ExtractedField;
  reference_books: ExtractedField;
  lab_flag: ExtractedField;
  assessment_scheme: ExtractedField;
}

export interface DashboardSummary {
  institute_count: number;
  course_count: number;
  generating_count: number;
  recent_additions: { id: string; filename: string; created_at: string; status: string }[];
  recent_courses?: Course[];
}

export interface InviteResponse {
  id: string;
  email: string;
  role: string;
  signup_url: string;
  expires_at: string;
}
