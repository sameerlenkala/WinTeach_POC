import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, CheckCircle, Clock, AlertCircle, Play, Users, Eye, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockCourses, mockLectures } from '../../data/mockAcademicData';

export default function FacultyDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);

  const myCourses = mockCourses.filter(c => c.primaryFacultyId === 'fac-1');
  const currentCourse = myCourses.find(c => c.id === selectedCourse) || myCourses[0];
  const courseLectures = mockLectures.filter(l => l.courseId === selectedCourse);

  const todayLectures = courseLectures.filter(l => l.date === new Date().toISOString().split('T')[0]);
  const pendingResources = courseLectures.filter(l => l.status === 'Completed' && !l.resourcesPublished).length;
  const pendingAttendance = courseLectures.filter(l => l.status === 'Completed' && !l.attendanceMarked).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-white">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold font-[family-name:var(--font-heading)]">
              AS
            </div>
            <div>
              <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Dr. Amit Singh</h1>
              <p className="text-xs opacity-75">Faculty • Computer Science</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-[family-name:var(--font-heading)]">{todayLectures.length}</span>
              <span className="opacity-70 text-xs">Today</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/25" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-orange-200 font-[family-name:var(--font-heading)]">{pendingResources + pendingAttendance}</span>
              <span className="opacity-70 text-xs">Pending</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/25" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-[family-name:var(--font-heading)]">{currentCourse.coveragePercentage}%</span>
              <span className="opacity-70 text-xs">Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          >
            {myCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name} (Section {course.section})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Today's Lectures", value: todayLectures.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Resources', value: pendingResources, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Attendance', value: pendingAttendance, icon: Users, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Coverage', value: `${currentCourse.coveragePercentage}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold font-[family-name:var(--font-heading)] truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/academic/faculty/lectures">
          <Card className="cursor-pointer hover:shadow-sm transition-all border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-[family-name:var(--font-heading)]">My Lectures</p>
                    <p className="text-[10px] text-muted-foreground">View all lectures</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/academic/faculty/courses">
          <Card className="cursor-pointer hover:shadow-sm transition-all border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-[family-name:var(--font-heading)]">My Courses</p>
                    <p className="text-[10px] text-muted-foreground">Manage courses</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/academic/faculty/course/${currentCourse.id}/timeline`}>
          <Card className="cursor-pointer hover:shadow-sm transition-all border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-[family-name:var(--font-heading)]">Timeline</p>
                    <p className="text-[10px] text-muted-foreground">Edit schedule</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator />
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                  Pending Plan Reviews
                </h3>
                <p className="text-xs text-muted-foreground">
                  Course plans waiting for your review and approval
                </p>
              </div>
            </div>
            <Badge variant="destructive" className="text-[10px]">
              1 Pending
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{currentCourse.code} - {currentCourse.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sent by Dr. Rajesh Kumar • 2 days ago
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">45 Lectures</Badge>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">90 Hours</Badge>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">9 Topics</Badge>
                  </div>
                </div>
                <Link to={`/academic/faculty/course/${currentCourse.id}/review-plan`}>
                  <Button size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Review Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Content */}
      <div className="space-y-6">
          {/* Today's Schedule */}
          <section>
            <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-4">Today's Schedule</h2>
            {todayLectures.length > 0 ? (
              <div className="space-y-3">
                {todayLectures.map((lecture) => (
                  <Card key={lecture.id} className="overflow-hidden" style={{ borderLeft: '3px solid #3B82F6' }}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-blue-50 text-blue-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{lecture.title}</h3>
                          <p className="text-xs text-muted-foreground">{lecture.time} • {lecture.duration} min</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => alert('Start lecture functionality')}>
                        <Play className="h-3 w-3 mr-1" />
                        Start Lecture
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No lectures scheduled for today</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Pending Actions */}
          {(pendingResources > 0 || pendingAttendance > 0) && (
            <section>
              <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-4">Pending Actions</h2>
              <div className="space-y-3">
                {pendingResources > 0 && (
                  <Card className="overflow-hidden" style={{ borderLeft: '3px solid #F59E0B' }}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-orange-50 text-orange-600">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Publish Resources</h3>
                          <p className="text-xs text-muted-foreground">{pendingResources} lectures waiting</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert('Review resources functionality')}>Review</Button>
                    </CardContent>
                  </Card>
                )}
                {pendingAttendance > 0 && (
                  <Card className="overflow-hidden" style={{ borderLeft: '3px solid #EF4444' }}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-red-50 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Mark Attendance</h3>
                          <p className="text-xs text-muted-foreground">{pendingAttendance} lectures pending</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert('Mark attendance functionality')}>Mark Now</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Course Progress */}
          <section>
            <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-4">Course Progress</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Lectures Completed</span>
                  <span className="text-sm font-bold font-[family-name:var(--font-heading)]">
                    {currentCourse.completedLectures} / {currentCourse.totalLectures}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div
                    className="bg-primary h-3 rounded-full"
                    style={{ width: `${(currentCourse.completedLectures / currentCourse.totalLectures) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coverage: {currentCourse.coveragePercentage}%</span>
                  <Badge variant={currentCourse.coveragePercentage >= 70 ? 'success' : 'warning'}>
                    {currentCourse.coveragePercentage >= 70 ? 'On Track' : 'Behind Schedule'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
    </div>
  );
}
