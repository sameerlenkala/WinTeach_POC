import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Code, Database, Cpu, Network, Boxes, Globe, ArrowLeft } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface Skill {
  id: number;
  name: string;
  icon: LucideIcon;
  tests: number;
  bestScore: number;
  progress: number;
  color: string;
  bg: string;
}

const skills: Skill[] = [
  { id: 1, name: 'DSA', icon: Code, tests: 20, bestScore: 88, progress: 78, color: '#5B4BDB', bg: 'bg-w-purple/10' },
  { id: 2, name: 'DBMS', icon: Database, tests: 12, bestScore: 82, progress: 65, color: '#4F46E5', bg: 'bg-w-indigo/10' },
  { id: 3, name: 'Operating Systems', icon: Cpu, tests: 10, bestScore: 75, progress: 55, color: '#49A9BE', bg: 'bg-w-blue/10' },
  { id: 4, name: 'Computer Networks', icon: Network, tests: 8, bestScore: 70, progress: 48, color: '#88B033', bg: 'bg-w-green/10' },
  { id: 5, name: 'OOP', icon: Boxes, tests: 14, bestScore: 90, progress: 82, color: '#ED9035', bg: 'bg-w-orange/10' },
  { id: 6, name: 'Web Dev', icon: Globe, tests: 16, bestScore: 85, progress: 72, color: '#EA446B', bg: 'bg-w-pink/10' },
];

export default function TechnicalTests() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home/mocktest" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Mocktest Hub
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Technical Tests</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Master core CS fundamentals and coding skills</p>

      {/* ── Skill Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`} style={{ color: s.color }}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.tests} tests available</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Best Score</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.bestScore}%</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} indicatorColor={s.color} />
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
