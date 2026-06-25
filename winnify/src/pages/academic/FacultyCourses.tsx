import { BookOpen, Users, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCourses } from '../../data/mockAcademicData';

export default function FacultyCourses() {
  const myCourses = mockCourses.filter(c => c.primaryFacultyId === 'fac-1');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">My Courses</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Courses you are teaching</p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {myCourses.map((course) => (
          <Card key={course.id} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{course.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{course.code}</p>
                  </div>
                </div>
                <Badge variant={course.status === 'Active' ? 'success' : 'secondary'} className="text-[10px]">
                  {course.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Section</p>
                    <p className="font-medium text-sm">{course.section}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Students</p>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolledStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Lectures</p>
                    <p className="font-medium text-sm">{course.completedLectures}/{course.totalLectures}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-semibold">{course.coveragePercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${course.coveragePercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${course.coveragePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link to={`/academic/faculty/course/${course.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">View Details</Button>
                  </Link>
                  <Link to={`/academic/faculty/course/${course.id}/timeline`} className="flex-1">
                    <Button size="sm" variant="ghost" className="w-full">
                      <GitBranch className="h-3 w-3 mr-1" />
                      Timeline
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
