import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Save, ArrowLeft, Shuffle, BookOpen, Target, ChevronRight } from 'lucide-react';
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

type SelectionMode = 'lecture' | 'topic';

export default function EnhancedQuizBuilder() {
  const navigate = useNavigate();
  
  // Quiz Configuration
  const [quizTitle, setQuizTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [randomize, setRandomize] = useState(true);
  const [deadline, setDeadline] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [cohort, setCohort] = useState('Section A');
  
  // Selection Mode
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('lecture');
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<'details' | 'configure' | 'questions' | 'preview'>('details');

  // Mock Data
  const lectures: Lecture[] = [
    { id: 'lec-1', number: 1, topic: 'Introduction to Data Structures', subtopics: ['Arrays', 'Linked Lists'], date: '2024-08-05' },
    { id: 'lec-2', number: 2, topic: 'Stacks and Queues', subtopics: ['Stack Operations', 'Queue Operations'], date: '2024-08-08' },
    { id: 'lec-3', number: 3, topic: 'Trees', subtopics: ['Binary Trees', 'Tree Traversal'], date: '2024-08-12' },
    { id: 'lec-4', number: 4, topic: 'Binary Search Trees', subtopics: ['BST Operations', 'AVL Trees'], date: '2024-08-15' },
    { id: 'lec-5', number: 5, topic: 'Graphs', subtopics: ['Graph Representation', 'BFS', 'DFS'], date: '2024-08-19' },
  ];

  const topics: TopicNode[] = [
    { id: 'topic-1', name: 'Arrays', subtopics: ['Array Basics', 'Array Operations', 'Multi-dimensional Arrays'] },
    { id: 'topic-2', name: 'Linked Lists', subtopics: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List'] },
    { id: 'topic-3', name: 'Stacks', subtopics: ['Stack Operations', 'Stack Applications', 'Expression Evaluation'] },
    { id: 'topic-4', name: 'Queues', subtopics: ['Queue Operations', 'Circular Queue', 'Priority Queue'] },
    { id: 'topic-5', name: 'Trees', subtopics: ['Binary Trees', 'Tree Traversal', 'BST', 'AVL Trees'] },
    { id: 'topic-6', name: 'Graphs', subtopics: ['Graph Representation', 'BFS', 'DFS', 'Shortest Path'] },
  ];

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
      subtopic: 'Array Basics',
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
      subtopic: 'Stack Operations',
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
      subtopic: 'Binary Trees',
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
      subtopic: 'Singly Linked List',
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
      subtopic: 'Array Operations',
      co: 'CO2',
    },
    {
      id: 'q6',
      text: 'Which traversal visits the root node first?',
      type: 'MCQ',
      options: ['Inorder', 'Preorder', 'Postorder', 'Level Order'],
      correctAnswer: 'Preorder',
      marks: 2,
      difficulty: 'Easy',
      topic: 'Trees',
      subtopic: 'Tree Traversal',
      co: 'CO1',
    },
  ];

  const handleLectureToggle = (lectureId: string) => {
    setSelectedLectures(prev =>
      prev.includes(lectureId)
        ? prev.filter(id => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const handleTopicToggle = (topicName: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicName)
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleSubtopicToggle = (subtopic: string) => {
    setSelectedSubtopics(prev =>
      prev.includes(subtopic)
        ? prev.filter(s => s !== subtopic)
        : [...prev, subtopic]
    );
  };

  const getFilteredQuestions = () => {
    if (selectionMode === 'lecture') {
      // Filter by selected lectures
      const selectedLectureTopics = lectures
        .filter(lec => selectedLectures.includes(lec.id))
        .flatMap(lec => lec.subtopics);
      
      return questionBank.filter(q => selectedLectureTopics.includes(q.subtopic));
    } else {
      // Filter by selected topics/subtopics
      if (selectedSubtopics.length > 0) {
        return questionBank.filter(q => selectedSubtopics.includes(q.subtopic));
      } else if (selectedTopics.length > 0) {
        return questionBank.filter(q => selectedTopics.includes(q.topic));
      }
      return questionBank;
    }
  };

  const handleGenerateQuiz = () => {
    const filtered = getFilteredQuestions();
    const selected = filtered.slice(0, numQuestions);
    setQuestions(selected);
    setCurrentStep('questions');
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handlePublish = () => {
    alert('Quiz published successfully!');
    navigate('/academic/faculty/quizzes');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              Create Quiz
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure quiz and select questions
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['details', 'configure', 'questions', 'preview'].map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentStep === step
                  ? 'bg-primary text-white'
                  : index < ['details', 'configure', 'questions', 'preview'].indexOf(currentStep)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
            {index < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1: Quiz Details */}
      {currentStep === 'details' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">Quiz Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quiz Name *</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g., Mid-Term Quiz 1"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cohort *</label>
                <select
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="All Sections">All Sections</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions *</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
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
              <div>
                <label className="block text-sm font-medium mb-2">Attempts Allowed</label>
                <input
                  type="number"
                  value={attemptsAllowed}
                  onChange={(e) => setAttemptsAllowed(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="randomize"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="randomize" className="text-sm">
                Randomize question order for each student
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep('configure')}>
                Next: Configure Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Quiz (Lecture/Topic Selection) */}
      {currentStep === 'configure' && (
        <div className="space-y-4">
          {/* Selection Mode Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">Select questions based on:</p>
                <div className="flex gap-2">
                  <Button
                    variant={selectionMode === 'lecture' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionMode('lecture')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Lectures
                  </Button>
                  <Button
                    variant={selectionMode === 'topic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionMode('topic')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Topics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Side: Lecture Selection */}
            {selectionMode === 'lecture' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                    Select Lectures
                  </h3>
                  <div className="space-y-2">
                    {lectures.map((lecture) => (
                      <div
                        key={lecture.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLectures.includes(lecture.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handleLectureToggle(lecture.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Lecture {lecture.number}</p>
                            <p className="font-semibold text-sm">{lecture.topic}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {lecture.subtopics.map((subtopic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {subtopic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedLectures.includes(lecture.id)}
                            onChange={() => handleLectureToggle(lecture.id)}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Right Side: Topic Selection */}
            {selectionMode === 'topic' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                    Select Topics & Subtopics
                  </h3>
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <div key={topic.id} className="space-y-2">
                        <div
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTopics.includes(topic.name)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => handleTopicToggle(topic.name)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{topic.name}</p>
                            <input
                              type="checkbox"
                              checked={selectedTopics.includes(topic.name)}
                              onChange={() => handleTopicToggle(topic.name)}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        {selectedTopics.includes(topic.name) && (
                          <div className="ml-4 space-y-1">
                            {topic.subtopics.map((subtopic, idx) => (
                              <div
                                key={idx}
                                className={`p-2 border rounded cursor-pointer text-sm ${
                                  selectedSubtopics.includes(subtopic)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted/50'
                                }`}
                                onClick={() => handleSubtopicToggle(subtopic)}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{subtopic}</span>
                                  <input
                                    type="checkbox"
                                    checked={selectedSubtopics.includes(subtopic)}
                                    onChange={() => handleSubtopicToggle(subtopic)}
                                    className="h-3 w-3"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Bank Preview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
                  Available Questions
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Total Questions Available:</span>
                    <Badge variant="secondary">{getFilteredQuestions().length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {getFilteredQuestions().slice(0, 5).map((question) => (
                      <div key={question.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{question.text}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                              <Badge variant="outline" className="text-xs">{question.subtopic}</Badge>
                              <Badge variant="secondary" className="text-xs">{question.difficulty}</Badge>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{question.marks}m</span>
                        </div>
                      </div>
                    ))}
                    {getFilteredQuestions().length > 5 && (
                      <p className="text-xs text-center text-muted-foreground">
                        +{getFilteredQuestions().length - 5} more questions
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('details')}>
              Back
            </Button>
            <Button onClick={handleGenerateQuiz}>
              Generate Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Questions Management */}
      {currentStep === 'questions' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                Quiz Questions ({questions.length})
              </h3>
              <Button variant="outline" size="sm">
                <Shuffle className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Q{index + 1}</Badge>
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">{question.marks} marks</span>
                      </div>
                      <p className="font-medium mb-2">{question.text}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {String.fromCharCode(65 + idx)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                        <Badge variant="outline" className="text-xs">{question.subtopic}</Badge>
                        <Badge variant="outline" className="text-xs">{question.co}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('configure')}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep('preview')}>
                Preview Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {currentStep === 'preview' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">Quiz Preview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-semibold">{questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-semibold">{questions.reduce((sum, q) => sum + q.marks, 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attempts</p>
                <p className="font-semibold">{attemptsAllowed}</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('questions')}>
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish}>
                  Publish Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
