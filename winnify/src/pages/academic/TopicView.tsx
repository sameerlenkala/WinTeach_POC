import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Wand2, Eye, Layers, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCourses } from '../../data/mockAcademicData';

interface Topic {
  id: string;
  name: string;
  unit: number;
  subtopics: string[];
  coveredSubtopics: string[];
  removedSubtopics: string[];
  totalLectures: number;
  completedLectures: number;
  resourcesGenerated: boolean;
}

export default function TopicView() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const course = mockCourses.find(c => c.id === courseId);
  
  // Mock topic data (in real app, fetch from backend)
  const [topics] = useState<Topic[]>([
    {
      id: 'topic-1',
      name: 'Introduction to Data Structures',
      unit: 1,
      subtopics: ['Arrays', 'Linked Lists', 'Memory Management'],
      coveredSubtopics: ['Arrays', 'Linked Lists', 'Memory Management'],
      removedSubtopics: [],
      totalLectures: 3,
      completedLectures: 3,
      resourcesGenerated: true,
    },
    {
      id: 'topic-2',
      name: 'Stacks and Queues',
      unit: 2,
      subtopics: ['Stack Operations', 'Queue Operations', 'Applications', 'Priority Queues'],
      coveredSubtopics: ['Stack Operations', 'Queue Operations'],
      removedSubtopics: [],
      totalLectures: 5,
      completedLectures: 2,
      resourcesGenerated: true,
    },
    {
      id: 'topic-3',
      name: 'Trees',
      unit: 3,
      subtopics: ['Binary Trees', 'Tree Traversal', 'BST', 'AVL Trees', 'B-Trees'],
      coveredSubtopics: [],
      removedSubtopics: ['B-Trees'],
      totalLectures: 8,
      completedLectures: 0,
      resourcesGenerated: false,
    },
    {
      id: 'topic-4',
      name: 'Graphs',
      unit: 4,
      subtopics: ['Graph Representation', 'BFS', 'DFS', 'Shortest Path', 'MST'],
      coveredSubtopics: [],
      removedSubtopics: [],
      totalLectures: 7,
      completedLectures: 0,
      resourcesGenerated: false,
    },
    {
      id: 'topic-5',
      name: 'Hashing',
      unit: 5,
      subtopics: ['Hash Functions', 'Collision Resolution', 'Applications'],
      coveredSubtopics: [],
      removedSubtopics: [],
      totalLectures: 4,
      completedLectures: 0,
      resourcesGenerated: false,
    },
  ]);

  const calculateCoverage = (topic: Topic) => {
    const totalSubtopics = topic.subtopics.length;
    const covered = topic.coveredSubtopics.length;
    const removed = topic.removedSubtopics.length;
    const pending = totalSubtopics - covered - removed;
    
    return {
      coveredPercent: totalSubtopics > 0 ? Math.round((covered / totalSubtopics) * 100) : 0,
      pendingPercent: totalSubtopics > 0 ? Math.round((pending / totalSubtopics) * 100) : 0,
      removedPercent: totalSubtopics > 0 ? Math.round((removed / totalSubtopics) * 100) : 0,
      covered,
      pending,
      removed,
      total: totalSubtopics,
    };
  };

  const overallStats = topics.reduce((acc, topic) => {
    const coverage = calculateCoverage(topic);
    return {
      totalSubtopics: acc.totalSubtopics + coverage.total,
      coveredSubtopics: acc.coveredSubtopics + coverage.covered,
      pendingSubtopics: acc.pendingSubtopics + coverage.pending,
      removedSubtopics: acc.removedSubtopics + coverage.removed,
      totalLectures: acc.totalLectures + topic.totalLectures,
      completedLectures: acc.completedLectures + topic.completedLectures,
    };
  }, {
    totalSubtopics: 0,
    coveredSubtopics: 0,
    pendingSubtopics: 0,
    removedSubtopics: 0,
    totalLectures: 0,
    completedLectures: 0,
  });

  const overallCoveredPercent = overallStats.totalSubtopics > 0 
    ? Math.round((overallStats.coveredSubtopics / overallStats.totalSubtopics) * 100) 
    : 0;
  const overallPendingPercent = overallStats.totalSubtopics > 0 
    ? Math.round((overallStats.pendingSubtopics / overallStats.totalSubtopics) * 100) 
    : 0;
  const overallRemovedPercent = overallStats.totalSubtopics > 0 
    ? Math.round((overallStats.removedSubtopics / overallStats.totalSubtopics) * 100) 
    : 0;

  const handleGenerateResources = (topicId: string) => {
    navigate(`/academic/faculty/topic/${topicId}/generate-resources`, {
      state: { topic: topics.find(t => t.id === topicId) }
    });
  };

  const handleViewResources = (topicId: string) => {
    navigate(`/academic/faculty/topic/${topicId}/resources`, {
      state: { topic: topics.find(t => t.id === topicId) }
    });
  };

  const handleViewFlashCards = (topicId: string) => {
    navigate(`/academic/faculty/topic/${topicId}/flashcards`, {
      state: { topic: topics.find(t => t.id === topicId) }
    });
  };

  if (!course) {
    return (
      <div className="p-6 lg:p-8">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Topic Coverage View</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{course.name} • {course.code}</p>
        </div>
        <Button size="sm" onClick={() => navigate(`/academic/faculty/course/${courseId}/timeline`)}>
          <Layers className="h-4 w-4 mr-2" />
          Lecture View
        </Button>
      </div>

      {/* Overall Coverage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Covered</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {overallCoveredPercent}%
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
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {overallPendingPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 shrink-0">
                <XCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Removed</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {overallRemovedPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lectures</p>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)]">
                  {overallStats.completedLectures}/{overallStats.totalLectures}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold font-[family-name:var(--font-heading)]">
              Overall Progress
            </span>
            <span className="text-[10px] text-muted-foreground">
              {overallStats.coveredSubtopics + overallStats.removedSubtopics} / {overallStats.totalSubtopics} subtopics
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
            <div className="h-full flex">
              <div
                className="bg-green-500"
                style={{ width: `${overallCoveredPercent}%` }}
              />
              <div
                className="bg-orange-500"
                style={{ width: `${overallPendingPercent}%` }}
              />
              <div
                className="bg-gray-400"
                style={{ width: `${overallRemovedPercent}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
              <span>Covered ({overallCoveredPercent}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
              <span>Pending ({overallPendingPercent}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-sm" />
              <span>Removed ({overallRemovedPercent}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((topic) => {
            const coverage = calculateCoverage(topic);
            
            return (
              <Card key={topic.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{topic.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">Unit {topic.unit}</Badge>
                        {topic.resourcesGenerated && (
                          <Badge variant="outline" className="text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resources
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                        <span>{topic.completedLectures}/{topic.totalLectures} lectures</span>
                        <span>•</span>
                        <span>{coverage.covered}/{coverage.total} subtopics covered</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {topic.subtopics.map((subtopic, idx) => {
                          const isCovered = topic.coveredSubtopics.includes(subtopic);
                          const isRemoved = topic.removedSubtopics.includes(subtopic);
                          
                          return (
                            <Badge
                              key={idx}
                              variant={isCovered ? 'success' : isRemoved ? 'secondary' : 'outline'}
                              className="text-[10px] px-2 py-0.5"
                            >
                              {subtopic}
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Coverage Progress</span>
                          <span className="font-medium">{coverage.coveredPercent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="h-full flex rounded-full overflow-hidden">
                            <div className="bg-green-500" style={{ width: `${coverage.coveredPercent}%` }} />
                            <div className="bg-orange-500" style={{ width: `${coverage.pendingPercent}%` }} />
                            <div className="bg-gray-400" style={{ width: `${coverage.removedPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {topic.resourcesGenerated ? (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleViewFlashCards(topic.id); }}>
                            <Zap className="h-3.5 w-3.5 mr-1" />
                            Flash Cards
                          </Button>
                          <Button size="sm" onClick={(e) => { e.preventDefault(); handleViewResources(topic.id); }}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Resources
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={(e) => { e.preventDefault(); handleGenerateResources(topic.id); }}>
                          <Wand2 className="h-3.5 w-3.5 mr-1" />
                          Generate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
