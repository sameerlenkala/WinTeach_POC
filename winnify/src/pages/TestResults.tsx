import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Trophy, Clock, Target, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

/* ── Mock Results Data ────────────────────────────────────────── */
interface ReviewItem {
  id: number;
  text: string;
  options: string[];
  selected: number;
  correct: number;
}

const reviewData: ReviewItem[] = [
  { id: 1, text: 'A train running at 60 km/h crosses a pole in 9 seconds. What is the length of the train?', options: ['120 m', '150 m', '180 m', '200 m'], selected: 1, correct: 1 },
  { id: 2, text: 'If the ratio of the ages of two persons is 4:7 and the difference is 18 years, what is the age of the younger person?', options: ['20 years', '24 years', '28 years', '32 years'], selected: 2, correct: 1 },
  { id: 3, text: 'A shopkeeper sells an article at 20% profit. If the cost price is ₹500, what is the selling price?', options: ['₹550', '₹580', '₹600', '₹620'], selected: 2, correct: 2 },
  { id: 4, text: 'The average of 5 consecutive odd numbers is 27. What is the largest number?', options: ['29', '31', '33', '35'], selected: 1, correct: 1 },
  { id: 5, text: 'Two pipes can fill a tank in 12 and 15 hours respectively. How long together?', options: ['6 hr', '6 hr 40 min', '7 hr', '7 hr 30 min'], selected: 0, correct: 1 },
];

const correctCount = reviewData.filter((r) => r.selected === r.correct).length;
const total = reviewData.length;
const percentage = Math.round((correctCount / total) * 100);
const circumference = 2 * Math.PI * 48;
const offset = circumference - (percentage / 100) * circumference;

const stats = [
  { icon: Clock, label: 'Time Taken', value: '18:32', color: 'text-w-blue' },
  { icon: Target, label: 'Accuracy', value: `${percentage}%`, color: 'text-w-green' },
  { icon: TrendingUp, label: 'Rank', value: '#12', color: 'text-w-orange' },
];

export default function TestResults() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
      {/* ── Score Hero ────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-w-amber" />
            <h1 className="text-xl font-extrabold font-[family-name:var(--font-heading)]">Test Complete!</h1>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative mx-auto h-[140px] w-[140px] mb-4">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-muted)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="48" fill="none"
                stroke={percentage >= 70 ? 'var(--color-w-green)' : 'var(--color-w-orange)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">{correctCount}/{total}</span>
              <span className="text-sm font-bold text-muted-foreground">({percentage}%)</span>
            </div>
          </div>

          <Badge variant={percentage >= 70 ? 'success' : 'warning'} className="text-sm px-4 py-1">
            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing'}
          </Badge>
        </CardContent>
      </Card>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <s.icon className={cn('h-5 w-5', s.color)} />
              <span className={cn('text-lg font-extrabold font-[family-name:var(--font-heading)]', s.color)}>{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Question Review ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewData.map((r, i) => {
            const isCorrect = r.selected === r.correct;
            return (
              <div key={r.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-w-green shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-w-red shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{r.text}</p>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className={cn('text-xs font-semibold', isCorrect ? 'text-w-green' : 'text-w-red')}>
                      Your answer: {r.options[r.selected]}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs font-semibold text-w-green">
                        Correct answer: {r.options[r.correct]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Link to="/home/mocktest" className="flex-1">
          <Button variant="outline" className="w-full">Back to Hub</Button>
        </Link>
        <Link to="/home/mocktest/config" className="flex-1">
          <Button className="w-full">Retake Test</Button>
        </Link>
      </div>
    </div>
  );
}
