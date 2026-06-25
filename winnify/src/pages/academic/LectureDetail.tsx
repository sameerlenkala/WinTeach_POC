import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, CheckCircle, Clock, Users, FileText, AlertTriangle, ArrowLeft, Wand2, Presentation, BookOpen, HelpCircle, FolderPlus, Eye, Upload, Plus, X, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockLectures, mockCourses, mockEnrolledStudents } from '../../data/mockAcademicData';

export default function LectureDetail() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const lecture = mockLectures.find(l => l.id === lectureId);
  const course = lecture ? mockCourses.find(c => c.id === lecture.courseId) : null;
  const enrolledStudents = course ? (mockEnrolledStudents[course.id as keyof typeof mockEnrolledStudents] || []) : [];
  
  const [lectureStatus, setLectureStatus] = useState(lecture?.status || 'Planned');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [coveragePercentage, setCoveragePercentage] = useState(lecture?.coveragePercentage || 0);
  const [topicCoverage, setTopicCoverage] = useState<Record<string, number>>(
    lecture?.topics.reduce((acc, topic) => ({ ...acc, [topic]: 0 }), {}) || {}
  );
  const [notes, setNotes] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(
    enrolledStudents.reduce((acc: Record<string, 'Present' | 'Absent' | 'Late'>, student: { studentId: string }) => {
      acc[student.studentId] = 'Present';
      return acc;
    }, {})
  );
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);

  // Topic Assessment state
  const [topicAssessmentCompleted, setTopicAssessmentCompleted] = useState(false);
  const [showAssessmentWarning, setShowAssessmentWarning] = useState(true);
  const [assessmentTiming] = useState<'before' | 'during' | 'skip'>('before'); // From HOD settings

  // Check if resources were just generated (from navigation state)
  const resourcesGenerated = location.state?.resourcesGenerated || false;

  // Mock resources state (in real app, this would come from backend)
  const [resources, setResources] = useState([
    { type: 'faculty-notes', title: 'Faculty Notes', status: resourcesGenerated ? 'Reviewed' : 'Not Generated', icon: FileText },
    { type: 'slides', title: 'Presentation Slides', status: resourcesGenerated ? 'Reviewed' : 'Not Generated', icon: Presentation },
    { type: 'student-notes', title: 'Student Notes', status: resourcesGenerated ? 'Reviewed' : 'Not Generated', icon: BookOpen },
    { type: 'quiz', title: 'Student Quiz', status: resourcesGenerated ? 'Not Reviewed' : 'Not Generated', icon: HelpCircle },
    { type: 'additional', title: 'Additional Resources', status: 'Not Generated', icon: FolderPlus },
  ]);

  const hasGeneratedResources = resources.some(r => r.status !== 'Not Generated');
  const allResourcesReviewed = resources.every(r => r.status === 'Reviewed' || r.status === 'Published');
  const hasPublishedResources = resources.some(r => r.status === 'Published');

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (lectureStatus === 'In Progress' && startTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [lectureStatus, startTime]);

  if (!lecture || !course) {
    return (
      <div className="p-6 lg:p-8">
        <p>Lecture not found</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartLecture = () => {
    setLectureStatus('In Progress');
    setStartTime(new Date());
    setShowAttendancePanel(true);
  };

  const handleEndLecture = () => {
    setShowCompletionForm(true);
  };

  const handleCompleteLecture = () => {
    // Calculate overall coverage from topic coverage
    const topics = Object.keys(topicCoverage);
    const avgCoverage = topics.length > 0
      ? Math.round(topics.reduce((sum, topic) => sum + topicCoverage[topic], 0) / topics.length)
      : coveragePercentage;
    
    setCoveragePercentage(avgCoverage);
    setLectureStatus('Completed');
    setShowCompletionForm(false);
    
    // In a real app, this would save to backend
    alert(`Lecture completed!\nCoverage: ${avgCoverage}%\nDuration: ${formatTime(elapsedTime)}`);
  };

  const handlePostponeLecture = () => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (newDate) {
      alert(`Lecture postponed to ${newDate}`);
      navigate(-1);
    }
  };

  const handleCancelLecture = () => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      alert(`Lecture cancelled. Reason: ${reason}`);
      navigate(-1);
    }
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    enrolledStudents.forEach((student: { studentId: string }) => {
      newAttendance[student.studentId] = 'Present';
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    enrolledStudents.forEach((student: { studentId: string }) => {
      newAttendance[student.studentId] = 'Absent';
    });
    setAttendance(newAttendance);
  };

  const handleGenerateResources = () => {
    navigate(`/academic/faculty/lecture/${lectureId}/generate-resources`, {
      state: { lecture }
    });
  };

  const handleReviewResource = (resourceType: string) => {
    // Mark resource as reviewed
    setResources(prev => prev.map(r => 
      r.type === resourceType ? { ...r, status: 'Reviewed' } : r
    ));
  };

  const handlePublishResource = (resourceType: string) => {
    // Publish individual resource
    setResources(prev => prev.map(r => 
      r.type === resourceType ? { ...r, status: 'Published' } : r
    ));
    alert(`${resources.find(r => r.type === resourceType)?.title} published to students!`);
  };

  const handlePublishAllResources = () => {
    // Publish all reviewed resources
    setResources(prev => prev.map(r => 
      r.status === 'Reviewed' ? { ...r, status: 'Published' } : r
    ));
    alert('All reviewed resources published to students!');
  };

  const handleReplaceResource = (resourceType: string) => {
    // In real app, this would open file upload dialog
    alert(`Upload custom ${resources.find(r => r.type === resourceType)?.title}`);
  };

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Reviewed': return 'default';
      case 'Not Reviewed': return 'warning';
      default: return 'secondary';
    }
  };

  const attendanceStats = {
    present: Object.values(attendance).filter(s => s === 'Present').length,
    absent: Object.values(attendance).filter(s => s === 'Absent').length,
    late: Object.values(attendance).filter(s => s === 'Late').length,
  };

  // Check prerequisites
  const prerequisitesCompleted = lecture.prerequisites?.every(prereqId => {
    const prereq = mockLectures.find(l => l.id === prereqId);
    return prereq?.status === 'Completed';
  }) ?? true;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{course.name} • {course.code}</p>
        </div>
        <Badge variant={
          lectureStatus === 'Completed' ? 'success' :
          lectureStatus === 'In Progress' ? 'default' :
          lectureStatus === 'Planned' ? 'secondary' : 'warning'
        }>
          {lectureStatus}
        </Badge>
      </div>

      {/* Status Banner */}
      {lectureStatus === 'In Progress' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Lecture in Progress</p>
                  <p className="text-xs text-blue-700">Elapsed: {formatTime(elapsedTime)}</p>
                </div>
              </div>
              <Button onClick={handleEndLecture} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                End Lecture
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisite Warning */}
      {!prerequisitesCompleted && lectureStatus === 'Planned' && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-900">Prerequisite Warning</p>
                <p className="text-xs text-orange-700">Some prerequisite lectures have not been completed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Assessment Warning (Dismissible) */}
      {!topicAssessmentCompleted && showAssessmentWarning && assessmentTiming !== 'skip' && lectureStatus === 'Planned' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900">Topic Assessment Pending</p>
                  <p className="text-xs text-yellow-700 mb-3">
                    {assessmentTiming === 'before' 
                      ? 'Complete topic assessment before starting the lecture to ensure readiness.'
                      : 'Complete topic assessment during the lecture to track your preparation.'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-white"
                      onClick={() => {
                        setTopicAssessmentCompleted(true);
                        alert('Topic assessment completed!');
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete Assessment
                    </Button>
                    {assessmentTiming === 'during' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowAssessmentWarning(false)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAssessmentWarning(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lecture Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Date & Time</p>
            <p className="text-sm font-semibold">{new Date(lecture.date).toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">{lecture.time}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Duration</p>
            <p className="text-sm font-semibold">{lecture.duration} minutes</p>
            {lecture.actualDuration && (
              <p className="text-xs text-muted-foreground">Actual: {lecture.actualDuration} min</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Coverage</p>
            <p className="text-sm font-semibold">{coveragePercentage}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${coveragePercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-3">Topics</h3>
          <div className="space-y-2">
            {lecture.topics.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">{topic}</span>
                {lectureStatus === 'In Progress' && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={topicCoverage[topic] || 0}
                    onChange={(e) => setTopicCoverage(prev => ({ ...prev, [topic]: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-2 py-1 border border-border rounded text-sm text-right"
                    placeholder="%"
                  />
                )}
                {lectureStatus === 'Completed' && (
                  <Badge variant="secondary">{topicCoverage[topic] || coveragePercentage}%</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Lecture Resources</h3>
            {!hasGeneratedResources && (
              <Button onClick={handleGenerateResources} size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Resources
              </Button>
            )}
            {hasGeneratedResources && allResourcesReviewed && !hasPublishedResources && (
              <Button onClick={handlePublishAllResources} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish All
              </Button>
            )}
          </div>

          {!hasGeneratedResources ? (
            <div className="space-y-4">
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No resources generated yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Generate Resources" to create AI-powered lecture materials
                </p>
              </div>
              
              {/* Show Quiz separately even when nothing is generated */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Student Quiz</p>
                      <p className="text-xs text-muted-foreground">Not generated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">Not Generated</Badge>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/academic/faculty/quiz/create-comprehensive`, {
                        state: { lecture }
                      })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Quiz
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => {
                const Icon = resource.icon;
                const isGenerated = resource.status !== 'Not Generated';
                
                return (
                  <div
                    key={resource.type}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isGenerated ? 'bg-card hover:bg-muted/30' : 'bg-muted/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                        resource.status === 'Published' ? 'bg-green-50 text-green-600' :
                        resource.status === 'Reviewed' ? 'bg-blue-50 text-blue-600' :
                        resource.status === 'Not Reviewed' ? 'bg-orange-50 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.type === 'student-notes' && isGenerated
                            ? 'Auto-generated from Faculty Notes'
                            : isGenerated
                            ? 'AI-generated content'
                            : 'Not generated'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getResourceStatusColor(resource.status)} className="text-[10px]">
                        {resource.status}
                      </Badge>
                      
                      {/* Quiz - Special handling with Create Quiz button */}
                      {resource.type === 'quiz' && !isGenerated && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/academic/faculty/quiz/create-comprehensive`, {
                            state: { lecture }
                          })}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Quiz
                        </Button>
                      )}
                      
                      {isGenerated && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/academic/faculty/lecture/${lectureId}/resource/${resource.type}`, {
                              state: { lecture }
                            })}
                            title="View Resource"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          {resource.status === 'Not Reviewed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReviewResource(resource.type)}
                              title="Mark as Reviewed"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {resource.status === 'Reviewed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePublishResource(resource.type)}
                              title="Publish to Students"
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReplaceResource(resource.type)}
                            title="Replace with Custom File"
                          >
                            <Upload className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasGeneratedResources && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Workflow:</strong> Generated → Review → Publish. You can replace any resource with your own version.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Panel */}
      {(lectureStatus === 'In Progress' || showAttendancePanel) && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Attendance</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={markAllPresent}>Present All</Button>
                <Button size="sm" variant="outline" onClick={markAllAbsent}>Absent All</Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="text-green-600 font-medium">Present: {attendanceStats.present}</span>
              <span className="text-red-600 font-medium">Absent: {attendanceStats.absent}</span>
              <span className="text-orange-600 font-medium">Late: {attendanceStats.late}</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {enrolledStudents.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                  </div>
                  <div className="flex gap-2">
                    {(['Present', 'Absent', 'Late'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setAttendance(prev => ({ ...prev, [student.studentId]: status }))}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          attendance[student.studentId] === status
                            ? status === 'Present' ? 'bg-green-500 text-white' :
                              status === 'Absent' ? 'bg-red-500 text-white' :
                              'bg-orange-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Form */}
      {showCompletionForm && (
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Complete Lecture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Overall Coverage Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={coveragePercentage}
                  onChange={(e) => setCoveragePercentage(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  placeholder="Any additional comments about the lecture..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resources to Publish</label>
                <div className="space-y-2">
                  {['Lecture Notes', 'Presentation Slides', 'Code Examples', 'Practice Problems'].map((resource) => (
                    <label key={resource} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResources([...selectedResources, resource]);
                          } else {
                            setSelectedResources(selectedResources.filter(r => r !== resource));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{resource}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCompleteLecture} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Lecture
                </Button>
                <Button variant="outline" onClick={() => setShowCompletionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {lectureStatus === 'Planned' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={handleStartLecture} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Lecture
            </Button>
            <Button variant="outline" onClick={handlePostponeLecture}>
              Postpone
            </Button>
            <Button variant="destructive" onClick={handleCancelLecture}>
              Cancel
            </Button>
          </div>
          {/* Quick Complete Option */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setLectureStatus('Completed');
              alert('Lecture marked as completed');
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Mark as Completed (Skip Lecture)
          </Button>
        </div>
      )}

      {/* In Progress Actions */}
      {lectureStatus === 'In Progress' && (
        <div className="flex gap-3">
          <Button onClick={handleEndLecture} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            End & Complete Lecture
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setLectureStatus('Completed');
              alert('Lecture marked as completed');
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Mark as Completed
          </Button>
        </div>
      )}

      {lectureStatus === 'Completed' && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Lecture Completed</h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {lecture.actualDuration || lecture.duration} minutes • Coverage: {coveragePercentage}%
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <FileText className="h-3 w-3 mr-1" />
                View Resources
              </Button>
              <Button size="sm" variant="outline">
                <Users className="h-3 w-3 mr-1" />
                View Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
