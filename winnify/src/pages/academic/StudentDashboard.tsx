import { useState } from 'react';
import { BookOpen, Trophy, TrendingUp, Clock, Download, Play } from 'lucide-react';
import { mockCourses, mockLectures, mockQuizzes, mockResources } from '../../data/mockAcademicData';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'quizzes' | 'performance'>('overview');
  const [selectedCourse, setSelectedCourse] = useState('course-1');

  const enrolledCourses = mockCourses.filter(c => ['course-1', 'course-2'].includes(c.id));
  const currentCourse = enrolledCourses.find(c => c.id === selectedCourse) || enrolledCourses[0];
  const courseLectures = mockLectures.filter(l => l.courseId === selectedCourse);
  const courseQuizzes = mockQuizzes.filter(q => q.courseId === selectedCourse);
  const completedLectures = courseLectures.filter(l => l.status === 'Completed');

  const stats = [
    {
      label: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Quizzes',
      value: courseQuizzes.filter(q => q.status === 'Live').length,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Average Score',
      value: '85%',
      icon: Trophy,
      color: 'bg-green-500',
    },
    {
      label: 'Attendance',
      value: '92%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Arjun Reddy • 22CS101 • CSE Section A</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'courses', label: 'My Courses' },
                { id: 'quizzes', label: 'Quizzes' },
                { id: 'performance', label: 'Performance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Upcoming Quizzes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Quizzes</h3>
                  <div className="space-y-3">
                    {courseQuizzes
                      .filter(q => q.status === 'Live')
                      .map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                              <p className="text-xs text-gray-600">
                                Due: {new Date(quiz.deadline).toLocaleDateString()} • {quiz.duration} min • {quiz.totalMarks} marks
                              </p>
                            </div>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                            <Play className="w-4 h-4" />
                            Take Quiz
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Lectures */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lectures</h3>
                  <div className="space-y-3">
                    {completedLectures.slice(0, 3).map((lecture) => {
                      const lectureResources = mockResources.filter(r => r.lectureId === lecture.id);
                      return (
                        <div key={lecture.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">{lecture.title}</h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {new Date(lecture.date).toLocaleDateString()} • {lecture.time}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {lecture.topics.map((topic, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                              {lectureResources.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {lectureResources.map((resource) => (
                                    <button
                                      key={resource.id}
                                      className="flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                                    >
                                      <Download className="w-3 h-3" />
                                      {resource.type}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Course Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">{course.name}</h4>
                          <span className="text-sm font-semibold text-gray-900">{course.coveragePercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.coveragePercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{course.completedLectures} / {course.totalLectures} lectures</span>
                          <span>Faculty: {course.primaryFacultyName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {enrolledCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{currentCourse.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Code</p>
                      <p className="font-medium text-gray-900">{currentCourse.code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credits</p>
                      <p className="font-medium text-gray-900">{currentCourse.credits}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Faculty</p>
                      <p className="font-medium text-gray-900">{currentCourse.primaryFacultyName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{currentCourse.type}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Course Progress</span>
                      <span className="font-semibold text-gray-900">{currentCourse.coveragePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${currentCourse.coveragePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecture Timeline</h3>
                <div className="space-y-4">
                  {courseLectures.map((lecture) => {
                    const lectureResources = mockResources.filter(r => r.lectureId === lecture.id);
                    return (
                      <div key={lecture.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{lecture.title}</h4>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  lecture.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : lecture.status === 'Planned'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {lecture.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {new Date(lecture.date).toLocaleDateString()} • {lecture.time} • {lecture.duration} min
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {lecture.topics.map((topic, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {lecture.status === 'Completed' && lectureResources.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Resources:</p>
                            <div className="flex flex-wrap gap-2">
                              {lectureResources.map((resource) => (
                                <button
                                  key={resource.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="text-sm">{resource.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {lecture.status === 'Planned' && (
                          <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                            Resources will be available after the lecture is completed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quizzes</h3>
                <div className="space-y-4">
                  {courseQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                quiz.status === 'Live'
                                  ? 'bg-green-100 text-green-800'
                                  : quiz.status === 'Completed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {quiz.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-500">Questions</p>
                              <p className="font-medium text-gray-900">{quiz.totalQuestions}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Marks</p>
                              <p className="font-medium text-gray-900">{quiz.totalMarks}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Duration</p>
                              <p className="font-medium text-gray-900">{quiz.duration} min</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Deadline</p>
                              <p className="font-medium text-gray-900">
                                {new Date(quiz.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {quiz.topics.map((topic, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          {quiz.status === 'Live' && (
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                              Take Quiz
                            </button>
                          )}
                          {quiz.status === 'Completed' && (
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Average Quiz Score</p>
                      <p className="text-3xl font-bold text-gray-900">85%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
                      <p className="text-3xl font-bold text-gray-900">92%</p>
                      <p className="text-xs text-green-600 mt-1">Above average</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Course Completion</p>
                      <p className="text-3xl font-bold text-gray-900">68%</p>
                      <p className="text-xs text-blue-600 mt-1">On track</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Performance</h3>
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">{course.name}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Quiz Average</p>
                            <p className="text-xl font-bold text-gray-900">{Math.floor(Math.random() * 20 + 75)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Attendance</p>
                            <p className="text-xl font-bold text-gray-900">{Math.floor(Math.random() * 15 + 85)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Progress</p>
                            <p className="text-xl font-bold text-gray-900">{course.coveragePercentage}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
