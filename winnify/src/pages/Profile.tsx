import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Star, ScrollText, GraduationCap, UserCircle, Mail, Lightbulb, ArrowRight } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */
const topSkills = [
  { name: 'React', level: 'Advanced', variant: 'success' as const },
  { name: 'Python', level: 'Advanced', variant: 'success' as const },
  { name: 'System Design', level: 'Intermediate', variant: 'warning' as const },
  { name: 'Machine Learning', level: 'Intermediate', variant: 'warning' as const },
  { name: 'Cloud Computing', level: 'Basic', variant: 'info' as const },
];

interface Award {
  icon: LucideIcon;
  title: string;
}

const awards: Award[] = [
  { icon: Trophy, title: 'Top Performer' },
  { icon: Flame, title: '30-Day Streak' },
  { icon: Star, title: 'Quiz Master' },
];

interface Certification {
  icon: LucideIcon;
  title: string;
  issuer: string;
  date: string;
}

const certifications: Certification[] = [
  { icon: ScrollText, title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Jan 2025' },
  { icon: GraduationCap, title: 'DSA with Python', issuer: 'NPTEL', date: 'Dec 2024' },
];

const interestTags = ['React', 'Python', 'System Design', 'ML'];

export default function Profile() {
  const { user } = useAuth();
  const displayName = user?.name || 'Student';
  const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Profile Header ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-xl font-extrabold font-[family-name:var(--font-heading)] text-primary">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">{displayName}</h1>
              <p className="text-sm text-muted-foreground">B.Tech Computer Science</p>
              <p className="text-xs text-muted-foreground">Vellore Institute of Technology · Class of 2026</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              Main Quest: SDE at a Product Company
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Winnify Score Row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-0.5">
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-purple">78/100</span>
            <span className="text-xs text-muted-foreground">Score</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-0.5">
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-green">1,250</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-0.5">
            <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-orange">12</span>
            <span className="text-xs text-muted-foreground">Day Streak</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Info ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Quick Info</h2>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground w-16">Email</span>
              <span className="text-sm">{user?.email || 'student@university.edu'}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground w-16">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {interestTags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Assigned Mentor ───────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Assigned Mentor</h2>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-w-purple/10">
              <UserCircle className="h-6 w-6 text-w-purple" />
            </div>
            <div>
              <p className="text-sm font-bold font-[family-name:var(--font-heading)]">Dr. Priya Sharma</p>
              <p className="text-xs text-muted-foreground">Associate Professor, CSE</p>
              <p className="text-xs text-muted-foreground">priya.sharma@university.edu</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Top Skills ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Top Skills</h2>
        <Card>
          <CardContent className="p-0">
            {topSkills.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-center justify-between px-5 py-3 ${i < topSkills.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-sm font-semibold">{s.name}</span>
                <Badge variant={s.variant}>{s.level}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ── Recent Awards ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">Recent Awards</h2>
          <Link to="/home/profile/badges">
            <Button variant="link" size="sm" className="text-primary text-xs">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {awards.map((a) => (
            <Link key={a.title} to="/home/profile/badges">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <a.icon className="h-8 w-8 text-w-purple" />
                  <span className="text-xs font-bold font-[family-name:var(--font-heading)] text-center">{a.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <Link to="/home/profile/badges" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            View All Badges <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Certifications ────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Certifications</h2>
        <Card>
          <CardContent className="p-0">
            {certifications.map((c, i) => (
              <div
                key={c.title}
                className={`flex items-center gap-4 px-5 py-3.5 ${i < certifications.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-w-purple/10">
                  <c.icon className="h-5 w-5 text-w-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold font-[family-name:var(--font-heading)]">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.issuer}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{c.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
