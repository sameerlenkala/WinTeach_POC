import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, BookOpen, Mic, Code, Building2, Star, Trophy, Bot } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface SemesterNode {
  id: number;
  label: string;
  score: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

const semesters: SemesterNode[] = [
  { id: 1, label: 'SEM 1', score: 78, status: 'Completed' },
  { id: 2, label: 'SEM 2', score: 82, status: 'Completed' },
  { id: 3, label: 'SEM 3', score: 74, status: 'In Progress' },
  { id: 4, label: 'SEM 4', score: 0, status: 'Upcoming' },
];

interface ActivaScore {
  id: number;
  name: string;
  icon: LucideIcon;
  score: number;
  color: string;
  bg: string;
}

const activaScores: ActivaScore[] = [
  { id: 1, name: 'Academics', icon: BookOpen, score: 82, color: '#5B4BDB', bg: 'bg-w-purple/10' },
  { id: 2, name: 'Communication', icon: Mic, score: 74, color: '#4F46E5', bg: 'bg-w-indigo/10' },
  { id: 3, name: 'Technical', icon: Code, score: 88, color: '#49A9BE', bg: 'bg-w-blue/10' },
  { id: 4, name: 'Internship', icon: Building2, score: 45, color: '#88B033', bg: 'bg-w-green/10' },
  { id: 5, name: 'Values', icon: Star, score: 70, color: '#ED9035', bg: 'bg-w-orange/10' },
  { id: 6, name: 'Activities', icon: Trophy, score: 65, color: '#EA446B', bg: 'bg-w-pink/10' },
];

const statusColor: Record<string, { variant: 'success' | 'info' | 'secondary' }> = {
  Completed: { variant: 'success' },
  'In Progress': { variant: 'info' },
  Upcoming: { variant: 'secondary' },
};

export default function Journey() {
  const completedCount = semesters.filter((s) => s.status === 'Completed').length;
  const fillPercent = (completedCount / (semesters.length + 1)) * 100;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Rocket className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Your Career Journey</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Track your progress across semesters and reach your goal</p>

      {/* ── Roadmap ───────────────────────────────────────────── */}
      <div className="relative">
        {/* Track line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full">
          <div
            className="h-full bg-gradient-to-r from-w-purple to-w-indigo rounded-full transition-all duration-700"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        <div className="relative flex justify-between items-start pt-0">
          {semesters.map((sem) => {
            const sc = statusColor[sem.status];
            const isCompleted = sem.status === 'Completed';
            const isCurrent = sem.status === 'In Progress';

            return (
              <div key={sem.id} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold font-[family-name:var(--font-heading)] border-2 transition-all ${
                    isCompleted
                      ? 'bg-w-green text-white border-w-green'
                      : isCurrent
                        ? 'bg-w-indigo text-white border-w-indigo ring-4 ring-w-indigo/20'
                        : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {isCompleted ? '✓' : sem.label.replace('SEM ', '')}
                </div>
                <span className="text-xs font-bold font-[family-name:var(--font-heading)]">{sem.label}</span>
                {sem.score > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground">{sem.score}%</span>
                )}
                <Badge variant={sc.variant} className="text-[10px]">{sem.status}</Badge>
              </div>
            );
          })}

          {/* Goal Node */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-w-orange/10 border-2 border-w-orange">
              <Star className="h-5 w-5 text-w-orange" />
            </div>
            <span className="text-xs font-bold font-[family-name:var(--font-heading)]">GOAL</span>
            <Badge variant="warning" className="text-[10px]">Dream Job</Badge>
          </div>
        </div>
      </div>

      {/* ── ACTIVA Scores ─────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">ACTIVA Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activaScores.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`} style={{ color: item.color }}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold font-[family-name:var(--font-heading)]">{item.name}</span>
                  </div>
                  <span className="text-sm font-extrabold font-[family-name:var(--font-heading)]" style={{ color: item.color }}>
                    {item.score}/100
                  </span>
                </div>
                <Progress value={item.score} indicatorColor={item.color} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <Button size="lg" className="w-full flex items-center gap-2">
        <Bot className="h-5 w-5" /> Generate AI Roadmap
      </Button>
    </div>
  );
}
