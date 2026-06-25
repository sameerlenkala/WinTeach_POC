import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Bell, Building2, ClipboardCheck, Mic, Settings, Calendar, Trophy, AlertCircle,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
interface Notification {
  id: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'drives' | 'assessments' | 'winspeak' | 'system';
}

const notifications: Notification[] = [
  { id: 1, icon: Building2, iconColor: 'text-w-indigo', iconBg: 'bg-w-indigo/10', title: 'Infosys Drive Update', message: 'Registration deadline extended to March 25. Don\'t miss out!', time: '2 hours ago', read: false, category: 'drives' },
  { id: 2, icon: Mic, iconColor: 'text-w-purple', iconBg: 'bg-w-purple/10', title: 'New WinSpeak Challenge', message: 'This week\'s challenge is live. Topic: Explain a technical concept.', time: '5 hours ago', read: false, category: 'winspeak' },
  { id: 3, icon: ClipboardCheck, iconColor: 'text-w-green', iconBg: 'bg-w-green/10', title: 'Assessment Reminder', message: 'Your Quantitative Aptitude mock test is scheduled for tomorrow.', time: '8 hours ago', read: false, category: 'assessments' },
  { id: 4, icon: Trophy, iconColor: 'text-w-amber', iconBg: 'bg-w-amber/10', title: 'Badge Earned!', message: 'Congratulations! You earned the "Quiz Master" badge.', time: '1 day ago', read: true, category: 'system' },
  { id: 5, icon: Building2, iconColor: 'text-w-indigo', iconBg: 'bg-w-indigo/10', title: 'TCS Drive Announced', message: 'TCS NQT drive scheduled for April 5. Start preparing now.', time: '1 day ago', read: true, category: 'drives' },
  { id: 6, icon: AlertCircle, iconColor: 'text-w-orange', iconBg: 'bg-w-orange/10', title: 'Streak Warning', message: 'You haven\'t logged in today. Don\'t break your 12-day streak!', time: '2 days ago', read: true, category: 'system' },
  { id: 7, icon: Calendar, iconColor: 'text-w-blue', iconBg: 'bg-w-blue/10', title: 'Mock Test Results', message: 'Your Logical Reasoning test results are ready. Score: 78%.', time: '3 days ago', read: true, category: 'assessments' },
  { id: 8, icon: Settings, iconColor: 'text-muted-foreground', iconBg: 'bg-muted', title: 'System Update', message: 'New features added: Practice mode improvements and bug fixes.', time: '4 days ago', read: true, category: 'system' },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Back Link ─────────────────────────────────────────── */}
      <Link to="/home" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Notifications</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Stay updated on your progress</p>

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="drives">Drives</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="winspeak">WinSpeak</TabsTrigger>
        </TabsList>

        {['all', 'drives', 'assessments', 'winspeak'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {(tab === 'all' ? notifications : notifications.filter((n) => n.category === tab)).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No notifications in this category.</p>
                  </CardContent>
                </Card>
              ) : (
                (tab === 'all' ? notifications : notifications.filter((n) => n.category === tab)).map((n) => (
                  <Card key={n.id} className={cn(!n.read && 'border-primary/20 bg-primary/[0.02]')}>
                    <CardContent className="p-4 flex items-start gap-3">
                      {/* Unread dot */}
                      <div className="relative">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', n.iconBg)}>
                          <n.icon className={cn('h-5 w-5', n.iconColor)} />
                        </div>
                        {!n.read && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-w-blue border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={cn('text-sm font-[family-name:var(--font-heading)]', n.read ? 'font-semibold' : 'font-bold')}>
                            {n.title}
                          </h3>
                          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
