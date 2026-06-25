// Academic LMS Types

export type UserRole = 'Admin' | 'HOD' | 'Faculty' | 'Student' | 'TA' | 'Reviewer';

export type CourseStatus = 'Draft' | 'Under Review' | 'Published' | 'Active' | 'Completed' | 'Archived';
export type LectureStatus = 'Planned' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';
export type ResourceStatus = 'Not Generated' | 'Generated' | 'Not Reviewed' | 'Under Review' | 'Reviewed' | 'Published' | 'Archived';
export type QuizStatus = 'Draft' | 'Configured' | 'Published' | 'Live' | 'Completed' | 'Closed';
export type PlanStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Needs Revision';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
}


export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  workingDays: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
}

export interface Regulation {
  id: string;
  code: string;
  name: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'Draft' | 'Active' | 'Inactive';
}

export interface CourseOutcome {
  id: string;
  code: string;
  description: string;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Theory' | 'Lab' | 'Theory+Lab';
  academicYearId: string;
  semesterId: string;
  regulationId: string;
  departmentId: string;
  section: string;
  status: CourseStatus;
  primaryFacultyId: string;
  primaryFacultyName: string;
  coFacultyIds?: string[];
  outcomes: CourseOutcome[];
  coveragePercentage: number;
  totalLectures: number;
  completedLectures: number;
  enrolledStudents?: number;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  topics: string[];
  prerequisites?: string[];
  status: LectureStatus;
  coveragePercentage: number;
  attendanceMarked: boolean;
  resourcesPublished: boolean;
  startedAt?: string;
  actualDuration?: number;
  completedAt?: string;
}

export interface Resource {
  id: string;
  lectureId: string;
  title: string;
  type: 'Notes' | 'Slides' | 'Code' | 'Video' | 'Practice';
  status: ResourceStatus;
  url?: string;
  generatedBy: 'AI' | 'Faculty';
  version: number;
  publishedAt?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  topics: string[];
  totalMarks: number;
  duration: number;
  status: QuizStatus;
  deadline: string;
  attemptsAllowed: number;
  randomize: boolean;
  totalQuestions: number;
}

export interface Attendance {
  id: string;
  lectureId: string;
  studentId: string;
  status: 'Present' | 'Absent' | 'Late';
  markedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId: string;
  hodName: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  courses: string[];
  phone?: string;
  designation?: string;
  specialization?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  departmentId: string;
  section: string;
  enrolledCourses: string[];
}

export interface CoPoMapping {
  coId: string;
  poId: string;
  level: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
}

export interface Analytics {
  courseId: string;
  coveragePercentage: number;
  averageAttendance: number;
  quizCompletionRate: number;
  averageQuizScore: number;
  atRiskStudents: number;
  topPerformers: number;
}
