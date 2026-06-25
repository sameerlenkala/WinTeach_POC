import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCourses, mockSemesters } from '../../data/mockAcademicData';

export default function HODCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');

  const departmentCourses = mockCourses.filter(c => c.departmentId === 'dept-1');

  // Get unique values for filters
  const uniqueFaculty = Array.from(new Set(departmentCourses.map(c => c.primaryFacultyName)));
  const uniqueSemesters = Array.from(
    new Set(
      departmentCourses.map(c => {
        const sem = mockSemesters.find(s => s.id === c.semesterId);
        return sem ? sem.semesterNumber : 1;
      })
    )
  );

  // Apply filters
  const filteredCourses = departmentCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    
    const courseSem = mockSemesters.find(s => s.id === course.semesterId);
    const courseSemNum = courseSem ? courseSem.semesterNumber.toString() : '1';
    const matchesSemester = selectedSemester === 'all' || courseSemNum === selectedSemester;
    const matchesFaculty = selectedFaculty === 'all' || course.primaryFacultyName === selectedFaculty;

    return matchesSearch && matchesStatus && matchesSemester && matchesFaculty;
  });

  const activeFiltersCount = [selectedStatus, selectedSemester, selectedFaculty].filter(f => f !== 'all').length;

  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedSemester('all');
    setSelectedFaculty('all');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Courses</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage department courses</p>
        </div>
        <Link to="/academic/hod/course/select-type">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[9px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <label className="block text-xs font-medium mb-2">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="all">All Semesters</option>
                  {uniqueSemesters.sort((a, b) => a - b).map(sem => (
                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Faculty Filter */}
              <div>
                <label className="block text-xs font-medium mb-2">Faculty</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="all">All Faculty</option>
                  {uniqueFaculty.sort().map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Showing <strong>{filteredCourses.length}</strong> of <strong>{departmentCourses.length}</strong> courses
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCourses.map((course) => (
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Faculty</p>
                    <p className="font-medium text-sm">{course.primaryFacultyName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Section</p>
                    <p className="font-medium text-sm">{course.section}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Students</p>
                    <p className="font-medium text-sm">{course.enrolledStudents}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Coverage</p>
                    <p className="font-medium text-sm">{course.coveragePercentage}%</p>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${course.coveragePercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${course.coveragePercentage}%` }}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/academic/hod/course/${course.id}`)}>
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => navigate(`/academic/hod/course/${course.id}/timeline`)}>
                    Timeline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">No courses found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
