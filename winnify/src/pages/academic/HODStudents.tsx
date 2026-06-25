import { useState } from 'react';
import { Search, Filter, Download, Upload, UserPlus, MoreVertical, Mail, Phone, BookOpen, TrendingUp, AlertCircle, CheckCircle, HelpCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  section: string;
  semester: number;
  enrolledCourses: number;
  attendance: number;
  cgpa: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  quizzes: {
    total: number;
    completed: number;
    pending: number;
    avgScore: number;
  };
}

export default function HODStudents() {
  // Mock student data with quiz completion
  const [students] = useState<Student[]>([
    {
      id: 'stu-1',
      rollNo: '22CS101',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@student.edu',
      phone: '+91 98765 11111',
      section: 'A',
      semester: 5,
      enrolledCourses: 6,
      attendance: 92,
      cgpa: 8.5,
      status: 'Active',
      quizzes: { total: 12, completed: 10, pending: 2, avgScore: 85 },
    },
    {
      id: 'stu-2',
      rollNo: '22CS102',
      name: 'Priya Sharma',
      email: 'priya.sharma@student.edu',
      phone: '+91 98765 22222',
      section: 'A',
      semester: 5,
      enrolledCourses: 6,
      attendance: 88,
      cgpa: 9.2,
      status: 'Active',
      quizzes: { total: 12, completed: 12, pending: 0, avgScore: 92 },
    },
    {
      id: 'stu-3',
      rollNo: '22CS103',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@student.edu',
      phone: '+91 98765 33333',
      section: 'A',
      semester: 5,
      enrolledCourses: 6,
      attendance: 75,
      cgpa: 7.8,
      status: 'Active',
      quizzes: { total: 12, completed: 8, pending: 4, avgScore: 72 },
    },
    {
      id: 'stu-4',
      rollNo: '22CS104',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@student.edu',
      phone: '+91 98765 44444',
      section: 'A',
      semester: 5,
      enrolledCourses: 6,
      attendance: 65,
      cgpa: 7.2,
      status: 'Active',
      quizzes: { total: 12, completed: 6, pending: 6, avgScore: 65 },
    },
    {
      id: 'stu-5',
      rollNo: '22CS105',
      name: 'Amit Patel',
      email: 'amit.patel@student.edu',
      phone: '+91 98765 55555',
      section: 'B',
      semester: 5,
      enrolledCourses: 6,
      attendance: 95,
      cgpa: 8.9,
      status: 'Active',
      quizzes: { total: 12, completed: 11, pending: 1, avgScore: 88 },
    },
    {
      id: 'stu-6',
      rollNo: '22CS201',
      name: 'Vikram Singh',
      email: 'vikram.singh@student.edu',
      phone: '+91 98765 66666',
      section: 'B',
      semester: 5,
      enrolledCourses: 6,
      attendance: 82,
      cgpa: 8.1,
      status: 'Active',
      quizzes: { total: 12, completed: 9, pending: 3, avgScore: 78 },
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    return matchesSearch && matchesSection && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    avgAttendance: Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length),
    avgCGPA: (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2),
    lowAttendance: students.filter(s => s.attendance < 75).length,
    avgQuizCompletion: Math.round(
      students.reduce((sum, s) => sum + (s.quizzes.completed / s.quizzes.total) * 100, 0) / students.length
    ),
    pendingQuizzes: students.reduce((sum, s) => sum + s.quizzes.pending, 0),
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 85) return 'text-green-600';
    if (attendance >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCGPAColor = (cgpa: number) => {
    if (cgpa >= 8.5) return 'text-green-600';
    if (cgpa >= 7.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQuizCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-600';
    if (completion >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Student Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage student enrollments, track performance, and monitor quiz completion
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => alert('Downloading student data...')}>
            <Download className="h-3.5 w-3.5 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert('Upload student data...')}>
            <Upload className="h-3.5 w-3.5 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => alert('Add new student...')}>
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Attend.</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-blue-600">{stats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg CGPA</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-purple-600">{stats.avgCGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Quiz Compl.</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-green-600">{stats.avgQuizCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-orange-600">{stats.pendingQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Low Attend.</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-red-600">{stats.lowAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, roll number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List with Quiz Coverage */}
      <div className="space-y-3">
        {filteredStudents.map((student) => {
          const quizCompletion = Math.round((student.quizzes.completed / student.quizzes.total) * 100);
          const isExpanded = expandedStudent === student.id;

          return (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Student Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-semibold">{student.rollNo}</p>
                        <p className="text-base font-semibold">{student.name}</p>
                        <Badge variant="secondary">{student.section}</Badge>
                        <Badge variant={student.status === 'Active' ? 'success' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </span>
                        <span>Sem {student.semester}</span>
                        <span>{student.enrolledCourses} courses</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="grid grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Attendance</p>
                      <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">CGPA</p>
                      <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getCGPAColor(student.cgpa)}`}>
                        {student.cgpa}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Quiz Completion</p>
                      <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getQuizCompletionColor(quizCompletion)}`}>
                        {quizCompletion}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Avg Quiz Score</p>
                      <p className={`text-xl font-bold font-[family-name:var(--font-heading)] ${getScoreColor(student.quizzes.avgScore)}`}>
                        {student.quizzes.avgScore}%
                      </p>
                    </div>
                  </div>

                  {/* Quiz Details (Expandable) */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                        Quiz Completion Coverage
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-[10px] text-green-900 font-medium uppercase tracking-wide">Completed</span>
                          </div>
                          <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-green-600">{student.quizzes.completed}</p>
                          <p className="text-[10px] text-green-700">out of {student.quizzes.total} quizzes</p>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <HelpCircle className="h-3.5 w-3.5 text-orange-600" />
                            <span className="text-[10px] text-orange-900 font-medium uppercase tracking-wide">Pending</span>
                          </div>
                          <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-orange-600">{student.quizzes.pending}</p>
                          <p className="text-[10px] text-orange-700">quizzes remaining</p>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-[10px] text-blue-900 font-medium uppercase tracking-wide">Average Score</span>
                          </div>
                          <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-blue-600">{student.quizzes.avgScore}%</p>
                          <p className="text-[10px] text-blue-700">across all quizzes</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground uppercase tracking-wide">Quiz Completion Progress</span>
                          <span className="font-semibold">{quizCompletion}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              quizCompletion >= 80 ? 'bg-green-500' :
                              quizCompletion >= 60 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${quizCompletion}%` }}
                          />
                        </div>
                      </div>

                      {/* Alerts */}
                      {(student.quizzes.pending > 3 || student.quizzes.avgScore < 60) && (
                        <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-[10px]">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                          <div className="text-orange-900">
                            {student.quizzes.pending > 3 && <p>• Multiple pending quizzes ({student.quizzes.pending})</p>}
                            {student.quizzes.avgScore < 60 && <p>• Low average quiz score ({student.quizzes.avgScore}%)</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`View details for ${student.name}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {isExpanded ? 'Hide' : 'View'} Quiz Coverage
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`More options for ${student.name}`)}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-muted-foreground">No students found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>Student Management:</strong> Track student enrollments, monitor attendance, 
            view academic performance, and track quiz completion coverage. Students with attendance below 75%, 
            multiple pending quizzes, or low quiz scores are highlighted for attention.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
