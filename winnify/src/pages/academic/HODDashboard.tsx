import { BookOpen, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockCourses, mockFaculty } from '../../data/mockAcademicData';

export default function HODDashboard() {
  const departmentCourses = mockCourses.filter(c => c.departmentId === 'dept-1');
  const activeCourses = departmentCourses.filter(c => c.status === 'Active');
  const pendingApprovals = 2;
  const behindSchedule = departmentCourses.filter(c => c.coveragePercentage < 60).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-white">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold font-[family-name:var(--font-heading)]">
              RK
            </div>
            <div>
              <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Dr. Rajesh Kumar</h1>
              <p className="text-xs opacity-75">Head of Department • Computer Science</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-[family-name:var(--font-heading)]">{activeCourses.length}</span>
              <span className="opacity-70 text-xs">Active</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/25" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-orange-200 font-[family-name:var(--font-heading)]">{pendingApprovals}</span>
              <span className="opacity-70 text-xs">Pending</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/25" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-[family-name:var(--font-heading)]">{mockFaculty.length}</span>
              <span className="opacity-70 text-xs">Faculty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Courses', value: activeCourses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Faculty Members', value: mockFaculty.length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Approvals', value: pendingApprovals, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Behind Schedule', value: behindSchedule, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
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

      {/* Overview Content */}
      <div className="space-y-6">
          {/* Coverage Alerts */}
          <section>
            <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-4">Coverage Alerts</h2>
            <div className="space-y-3">
              {departmentCourses
                .filter(c => c.coveragePercentage < 70)
                .map((course) => (
                  <Card key={course.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-orange-50 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-0.5">{course.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Faculty: {course.primaryFacultyName} • Section: {course.section}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-orange-600 font-[family-name:var(--font-heading)]">{course.coveragePercentage}%</p>
                          <p className="text-[10px] text-muted-foreground">Coverage</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>

          {/* Department Analytics */}
          <section>
            <h2 className="text-base font-bold font-[family-name:var(--font-heading)] mb-4">Department Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Average Coverage', value: `${Math.round(departmentCourses.reduce((acc, c) => acc + c.coveragePercentage, 0) / departmentCourses.length)}%`, color: 'text-blue-600' },
                { label: 'Total Lectures', value: `${departmentCourses.reduce((acc, c) => acc + c.completedLectures, 0)}/${departmentCourses.reduce((acc, c) => acc + c.totalLectures, 0)}`, color: 'text-green-600' },
                { label: 'Faculty Utilization', value: '87%', color: 'text-purple-600' },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold font-[family-name:var(--font-heading)] ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
