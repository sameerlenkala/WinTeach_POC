import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Every page is code-split. The app spans five unrelated products (marketing
// site, student studio, legacy student app, faculty studio, admin consoles);
// statically importing them all meant a student on campus wifi downloaded the
// superadmin console and the video SDK before their first lesson could paint.
//
// Kept static: routing, auth, and the studio shell — the shell paints the dark
// phone canvas immediately, so studio routes stream in without a white flash.
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudioShell from './pages/studio/StudioShell';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const NavbarOnlyLayout = lazy(() => import('./layouts/NavbarOnlyLayout'));
const CourseLayout = lazy(() => import('./layouts/CourseLayout'));
const AcademicLayout = lazy(() => import('./layouts/AcademicLayout'));

const Landing = lazy(() => import('./pages/Landing'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const SignUpInvite = lazy(() => import('./pages/SignUpInvite'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Student Studio
const StudioLogin = lazy(() => import('./pages/studio/StudioLogin'));
const StudioSignup = lazy(() => import('./pages/studio/StudioSignup'));
const StudioHome = lazy(() => import('./pages/studio/StudioHome'));
const StudioCourse = lazy(() => import('./pages/studio/StudioCourse'));
const StudioTopic = lazy(() => import('./pages/studio/StudioTopic'));
const StudioLesson = lazy(() => import('./pages/studio/StudioLesson'));
const StudioRevision = lazy(() => import('./pages/studio/StudioRevision'));
const StudioMastery = lazy(() => import('./pages/studio/StudioMastery'));
const StudioPicker = lazy(() => import('./pages/studio/StudioPicker'));

// Shared content engines (used by studio, legacy student app and faculty)
const WinTeachCheatSheet = lazy(() => import('./pages/winteach/WinTeachCheatSheet'));
const WinTeachTopicArtifact = lazy(() => import('./pages/winteach/WinTeachTopicArtifact'));
const WinTeachConceptReader = lazy(() => import('./pages/winteach/WinTeachConceptReader'));

// Consoles
const SuperAdminLayout = lazy(() => import('./pages/superadmin/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminColleges = lazy(() => import('./pages/superadmin/SuperAdminColleges'));
const SuperAdminUsers = lazy(() => import('./pages/superadmin/SuperAdminUsers'));
const CollegeAdminLayout = lazy(() => import('./pages/collegeadmin/CollegeAdminLayout'));
const CollegeAdminDashboard = lazy(() => import('./pages/collegeadmin/CollegeAdminDashboard'));
const CollegeAdminUsers = lazy(() => import('./pages/collegeadmin/CollegeAdminUsers'));
const CollegeAdminCourses = lazy(() => import('./pages/collegeadmin/CollegeAdminCourses'));

// WinTeach console
const WinTeachLayout = lazy(() => import('./pages/winteach/WinTeachLayout'));
const WinTeachDashboard = lazy(() => import('./pages/winteach/WinTeachDashboard'));
const WinTeachCourses = lazy(() => import('./pages/winteach/WinTeachCourses'));
const WinTeachCreateCourse = lazy(() => import('./pages/winteach/WinTeachCreateCourse'));
const WinTeachCoursePage = lazy(() => import('./pages/winteach/WinTeachCoursePage'));
const WinTeachGenerate = lazy(() => import('./pages/winteach/WinTeachGenerate'));
const WinTeachGeneration = lazy(() => import('./pages/winteach/WinTeachGeneration'));
const WinTeachMaterialsPage = lazy(() => import('./pages/winteach/WinTeachMaterialsPage'));
const WinTeachAddLibrary = lazy(() => import('./pages/winteach/WinTeachAddLibrary'));
const WinTeachInstitutes = lazy(() => import('./pages/winteach/WinTeachInstitutes'));
const WinTeachSettings = lazy(() => import('./pages/winteach/WinTeachSettings'));
const StaffAccount = lazy(() => import('./pages/account/StaffAccount'));

// Legacy student app (/home/*)
const Home = lazy(() => import('./pages/Home'));
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'));
const StudentCourseTopics = lazy(() => import('./pages/student/StudentCourseTopics'));
const StudentTopic = lazy(() => import('./pages/student/StudentTopic'));
const StudentRevision = lazy(() => import('./pages/student/StudentRevision'));
const StudentMastery = lazy(() => import('./pages/student/StudentMastery'));
const Judge0Page = lazy(() => import('./pages/Judge0Page'));
const Judge0SolvePage = lazy(() => import('./pages/Judge0SolvePage'));
const DailyCoPage = lazy(() => import('./pages/DailyCoPage'));
const Drives = lazy(() => import('./pages/Drives'));
const DriveDetail = lazy(() => import('./pages/DriveDetail'));
const Journey = lazy(() => import('./pages/Journey'));
const Assessments = lazy(() => import('./pages/Assessments'));
const Mocktest = lazy(() => import('./pages/Mocktest'));
const Courses = lazy(() => import('./pages/Courses'));
const Learning = lazy(() => import('./pages/Learning'));
const Profile = lazy(() => import('./pages/Profile'));
const NinetyDayPlan = lazy(() => import('./pages/NinetyDayPlan'));
const AptitudeTests = lazy(() => import('./pages/AptitudeTests'));
const TechnicalTests = lazy(() => import('./pages/TechnicalTests'));
const CompanyOA = lazy(() => import('./pages/CompanyOA'));
const AIChat = lazy(() => import('./pages/AIChat'));
const RevisionCourse = lazy(() => import('./pages/RevisionCourse'));
const SkillLesson = lazy(() => import('./pages/SkillLesson'));
const MilestoneDetail = lazy(() => import('./pages/MilestoneDetail'));
const TestConfig = lazy(() => import('./pages/TestConfig'));
const TestBriefing = lazy(() => import('./pages/TestBriefing'));
const TestTaking = lazy(() => import('./pages/TestTaking'));
const TestResults = lazy(() => import('./pages/TestResults'));
const BadgesGallery = lazy(() => import('./pages/BadgesGallery'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Support = lazy(() => import('./pages/Support'));
const Settings = lazy(() => import('./pages/Settings'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));

// WinSpeak
const WinSpeak = lazy(() => import('./pages/WinSpeak'));
const WinSpeakChallenge = lazy(() => import('./pages/WinSpeakChallenge'));
const WinSpeakLeaderboard = lazy(() => import('./pages/WinSpeakLeaderboard'));
const WinSpeakPractice = lazy(() => import('./pages/WinSpeakPractice'));
const WinSpeakRecording = lazy(() => import('./pages/WinSpeakRecording'));
const WinSpeakReport = lazy(() => import('./pages/WinSpeakReport'));
const WinSpeakPracticeSetup = lazy(() => import('./pages/WinSpeakPracticeSetup'));
const WinSpeakPracticeRecording = lazy(() => import('./pages/WinSpeakPracticeRecording'));
const WinSpeakPracticeReport = lazy(() => import('./pages/WinSpeakPracticeReport'));
const WinSpeakScoreDashboard = lazy(() => import('./pages/WinSpeakScoreDashboard'));
const WinSpeakAnalysis = lazy(() => import('./pages/WinSpeakAnalysis'));
const WinSpeakDimensionDetail = lazy(() => import('./pages/WinSpeakDimensionDetail'));
const WinSpeakTips = lazy(() => import('./pages/WinSpeakTips'));
const WinSpeakPracticeHistory = lazy(() => import('./pages/WinSpeakPracticeHistory'));
const WinSpeakChallengeDetail = lazy(() => import('./pages/WinSpeakChallengeDetail'));

// Academic LMS
const AcademicPortal = lazy(() => import('./pages/academic/AcademicPortal'));
const AdminDashboard = lazy(() => import('./pages/academic/AdminDashboard'));
const HODDashboard = lazy(() => import('./pages/academic/HODDashboard'));
const HODCourses = lazy(() => import('./pages/academic/HODCourses'));
const HODFaculty = lazy(() => import('./pages/academic/HODFaculty'));
const HODStudents = lazy(() => import('./pages/academic/HODStudents'));
const HODApprovals = lazy(() => import('./pages/academic/HODApprovals'));
const HODAnalytics = lazy(() => import('./pages/academic/HODAnalytics'));
const HODCalendar = lazy(() => import('./pages/academic/HODCalendar'));
const HODReports = lazy(() => import('./pages/academic/HODReports'));
const HODDepartment = lazy(() => import('./pages/academic/HODDepartment'));
const HODSettings = lazy(() => import('./pages/academic/HODSettings'));
const FacultyDashboard = lazy(() => import('./pages/academic/FacultyDashboard'));
const FacultyCourses = lazy(() => import('./pages/academic/FacultyCourses'));
const FacultyLectures = lazy(() => import('./pages/academic/FacultyLectures'));
const FacultyResources = lazy(() => import('./pages/academic/FacultyResources'));
const FacultyQuizzes = lazy(() => import('./pages/academic/FacultyQuizzes'));
const FacultyAttendance = lazy(() => import('./pages/academic/FacultyAttendance'));
const FacultyAnalytics = lazy(() => import('./pages/academic/FacultyAnalytics'));
const FacultyDoubts = lazy(() => import('./pages/academic/FacultyDoubts'));
const FacultySettings = lazy(() => import('./pages/academic/FacultySettings'));
const LectureDetail = lazy(() => import('./pages/academic/LectureDetail'));
const QuizBuilder = lazy(() => import('./pages/academic/QuizBuilder'));
const CourseDetail = lazy(() => import('./pages/academic/CourseDetail'));
const StudentDashboard = lazy(() => import('./pages/academic/StudentDashboard'));
const ContentTypeSelector = lazy(() => import('./pages/academic/ContentTypeSelector'));
const EnhancedCourseCreation = lazy(() => import('./pages/academic/EnhancedCourseCreation'));
const TimelineKanban = lazy(() => import('./pages/academic/TimelineKanban'));
const EnhancedQuizBuilder = lazy(() => import('./pages/academic/EnhancedQuizBuilder'));
const PlanGenerationOptions = lazy(() => import('./pages/academic/PlanGenerationOptions'));
const AutoPlanGenerator = lazy(() => import('./pages/academic/AutoPlanGenerator'));
const FacultyTimelineEditor = lazy(() => import('./pages/academic/FacultyTimelineEditor'));
const FacultyReviewPlan = lazy(() => import('./pages/academic/FacultyReviewPlan'));
const CourseSettings = lazy(() => import('./pages/academic/CourseSettings'));
const ResourceGenerator = lazy(() => import('./pages/academic/ResourceGenerator'));
const ResourceReviewPanel = lazy(() => import('./pages/academic/ResourceReviewPanel'));
const TopicView = lazy(() => import('./pages/academic/TopicView'));
const StitchedResources = lazy(() => import('./pages/academic/StitchedResources'));
const TopicFlashcards = lazy(() => import('./pages/academic/TopicFlashcards'));
const ComprehensiveQuizBuilder = lazy(() => import('./pages/academic/ComprehensiveQuizBuilder'));

// Staff consoles (WinTeach / SuperAdmin / CollegeAdmin) are never shown to
// students or logged-out visitors: students bounce to their studio, everyone
// else to sign-in. Non-student roles keep free navigation between consoles
// (useful in dev/demo flows).
function StaffOnly({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading && !user) return null;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (user?.role === 'student') return <Navigate to="/study" replace />;
  return <>{children}</>;
}

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
        {/* No visible fallback: chunks resolve in a frame or two on a warm
            connection, and a spinner that flashes reads worse than nothing.
            Route shells (studio canvas, dashboard chrome) paint underneath. */}
        <Suspense fallback={null}>
          <Routes>
          {/* OAuth callback — must be public, no layout */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Marketing landing + auth — standalone, winnify.ai-themed, no app chrome */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Legacy academic demo login — orphaned surface, folded into /signin */}
          <Route path="/academic/login" element={<Navigate to="/signin" replace />} />

          {/* WinTeach Student Studio — mobile-only learning studio (courses).
              Content pages reuse the shared reader/artifact engines re-skinned
              by the .studio-content variable scope (see studio.css). */}
          <Route path="/study/login" element={<StudioLogin />} />
          <Route path="/study/signup" element={<StudioSignup />} />
          <Route path="/study" element={<StudioShell />}>
            <Route index element={<StudioHome />} />
            {/* Tab-bar destinations: resolve to the right course, or pick one */}
            <Route path="revise" element={<StudioPicker mode="revision" />} />
            <Route path="progress" element={<StudioPicker mode="mastery" />} />
            <Route path="courses/:id" element={<StudioCourse />} />
            <Route path="courses/:id/revision" element={<StudioRevision />} />
            <Route path="courses/:id/mastery" element={<StudioMastery />} />
            <Route path="courses/:id/topic/:topicId" element={<StudioTopic />} />
            <Route path="courses/:id/topic/:topicId/cheatsheet" element={<div className="studio-content"><WinTeachCheatSheet student /></div>} />
            <Route path="courses/:id/topic/:topicId/artifact/:type" element={<div className="studio-content"><WinTeachTopicArtifact student /></div>} />
            <Route path="courses/:id/topic/:topicId/notes/:conceptId" element={<StudioLesson type="student_notes" />} />
            <Route path="courses/:id/topic/:topicId/slides/:conceptId" element={<StudioLesson type="slides" />} />
            <Route path="courses/:id/topic/:topicId/quiz/:conceptId" element={<StudioLesson type="quiz" />} />
          </Route>

          {/* SuperAdmin Console */}
          <Route path="/superadmin" element={<StaffOnly><SuperAdminLayout /></StaffOnly>}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="colleges" element={<SuperAdminColleges />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="stats" element={<ComingSoon title="Analytics" />} />
            <Route path="announcements" element={<ComingSoon title="Announcements" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* College Admin Console */}
          <Route path="/admin" element={<StaffOnly><CollegeAdminLayout /></StaffOnly>}>
            <Route index element={<CollegeAdminDashboard />} />
            <Route path="users" element={<CollegeAdminUsers />} />
            <Route path="courses" element={<CollegeAdminCourses />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* WinTeach Console */}
          <Route path="/winteach" element={<StaffOnly><WinTeachLayout /></StaffOnly>}>
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
            <Route path="courses/:id/topic/:topicId/cheatsheet" element={<WinTeachCheatSheet />} />
            <Route path="courses/:id/topic/:topicId/artifact/:type" element={<WinTeachTopicArtifact />} />
            <Route path="generation" element={<WinTeachGeneration />} />
            <Route path="materials" element={<WinTeachMaterialsPage />} />
            <Route path="add-library" element={<WinTeachAddLibrary />} />
            <Route path="institutes" element={<WinTeachInstitutes />} />
            <Route path="settings" element={<WinTeachSettings />} />
            <Route path="account" element={<StaffAccount />} />
          </Route>

          {/* Public routes still using the app shell (navbar/footer) */}
          <Route element={<PublicLayout />}>
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
            <Route path="/home/courses/:id/topic/:topicId" element={<StudentTopic />} />
            <Route path="/home/courses/:id/topic/:topicId/cheatsheet" element={<div className="wt-pro"><WinTeachCheatSheet student /></div>} />
            <Route path="/home/courses/:id/topic/:topicId/artifact/:type" element={<div className="wt-pro"><WinTeachTopicArtifact student /></div>} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
