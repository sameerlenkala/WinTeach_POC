import { useState } from 'react';
import { Plus, Search, Mail, Phone, BookOpen, TrendingUp, CheckCircle, AlertCircle, BarChart3, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockFaculty } from '../../data/mockAcademicData';

export default function HODFaculty() {
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  // Mock course completion data for each faculty
  const facultyPerformance = {
    'fac-1': {
      courses: [
        { id: 'course-1', name: 'Data Structures', completion: 65, topicsCovered: 5, totalTopics: 9, attendance: 92 },
        { id: 'course-3', name: 'Operating Systems', completion: 0, topicsCovered: 0, totalTopics: 8, attendance: 0 },
      ],
      avgCompletion: 32.5,
      avgTopicCoverage: 27.8,
      avgAttendance: 46,
    },
    'fac-2': {
      courses: [
        { id: 'course-1', name: 'Data Structures (Co-Faculty)', completion: 65, topicsCovered: 5, totalTopics: 9, attendance: 92 },
      ],
      avgCompletion: 65,
      avgTopicCoverage: 55.6,
      avgAttendance: 92,
    },
    'fac-3': {
      courses: [
        { id: 'course-2', name: 'Database Management', completion: 72, topicsCovered: 6, totalTopics: 8, attendance: 88 },
      ],
      avgCompletion: 72,
      avgTopicCoverage: 75,
      avgAttendance: 88,
    },
    'fac-4': {
      courses: [],
      avgCompletion: 0,
      avgTopicCoverage: 0,
      avgAttendance: 0,
    },
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 75) return 'text-green-600';
    if (value >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (value: number) => {
    if (value >= 75) return 'success';
    if (value >= 50) return 'warning';
    return 'destructive';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Faculty Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage faculty members and monitor course completion & topic coverage
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search faculty..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Faculty List with Performance Dashboards */}
      <div className="space-y-3">
        {mockFaculty.map((faculty) => {
          const performance = facultyPerformance[faculty.id as keyof typeof facultyPerformance];
          const isExpanded = selectedFaculty === faculty.id;

          return (
            <Card key={faculty.id}>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Faculty Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold font-[family-name:var(--font-heading)] shrink-0">
                      {faculty.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                            {faculty.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{faculty.designation}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{faculty.courses.length} Courses</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground truncate">{faculty.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{faculty.phone}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Specialization: </span>
                          <span className="font-medium">{faculty.specialization}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  {performance.courses.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Course Completion</span>
                        </div>
                        <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getPerformanceColor(performance.avgCompletion)}`}>
                          {Math.round(performance.avgCompletion)}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Topic Coverage</span>
                        </div>
                        <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getPerformanceColor(performance.avgTopicCoverage)}`}>
                          {Math.round(performance.avgTopicCoverage)}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Attendance</span>
                        </div>
                        <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getPerformanceColor(performance.avgAttendance)}`}>
                          {Math.round(performance.avgAttendance)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Course Details (Expandable) */}
                  {isExpanded && performance.courses.length > 0 && (
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                        Course-wise Performance
                      </h4>
                      {performance.courses.map((course) => (
                        <div key={course.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{course.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.topicsCovered} of {course.totalTopics} topics covered
                              </p>
                            </div>
                            <Badge variant={getPerformanceBadge(course.completion)} className="text-[10px]">
                              {course.completion}% Complete
                            </Badge>
                          </div>

                          {/* Progress Bars */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Course Completion</span>
                                <span className="font-medium">{course.completion}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    course.completion >= 75 ? 'bg-green-500' :
                                    course.completion >= 50 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${course.completion}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Topic Coverage</span>
                                <span className="font-medium">
                                  {Math.round((course.topicsCovered / course.totalTopics) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    (course.topicsCovered / course.totalTopics) * 100 >= 75 ? 'bg-green-500' :
                                    (course.topicsCovered / course.totalTopics) * 100 >= 50 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${(course.topicsCovered / course.totalTopics) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Attendance</span>
                                <span className="font-medium">{course.attendance}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    course.attendance >= 75 ? 'bg-green-500' :
                                    course.attendance >= 50 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${course.attendance}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Alerts */}
                          {(course.completion < 50 || course.attendance < 75) && (
                            <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                              <AlertCircle className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                              <div className="text-orange-900">
                                {course.completion < 50 && <p>• Course is behind schedule</p>}
                                {course.attendance < 75 && <p>• Low attendance rate</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">View Profile</Button>
                    <Button size="sm" variant="ghost">Assign Courses</Button>
                    {performance.courses.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFaculty(isExpanded ? null : faculty.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {isExpanded ? 'Hide' : 'View'} Performance
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs text-blue-900">
            <strong>Faculty Management:</strong> Monitor course completion rates, topic coverage progress, 
            and attendance for each faculty member. Faculty with completion below 50% or attendance below 75% 
            are highlighted for attention.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
