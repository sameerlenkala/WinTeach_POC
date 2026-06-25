import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, Edit, RefreshCw, Save, CheckCircle, BookOpen, Calendar, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  text: string;
  type: 'MCQ' | 'MSQ' | 'True/False' | 'Short Answer';
  options?: string[];
  correctAnswer?: string | string[];
  solution: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  subtopic: string;
  co: string;
}

interface Lecture {
  id: string;
  number: number;
  topic: string;
  subtopics: string[];
  date: string;
}

interface TopicNode {
  id: string;
  name: string;
  subtopics: string[];
}

type Step = 'details' | 'configure' | 'questions' | 'preview';
type SelectionMode = 'lecture' | 'topic';
type QuestionSource = 'manual' | 'generate';

export default function ComprehensiveQuizBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const lectureFromState = location.state?.lecture;

  // Step Management
  const [currentStep, setCurrentStep] = useState<Step>('details');

  // Step 1: Quiz Details
  const [quizName, setQuizName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [cohort, setCohort] = useState('Section A');
  const [numQuestions, setNumQuestions] = useState(10);

  // Step 2: Configure Quiz
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('lecture');
  const [questionSource, setQuestionSource] = useState<QuestionSource>('generate');
  const [selectedLectures, setSelectedLectures] = useState<string[]>(
    lectureFromState ? [lectureFromState.id] : []
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<Record<string, string[]>>({});

  // Step 3: Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Mock Data
  const lectures: Lecture[] = [
    { id: 'lec-1', number: 1, topic: 'Introduction to Data Structures', subtopics: ['Arrays', 'Linked Lists', 'Memory Management'], date: '2024-08-05' },
    { id: 'lec-2', number: 2, topic: 'Stacks and Queues', subtopics: ['Stack Operations', 'Queue Operations', 'Applications'], date: '2024-08-08' },
    { id: 'lec-3', number: 3, topic: 'Trees', subtopics: ['Binary Trees', 'Tree Traversal', 'BST'], date: '2024-08-12' },
    { id: 'lec-4', number: 4, topic: 'Graphs', subtopics: ['Graph Representation', 'BFS', 'DFS'], date: '2024-08-15' },
    { id: 'lec-5', number: 5, topic: 'Hashing', subtopics: ['Hash Functions', 'Collision Resolution'], date: '2024-08-19' },
  ];

  const topics: TopicNode[] = [
    { id: 'topic-1', name: 'Arrays', subtopics: ['Array Basics', 'Array Operations', 'Multi-dimensional Arrays'] },
    { id: 'topic-2', name: 'Linked Lists', subtopics: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List'] },
    { id: 'topic-3', name: 'Stacks', subtopics: ['Stack Operations', 'Stack Applications', 'Expression Evaluation'] },
    { id: 'topic-4', name: 'Queues', subtopics: ['Queue Operations', 'Circular Queue', 'Priority Queue'] },
    { id: 'topic-5', name: 'Trees', subtopics: ['Binary Trees', 'Tree Traversal', 'BST', 'AVL Trees'] },
    { id: 'topic-6', name: 'Graphs', subtopics: ['Graph Representation', 'BFS', 'DFS', 'Shortest Path'] },
    { id: 'topic-7', name: 'Hashing', subtopics: ['Hash Functions', 'Collision Resolution', 'Applications'] },
  ];

  const cohorts = ['Section A', 'Section B', 'Section C', 'All Sections'];

  // Question Bank (mock data)
  const questionBank: Question[] = [
    {
      id: 'q1',
      text: 'What is the time complexity of accessing an element in an array?',
      type: 'MCQ',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctAnswer: 'O(1)',
      solution: 'Array elements can be accessed directly using their index, which is a constant time operation.',
      marks: 2,
      difficulty: 'Easy',
      topic: 'Arrays',
      subtopic: 'Array Basics',
      co: 'CO1',
    },
    {
      id: 'q2',
      text: 'Which data structure uses LIFO principle?',
      type: 'MCQ',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 'Stack',
      solution: 'Stack follows Last In First Out (LIFO) principle where the last element added is the first one to be removed.',
      marks: 2,
      difficulty: 'Easy',
      topic: 'Stacks',
      subtopic: 'Stack Operations',
      co: 'CO1',
    },
    {
      id: 'q3',
      text: 'In a binary tree, what is the maximum number of nodes at level k?',
      type: 'MCQ',
      options: ['2^k', '2^(k-1)', 'k^2', '2k'],
      correctAnswer: '2^k',
      solution: 'At each level k, the maximum number of nodes is 2^k, starting from level 0 (root).',
      marks: 3,
      difficulty: 'Medium',
      topic: 'Trees',
      subtopic: 'Binary Trees',
      co: 'CO2',
    },
    {
      id: 'q4',
      text: 'A linked list is a linear data structure.',
      type: 'True/False',
      correctAnswer: 'True',
      solution: 'Linked list is indeed a linear data structure where elements are stored in nodes connected by pointers.',
      marks: 1,
      difficulty: 'Easy',
      topic: 'Linked Lists',
      subtopic: 'Singly Linked List',
      co: 'CO1',
    },
    {
      id: 'q5',
      text: 'What is BFS in graph traversal?',
      type: 'Short Answer',
      correctAnswer: 'Breadth First Search',
      solution: 'BFS (Breadth First Search) is a graph traversal algorithm that explores all vertices at the present depth before moving to vertices at the next depth level.',
      marks: 3,
      difficulty: 'Medium',
      topic: 'Graphs',
      subtopic: 'BFS',
      co: 'CO2',
    },
  ];

  // Handlers
  const handleLectureToggle = (lectureId: string) => {
    setSelectedLectures(prev =>
      prev.includes(lectureId)
        ? prev.filter(id => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubtopicToggle = (topicId: string, subtopic: string) => {
    setSelectedSubtopics(prev => {
      const current = prev[topicId] || [];
      const updated = current.includes(subtopic)
        ? current.filter(s => s !== subtopic)
        : [...current, subtopic];
      return { ...prev, [topicId]: updated };
    });
  };

  const handleGenerateQuestions = () => {
    // Filter questions based on selection
    let filtered = questionBank;

    if (selectionMode === 'lecture') {
      const selectedLectureTopics = lectures
        .filter(l => selectedLectures.includes(l.id))
        .flatMap(l => l.subtopics);
      filtered = questionBank.filter(q => selectedLectureTopics.includes(q.subtopic));
    } else {
      const selectedTopicNames = topics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.name);
      const selectedSubtopicsList = Object.values(selectedSubtopics).flat();
      
      filtered = questionBank.filter(q =>
        selectedTopicNames.includes(q.topic) ||
        selectedSubtopicsList.includes(q.subtopic)
      );
    }

    // Take random questions up to numQuestions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numQuestions);
    setQuestions(selected);
    setCurrentStep('questions');
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleReplaceQuestion = (questionId: string) => {
    // Find a replacement question from question bank
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    const replacements = questionBank.filter(q =>
      q.topic === currentQuestion.topic &&
      q.subtopic === currentQuestion.subtopic &&
      !questions.some(existing => existing.id === q.id)
    );

    if (replacements.length > 0) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      setQuestions(prev => prev.map(q => q.id === questionId ? replacement : q));
    } else {
      alert('No replacement questions available for this topic/subtopic');
    }
  };

  const handleRegenerateQuiz = () => {
    handleGenerateQuestions();
  };

  const handlePublish = () => {
    alert(`Quiz "${quizName}" published successfully to ${cohort}!`);
    navigate(-1);
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Create Quiz</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStep === 'details' && 'Enter quiz details'}
            {currentStep === 'configure' && 'Configure quiz content'}
            {currentStep === 'questions' && 'Manage questions'}
            {currentStep === 'preview' && 'Review and publish'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {(['details', 'configure', 'questions', 'preview'] as Step[]).map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                    currentStep === step ? 'bg-primary text-primary-foreground' :
                    ['details', 'configure', 'questions', 'preview'].indexOf(currentStep) > idx ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {['details', 'configure', 'questions', 'preview'].indexOf(currentStep) > idx ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium capitalize">{step}</p>
                  </div>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-3 ${
                    ['details', 'configure', 'questions', 'preview'].indexOf(currentStep) > idx ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Step 1: Quiz Details */}
      {currentStep === 'details' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)]">Quiz Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Name *</label>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Mid-Term Quiz - Data Structures"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cohort *</label>
                <select
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                >
                  {cohorts.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Time *</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes) *</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Questions *</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setCurrentStep('configure')}
                disabled={!quizName || !startTime || !endTime || !duration || !numQuestions}
              >
                Next: Configure Quiz
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Quiz */}
      {currentStep === 'configure' && (
        <div className="space-y-6">
          {/* Selection Mode Toggle */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                Select Content Source
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant={selectionMode === 'lecture' ? 'default' : 'outline'}
                  onClick={() => setSelectionMode('lecture')}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  By Lecture
                </Button>
                <Button
                  variant={selectionMode === 'topic' ? 'default' : 'outline'}
                  onClick={() => setSelectionMode('topic')}
                  className="flex-1"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  By Topic
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {selectionMode === 'lecture'
                  ? 'Select one or more lectures. Questions will be pulled from topics covered in selected lectures.'
                  : 'Select specific topics and subtopics. Questions will be pulled from selected content.'}
              </p>
            </CardContent>
          </Card>

          {/* Lecture Selection */}
          {selectionMode === 'lecture' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Select Lectures
                </h3>
                <div className="space-y-3">
                  {lectures.map(lecture => (
                    <div
                      key={lecture.id}
                      onClick={() => handleLectureToggle(lecture.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedLectures.includes(lecture.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">Lecture {lecture.number}</Badge>
                            <h4 className="font-semibold">{lecture.topic}</h4>
                            {selectedLectures.includes(lecture.id) && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(lecture.date).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {lecture.subtopics.map((subtopic, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {subtopic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topic Selection */}
          {selectionMode === 'topic' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Select Topics & Subtopics
                </h3>
                <div className="space-y-4">
                  {topics.map(topic => (
                    <div key={topic.id} className="border border-border rounded-lg p-4">
                      <div
                        onClick={() => handleTopicToggle(topic.id)}
                        className="flex items-center gap-3 mb-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.id)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded"
                        />
                        <h4 className="font-semibold">{topic.name}</h4>
                      </div>
                      <div className="ml-7 space-y-2">
                        {topic.subtopics.map((subtopic, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSubtopicToggle(topic.id, subtopic)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubtopics[topic.id]?.includes(subtopic) || false}
                              onChange={() => {}}
                              className="h-3 w-3 rounded"
                            />
                            <span className="text-sm">{subtopic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Source */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                Question Source
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setQuestionSource('generate')}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    questionSource === 'generate'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Generate from DB</h4>
                    {questionSource === 'generate' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Auto-generate questions from question bank based on your selection
                  </p>
                </div>

                <div
                  onClick={() => setQuestionSource('manual')}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    questionSource === 'manual'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Edit className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Select Manually</h4>
                    {questionSource === 'manual' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manually select questions from question bank
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('details')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={
                (selectionMode === 'lecture' && selectedLectures.length === 0) ||
                (selectionMode === 'topic' && selectedTopics.length === 0 && Object.keys(selectedSubtopics).length === 0)
              }
            >
              {questionSource === 'generate' ? 'Generate Questions' : 'Select Questions'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}


      {/* Step 3: Questions Management */}
      {currentStep === 'questions' && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm">{questions.length} Questions</h3>
                    <p className="text-xs text-blue-700">Total Marks: {totalMarks}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleRegenerateQuiz}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button size="sm" onClick={() => alert('Add question functionality coming soon')}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Question
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <Card key={question.id}>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px]">Q{idx + 1}</Badge>
                          <Badge variant="outline" className="text-[10px]">{question.type}</Badge>
                          <Badge variant={
                            question.difficulty === 'Easy' ? 'success' :
                            question.difficulty === 'Medium' ? 'default' : 'destructive'
                          } className="text-[10px]">
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{question.marks} marks</Badge>
                        </div>
                        <p className="text-sm font-medium mb-2">{question.text}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Topic: {question.topic}</span>
                          <span>•</span>
                          <span>Subtopic: {question.subtopic}</span>
                          <span>•</span>
                          <span>CO: {question.co}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert('Edit question functionality coming soon')}
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReplaceQuestion(question.id)}
                          title="Replace"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Options (for MCQ/MSQ) */}
                    {question.options && (
                      <div className="space-y-2 pl-4">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded ${
                              option === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-muted/30'
                            }`}
                          >
                            <span className="text-sm font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="text-sm">{option}</span>
                            {option === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer (for non-MCQ) */}
                    {!question.options && (
                      <div className="pl-4 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm">
                          <span className="font-medium">Answer: </span>
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {/* Solution */}
                    <div className="pl-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs font-medium text-blue-900 mb-1">Solution:</p>
                      <p className="text-sm text-blue-800">{question.solution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('configure')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep('preview')}
              disabled={questions.length === 0}
            >
              Preview & Publish
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Publish */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          {/* Quiz Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                Quiz Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Quiz Name</p>
                  <p className="font-semibold">{quizName}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cohort</p>
                  <p className="font-semibold">{cohort}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{duration} minutes</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                  <p className="font-semibold">{totalMarks}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                  <p className="font-semibold text-sm">
                    {startTime ? new Date(startTime).toLocaleString() : 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">End Time</p>
                  <p className="font-semibold text-sm">
                    {endTime ? new Date(endTime).toLocaleString() : 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Questions</p>
                  <p className="font-semibold">{questions.length}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Selection Mode</p>
                  <p className="font-semibold capitalize">{selectionMode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-4">
                Question Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* By Difficulty */}
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm font-medium mb-3">By Difficulty</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Easy</span>
                      <Badge variant="success">
                        {questions.filter(q => q.difficulty === 'Easy').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Medium</span>
                      <Badge variant="default">
                        {questions.filter(q => q.difficulty === 'Medium').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Hard</span>
                      <Badge variant="destructive">
                        {questions.filter(q => q.difficulty === 'Hard').length}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* By Type */}
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm font-medium mb-3">By Type</p>
                  <div className="space-y-2">
                    {['MCQ', 'MSQ', 'True/False', 'Short Answer'].map(type => {
                      const count = questions.filter(q => q.type === type).length;
                      if (count === 0) return null;
                      return (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span>{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By Topic */}
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm font-medium mb-3">By Topic</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.from(new Set(questions.map(q => q.topic))).map(topic => (
                      <div key={topic} className="flex items-center justify-between text-sm">
                        <span className="truncate">{topic}</span>
                        <Badge variant="outline">
                          {questions.filter(q => q.topic === topic).length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish Confirmation */}
          <Card className="border-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] mb-2">
                    Ready to Publish
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once published, the quiz will be available to {cohort}. Students will receive a notification
                    and can start attempting the quiz from {startTime ? new Date(startTime).toLocaleString() : 'the start time'}.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handlePublish}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish to Students
                    </Button>
                    <Button variant="outline" onClick={() => {
                      alert('Quiz saved as draft');
                      navigate(-1);
                    }}>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('questions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
