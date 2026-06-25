import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Save, ArrowLeft, Plus, Clock, Award, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  text: string;
  type: 'MCQ' | 'MSQ' | 'True/False' | 'Short Answer';
  options?: string[];
  correctAnswer?: string | string[];
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  co: string;
}

export default function QuizBuilder() {
  const navigate = useNavigate();
  
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCOs, setSelectedCOs] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(20);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [randomize, setRandomize] = useState(true);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<'config' | 'questions' | 'preview'>('config');

  const availableTopics = ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Hashing'];
  const availableCOs = ['CO1', 'CO2', 'CO3', 'CO4'];

  const questionBank: Question[] = [
    {
      id: 'q1',
      text: 'What is the time complexity of accessing an element in an array?',
      type: 'MCQ',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctAnswer: 'O(1)',
      marks: 2,
      difficulty: 'Easy',
      topic: 'Arrays',
      co: 'CO1',
    },
    {
      id: 'q2',
      text: 'Which data structure uses LIFO principle?',
      type: 'MCQ',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 'Stack',
      marks: 2,
      difficulty: 'Easy',
      topic: 'Stacks',
      co: 'CO1',
    },
    {
      id: 'q3',
      text: 'In a binary tree, what is the maximum number of nodes at level k?',
      type: 'MCQ',
      options: ['2^k', '2^(k-1)', 'k^2', '2k'],
      correctAnswer: '2^k',
      marks: 3,
      difficulty: 'Medium',
      topic: 'Trees',
      co: 'CO2',
    },
    {
      id: 'q4',
      text: 'A linked list is a linear data structure.',
      type: 'True/False',
      correctAnswer: 'True',
      marks: 1,
      difficulty: 'Easy',
      topic: 'Linked Lists',
      co: 'CO1',
    },
    {
      id: 'q5',
      text: 'What is the worst-case time complexity of binary search?',
      type: 'MCQ',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctAnswer: 'O(log n)',
      marks: 2,
      difficulty: 'Medium',
      topic: 'Arrays',
      co: 'CO2',
    },
  ];

  const filteredQuestions = questionBank.filter(q => {
    const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(q.topic);
    const coMatch = selectedCOs.length === 0 || selectedCOs.includes(q.co);
    return topicMatch && coMatch;
  });

  const addQuestion = (question: Question) => {
    if (!questions.find(q => q.id === question.id)) {
      setQuestions([...questions, question]);
    }
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + q.marks, 0);
  };

  const handleSaveDraft = () => {
    alert('Quiz saved as draft!');
    navigate('/academic/faculty/quizzes');
  };

  const handlePublish = () => {
    if (!quizTitle || questions.length === 0 || !deadline) {
      alert('Please fill all required fields and add at least one question');
      return;
    }
    alert('Quiz published successfully!');
    navigate('/academic/faculty/quizzes');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/academic/faculty/quizzes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Create Quiz</h1>
          <p className="text-sm text-muted-foreground mt-1">Build and configure your quiz</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish}>
            Publish Quiz
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {[
          { id: 'config', label: 'Configuration' },
          { id: 'questions', label: 'Questions' },
          { id: 'preview', label: 'Preview' },
        ].map((step) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === step.id
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Configuration Step */}
      {currentStep === 'config' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quiz Title *</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g., Quiz 1: Arrays and Linked Lists"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Attempts Allowed</label>
                  <input
                    type="number"
                    value={attemptsAllowed}
                    onChange={(e) => setAttemptsAllowed(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline *</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={randomize}
                    onChange={(e) => setRandomize(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Randomize question order</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Topics</label>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        if (selectedTopics.includes(topic)) {
                          setSelectedTopics(selectedTopics.filter(t => t !== topic));
                        } else {
                          setSelectedTopics([...selectedTopics, topic]);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        selectedTopics.includes(topic)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Course Outcomes</label>
                <div className="flex flex-wrap gap-2">
                  {availableCOs.map((co) => (
                    <button
                      key={co}
                      onClick={() => {
                        if (selectedCOs.includes(co)) {
                          setSelectedCOs(selectedCOs.filter(c => c !== co));
                        } else {
                          setSelectedCOs([...selectedCOs, co]);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        selectedCOs.includes(co)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {co}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep('questions')}>
              Next: Add Questions
            </Button>
          </div>
        </div>
      )}

      {/* Questions Step */}
      {currentStep === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">
                Selected Questions ({questions.length})
              </h3>
              <Badge variant="secondary">
                Total: {calculateTotalMarks()} marks
              </Badge>
            </div>

            {questions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">No questions added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Select questions from the question bank</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">Q{index + 1}.</span>
                            <Badge variant="outline" className="text-xs">{question.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{question.marks} marks</Badge>
                          </div>
                          <p className="text-sm mb-2">{question.text}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                            <Badge variant="outline" className="text-xs">{question.co}</Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                question.difficulty === 'Easy' ? 'text-green-600' :
                                question.difficulty === 'Medium' ? 'text-orange-600' :
                                'text-red-600'
                              }`}
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Question Bank */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">
              Question Bank ({filteredQuestions.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredQuestions.map((question) => {
                const isAdded = questions.find(q => q.id === question.id);
                return (
                  <Card key={question.id} className={isAdded ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{question.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{question.marks} marks</Badge>
                          </div>
                          <p className="text-sm mb-2">{question.text}</p>
                          {question.options && (
                            <div className="space-y-1 mb-2">
                              {question.options.map((option, idx) => (
                                <p key={idx} className="text-xs text-muted-foreground pl-4">
                                  {String.fromCharCode(65 + idx)}. {option}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                            <Badge variant="outline" className="text-xs">{question.co}</Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                question.difficulty === 'Easy' ? 'text-green-600' :
                                question.difficulty === 'Medium' ? 'text-orange-600' :
                                'text-red-600'
                              }`}
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? 'secondary' : 'default'}
                          onClick={() => addQuestion(question)}
                          disabled={!!isAdded}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">{quizTitle || 'Untitled Quiz'}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold">{duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                    <p className="text-sm font-semibold">{calculateTotalMarks()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Randomize</p>
                    <p className="text-sm font-semibold">{randomize ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-sm font-semibold">{questions.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-sm font-semibold">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{question.text}</p>
                        {question.options && (
                          <div className="space-y-1.5">
                            {question.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-border" />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">{question.marks} marks</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep('questions')}>
              Back to Edit
            </Button>
            <Button onClick={handlePublish} className="flex-1">
              Publish Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
