import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react';

/* ── Mock Questions ───────────────────────────────────────────── */
interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    id: 1,
    text: 'A train running at 60 km/h crosses a pole in 9 seconds. What is the length of the train?',
    options: ['120 m', '150 m', '180 m', '200 m'],
    correct: 1,
  },
  {
    id: 2,
    text: 'If the ratio of the ages of two persons is 4:7 and the difference of their ages is 18 years, what is the age of the younger person?',
    options: ['20 years', '24 years', '28 years', '32 years'],
    correct: 1,
  },
  {
    id: 3,
    text: 'A shopkeeper sells an article at 20% profit. If the cost price is ₹500, what is the selling price?',
    options: ['₹550', '₹580', '₹600', '₹620'],
    correct: 2,
  },
  {
    id: 4,
    text: 'The average of 5 consecutive odd numbers is 27. What is the largest number?',
    options: ['29', '31', '33', '35'],
    correct: 1,
  },
  {
    id: 5,
    text: 'Two pipes can fill a tank in 12 and 15 hours respectively. If both pipes are opened together, how long will it take to fill the tank?',
    options: ['6 hr', '6 hr 40 min', '7 hr', '7 hr 30 min'],
    correct: 1,
  },
];

export default function TestTaking() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/home/mocktest/results');
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const q = questions[currentQuestion];
  const total = questions.length;
  const progressPercent = ((currentQuestion + 1) / total) * 100;
  const isLast = currentQuestion === total - 1;

  const selectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-w-purple">
          Q {currentQuestion + 1}/{total}
        </span>
        <span className={cn(
          'flex items-center gap-1.5 text-sm font-bold font-[family-name:var(--font-heading)]',
          timeLeft < 60 ? 'text-w-red' : 'text-muted-foreground'
        )}>
          <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
        </span>
      </div>
      <Progress value={progressPercent} indicatorColor="var(--color-w-purple)" className="h-2" />

      {/* ── Question Card ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <p className="text-base font-semibold leading-relaxed mb-6">{q.text}</p>

          <div className="space-y-3">
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer',
                  selectedAnswers[currentQuestion] === i
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <span className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                  selectedAnswers[currentQuestion] === i
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {optionLabels[i]}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Navigation ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((c) => c - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {isLast ? (
          <Button onClick={() => navigate('/home/mocktest/results')}>
            <Send className="h-4 w-4" /> Submit Test
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion((c) => c + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
