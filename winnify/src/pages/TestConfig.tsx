import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Settings2, Zap } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
const topics = [
  'Quantitative Aptitude',
  'Verbal Reasoning',
  'Logical Reasoning',
  'Data Interpretation',
];

const difficulties = [
  { label: 'Easy', color: 'text-w-green', bg: 'bg-w-green/10 border-w-green/20', active: 'bg-w-green/20 border-w-green ring-2 ring-w-green/30' },
  { label: 'Medium', color: 'text-w-orange', bg: 'bg-w-orange/10 border-w-orange/20', active: 'bg-w-orange/20 border-w-orange ring-2 ring-w-orange/30' },
  { label: 'Hard', color: 'text-w-red', bg: 'bg-w-red/10 border-w-red/20', active: 'bg-w-red/20 border-w-red ring-2 ring-w-red/30' },
];

const questionCounts = [10, 20, 30];
const timeLimits = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: 'No limit', value: 0 },
];

export default function TestConfig() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(topics[0]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home/mocktest" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Configure Test</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Customize your mock assessment</p>

      {/* ── Topic ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary transition-colors"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* ── Difficulty ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.label}
                onClick={() => setDifficulty(d.label)}
                className={cn(
                  'rounded-xl border p-4 text-center cursor-pointer transition-all',
                  difficulty === d.label ? d.active : d.bg
                )}
              >
                <span className={cn('text-sm font-bold font-[family-name:var(--font-heading)]', d.color)}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Number of Questions ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Number of Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {questionCounts.map((q) => (
              <button
                key={q}
                onClick={() => setQuestionCount(q)}
                className={cn(
                  'flex-1 h-10 rounded-full text-sm font-bold font-[family-name:var(--font-heading)] border transition-all cursor-pointer',
                  questionCount === q
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Time Limit ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Time Limit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {timeLimits.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeLimit(t.value)}
                className={cn(
                  'flex-1 h-10 rounded-full text-sm font-bold font-[family-name:var(--font-heading)] border transition-all cursor-pointer',
                  timeLimit === t.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Summary + Start ───────────────────────────────────── */}
      <Card className="bg-muted/50">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge>{topic}</Badge>
            <Badge variant="warning">{difficulty}</Badge>
            <Badge variant="info">{questionCount} Questions</Badge>
            <Badge variant="secondary">{timeLimit ? `${timeLimit} min` : 'No limit'}</Badge>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/home/mocktest/briefing')}
          >
            <Zap className="h-4 w-4" /> Start Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
