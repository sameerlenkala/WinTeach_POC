import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, BookOpen, Brain, BarChart3, ArrowLeft } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface Topic {
  id: number;
  name: string;
  icon: LucideIcon;
  tests: number;
  bestScore: number;
  progress: number;
  color: string;
  bg: string;
}

const topics: Topic[] = [
  { id: 1, name: 'Quantitative', icon: Calculator, tests: 15, bestScore: 88, progress: 72, color: '#5B4BDB', bg: 'bg-w-purple/10' },
  { id: 2, name: 'Verbal', icon: BookOpen, tests: 12, bestScore: 92, progress: 85, color: '#49A9BE', bg: 'bg-w-blue/10' },
  { id: 3, name: 'Logical', icon: Brain, tests: 10, bestScore: 76, progress: 68, color: '#ED9035', bg: 'bg-w-orange/10' },
  { id: 4, name: 'Data Interpretation', icon: BarChart3, tests: 8, bestScore: 80, progress: 55, color: '#88B033', bg: 'bg-w-green/10' },
];

export default function AptitudeTests() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home/mocktest" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Mocktest Hub
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Aptitude Tests</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Sharpen your quantitative, verbal, and logical skills</p>

      {/* ── Topic Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.bg}`} style={{ color: t.color }}>
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.tests} tests available</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Best Score</span>
                  <span className="font-bold" style={{ color: t.color }}>{t.bestScore}%</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold" style={{ color: t.color }}>{t.progress}%</span>
                  </div>
                  <Progress value={t.progress} indicatorColor={t.color} />
                </div>
              </div>

              <Link to="/home/mocktest/config">
                <Button size="sm" className="w-full">Start Practice</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
