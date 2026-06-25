import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Network, Mic, Globe, Puzzle, Layers, ClipboardList, CheckCircle, BarChart3, Clock, HelpCircle } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Assessment {
  id: number;
  title: string;
  icon: LucideIcon;
  iconBg: string;
  difficulty: Difficulty;
  category: string;
  duration: string;
  questions: number;
  completed: boolean;
  score?: number;
  passed?: boolean;
}

const assessments: Assessment[] = [
  { id: 1, title: 'Quantitative Aptitude', icon: Calculator, iconBg: 'bg-w-purple/10', difficulty: 'Medium', category: 'Aptitude', duration: '45 min', questions: 30, completed: true, score: 85, passed: true },
  { id: 2, title: 'Data Structures', icon: Network, iconBg: 'bg-w-blue/10', difficulty: 'Hard', category: 'Technical', duration: '60 min', questions: 25, completed: false },
  { id: 3, title: 'HR Mock Interview', icon: Mic, iconBg: 'bg-w-pink/10', difficulty: 'Easy', category: 'Communication', duration: '30 min', questions: 15, completed: true, score: 92, passed: true },
  { id: 4, title: 'Web Development', icon: Globe, iconBg: 'bg-w-indigo/10', difficulty: 'Medium', category: 'Technical', duration: '50 min', questions: 20, completed: false },
  { id: 5, title: 'Logical Reasoning', icon: Puzzle, iconBg: 'bg-w-orange/10', difficulty: 'Medium', category: 'Aptitude', duration: '40 min', questions: 25, completed: true, score: 76, passed: true },
  { id: 6, title: 'System Design', icon: Layers, iconBg: 'bg-w-green/10', difficulty: 'Hard', category: 'Technical', duration: '90 min', questions: 10, completed: false },
];

const diffStyles: Record<Difficulty, { variant: 'success' | 'warning' | 'destructive' }> = {
  Easy: { variant: 'success' },
  Medium: { variant: 'warning' },
  Hard: { variant: 'destructive' },
};

export default function Assessments() {
  const totalTests = assessments.length;
  const completedCount = assessments.filter((a) => a.completed).length;
  const avgScore = Math.round(
    assessments.filter((a) => a.completed && a.score).reduce((sum, a) => sum + (a.score ?? 0), 0) /
      (completedCount || 1)
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <ClipboardList className="h-6 w-6 text-w-purple" />
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-purple">{totalTests}</span>
            <span className="text-xs text-muted-foreground">Total Tests</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <CheckCircle className="h-6 w-6 text-w-green" />
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-green">{completedCount}</span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <BarChart3 className="h-6 w-6 text-w-blue" />
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-blue">{avgScore}%</span>
            <span className="text-xs text-muted-foreground">Avg Score</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Assessment List ───────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">All Assessments</h2>
        <Card>
          <CardContent className="p-0">
            {assessments.map((a, i) => {
              const ds = diffStyles[a.difficulty];
              return (
                <div
                  key={a.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors ${i < assessments.length - 1 ? 'border-b border-border' : ''}`}
                >
                  {/* Icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.iconBg}`}>
                    <a.icon className="h-5 w-5" />
                  </div>

                  {/* Body */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold font-[family-name:var(--font-heading)]">{a.title}</span>
                      <Badge variant={ds.variant}>{a.difficulty}</Badge>
                      <Badge variant="secondary">{a.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration}</span>
                      <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {a.questions} questions</span>
                    </div>
                  </div>

                  {/* Result */}
                  {a.completed && a.score !== undefined ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-sm font-extrabold font-[family-name:var(--font-heading)] ${a.passed ? 'text-w-green' : 'text-w-red'}`}>
                        {a.score}%
                      </span>
                      <Badge variant={a.passed ? 'success' : 'destructive'} className="text-[10px]">
                        {a.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Action */}
                  <div>
                    {a.completed ? (
                      <Link to="/home/mocktest/results">
                        <Button variant="outline" size="sm">Review</Button>
                      </Link>
                    ) : (
                      <Link to="/home/mocktest/config">
                        <Button size="sm">Start Test</Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
