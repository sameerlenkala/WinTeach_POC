import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, BookOpen, FileText, Target, CheckCircle, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCourses } from '../../data/mockAcademicData';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = mockCourses.find(c => c.id === courseId);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'outcomes' | 'mapping' | 'timeline'>('overview');

  if (!course) {
    return (
      <div className="p-6 lg:p-8">
        <p>Course not found</p>
      </div>
    );
  }

  // Mock PO/PSO data
  const programOutcomes = [
    { id: 'PO1', name: 'Engineering Knowledge' },
    { id: 'PO2', name: 'Problem Analysis' },
    { id: 'PO3', name: 'Design/Development of Solutions' },
    { id: 'PO4', name: 'Conduct Investigations' },
    { id: 'PO5', name: 'Modern Tool Usage' },
  ];

  const psoData = [
    { id: 'PSO1', name: 'Software Development' },
    { id: 'PSO2', name: 'System Design' },
  ];

  // Mock CO-PO mapping (1=Low, 2=Medium, 3=High)
  const coPoMapping = {
    'CO1': { 'PO1': 3, 'PO2': 2, 'PO3': 1, 'PO4': 0, 'PO5': 2, 'PSO1': 3, 'PSO2': 2 },
    'CO2': { 'PO1': 2, 'PO2': 3, 'PO3': 3, 'PO4': 2, 'PO5': 3, 'PSO1': 3, 'PSO2': 3 },
    'CO3': { 'PO1': 2, 'PO2': 3, 'PO3': 2, 'PO4': 3, 'PO5': 2, 'PSO1': 2, 'PSO2': 3 },
  };

  const getMappingColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 text-gray-400';
    if (value === 1) return 'bg-green-100 text-green-700';
    if (value === 2) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getMappingLabel = (value: number) => {
    if (value === 0) return '-';
    if (value === 1) return 'L';
    if (value === 2) return 'M';
    return 'H';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">{course.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{course.code} • {course.credits} Credits</p>
        </div>
        <Badge variant={course.status === 'Active' ? 'success' : 'secondary'}>
          {course.status}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => navigate(`/academic/hod/course/${courseId}/timeline`)}>
          <BookOpen className="h-4 w-4 mr-2" />
          View Timeline
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/academic/hod/course/${courseId}/settings`)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Type', value: course.type, icon: BookOpen, color: '#3B82F6' },
          { label: 'Section', value: course.section, icon: Users, color: '#10B981' },
          { label: 'Faculty', value: course.primaryFacultyName, icon: Users, color: '#8B5CF6' },
          { label: 'Coverage', value: `${course.coveragePercentage}%`, icon: CheckCircle, color: '#F59E0B' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: `${stat.color}12`, color: stat.color }}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/60">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'outcomes', label: 'Course Outcomes' },
          { id: 'mapping', label: 'CO-PO Mapping' },
          { id: 'timeline', label: 'Timeline' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Course Code</p>
                  <p className="text-sm font-medium">{course.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Course Name</p>
                  <p className="text-sm font-medium">{course.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Credits</p>
                  <p className="text-sm font-medium">{course.credits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium">{course.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="text-sm font-medium">Computer Science and Engineering</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Section</p>
                  <p className="text-sm font-medium">{course.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Faculty</p>
                  <p className="text-sm font-medium">{course.primaryFacultyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={course.status === 'Active' ? 'success' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Lectures Completed</span>
                    <span className="text-sm font-bold">{course.completedLectures} / {course.totalLectures}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${(course.completedLectures / course.totalLectures) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Coverage</span>
                    <span className="text-sm font-bold">{course.coveragePercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${course.coveragePercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${course.coveragePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'outcomes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Course Outcomes</h3>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3 mr-1" />
              Edit COs
            </Button>
          </div>
          {course.outcomes?.map((outcome) => (
            <Card key={outcome.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{outcome.code}</h4>
                      <Badge variant="outline" className="text-xs">{outcome.bloomLevel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{outcome.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">CO-PO/PSO Mapping Matrix</h3>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3 mr-1" />
              Edit Mapping
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">CO</th>
                    {programOutcomes.map(po => (
                      <th key={po.id} className="text-center p-2 font-semibold">{po.id}</th>
                    ))}
                    {psoData.map(pso => (
                      <th key={pso.id} className="text-center p-2 font-semibold">{pso.id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {course.outcomes?.map((outcome) => (
                    <tr key={outcome.id} className="border-b">
                      <td className="p-2 font-medium">{outcome.code}</td>
                      {programOutcomes.map(po => {
                        const mapping = coPoMapping[outcome.code as keyof typeof coPoMapping];
                        const value = mapping ? (mapping as Record<string, number>)[po.id] || 0 : 0;
                        return (
                          <td key={po.id} className="text-center p-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-semibold ${getMappingColor(value)}`}>
                              {getMappingLabel(value)}
                            </span>
                          </td>
                        );
                      })}
                      {psoData.map(pso => {
                        const mapping = coPoMapping[outcome.code as keyof typeof coPoMapping];
                        const value = mapping ? (mapping as Record<string, number>)[pso.id] || 0 : 0;
                        return (
                          <td key={pso.id} className="text-center p-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-semibold ${getMappingColor(value)}`}>
                              {getMappingLabel(value)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-red-100" />
                  <span>High (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-orange-100" />
                  <span>Medium (2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-green-100" />
                  <span>Low (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-gray-100" />
                  <span>None (0)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-3">Program Outcomes</h4>
              <div className="space-y-2">
                {programOutcomes.map(po => (
                  <div key={po.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">{po.id}</Badge>
                    <span className="text-muted-foreground">{po.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-base font-medium font-[family-name:var(--font-heading)] mb-2">Course Timeline</p>
            <p className="text-sm text-muted-foreground">View and manage lecture schedule</p>
            <Button className="mt-4" onClick={() => navigate('/academic/faculty/lectures')}>
              View Lectures
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
