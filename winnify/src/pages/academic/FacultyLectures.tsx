import { useState } from 'react';
import { Calendar, Clock, Plus, Play, LayoutList, BookOpen, CheckCircle, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockLectures, mockCourses } from '../../data/mockAcademicData';

type ViewMode = 'lecture' | 'topic';

export default function FacultyLectures() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('lecture');
  const [showAddLectureDialog, setShowAddLectureDialog] = useState(false);
  const [lectures, setLectures] = useState(mockLectures);

  // Get the first course for topic view (in real app, this would be selected by user)
  const firstCourse = mockCourses[0];

  const handleSwitchToTopicView = () => {
    if (firstCourse) {
      navigate(`/academic/faculty/course/${firstCourse.id}/topic-view`);
    }
  };

  const handleStartLecture = (lectureId: string) => {
    // Update lecture status to "In Progress"
    setLectures(prev => prev.map(lec => 
      lec.id === lectureId ? { ...lec, status: 'In Progress' as const } : lec
    ));
    // Navigate to lecture detail page
    navigate(`/academic/faculty/lecture/${lectureId}`);
  };

  const handleMarkAttendance = (lectureId: string) => {
    // Update lecture attendance status
    setLectures(prev => prev.map(lec => 
      lec.id === lectureId ? { ...lec, attendanceMarked: true } : lec
    ));
    // Navigate to attendance page
    navigate('/academic/faculty/attendance');
  };

  const handlePublishResources = (lectureId: string) => {
    // Update lecture resources status
    setLectures(prev => prev.map(lec => 
      lec.id === lectureId ? { ...lec, resourcesPublished: true } : lec
    ));
    // Navigate to resources page
    navigate('/academic/faculty/resources');
  };

  const handleAddLecture = () => {
    setShowAddLectureDialog(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Lectures</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your lecture schedule</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'lecture' ? 'default' : 'ghost'}
              onClick={() => setViewMode('lecture')}
              className="gap-1.5"
            >
              <LayoutList className="h-4 w-4" />
              Lecture View
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'topic' ? 'default' : 'ghost'}
              onClick={handleSwitchToTopicView}
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              Topic View
            </Button>
          </div>
          <Button onClick={handleAddLecture}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lecture
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              {viewMode === 'lecture' ? <LayoutList className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                {viewMode === 'lecture' ? 'Lecture View' : 'Topic View'}
              </h3>
              <p className="text-xs text-blue-700">
                {viewMode === 'lecture' 
                  ? 'View and manage lectures chronologically. Each lecture shows detailed info, topics, and resources.'
                  : 'View and manage content by topics. See overall topic coverage based on BOS curriculum.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lectures Timeline */}
      <div className="space-y-3">
        {lectures.map((lecture) => (
          <Link key={lecture.id} to={`/academic/faculty/lecture/${lecture.id}`}>
            <Card className="cursor-pointer hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{lecture.title}</h3>
                      <Badge variant={
                        lecture.status === 'Completed' ? 'success' :
                        lecture.status === 'In Progress' ? 'default' :
                        lecture.status === 'Planned' ? 'secondary' : 'warning'
                      } className="text-[10px]">
                        {lecture.status}
                      </Badge>
                      {lecture.attendanceMarked && (
                        <Badge variant="outline" className="text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Attendance
                        </Badge>
                      )}
                      {lecture.resourcesPublished && (
                        <Badge variant="outline" className="text-[10px]">
                          <Upload className="h-3 w-3 mr-1" />
                          Resources
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(lecture.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lecture.time}
                      </span>
                      <span>{lecture.duration} min</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.topics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2 shrink-0">
                    {lecture.status === 'Planned' && (
                      <Button size="sm" onClick={(e) => { e.preventDefault(); handleStartLecture(lecture.id); }}>
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {lecture.status === 'Completed' && (
                      <>
                        {!lecture.attendanceMarked && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleMarkAttendance(lecture.id); }}>
                            Mark Attendance
                          </Button>
                        )}
                        {!lecture.resourcesPublished && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handlePublishResources(lecture.id); }}>
                            Publish Resources
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-3">
                  <span>Coverage: {lecture.coveragePercentage}%</span>
                  <div className="w-24 bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${lecture.coveragePercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${lecture.coveragePercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Add Lecture Dialog */}
      {showAddLectureDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-4">
                Add New Lecture
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                This will redirect you to the timeline editor where you can add lectures to your course plan.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddLectureDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowAddLectureDialog(false);
                  navigate(`/academic/faculty/course/${firstCourse.id}/timeline`);
                }}>
                  Go to Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
