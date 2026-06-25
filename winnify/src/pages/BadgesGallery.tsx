import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Trophy, Flame, Star, ClipboardCheck, Mic, Code,
  FileText, UserCheck, Users, Sun, Moon, Award, Lock,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface BadgeItem {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  earned: boolean;
  date?: string;
  color: string;
}

const badges: BadgeItem[] = [
  { id: 1, icon: Star, title: 'Quiz Master', description: 'Score 90%+ on 5 mock tests', earned: true, date: 'Jan 15, 2025', color: 'text-w-amber' },
  { id: 2, icon: Flame, title: '30-Day Streak', description: 'Log in for 30 consecutive days', earned: true, date: 'Feb 2, 2025', color: 'text-w-orange' },
  { id: 3, icon: Trophy, title: 'Top Performer', description: 'Rank in top 10 on leaderboard', earned: true, date: 'Feb 10, 2025', color: 'text-w-purple' },
  { id: 4, icon: ClipboardCheck, title: 'First Assessment', description: 'Complete your first mock test', earned: true, date: 'Dec 5, 2024', color: 'text-w-green' },
  { id: 5, icon: Mic, title: 'WinSpeak Champion', description: 'Win 10 speaking challenges', earned: true, date: 'Feb 18, 2025', color: 'text-w-pink' },
  { id: 6, icon: Code, title: 'Code Warrior', description: 'Solve 50 coding problems', earned: true, date: 'Jan 28, 2025', color: 'text-w-indigo' },
  { id: 7, icon: FileText, title: 'Resume Pro', description: 'Get AI resume score above 85', earned: true, date: 'Feb 22, 2025', color: 'text-w-blue' },
  { id: 8, icon: UserCheck, title: 'Interview Ready', description: 'Complete all interview prep modules', earned: false, color: 'text-muted-foreground' },
  { id: 9, icon: Users, title: 'Team Player', description: 'Participate in 5 group discussions', earned: false, color: 'text-muted-foreground' },
  { id: 10, icon: Sun, title: 'Early Bird', description: 'Complete 10 sessions before 8 AM', earned: false, color: 'text-muted-foreground' },
  { id: 11, icon: Moon, title: 'Night Owl', description: 'Complete 10 sessions after 10 PM', earned: false, color: 'text-muted-foreground' },
  { id: 12, icon: Award, title: 'Perfectionist', description: 'Score 100% on any assessment', earned: false, color: 'text-muted-foreground' },
];

const earnedCount = badges.filter((b) => b.earned).length;
const lockedCount = badges.length - earnedCount;

export default function BadgesGallery() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Badges &amp; Achievements</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Collect them all!</p>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="inline-flex items-center gap-6 rounded-xl bg-muted px-6 py-3 w-full justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-purple">{badges.length}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
        <Separator orientation="vertical" className="h-7" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-green">{earnedCount}</span>
          <span className="text-xs text-muted-foreground">Earned</span>
        </div>
        <Separator orientation="vertical" className="h-7" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-muted-foreground">{lockedCount}</span>
          <span className="text-xs text-muted-foreground">Locked</span>
        </div>
      </div>

      {/* ── Badge Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((b) => (
          <Card key={b.id} className={cn(!b.earned && 'opacity-50')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl',
                b.earned ? 'bg-w-purple/10' : 'bg-muted'
              )}>
                {b.earned ? (
                  <b.icon className={cn('h-7 w-7', b.color)} />
                ) : (
                  <Lock className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
              {b.earned ? (
                <Badge variant="success" className="text-[10px]">{b.date}</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">Locked</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
