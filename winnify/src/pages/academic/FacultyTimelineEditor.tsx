import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, GripVertical, Plus, Save, Send, Edit2, Check, X } from 'lucide-react';
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
}

export default function FacultyTimelineEditor() {
  const navigate = useNavigate();
  const { courseId: _courseId } = useParams();
  const location = useLocation();
  const canEdit = location.state?.canEdit !== false; // Default true if not specified

  const [draggedItem, setDraggedItem] = useState<KanbanLecture | null>(null);
  const [editingLecture, setEditingLecture] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Mock data - in real app, fetch from API
  const [lectures, setLectures] = useState<KanbanLecture[]>([
    {
      id: 'lec-1',
      lectureNumber: 1,
      topic: 'Introduction to Data Structures',
      subtopics: ['Arrays', 'Linked Lists'],
      tentativeDate: '2024-08-05',
      duration: 2,
      status: 'completed',
      prerequisites: [],
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
    },
  ]);

  const columns: { id: LectureStatus; title: string; color: string }[] = [
    { id: 'planned', title: 'Planned', color: 'bg-blue-100 border-blue-300' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-orange-100 border-orange-300' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100 border-green-300' },
    { id: 'postponed', title: 'Postponed', color: 'bg-red-100 border-red-300' },
  ];

  const handleDragStart = (lecture: KanbanLecture) => {
    if (canEdit) {
      setDraggedItem(lecture);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: LectureStatus) => {
    if (draggedItem && canEdit) {
      setLectures(prev =>
        prev.map(lec =>
          lec.id === draggedItem.id ? { ...lec, status } : lec
        )
      );
      setDraggedItem(null);
    }
  };

  const handleUpdateHours = (lectureId: string, newHours: number) => {
    setLectures(prev =>
      prev.map(lec =>
        lec.id === lectureId ? { ...lec, duration: Math.max(1, Math.min(10, newHours)) } : lec
      )
    );
  };

  const handleSave = () => {
    alert('Changes saved as draft!');
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  const confirmPublish = () => {
    alert('Plan published successfully! HOD will be notified of your changes.');
    setShowPublishDialog(false);
    navigate('/academic/faculty');
  };

  const getLecturesByStatus = (status: LectureStatus) => {
    return lectures.filter(lec => lec.status === status);
  };

  const getStatusBadgeVariant = (status: LectureStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'postponed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTotalHours = () => {
    return lectures.reduce((sum, lec) => sum + lec.duration, 0);
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
              {canEdit ? 'Edit Course Timeline' : 'View Course Timeline'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {canEdit 
                ? 'Adjust lecture hours and organize your course timeline'
                : 'View the course timeline (editing disabled by HOD)'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handlePublish}>
                <Send className="h-4 w-4 mr-2" />
                Publish to HOD
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Permission Notice */}
      {!canEdit && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-900">View Only Mode</p>
                <p className="text-xs text-orange-700">
                  HOD has restricted editing for this timeline. You can only view the plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canEdit && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">Edit Permission Granted</p>
                <p className="text-xs text-green-700">
                  You can adjust lecture hours, dates, and reorganize the timeline. Click on hours to edit them directly.
                </p>
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Completed</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {getLecturesByStatus('completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">In Progress</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {getLecturesByStatus('in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Hours</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {getTotalHours()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            {/* Column Header */}
            <div className={`p-3 rounded-lg border ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {getLecturesByStatus(column.id).length}
                </Badge>
              </div>
            </div>

            {/* Column Content */}
            <div
              className="space-y-3 min-h-[400px] p-2 rounded-lg bg-muted/30"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {getLecturesByStatus(column.id).map((lecture) => (
                <Card
                  key={lecture.id}
                  draggable={canEdit}
                  onDragStart={() => handleDragStart(lecture)}
                  className={`${canEdit ? 'cursor-move' : 'cursor-default'} hover:shadow-sm transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      {canEdit && <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              Lecture {lecture.lectureNumber}
                            </p>
                            <h4 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                              {lecture.topic}
                            </h4>
                          </div>
                          <Badge variant={getStatusBadgeVariant(lecture.status)} className="text-[10px]">
                            {lecture.status}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(lecture.tentativeDate).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Editable Hours */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {canEdit && editingLecture === lecture.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={lecture.duration}
                                  onChange={(e) => handleUpdateHours(lecture.id, parseInt(e.target.value) || 1)}
                                  className="w-12 px-1 py-0.5 text-[10px] border border-border rounded"
                                  min="1"
                                  max="10"
                                  autoFocus
                                  onBlur={() => setEditingLecture(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingLecture(null);
                                  }}
                                />
                                <span className="text-[10px] text-muted-foreground">hours</span>
                              </div>
                            ) : (
                              <div 
                                className={`flex items-center gap-1 text-[10px] ${canEdit ? 'cursor-pointer hover:text-primary' : ''}`}
                                onClick={() => canEdit && setEditingLecture(lecture.id)}
                              >
                                <span className="font-medium">{lecture.duration} hours</span>
                                {canEdit && <Edit2 className="h-3 w-3 text-muted-foreground" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {lecture.subtopics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lecture.subtopics.map((subtopic, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">
                                {subtopic}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {lecture.prerequisites.length > 0 && (
                          <div className="text-[10px] text-muted-foreground">
                            Prerequisites: {lecture.prerequisites.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Lecture Button */}
              {column.id === 'planned' && canEdit && (
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  size="sm"
                  onClick={() => {
                    // In a real app, this would open a dialog to add a new lecture
                    const newLecture: KanbanLecture = {
                      id: `lec-${lectures.length + 1}`,
                      lectureNumber: lectures.length + 1,
                      topic: 'New Lecture Topic',
                      subtopics: [],
                      tentativeDate: new Date().toISOString().split('T')[0],
                      duration: 2,
                      status: 'planned',
                      prerequisites: [],
                    };
                    setLectures([...lectures, newLecture]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lecture
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> {canEdit 
              ? 'Click on lecture hours to edit them. Drag lectures between columns to update status. Save your changes before publishing to HOD.'
              : 'This timeline is in view-only mode. Contact HOD if you need to make changes.'}
          </p>
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] mb-2">
                  Publish Timeline to HOD
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your changes will be sent to HOD for final approval
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Lectures:</span>
                  <span className="font-semibold">{lectures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-semibold">{getTotalHours()} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold">{getLecturesByStatus('completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Planned:</span>
                  <span className="font-semibold">{getLecturesByStatus('planned').length}</span>
                </div>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <p className="text-[10px] text-green-900">
                    <strong>✓ Ready to Publish:</strong> Your timeline will be sent to HOD for review. 
                    You'll be notified once it's approved.
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPublishDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={confirmPublish}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
