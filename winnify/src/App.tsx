import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import NavbarOnlyLayout from './layouts/NavbarOnlyLayout';
import CourseLayout from './layouts/CourseLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DailyCoPage from './pages/DailyCoPage';
import Judge0Page from './pages/Judge0Page';
import Judge0SolvePage from './pages/Judge0SolvePage';
import Home from './pages/Home';
import WinSpeak from './pages/WinSpeak';
import Drives from './pages/Drives';
import Journey from './pages/Journey';
import Assessments from './pages/Assessments';
import Mocktest from './pages/Mocktest';
import Courses from './pages/Courses';
import Learning from './pages/Learning';
import Profile from './pages/Profile';
import NinetyDayPlan from './pages/NinetyDayPlan';
import DriveDetail from './pages/DriveDetail';
import AptitudeTests from './pages/AptitudeTests';
import TechnicalTests from './pages/TechnicalTests';
import CompanyOA from './pages/CompanyOA';
import WinSpeakChallenge from './pages/WinSpeakChallenge';
import WinSpeakLeaderboard from './pages/WinSpeakLeaderboard';
import WinSpeakPractice from './pages/WinSpeakPractice';
import AIChat from './pages/AIChat';
import RevisionCourse from './pages/RevisionCourse';
import SkillLesson from './pages/SkillLesson';
import MilestoneDetail from './pages/MilestoneDetail';
import TestConfig from './pages/TestConfig';
import TestBriefing from './pages/TestBriefing';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import WinSpeakRecording from './pages/WinSpeakRecording';
import WinSpeakReport from './pages/WinSpeakReport';
import WinSpeakPracticeSetup from './pages/WinSpeakPracticeSetup';
import WinSpeakPracticeRecording from './pages/WinSpeakPracticeRecording';
import WinSpeakPracticeReport from './pages/WinSpeakPracticeReport';
import WinSpeakScoreDashboard from './pages/WinSpeakScoreDashboard';
import WinSpeakAnalysis from './pages/WinSpeakAnalysis';
import BadgesGallery from './pages/BadgesGallery';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import Settings from './pages/Settings';
import ResumeBuilder from './pages/ResumeBuilder';
import WinSpeakDimensionDetail from './pages/WinSpeakDimensionDetail';
import WinSpeakTips from './pages/WinSpeakTips';
import WinSpeakPracticeHistory from './pages/WinSpeakPracticeHistory';
import WinSpeakChallengeDetail from './pages/WinSpeakChallengeDetail';
import AuthCallback from './pages/AuthCallback';
import AcademicLogin from './pages/academic/AcademicLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminColleges from './pages/superadmin/SuperAdminColleges';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import CollegeAdminLayout from './pages/collegeadmin/CollegeAdminLayout';
import CollegeAdminDashboard from './pages/collegeadmin/CollegeAdminDashboard';
import CollegeAdminUsers from './pages/collegeadmin/CollegeAdminUsers';
import CollegeAdminCourses from './pages/collegeadmin/CollegeAdminCourses';
import SignUpInvite from './pages/SignUpInvite';
import WinTeachLayout from './pages/winteach/WinTeachLayout';
import WinTeachDashboard from './pages/winteach/WinTeachDashboard';
import WinTeachCourses from './pages/winteach/WinTeachCourses';
import WinTeachCreateCourse from './pages/winteach/WinTeachCreateCourse';
import WinTeachCoursePage from './pages/winteach/WinTeachCoursePage';
import WinTeachGenerate from './pages/winteach/WinTeachGenerate';
import WinTeachConceptReader from './pages/winteach/WinTeachConceptReader';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseTopics from './pages/student/StudentCourseTopics';
import StudentRevision from './pages/student/StudentRevision';
import StudentMastery from './pages/student/StudentMastery';
import WinTeachGeneration from './pages/winteach/WinTeachGeneration';
import WinTeachMaterialsPage from './pages/winteach/WinTeachMaterialsPage';
import WinTeachLibrary from './pages/winteach/WinTeachLibrary';
import WinTeachAddLibrary from './pages/winteach/WinTeachAddLibrary';
import WinTeachInstitutes from './pages/winteach/WinTeachInstitutes';
import WinTeachSettings from './pages/winteach/WinTeachSettings';
import AcademicPortal from './pages/academic/AcademicPortal';
import AcademicLayout from './layouts/AcademicLayout';
import AdminDashboard from './pages/academic/AdminDashboard';
import HODDashboard from './pages/academic/HODDashboard';
import HODCourses from './pages/academic/HODCourses';
import HODFaculty from './pages/academic/HODFaculty';
import HODStudents from './pages/academic/HODStudents';
import HODApprovals from './pages/academic/HODApprovals';
import HODAnalytics from './pages/academic/HODAnalytics';
import HODCalendar from './pages/academic/HODCalendar';
import HODReports from './pages/academic/HODReports';
import HODDepartment from './pages/academic/HODDepartment';
import HODSettings from './pages/academic/HODSettings';
import FacultyDashboard from './pages/academic/FacultyDashboard';
import FacultyCourses from './pages/academic/FacultyCourses';
import FacultyLectures from './pages/academic/FacultyLectures';
import FacultyResources from './pages/academic/FacultyResources';
import FacultyQuizzes from './pages/academic/FacultyQuizzes';
import FacultyAttendance from './pages/academic/FacultyAttendance';
import FacultyAnalytics from './pages/academic/FacultyAnalytics';
import FacultyDoubts from './pages/academic/FacultyDoubts';
import FacultySettings from './pages/academic/FacultySettings';
import LectureDetail from './pages/academic/LectureDetail';
import QuizBuilder from './pages/academic/QuizBuilder';
import CourseDetail from './pages/academic/CourseDetail';
import StudentDashboard from './pages/academic/StudentDashboard';
import ContentTypeSelector from './pages/academic/ContentTypeSelector';
import EnhancedCourseCreation from './pages/academic/EnhancedCourseCreation';
import TimelineKanban from './pages/academic/TimelineKanban';
import EnhancedQuizBuilder from './pages/academic/EnhancedQuizBuilder';
import PlanGenerationOptions from './pages/academic/PlanGenerationOptions';
import AutoPlanGenerator from './pages/academic/AutoPlanGenerator';
import FacultyTimelineEditor from './pages/academic/FacultyTimelineEditor';
import FacultyReviewPlan from './pages/academic/FacultyReviewPlan';
import CourseSettings from './pages/academic/CourseSettings';
import ResourceGenerator from './pages/academic/ResourceGenerator';
import ResourceReviewPanel from './pages/academic/ResourceReviewPanel';
import TopicView from './pages/academic/TopicView';
import StitchedResources from './pages/academic/StitchedResources';
import TopicFlashcards from './pages/academic/TopicFlashcards';
import ComprehensiveQuizBuilder from './pages/academic/ComprehensiveQuizBuilder';

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12, color: 'rgba(26,26,34,0.45)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#1A1A22' }}>{title}</div>
      <div style={{ fontSize: 14 }}>Coming soon</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* OAuth callback — must be public, no layout */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Academic login — standalone, no navbar */}
          <Route path="/academic/login" element={<AcademicLogin />} />

          {/* SuperAdmin Console */}
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="colleges" element={<SuperAdminColleges />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="stats" element={<ComingSoon title="Analytics" />} />
            <Route path="announcements" element={<ComingSoon title="Announcements" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* College Admin Console */}
          <Route path="/admin" element={<CollegeAdminLayout />}>
            <Route index element={<CollegeAdminDashboard />} />
            <Route path="users" element={<CollegeAdminUsers />} />
            <Route path="courses" element={<CollegeAdminCourses />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* WinTeach Console */}
          <Route path="/winteach" element={<WinTeachLayout />}>
            <Route index element={<WinTeachDashboard />} />
            <Route path="courses" element={<WinTeachCourses />} />
            <Route path="courses/new" element={<WinTeachCreateCourse />} />
            <Route path="courses/:id/edit" element={<WinTeachCreateCourse />} />
            <Route path="courses/:id" element={<WinTeachCoursePage />} />
            {/* Topic → the generation studio directly (no redundant topic page) */}
            <Route path="courses/:id/topic/:topicId" element={<WinTeachGenerate />} />
            <Route path="courses/:id/topic/:topicId/generate" element={<WinTeachGenerate />} />
            <Route path="courses/:id/topic/:topicId/notes/:conceptId" element={<WinTeachConceptReader type="student_notes" />} />
            <Route path="courses/:id/topic/:topicId/slides/:conceptId" element={<WinTeachConceptReader type="slides" />} />
            <Route path="courses/:id/topic/:topicId/quiz/:conceptId" element={<WinTeachConceptReader type="quiz" />} />
            <Route path="generation" element={<WinTeachGeneration />} />
            <Route path="materials" element={<WinTeachMaterialsPage />} />
            <Route path="library" element={<WinTeachLibrary />} />
            <Route path="add-library" element={<WinTeachAddLibrary />} />
            <Route path="institutes" element={<WinTeachInstitutes />} />
            <Route path="settings" element={<WinTeachSettings />} />
          </Route>

          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/invite" element={<SignUpInvite />} />
          </Route>

          {/* Protected routes — Sidebar always present for all /home/* and main pages */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/judge0"     element={<Judge0Page />} />
            <Route path="/daily-co"   element={<DailyCoPage />} />
            <Route path="/home"       element={<Home />} />
            {/* Student courses: published (approved) content, read-only */}
            <Route path="/home/courses" element={<StudentCourses />} />
            <Route path="/home/courses/:id" element={<StudentCourseTopics />} />
            <Route path="/home/courses/:id/revision" element={<StudentRevision />} />
            <Route path="/home/courses/:id/mastery" element={<StudentMastery />} />
            <Route path="/home/courses/:id/topic/:topicId/notes/:conceptId" element={<div className="wt-pro"><WinTeachConceptReader type="student_notes" student /></div>} />
            <Route path="/home/courses/:id/topic/:topicId/slides/:conceptId" element={<div className="wt-pro"><WinTeachConceptReader type="slides" student /></div>} />
            <Route path="/home/courses/:id/topic/:topicId/quiz/:conceptId" element={<div className="wt-pro"><WinTeachConceptReader type="quiz" student /></div>} />
            <Route path="/home/winspeak" element={<WinSpeak />} />
            <Route path="/home/winspeak/challenge" element={<WinSpeakChallenge />} />
            <Route path="/home/winspeak/leaderboard" element={<WinSpeakLeaderboard />} />
            <Route path="/home/winspeak/practice" element={<WinSpeakPractice />} />
            <Route path="/home/drives" element={<Drives />} />
            <Route path="/home/drives/:id" element={<DriveDetail />} />
            <Route path="/home/journey" element={<Journey />} />
            <Route path="/home/assessments" element={<Assessments />} />
            <Route path="/home/mocktest" element={<Mocktest />} />
            <Route path="/home/mocktest/aptitude" element={<AptitudeTests />} />
            <Route path="/home/mocktest/technical" element={<TechnicalTests />} />
            <Route path="/home/mocktest/company-oa" element={<CompanyOA />} />
            <Route path="/home/courses" element={<Courses />} />
            <Route path="/home/learning" element={<Learning />} />
            <Route path="/home/profile" element={<Profile />} />
            <Route path="/home/ai-chat" element={<AIChat />} />
            <Route path="/home/mocktest/config" element={<TestConfig />} />
            <Route path="/home/mocktest/briefing" element={<TestBriefing />} />
            <Route path="/home/mocktest/test" element={<TestTaking />} />
            <Route path="/home/mocktest/results" element={<TestResults />} />
            <Route path="/home/winspeak/recording" element={<WinSpeakRecording />} />
            <Route path="/home/winspeak/report" element={<WinSpeakReport />} />
            <Route path="/home/winspeak/practice/setup" element={<WinSpeakPracticeSetup />} />
            <Route path="/home/winspeak/practice/recording" element={<WinSpeakPracticeRecording />} />
            <Route path="/home/winspeak/practice/report" element={<WinSpeakPracticeReport />} />
            <Route path="/home/winspeak/practice/history" element={<WinSpeakPracticeHistory />} />
            <Route path="/home/winspeak/challenge/detail" element={<WinSpeakChallengeDetail />} />
            <Route path="/home/winspeak/scores" element={<WinSpeakScoreDashboard />} />
            <Route path="/home/winspeak/analysis" element={<WinSpeakAnalysis />} />
            <Route path="/home/profile/badges" element={<BadgesGallery />} />
            <Route path="/home/notifications" element={<Notifications />} />
            <Route path="/home/winspeak/dimension/:id" element={<WinSpeakDimensionDetail />} />
            <Route path="/home/winspeak/tips" element={<WinSpeakTips />} />
            <Route path="/home/support" element={<Support />} />
            <Route path="/home/settings" element={<Settings />} />
            <Route path="/home/resume" element={<ResumeBuilder />} />
            <Route path="/home/90-day-plan" element={<NinetyDayPlan />} />
            <Route path="/home/90-day-plan/milestone/:milestoneId" element={<MilestoneDetail />} />
          </Route>

          {/* Full-screen flows — no sidebar intentional (IDE, course player) */}
          <Route
            element={
              <ProtectedRoute>
                <NavbarOnlyLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/judge0/:id" element={<Judge0SolvePage />} />
          </Route>

          {/* Academic LMS Routes with Academic Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AcademicLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/academic" element={<AcademicPortal />} />
            <Route path="/academic/admin" element={<AdminDashboard />} />
            
            {/* HOD Routes */}
            <Route path="/academic/hod" element={<HODDashboard />} />
            <Route path="/academic/hod/courses" element={<HODCourses />} />
            <Route path="/academic/hod/course/:courseId" element={<CourseDetail />} />
            <Route path="/academic/hod/course/:courseId/timeline" element={<TimelineKanban />} />
            <Route path="/academic/hod/course/:courseId/plan-options" element={<PlanGenerationOptions />} />
            <Route path="/academic/hod/course/:courseId/generate-plan" element={<AutoPlanGenerator />} />
            <Route path="/academic/hod/course/:courseId/settings" element={<CourseSettings />} />
            <Route path="/academic/hod/faculty" element={<HODFaculty />} />
            <Route path="/academic/hod/students" element={<HODStudents />} />
            <Route path="/academic/hod/approvals" element={<HODApprovals />} />
            <Route path="/academic/hod/analytics" element={<HODAnalytics />} />
            <Route path="/academic/hod/calendar" element={<HODCalendar />} />
            <Route path="/academic/hod/reports" element={<HODReports />} />
            <Route path="/academic/hod/department" element={<HODDepartment />} />
            <Route path="/academic/hod/settings" element={<HODSettings />} />
            <Route path="/academic/hod/course/select-type" element={<ContentTypeSelector />} />
            <Route path="/academic/hod/course/create" element={<EnhancedCourseCreation />} />
            
            {/* Faculty Routes */}
            <Route path="/academic/faculty" element={<FacultyDashboard />} />
            <Route path="/academic/faculty/courses" element={<FacultyCourses />} />
            <Route path="/academic/faculty/course/:courseId" element={<CourseDetail />} />
            <Route path="/academic/faculty/course/:courseId/timeline" element={<FacultyTimelineEditor />} />
            <Route path="/academic/faculty/course/:courseId/review-plan" element={<FacultyReviewPlan />} />
            <Route path="/academic/faculty/lectures" element={<FacultyLectures />} />
            <Route path="/academic/faculty/lecture/:lectureId" element={<LectureDetail />} />
            <Route path="/academic/faculty/lecture/:lectureId/generate-resources" element={<ResourceGenerator />} />
            <Route path="/academic/faculty/lecture/:lectureId/resource/:resourceType" element={<ResourceReviewPanel />} />
            <Route path="/academic/faculty/course/:courseId/topic-view" element={<TopicView />} />
            <Route path="/academic/faculty/topic/:topicId/resources" element={<StitchedResources />} />
            <Route path="/academic/faculty/topic/:topicId/flashcards" element={<TopicFlashcards />} />
            <Route path="/academic/faculty/quiz/create-comprehensive" element={<ComprehensiveQuizBuilder />} />
            <Route path="/academic/faculty/resources" element={<FacultyResources />} />
            <Route path="/academic/faculty/resource/:resourceId/view" element={<ResourceReviewPanel />} />
            <Route path="/academic/faculty/quizzes" element={<FacultyQuizzes />} />
            <Route path="/academic/faculty/quiz/create" element={<EnhancedQuizBuilder />} />
            <Route path="/academic/faculty/quiz/create-basic" element={<QuizBuilder />} />
            <Route path="/academic/faculty/quiz/:quizId/edit" element={<EnhancedQuizBuilder />} />
            <Route path="/academic/faculty/quiz/:quizId/results" element={<QuizBuilder />} />
            <Route path="/academic/faculty/attendance" element={<FacultyAttendance />} />
            <Route path="/academic/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/academic/faculty/doubts" element={<FacultyDoubts />} />
            <Route path="/academic/faculty/settings" element={<FacultySettings />} />
            
            <Route path="/academic/student" element={<StudentDashboard />} />
          </Route>

          {/* Revision + Skill lesson (no main sidebar — has own sidebar) */}
          <Route
            element={
              <ProtectedRoute>
                <CourseLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home/90-day-plan/revision" element={<RevisionCourse />} />
            <Route path="/home/90-day-plan/revision/:skillSlug" element={<SkillLesson />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
