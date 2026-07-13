import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import { studentApi, type LearnHome } from '@/api/student';
import type { UserProfile } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Mail, Lightbulb, GraduationCap, Pencil, Check, X, BookOpen, Flame, Target } from 'lucide-react';

/* All content on this page is real: identity from /auth/me, learning stats
   from /student/home. Sections without a data source (mentor, certifications,
   awards) were removed rather than mocked. */

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [home, setHome] = useState<LearnHome | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fName, setFName] = useState('');
  const [fDesignation, setFDesignation] = useState('');
  const [fSkills, setFSkills] = useState('');

  useEffect(() => {
    authApi.me().then(setMe).catch(() => setError('Could not load your profile.'));
    // Learning stats are student-only; other roles landing here just skip them.
    if (user?.role === 'student' || !user?.role) {
      studentApi.home().then(setHome).catch(() => { /* stats optional */ });
    }
  }, [user?.role]);

  const displayName = me?.full_name || user?.name || 'Student';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const skills = me?.skills ?? [];

  const avgMastery = useMemo(() => {
    const cs = home?.courses ?? [];
    const withContent = cs.filter(c => c.published_lessons > 0);
    if (!withContent.length) return null;
    return Math.round(withContent.reduce((s, c) => s + c.mastery_pct, 0) / withContent.length);
  }, [home]);

  const startEdit = () => {
    setFName(me?.full_name ?? displayName);
    setFDesignation(me?.designation ?? '');
    setFSkills(skills.join(', '));
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await authApi.updateMe({
        full_name: fName.trim(),
        designation: fDesignation.trim(),
        skills: fSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 12),
      });
      setMe(updated);
      updateUser({ name: updated.full_name });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Profile Header ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-primary/10 text-xl font-extrabold font-[family-name:var(--font-heading)] text-primary">
                {initials}
              </div>
              {editing ? (
                <div className="space-y-2 w-full max-w-sm">
                  <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Your name" aria-label="Name" />
                  <Input value={fDesignation} onChange={e => setFDesignation(e.target.value)}
                         placeholder="Headline — e.g. B.Tech CSE · Class of 2027" aria-label="Headline" />
                </div>
              ) : (
                <div className="min-w-0">
                  <h1 className="text-xl font-bold font-[family-name:var(--font-heading)] truncate">{displayName}</h1>
                  {me?.designation
                    ? <p className="text-sm text-muted-foreground">{me.designation}</p>
                    : <p className="text-sm text-muted-foreground italic">Add a headline — degree, branch, batch…</p>}
                  {me?.institute_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <GraduationCap className="h-3.5 w-3.5" /> {me.institute_name}
                    </p>
                  )}
                </div>
              )}
            </div>
            {editing ? (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={save} disabled={saving || !fName.trim()}>
                  <Check className="h-4 w-4 mr-1" /> {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={startEdit} className="shrink-0">
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
            )}
          </div>
          {me?.role && !editing && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs capitalize">{me.role}</Badge>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* ── Learning stats (real, from /student/home) ─────────── */}
      {home && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center gap-0.5">
              <Target className="h-4 w-4 text-w-purple mb-1" />
              <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-purple">
                {avgMastery !== null ? `${avgMastery}%` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">Avg Mastery</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center gap-0.5">
              <BookOpen className="h-4 w-4 text-w-green mb-1" />
              <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-green">
                {home.week.lessons_completed}
              </span>
              <span className="text-xs text-muted-foreground">Lessons This Week</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center gap-0.5">
              <Flame className="h-4 w-4 text-w-orange mb-1" />
              <span className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-w-orange">
                {home.week.active_days}
              </span>
              <span className="text-xs text-muted-foreground">Active Days This Week</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Quick Info ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Quick Info</h2>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground w-16">Email</span>
              <span className="text-sm truncate">{me?.email || user?.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Lightbulb className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">Skills</span>
              {editing ? (
                <Input value={fSkills} onChange={e => setFSkills(e.target.value)}
                       placeholder="Comma-separated — e.g. Python, React, SQL" aria-label="Skills" />
              ) : skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">No skills added yet — hit Edit to add some.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Course mastery (real, per enrolled course) ────────── */}
      {home && home.courses.length > 0 && (
        <section>
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Course Mastery</h2>
          <Card>
            <CardContent className="p-0">
              {home.courses.map((c, i) => (
                <Link key={c.id} to={`/home/courses/${c.id}`}
                      className={`block px-5 py-3.5 hover:bg-muted/50 transition-colors ${i < home.courses.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <span className="text-sm font-semibold truncate">{c.name}</span>
                    <span className="text-xs font-bold text-muted-foreground shrink-0">
                      {c.published_lessons > 0
                        ? `${c.read_lessons}/${c.published_lessons} lessons · ${c.mastery_pct}%`
                        : 'No lessons published yet'}
                    </span>
                  </div>
                  <Progress value={c.mastery_pct} className="h-1.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
