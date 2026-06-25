import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, GripVertical, Plus, Save, Send, Edit, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type LectureStatus = 'planned' | 'in-progress' | 'completed' | 'postponed';

interface KanbanLecture {
  id: string;
  lectureNumber: number;
  topic: string;
  subtopics: string[];
  tentativeDate: string;
  duration: number; // in hours
  status: LectureStatus;
  prerequisites: string[];
  weekNumber: number; // Week of the course
}

export default function TimelineKanban() {
  const navigate = useNavigate();
  const location = useLocation();
  const generatedPlan = location.state?.generatedPlan;
  const courseData = location.state?.courseData;
  const fromAutoGenerate = location.state?.fromAutoGenerate;
  
  const [draggedItem, setDraggedItem] = useState<KanbanLecture | null>(null);
  const [allowFacultyEdit, setAllowFacultyEdit] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [editingLecture, setEditingLecture] = useState<KanbanLecture | null>(null);
  const [editForm, setEditForm] = useState<KanbanLecture | null>(null);
  const [viewingLecture, setViewingLecture] = useState<KanbanLecture | null>(null);
  const [draggedSubtopic, setDraggedSubtopic] = useState<{ lectureId: string; subtopic: string } | null>(null);

  // Generate lectures from the plan data
  const generateLecturesFromPlan = () => {
    if (!generatedPlan || !generatedPlan.topics) {
      return getDefaultLectures();
    }

    const lectures: KanbanLecture[] = [];
    let lectureCounter = 1;
    let currentWeek = 1;
    let lecturesInWeek = 0;
    const lecturesPerWeek = 3; // Average lectures per week
    
    // Start date
    const startDate = new Date(generatedPlan.startDate || '2024-08-05');

    generatedPlan.topics.forEach((topic: any) => {
      const lecturesForTopic = topic.lectures || 1;
      
      for (let i = 0; i < lecturesForTopic; i++) {
        // Calculate date
        const daysToAdd = (lectureCounter - 1) * 2; // 2 days between lectures
        const lectureDate = new Date(startDate);
        lectureDate.setDate(lectureDate.getDate() + daysToAdd);
        
        // Determine status based on lecture number
        let status: LectureStatus = 'planned';
        if (lectureCounter <= 2) status = 'completed';
        else if (lectureCounter === 3) status = 'in-progress';
        
        lectures.push({
          id: `lec-${lectureCounter}`,
          lectureNumber: lectureCounter,
          topic: lecturesForTopic > 1 ? `${topic.name} - Part ${i + 1}` : topic.name,
          subtopics: topic.subtopics || [],
          tentativeDate: lectureDate.toISOString().split('T')[0],
          duration: 2,
          status: status,
          prerequisites: lectureCounter > 1 ? [`lec-${lectureCounter - 1}`] : [],
          weekNumber: currentWeek,
        });
        
        lectureCounter++;
        lecturesInWeek++;
        
        // Move to next week
        if (lecturesInWeek >= lecturesPerWeek) {
          currentWeek++;
          lecturesInWeek = 0;
        }
      }
    });

    return lectures;
  };

  const getDefaultLectures = (): KanbanLecture[] => [
    {
      id: 'lec-1',
      lectureNumber: 1,
      topic: 'Introduction to Data Structures',
      subtopics: ['Arrays', 'Linked Lists'],
      tentativeDate: '2024-08-05',
      duration: 2,
      status: 'completed',
      prerequisites: [],
      weekNumber: 1,
    },
    {
      id: 'lec-2',
      lectureNumber: 2,
      topic: 'Stacks and Queues',
      subtopics: ['Stack Operations', 'Queue Operations'],
      tentativeDate: '2024-08-08',
      duration: 2,
      status: 'completed',
      prerequisites: ['lec-1'],
      weekNumber: 1,
    },
    {
      id: 'lec-3',
      lectureNumber: 3,
      topic: 'Trees',
      subtopics: ['Binary Trees', 'Tree Traversal'],
      tentativeDate: '2024-08-12',
      duration: 3,
      status: 'in-progress',
      prerequisites: ['lec-1'],
      weekNumber: 2,
    },
    {
      id: 'lec-4',
      lectureNumber: 4,
      topic: 'Binary Search Trees',
      subtopics: ['BST Operations', 'AVL Trees'],
      tentativeDate: '2024-08-15',
      duration: 2,
      status: 'planned',
      prerequisites: ['lec-3'],
      weekNumber: 2,
    },
    {
      id: 'lec-5',
      lectureNumber: 5,
      topic: 'Graphs',
      subtopics: ['Graph Representation', 'BFS', 'DFS'],
      tentativeDate: '2024-08-19',
      duration: 3,
      status: 'planned',
      prerequisites: ['lec-3'],
      weekNumber: 3,
    },
    {
      id: 'lec-6',
      lectureNumber: 6,
      topic: 'Sorting Algorithms',
      subtopics: ['Bubble Sort', 'Quick Sort', 'Merge Sort'],
      tentativeDate: '2024-08-22',
      duration: 2,
      status: 'planned',
      prerequisites: ['lec-1'],
      weekNumber: 3,
    },
    {
      id: 'lec-7',
      lectureNumber: 7,
      topic: 'Hashing',
      subtopics: ['Hash Tables', 'Collision Resolution'],
      tentativeDate: '2024-08-26',
      duration: 2,
      status: 'planned',
      prerequisites: ['lec-1'],
      weekNumber: 4,
    },
    {
      id: 'lec-8',
      lectureNumber: 8,
      topic: 'Dynamic Programming',
      subtopics: ['Memoization', 'Tabulation'],
      tentativeDate: '2024-08-29',
      duration: 3,
      status: 'planned',
      prerequisites: ['lec-5'],
      weekNumber: 4,
    },
  ];

  // Initialize lectures from generated plan or use default
  const [lectures, setLectures] = useState<KanbanLecture[]>(() => {
    if (fromAutoGenerate && generatedPlan) {
      return generateLecturesFromPlan();
    }
    return getDefaultLectures();
  });

  // Calculate total weeks
  const totalWeeks = Math.max(...lectures.map(l => l.weekNumber));
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const handleDragStart = (lecture: KanbanLecture) => {
    setDraggedItem(lecture);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (weekNumber: number) => {
    if (draggedItem) {
      setLectures(prev =>
        prev.map(lec =>
          lec.id === draggedItem.id ? { ...lec, weekNumber } : lec
        )
      );
      setDraggedItem(null);
    }
  };

  const handleSave = () => {
    alert('Timeline saved successfully!');
  };

  const handleSendForReview = () => {
    setShowSendDialog(true);
  };

  const confirmSendForReview = () => {
    const message = allowFacultyEdit 
      ? 'Timeline sent to faculty for review. Faculty can edit the plan.'
      : 'Timeline sent to faculty for review. Faculty can only view (no editing allowed).';
    alert(message);
    setShowSendDialog(false);
    navigate(-1);
  };

  const handleEditLecture = (lecture: KanbanLecture) => {
    setEditingLecture(lecture);
    setEditForm({ ...lecture });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      setLectures(prev =>
        prev.map(lec =>
          lec.id === editForm.id ? editForm : lec
        )
      );
      setEditingLecture(null);
      setEditForm(null);
    }
  };

  const handleDeleteLecture = (lectureId: string) => {
    if (confirm('Are you sure you want to delete this lecture?')) {
      setLectures(prev => prev.filter(lec => lec.id !== lectureId));
      setEditingLecture(null);
      setEditForm(null);
    }
  };

  const getLecturesByWeek = (weekNumber: number) => {
    return lectures.filter(lec => lec.weekNumber === weekNumber);
  };

  const getWeekHours = (weekNumber: number) => {
    return getLecturesByWeek(weekNumber).reduce((sum, lec) => sum + lec.duration, 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">
              Timeline Editor
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag and drop lectures to organize your course timeline
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="sm" onClick={handleSendForReview}>
            <Send className="h-4 w-4 mr-2" />
            Send for Review
          </Button>
        </div>
      </div>

      {/* Course Info Banner */}
      {courseData && (
        <Card className={fromAutoGenerate ? "bg-green-50 border-green-200" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Course</p>
                <p className="text-sm font-semibold">{courseData.code} - {courseData.name}</p>
                {fromAutoGenerate && (
                  <p className="text-[10px] text-green-700 mt-1">
                    ✓ Auto-generated plan loaded - Review and adjust as needed
                  </p>
                )}
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Credits: </span>
                  <span className="font-medium">{courseData.credits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium">{courseData.type}</span>
                </div>
                {courseData.lectures && (
                  <div>
                    <span className="text-muted-foreground">Total Lectures: </span>
                    <span className="font-medium">{courseData.lectures}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Lectures</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {lectures.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Weeks</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {totalWeeks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Hours</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {lectures.reduce((sum, lec) => sum + lec.duration, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Hours/Week</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {Math.round(lectures.reduce((sum, lec) => sum + lec.duration, 0) / totalWeeks)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart View */}
      <Card>
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                Lecture Timeline
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {lectures.length} Lectures
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {totalWeeks} Weeks
                </Badge>
              </div>
            </div>

            {/* Week-by-Week Timeline */}
            <div className="space-y-6">
              {weeks.map((weekNumber) => {
                const weekLectures = getLecturesByWeek(weekNumber);
                if (weekLectures.length === 0) return null;
                
                return (
                  <div key={weekNumber} className="space-y-3">
                    {/* Week Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          W{weekNumber}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Week {weekNumber}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {weekLectures.length} lectures • {getWeekHours(weekNumber)} hours
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lectures in Timeline Format */}
                    <div 
                      className="space-y-2"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(weekNumber)}
                    >
                      {weekLectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          draggable
                          onDragStart={() => handleDragStart(lecture)}
                          className="group"
                        >
                          <div
                            onClick={() => setViewingLecture(lecture)}
                            className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-primary/20"
                          >
                            {/* Drag Handle */}
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Lecture Number Badge */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border text-xs font-bold shrink-0">
                              L{lecture.lectureNumber}
                            </div>

                            {/* Lecture Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)] truncate">
                                {lecture.topic}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(lecture.tentativeDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{lecture.duration}h</span>
                                </div>
                                {lecture.subtopics.length > 0 && (
                                  <Badge variant="outline" className="text-[9px]">
                                    {lecture.subtopics.length} subtopics
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Subtopics Preview */}
                            {lecture.subtopics.length > 0 && (
                              <div className="hidden lg:flex flex-wrap gap-1 max-w-md">
                                {lecture.subtopics.slice(0, 2).map((subtopic, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[9px]">
                                    {subtopic}
                                  </Badge>
                                ))}
                                {lecture.subtopics.length > 2 && (
                                  <Badge variant="secondary" className="text-[9px]">
                                    +{lecture.subtopics.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLecture(lecture);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add Lecture Button */}
                      <Button
                        variant="outline"
                        className="w-full border-dashed h-10"
                        size="sm"
                        onClick={() => {
                          const newLecture: KanbanLecture = {
                            id: `lec-${lectures.length + 1}`,
                            lectureNumber: lectures.length + 1,
                            topic: 'New Lecture Topic',
                            subtopics: [],
                            tentativeDate: new Date().toISOString().split('T')[0],
                            duration: 2,
                            status: 'planned',
                            prerequisites: [],
                            weekNumber: weekNumber,
                          };
                          setLectures([...lectures, newLecture]);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Add Lecture to Week {weekNumber}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Drag lectures between weeks to reorganize your course timeline. 
            Click the edit icon on any lecture card to modify its details. 
            Each week shows the total number of lectures and hours scheduled.
          </p>
        </CardContent>
      </Card>

      {/* Send for Review Dialog */}
      {showSendDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                  Send Plan to Faculty
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure faculty permissions before sending the plan for review
                </p>
              </div>

              {/* Faculty Edit Permission Toggle */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold">Allow Faculty to Edit Plan</h4>
                      <Badge variant={allowFacultyEdit ? 'success' : 'secondary'} className="text-[10px]">
                        {allowFacultyEdit ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Faculty can modify lecture dates, topics, and timeline
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={allowFacultyEdit}
                      onChange={(e) => setAllowFacultyEdit(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {allowFacultyEdit ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-[10px]">
                    <p className="text-green-900">
                      <strong>✓ Edit Enabled:</strong> Faculty can review and make changes to the plan. 
                      You'll be notified when they submit their changes.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded text-[10px]">
                    <p className="text-orange-900">
                      <strong>⚠ View Only:</strong> Faculty can only view the plan. 
                      They cannot make any modifications to the timeline.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Lectures:</span>
                  <span className="font-semibold">{lectures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-semibold">
                    {lectures.reduce((sum, lec) => sum + lec.duration, 0)} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faculty Permission:</span>
                  <span className="font-semibold">
                    {allowFacultyEdit ? 'Can Edit' : 'View Only'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowSendDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="flex-1"
                  onClick={confirmSendForReview}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Faculty
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lecture Detail View Dialog */}
      {viewingLecture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingLecture(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Lecture {viewingLecture.lectureNumber} • Week {viewingLecture.weekNumber}
                  </p>
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] mt-1">
                    {viewingLecture.topic}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingLecture(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                  <p className="text-xs font-medium">{new Date(viewingLecture.tentativeDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Duration</p>
                  <p className="text-xs font-medium">{viewingLecture.duration} hours</p>
                </div>
              </div>

              {/* Subtopics with drag and drop */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold">Subtopics ({viewingLecture.subtopics.length})</h4>
                  <p className="text-[10px] text-muted-foreground">Drag to move to another lecture</p>
                </div>
                
                {viewingLecture.subtopics.length > 0 ? (
                  <div className="space-y-2">
                    {viewingLecture.subtopics.map((subtopic, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedSubtopic({ lectureId: viewingLecture.id, subtopic });
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation();
                          setDraggedSubtopic(null);
                        }}
                        className={`flex items-center justify-between p-2 bg-white border rounded-lg cursor-move hover:shadow-sm transition-all group ${
                          draggedSubtopic?.subtopic === subtopic ? 'opacity-50 border-primary' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{subtopic}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove subtopic
                            const updated = lectures.map(lec => 
                              lec.id === viewingLecture.id
                                ? { ...lec, subtopics: lec.subtopics.filter((_, i) => i !== idx) }
                                : lec
                            );
                            setLectures(updated);
                            setViewingLecture({
                              ...viewingLecture,
                              subtopics: viewingLecture.subtopics.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No subtopics assigned</p>
                )}
              </div>

              {/* Drop zones for other lectures */}
              <div>
                <h4 className="text-xs font-semibold mb-3">
                  {draggedSubtopic ? 'Drop subtopic on a lecture:' : 'Move Subtopic To:'}
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {lectures
                    .filter(lec => lec.id !== viewingLecture.id)
                    .map(lec => (
                      <div
                        key={lec.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedSubtopic && draggedSubtopic.lectureId === viewingLecture.id) {
                            // Move subtopic to this lecture
                            const updated = lectures.map(lecture => {
                              if (lecture.id === viewingLecture.id) {
                                return {
                                  ...lecture,
                                  subtopics: lecture.subtopics.filter(st => st !== draggedSubtopic.subtopic)
                                };
                              }
                              if (lecture.id === lec.id) {
                                return {
                                  ...lecture,
                                  subtopics: [...lecture.subtopics, draggedSubtopic.subtopic]
                                };
                              }
                              return lecture;
                            });
                            setLectures(updated);
                            setViewingLecture({
                              ...viewingLecture,
                              subtopics: viewingLecture.subtopics.filter(st => st !== draggedSubtopic.subtopic)
                            });
                            setDraggedSubtopic(null);
                          }
                        }}
                        className={`p-2 border-2 border-dashed rounded-lg text-xs cursor-pointer transition-all ${
                          draggedSubtopic ? 'border-primary bg-primary/5 hover:bg-primary/10 hover:border-primary hover:shadow-sm' : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <p className="font-medium text-[10px] text-muted-foreground mb-1">
                          Lecture {lec.lectureNumber} • Week {lec.weekNumber}
                        </p>
                        <p className="text-xs font-semibold truncate">{lec.topic}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">
                          {lec.subtopics.length} subtopics
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setViewingLecture(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => {
                  setViewingLecture(null);
                  handleEditLecture(viewingLecture);
                }}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Lecture Dialog */}
      {editingLecture && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                    Edit Lecture {editForm.lectureNumber}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update lecture details and schedule
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingLecture(null);
                    setEditForm(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Lecture Number and Week */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2">Lecture Number</label>
                    <input
                      type="number"
                      value={editForm.lectureNumber}
                      onChange={(e) => setEditForm({ ...editForm, lectureNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Week Number *</label>
                    <input
                      type="number"
                      value={editForm.weekNumber}
                      onChange={(e) => setEditForm({ ...editForm, weekNumber: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-medium mb-2">Topic *</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                    placeholder="e.g., Introduction to Data Structures"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                </div>

                {/* Subtopics */}
                <div>
                  <label className="block text-xs font-medium mb-2">Subtopics (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.subtopics.join(', ')}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      subtopics: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="e.g., Arrays, Linked Lists, Stacks"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                </div>

                {/* Date and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2">Tentative Date *</label>
                    <input
                      type="date"
                      value={editForm.tentativeDate}
                      onChange={(e) => setEditForm({ ...editForm, tentativeDate: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Duration (hours) *</label>
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                      min="1"
                      max="8"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LectureStatus })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteLecture(editForm.id)}
                >
                  Delete Lecture
                </Button>
                <div className="flex-1" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingLecture(null);
                    setEditForm(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editForm.topic || !editForm.tentativeDate}
                >
                  <Save className="h-3.5 w-3.5 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
