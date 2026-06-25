import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlan } from '@/contexts/PlanContext';

type SkillStatus = 'completed' | 'assessed' | 'not-started';

function getStatus(index: number, total: number): SkillStatus {
  if (index < total * 0.35) return 'completed';
  if (index < total * 0.60) return 'assessed';
  return 'not-started';
}

const statusConfig: Record<SkillStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  completed:     { icon: CheckCircle, color: 'text-w-green',             bg: 'bg-w-green/10 border-w-green/20'   },
  assessed:      { icon: Clock,       color: 'text-w-blue',              bg: 'bg-w-blue/10 border-w-blue/20'     },
  'not-started': { icon: Circle,      color: 'text-muted-foreground/40', bg: 'bg-muted/50 border-border/60'      },
};

export default function SkillsTimeline() {
  const { weeklySkills, selectedAreas, duration, skills } = usePlan();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const totalSkills = skills.length;
  const completedSkills = Math.round(totalSkills * 0.35);

  let globalIndex = 0;
  const weeksWithStatus = weeklySkills.map((week) => ({
    ...week,
    skills: week.skills.map((skill) => ({
      ...skill,
      status: getStatus(globalIndex++, totalSkills),
    })),
  }));

  if (weeksWithStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No skills found. Go back and select areas of interest.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">
            Skills Timeline
            {duration && <span className="text-muted-foreground font-normal ml-2">({duration.label})</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedAreas.length > 0 ? selectedAreas.join(' · ') : 'All areas'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Circle className="h-3 w-3 text-muted-foreground/40" /> Not started</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-w-blue" /> Assessed</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-w-green" /> Completed</span>
        </div>
      </div>

      {/* ── Mobile: vertical accordion ─────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {weeksWithStatus.map((week) => {
          const done = week.skills.filter((s) => s.status === 'completed').length;
          const allDone = done === week.skills.length;
          const isOpen = expandedWeek === week.week;
          return (
            <div key={week.week} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedWeek(isOpen ? null : week.week)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer',
                  allDone ? 'bg-w-green/8' : done > 0 ? 'bg-primary/5' : 'bg-muted/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('text-sm font-bold font-[family-name:var(--font-heading)]',
                    allDone ? 'text-w-green' : done > 0 ? 'text-primary' : 'text-foreground'
                  )}>{week.label}</span>
                  <span className="text-[10px] text-muted-foreground">{week.skills.length} skill{week.skills.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{done}/{week.skills.length} done</span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </div>
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 gap-2 p-3 border-t border-border/60">
                  {week.skills.map((skill) => {
                    const cfg = statusConfig[skill.status as SkillStatus];
                    const Icon = cfg.icon;
                    return (
                      <Link
                        key={skill.slug}
                        to={`/home/90-day-plan/revision/${skill.slug}`}
                        className={cn('rounded-lg border p-3 transition-all hover:shadow-md block', cfg.bg)}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <Icon className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', cfg.color)} />
                          <p className="text-xs font-semibold font-[family-name:var(--font-heading)] leading-tight">{skill.name}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground pl-5">{skill.grouping}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop: horizontal scrollable grid ────────────────── */}
      <div className="hidden sm:block border border-border rounded-xl overflow-hidden w-full">
        <div
          className="overflow-x-auto overflow-y-hidden w-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) transparent',
            maxWidth: '100%',
          }}
        >
          <div
            className="inline-grid gap-3 p-3"
            style={{ gridTemplateColumns: `repeat(${weeksWithStatus.length}, minmax(160px, 1fr))` }}
          >
            {/* Week headers */}
            {weeksWithStatus.map((week) => {
              const done = week.skills.filter((s) => s.status === 'completed').length;
              const allDone = done === week.skills.length;
              return (
                <div key={`h-${week.week}`} className={cn('rounded-lg px-3 py-2 text-center border',
                  allDone ? 'bg-w-green/8 border-w-green/30' : done > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border/60'
                )}>
                  <p className={cn('text-xs font-bold font-[family-name:var(--font-heading)]',
                    allDone ? 'text-w-green' : done > 0 ? 'text-primary' : 'text-foreground'
                  )}>{week.label}</p>
                </div>
              );
            })}

            {/* Skill counts */}
            {weeksWithStatus.map((week) => (
              <div key={`c-${week.week}`} className="px-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {week.skills.length} skill{week.skills.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}

            {/* Skill cells */}
            {Array.from({ length: Math.max(...weeksWithStatus.map((w) => w.skills.length)) }).map((_, rowIdx) =>
              weeksWithStatus.map((week) => {
                const skill = week.skills[rowIdx];
                if (!skill) return <div key={`e-${week.week}-${rowIdx}`} />;
                const cfg = statusConfig[skill.status as SkillStatus];
                const Icon = cfg.icon;
                return (
                  <Link
                    key={`${week.week}-${rowIdx}`}
                    to={`/home/90-day-plan/revision/${skill.slug}`}
                    className={cn('rounded-lg border p-3 transition-all hover:shadow-md cursor-pointer block', cfg.bg)}
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <Icon className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', cfg.color)} />
                      <p className="text-xs font-semibold font-[family-name:var(--font-heading)] leading-tight">{skill.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{skill.grouping}</p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="text-muted-foreground">
          <strong className="text-foreground font-[family-name:var(--font-heading)]">{completedSkills}</strong> of {totalSkills} skills completed
        </span>
        <Badge variant={completedSkills === totalSkills ? 'success' : 'default'}>
          {totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0}% done
        </Badge>
        {duration && totalSkills > 0 && (
          <span className="text-xs text-muted-foreground">
            Pace: <strong className="text-foreground">{Math.round((totalSkills * 5) / duration.totalWeeks * 10) / 10}h/week</strong>
          </span>
        )}
      </div>
    </div>
  );
}
