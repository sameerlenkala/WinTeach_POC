import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, Code, Building2, Zap, AlertCircle } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface PracticeCard {
  id: number;
  name: string;
  sub: string;
  icon: LucideIcon;
  gradient: string;
  hot: boolean;
  link: string;
}

const practiceCards: PracticeCard[] = [
  { id: 1, name: 'Aptitude', sub: '4 Topics', icon: Calculator, gradient: 'from-w-orange to-w-amber', hot: false, link: '/home/mocktest/aptitude' },
  { id: 2, name: 'Technical', sub: '6 Skills', icon: Code, gradient: 'from-w-green to-emerald-500', hot: false, link: '/home/mocktest/technical' },
  { id: 3, name: 'Company OA', sub: '14 Firms', icon: Building2, gradient: 'from-w-indigo to-w-purple', hot: true, link: '/home/mocktest/company-oa' },
];

const skills = [
  { id: 1, name: 'Quantitative', score: 72, color: '#5B4BDB' },
  { id: 2, name: 'Verbal', score: 85, color: '#49A9BE' },
  { id: 3, name: 'Logical', score: 68, color: '#ED9035' },
];

const trendData = [
  { label: 'W1', value: 65 },
  { label: 'W2', value: 72 },
  { label: 'W3', value: 68 },
  { label: 'W4', value: 78 },
  { label: 'W5', value: 82 },
  { label: 'W6', value: 76 },
  { label: 'W7', value: 88 },
];

const topicProgress = [
  { name: 'Quant', value: 72, color: '#5B4BDB' },
  { name: 'Verbal', value: 85, color: '#49A9BE' },
  { name: 'Logical', value: 68, color: '#ED9035' },
  { name: 'Coding', value: 78, color: '#88B033' },
  { name: 'DS/Algo', value: 62, color: '#EA446B' },
];

export default function Mocktest() {
  const [perfExpanded, setPerfExpanded] = useState(true);
  const maxTrend = Math.max(...trendData.map((d) => d.value));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Mock Assessments</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Practice · Identify gaps · Improve</p>

      {/* ── Upcoming Drive Banner ─────────────────────────────── */}
      <Card className="border-l-4 border-l-w-red">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Upcoming Drive
            </p>
            <p className="font-bold font-[family-name:var(--font-heading)]">Infosys OA Practice</p>
            <p className="text-xs text-muted-foreground mt-0.5">Mar 23, 10:00 AM</p>
          </div>
          <Link to="/home/mocktest/config">
            <Button size="sm">Practice Now</Button>
          </Link>
        </CardContent>
      </Card>

      {/* ── Start Practicing ──────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Start Practicing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practiceCards.map((c) => (
            <Link key={c.id} to={c.link}>
              <div
                className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${c.gradient} p-5 text-white cursor-pointer hover:-translate-y-0.5 transition-transform`}
              >
                <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                {c.hot && (
                  <Badge variant="outline" className="absolute top-3 right-3 border-white/20 bg-white/15 text-white text-[10px]">
                    Hot
                  </Badge>
                )}
                <c.icon className="relative z-10 h-6 w-6 mb-2" />
                <h3 className="relative z-10 font-bold font-[family-name:var(--font-heading)]">{c.name}</h3>
                <p className="relative z-10 text-xs opacity-80 mt-0.5">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Skills in Focus ───────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Skills in Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skills.map((s) => (
            <Link key={s.id} to="/home/mocktest/config">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold font-[family-name:var(--font-heading)]">{s.name}</p>
                    <span className="text-sm font-extrabold font-[family-name:var(--font-heading)]" style={{ color: s.color }}>{s.score}%</span>
                  </div>
                  <Progress value={s.score} indicatorColor={s.color} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Your Performance ──────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setPerfExpanded(!perfExpanded)}
          >
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">Your Performance</h2>
            <span className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {perfExpanded ? 'Collapse ▲' : 'Expand ▼'}
            </span>
          </div>

          {perfExpanded && (
            <div className="space-y-6">
              {/* 4-stat grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted p-3">
                  <span className="text-lg font-extrabold font-[family-name:var(--font-heading)] text-w-purple">23</span>
                  <span className="text-xs text-muted-foreground">Tests Taken</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted p-3">
                  <span className="text-lg font-extrabold font-[family-name:var(--font-heading)] text-w-green">94%</span>
                  <span className="text-xs text-muted-foreground">Best Score</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted p-3">
                  <span className="text-lg font-extrabold font-[family-name:var(--font-heading)] text-w-orange">Logical</span>
                  <span className="text-xs text-muted-foreground">Weakest</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted p-3">
                  <span className="text-lg font-extrabold font-[family-name:var(--font-heading)] text-w-blue">↑12%</span>
                  <span className="text-xs text-muted-foreground">Trend</span>
                </div>
              </div>

              {/* Score Trend Chart */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">Score Trend</p>
                <div className="flex items-end gap-2 h-32">
                  {trendData.map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-w-purple to-w-indigo transition-all duration-500"
                        style={{ height: `${(d.value / maxTrend) * 100}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Progress */}
              <div className="space-y-3">
                {topicProgress.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{t.name}</span>
                    <Progress value={t.value} indicatorColor={t.color} className="flex-1 h-2" />
                    <span className="text-xs font-bold w-10 text-right" style={{ color: t.color }}>{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
