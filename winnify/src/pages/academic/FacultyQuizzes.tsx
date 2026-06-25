import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockQuizzes } from '../../data/mockAcademicData';

export default function FacultyQuizzes() {
  const navigate = useNavigate();
  const [_quizzes, setQuizzes] = useState(mockQuizzes);

  const handlePublishQuiz = (quizId: string) => {
    setQuizzes(prev => prev.map(quiz => 
      quiz.id === quizId ? { ...quiz, status: 'Live' as const } : quiz
    ));
  };

  const handleViewResults = (quizId: string) => {
    // Navigate to quiz results page
    navigate(`/academic/faculty/quiz/${quizId}/results`);
  };

  const handleEditQuiz = (quizId: string) => {
    // Navigate to quiz edit page
    navigate(`/academic/faculty/quiz/${quizId}/edit`);
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Quizzes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create and manage quizzes</p>
        </div>
        <Link to="/academic/faculty/quiz/create">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Quizzes List */}
      <div className="space-y-3">
        {mockQuizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">{quiz.title}</h3>
                      <Badge variant={
                        quiz.status === 'Live' ? 'success' :
                        quiz.status === 'Completed' ? 'secondary' : 'default'
                      } className="text-[10px]">
                        {quiz.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{quiz.totalQuestions} questions</span>
                      <span>•</span>
                      <span>{quiz.totalMarks} marks</span>
                      <span>•</span>
                      <span>{quiz.duration} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {quiz.status === 'Draft' && (
                    <Button size="sm" onClick={() => handlePublishQuiz(quiz.id)}>Publish</Button>
                  )}
                  {quiz.status === 'Live' && (
                    <Button size="sm" variant="outline" onClick={() => handleViewResults(quiz.id)}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View Results
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEditQuiz(quiz.id)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground pt-2 border-t">
                Deadline: {new Date(quiz.deadline).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
