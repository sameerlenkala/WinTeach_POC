import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  CheckCircle, ArrowRight, ArrowLeft, Target,
  Monitor, Wrench, Zap,
  Cpu, Building2, FlaskConical, Dna, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PlanExecution from '@/components/plan/PlanExecution';
import { allAoiSkillsForCalc, basicModuleSkills, usePlan } from '@/contexts/PlanContext';

/* ── Stream + Area Data ───────────────────────────────────────── */
interface StreamData {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  color: string;
  activeColor: string;
  areas: string[];
}

const streamsData: StreamData[] = [
  { id: 'cs', label: 'Computer Science', short: 'CS', icon: Monitor,
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',
    activeColor: 'bg-violet-600 text-white',
    areas: ['Software Development', 'Data Science & Analytics', 'AI & Machine Learning', 'Cybersecurity', 'Cloud Computing & DevOps', 'Product Management & Strategy'] },
  { id: 'eee', label: 'Electrical & Electronics (EEE)', short: 'EEE', icon: Zap,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    activeColor: 'bg-amber-600 text-white',
    areas: ['Power Systems & Energy', 'Electrical Machines & Drives', 'Power Electronics', 'Control Systems & Automation', 'Embedded & Hardware Systems'] },
  { id: 'ece', label: 'Electronics & Communication (ECE)', short: 'ECE', icon: Cpu,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    activeColor: 'bg-blue-600 text-white',
    areas: ['Embedded Systems & IoT', 'Communication Systems', 'VLSI & Chip Design', 'Embedded & Hardware Systems', 'Control Systems & Automation', 'Power Electronics'] },
  { id: 'mech', label: 'Mechanical Engineering', short: 'MECH', icon: Wrench,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    activeColor: 'bg-orange-600 text-white',
    areas: ['Design Engineering', 'Manufacturing & Production Systems', 'Thermal & Fluid Systems', 'Robotics & Mechatronics'] },
  { id: 'civil', label: 'Civil Engineering', short: 'CIVIL', icon: Building2,
    color: 'text-stone-600 bg-stone-50 dark:bg-stone-950/30 border-stone-200 dark:border-stone-800',
    activeColor: 'bg-stone-600 text-white',
    areas: ['Structural Engineering', 'Construction & Project Management', 'Environmental & Water Systems', 'Transportation Engineering', 'Urban Planning & Development'] },
  { id: 'chem', label: 'Chemical Engineering', short: 'CHEM', icon: FlaskConical,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    activeColor: 'bg-emerald-600 text-white',
    areas: ['Process Engineering', 'Energy & Petrochemical Systems', 'Materials & Polymer Engineering', 'Biochemical & Pharmaceutical Engineering'] },
  { id: 'biotech', label: 'Biotechnology', short: 'BIO', icon: Dna,
    color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
    activeColor: 'bg-pink-600 text-white',
    areas: ['Molecular & Cellular Biotechnology', 'Bioprocess Engineering', 'Pharmaceutical & Drug Development', 'Bioinformatics & Computational Biology', 'Agricultural & Food Biotechnology'] },
];

/* ── Area hours — computed dynamically from actual skill counts × 5h ── */
const HOURS_PER_SKILL = 5;

function getAreaHours(area: string): number {
  // Stream-level "Basic" selections → use basic module skill count
  if (area === 'Computer Science') {
    return basicModuleSkills.filter((s) => s.aoi === 'Computer Science Basic').length * HOURS_PER_SKILL;
  }
  if (area === 'Mechanical Engineering') {
    return basicModuleSkills.filter((s) => s.aoi === 'Mechanical Basic').length * HOURS_PER_SKILL;
  }
  // AOI-level selections → count from AOI skills
  const exact = allAoiSkillsForCalc.filter((s) => s.aoi === area).length;
  if (exact > 0) return exact * HOURS_PER_SKILL;
  // Fuzzy fallback
  const streamSkills = allAoiSkillsForCalc.filter((s) =>
    area.toLowerCase().includes(s.aoi.toLowerCase().split(' ')[0].toLowerCase())
  ).length;
  return Math.max(streamSkills, 5) * HOURS_PER_SKILL;
}

const DEFAULT_HOURS = 10 * HOURS_PER_SKILL; // fallback: 10 skills

/* ── Duration Data ────────────────────────────────────────────── */
interface DurationOpt { id: string; label: string; days: number }
const allDurations: DurationOpt[] = [
  { id: '1w', label: '1 Week', days: 7 },
  { id: '15d', label: '15 Days', days: 15 },
  { id: '1m', label: '1 Month', days: 30 },
  { id: '1.5m', label: '1.5 Months', days: 45 },
  { id: '2m', label: '2 Months', days: 60 },
  { id: '3m', label: '3 Months', days: 90 },
];

function getDurations(totalHours: number) {
  const minDays = Math.ceil(totalHours / 6);
  const comfortDays = Math.ceil(totalHours / 2);
  let recId = '2m';
  if (comfortDays <= 7) recId = '1w';
  else if (comfortDays <= 15) recId = '15d';
  else if (comfortDays <= 30) recId = '1m';
  else if (comfortDays <= 45) recId = '1.5m';

  return allDurations.filter((d) => d.days >= minDays).map((d) => ({
    ...d,
    hpw: Math.round((totalHours / (d.days / 7)) * 10) / 10,
    hpd: Math.round((totalHours / d.days) * 10) / 10,
    recommended: d.id === recId,
  }));
}

/* ── Component ────────────────────────────────────────────────── */
export default function NinetyDayPlan() {
  const navigate = useNavigate();
  const { refreshPlan } = usePlan();
  const [planGenerated, setPlanGenerated] = useState(() => {
    const s = sessionStorage.getItem('plan-generated');
    return s === 'true';
  });

  const [activeStreamId, setActiveStreamId] = useState('cs');
  const [streamSelected, setStreamSelected] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedDur, setSelectedDur] = useState<string | null>(() => sessionStorage.getItem('plan-duration') || null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const activeStream = streamsData.find((s) => s.id === activeStreamId)!;
  const ActiveIcon = activeStream.icon;

  // Compute total hours dynamically: count actual skills per area × 5h
  const totalHours = selectedAreas.size > 0
    ? Array.from(selectedAreas).reduce((sum, area) => sum + getAreaHours(area), 0)
    : DEFAULT_HOURS;

  const durations = getDurations(totalHours);

  function toggleArea(area: string) {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      next.has(area) ? next.delete(area) : next.add(area);
      return next;
    });
    setSelectedDur(null); // reset duration when selection changes
  }

  function handleGenerate() {
    if (!selectedDur) return;
    setPlanGenerated(true);
    sessionStorage.setItem('plan-generated', 'true');
    sessionStorage.setItem('plan-duration', selectedDur);
    sessionStorage.setItem('plan-domain', Array.from(selectedAreas).join(', ') || activeStream.label);
    sessionStorage.setItem('plan-track', activeStream.short);
    if (!sessionStorage.getItem('plan-start-date')) {
      sessionStorage.setItem('plan-start-date', new Date().toISOString());
    }
    refreshPlan();
  }

  function handleBack() {
    // Just navigate back — no modal, no clearing
    navigate('/home/learning');
  }

  function handleReconfigure() {
    sessionStorage.removeItem('plan-generated');
    sessionStorage.removeItem('plan-domain');
    sessionStorage.removeItem('plan-duration');
    sessionStorage.removeItem('plan-start-date');
    // keep plan-role-title and active-plan-role-id so the card shows "Continue" on /home/learning
    refreshPlan();
    navigate('/home/learning?reconfigure=1');
  }

  if (planGenerated) {
    return <PlanExecution track={sessionStorage.getItem('plan-track') || 'IT'} domain={sessionStorage.getItem('plan-domain') || ''} onReconfigure={handleReconfigure} onBack={handleBack} />;
  }

  const allAreaOptions = [activeStream.label, ...activeStream.areas];

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── LEFT: Two-step sidebar ───────────────────────────── */}
      <div className="w-[300px] shrink-0 border-r border-border bg-card flex flex-col max-md:hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold font-[family-name:var(--font-heading)]">Slog Overs</h1>
          </div>
        </div>

        {/* Step 1 — Stream selection (hidden — handled in right panel) */}
        <div className={cn('flex flex-col overflow-hidden transition-all', currentStep === 1 ? 'flex-none' : 'flex-none')}>
          <button
            onClick={() => setCurrentStep(1)}
            className="px-4 pt-3 pb-2 flex items-center gap-2 w-full text-left hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
              currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-w-green text-white'
            )}>
              {currentStep > 1 ? <CheckCircle className="h-3 w-3" /> : '1'}
            </span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stream & Areas</p>
            {selectedAreas.size > 0 && currentStep > 1 && (
              <span className="ml-auto text-[10px] font-semibold text-primary">{selectedAreas.size} selected</span>
            )}
          </button>
        </div>

        <Separator />

        {/* Step 2 — Duration summary */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
              selectedDur ? 'bg-w-green text-white' : currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>2</span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
            {currentStep === 1 && (
              <span className="text-[9px] text-muted-foreground ml-auto">Select areas first</span>
            )}
          </div>

          {/* Only show content when on step 2 */}
          {currentStep === 2 && (
            <>
              {/* Total hours + selected summary */}
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 mb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Total study hours</span>
                  <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-foreground">{totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Areas selected</span>
                  <span className="text-[11px] font-semibold text-foreground">{selectedAreas.size > 0 ? selectedAreas.size : '—'}</span>
                </div>
                {selectedDur && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">Selected duration</span>
                    <span className="text-[11px] font-bold text-primary">{durations.find((d) => d.id === selectedDur)?.label}</span>
                  </div>
                )}
              </div>

              {/* Generate button */}
              {selectedDur ? (
                <p className="text-[10px] text-primary font-semibold text-center">✓ {durations.find((d) => d.id === selectedDur)?.label} selected</p>
              ) : (
                <p className="text-[10px] text-muted-foreground text-center">Pick a duration to continue</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: Main content ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 lg:p-8 max-w-[720px] space-y-8">

          {/* ── Section 1: Stream + Areas ─────────────────────── */}
          {currentStep === 1 && (
          <section>
            {!streamSelected ? (
              /* ── Stream selection ─────────────────────────── */
              <>
                <div className="mb-5">
                  <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">Choose your stream</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Select the engineering discipline you're preparing for</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {streamsData.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setActiveStreamId(s.id); setStreamSelected(true); setSelectedAreas(new Set()); setSelectedDur(null); }}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all cursor-pointer hover:shadow-md',
                          activeStreamId === s.id && streamSelected
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border bg-card hover:border-primary/30'
                        )}
                      >
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', s.activeColor)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-[family-name:var(--font-heading)]">{s.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{s.areas.length} areas of interest</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ── Area selection ───────────────────────────── */
              <>
                {/* Stream header with back */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setStreamSelected(false); setSelectedAreas(new Set()); setSelectedDur(null); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', activeStream.activeColor)}>
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">{activeStream.label}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Select areas of interest — you can pick multiple</p>
                    </div>
                  </div>
                  {selectedAreas.size > 0 && (
                    <button
                      onClick={() => { setSelectedAreas(new Set()); setSelectedDur(null); }}
                      className="text-xs text-muted-foreground hover:text-w-red transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Area cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allAreaOptions.map((area) => {
                    const isSelected = selectedAreas.has(area);
                    const isStream = area === activeStream.label;
                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all cursor-pointer',
                          isStream && 'sm:col-span-2',
                          isSelected
                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                            : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                        )}
                      >
                        <div className={cn(
                          'flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border-2 shrink-0 transition-all',
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'
                        )}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-primary-foreground">
                              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={cn('text-sm leading-snug', isSelected ? 'font-semibold text-primary' : 'text-foreground')}>
                          {area}
                        </span>
                        {isStream && <Badge variant="secondary" className="text-[9px] ml-auto shrink-0">Basic</Badge>}
                      </button>
                    );
                  })}
                </div>

                {/* Selected pills */}
                {selectedAreas.size > 0 && (
                  <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-muted-foreground mr-1">Selected:</span>
                    {Array.from(selectedAreas).map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
                        {a}
                        <button onClick={() => toggleArea(a)} className="hover:text-primary/60 cursor-pointer"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Next button */}
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} disabled={selectedAreas.size === 0}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </section>
          )}

          <Separator />

          {/* ── Section 2: Duration ───────────────────────────── */}
          {currentStep === 2 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>
                  <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">Choose Duration</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Based on <span className="font-semibold text-foreground">{totalHours}h</span> total
                    {selectedAreas.size > 0 && <span> across {selectedAreas.size} area{selectedAreas.size > 1 ? 's' : ''}</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {durations.map((d) => {
                  const sel = selectedDur === d.id;
                  const pace = d.hpd >= 4 ? 'Aggressive' : d.hpd >= 2 ? 'Moderate' : 'Comfortable';
                  const paceColor = d.hpd >= 4 ? 'text-w-red' : d.hpd >= 2 ? 'text-w-orange' : 'text-w-green';
                  const paceBg = d.hpd >= 4 ? 'bg-w-red/8' : d.hpd >= 2 ? 'bg-w-orange/8' : 'bg-w-green/8';
                  return (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDur(d.id); sessionStorage.setItem('plan-duration', d.id); }}
                      className={cn(
                        'text-left rounded-xl border p-4 transition-all cursor-pointer relative',
                        sel ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                      )}
                    >
                      {d.recommended && (
                        <div className="absolute -top-2.5 right-3">
                          <Badge variant="success" className="text-[8px] px-2 py-0.5 shadow-sm">Recommended</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn('text-sm font-bold font-[family-name:var(--font-heading)]', sel ? 'text-primary' : 'text-foreground')}>
                          {d.label}
                        </span>
                        {sel && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <div className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 mb-2', paceBg)}>
                        <Zap className={cn('h-3 w-3', paceColor)} />
                        <span className={cn('text-[11px] font-semibold', paceColor)}>{pace}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-foreground">
                          {d.hpw >= 10 ? Math.round(d.hpw) : d.hpw}
                        </span>
                        <span className="text-[11px] text-muted-foreground">hrs/week</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">~{d.hpd}h per day</p>
                    </button>
                  );
                })}
              </div>

              {selectedDur && (
                <div className="mt-6">
                  <Button size="lg" className="w-full" onClick={handleGenerate}>
                    Generate Plan <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
