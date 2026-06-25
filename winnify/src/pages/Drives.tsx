import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Search, SlidersHorizontal, MapPin, Users, Zap, User,
  ChevronRight, Check, X, CircleAlert, Plus, Calendar, ChevronDown,
  Briefcase, Upload, ChevronUp, Clock, Bell, ArrowLeft,
  Target, TrendingUp, GraduationCap, Globe, Star, List,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────── */
type DriveStatus = 'applied' | 'eligible' | 'not-eligible';
type DriveType = 'on-campus' | 'off-campus';
type DriveCategory = 'Dream' | 'Standard';
type AppStage = 'registered' | 'active' | 'offer' | 'not-shortlisted';
type TabType = 'drives' | 'applications';
type FilterType = 'all' | 'on-campus' | 'off-campus';
type StatusFilter = 'all' | 'eligible' | 'applied' | 'not-eligible';
type CategoryFilter = 'all' | 'Dream' | 'Standard';

interface Drive {
  id: number; company: string; initial: string; logo: string;
  bgColor: string; textColor: string; role: string; ctc: string;
  location: string; match: number; applied: number;
  deadline: string; daysLeft: string; urgentHours?: number;
  status: DriveStatus; type: DriveType; category: DriveCategory;
  cgpaRequired?: number;
  nextStage?: { label: string; date: string; platform?: string };
  oaDate?: string; notEligibleReason?: string;
}

interface AppEntry {
  id: number; company: string; initial: string; logo: string;
  bgColor: string; textColor: string; role: string; ctc: string;
  appliedCount: number; stage: AppStage; stageLabel: string;
  nextAction: { label: string; sub: string; urgency: 'high' | 'medium' | 'low' };
  timeline: { date: string; event: string; note: string; status: 'done' | 'current' | 'pending' }[];
  rounds: number; currentRound: number;
}

/* ── Data ───────────────────────────────────────────────────────── */
const initialDrives: Drive[] = [
  {
    id: 1, company: 'Microsoft', initial: 'M', logo: 'microsoft.com',
    bgColor: '#EFF6FF', textColor: '#1D4ED8',
    role: 'SDE I — Azure Cloud', ctc: '₹ 14 LPA', location: 'Hyderabad',
    match: 84, applied: 218, deadline: 'Today', daysLeft: 'Today', urgentHours: 8,
    status: 'applied', type: 'on-campus', category: 'Dream',
    nextStage: { label: 'OA Round · Today, 10:00 AM', date: 'Today', platform: 'HackerRank — link via email' },
  },
  {
    id: 2, company: 'Wipro', initial: 'W', logo: 'wipro.com',
    bgColor: '#F0FDF4', textColor: '#16A34A',
    role: 'Project Engineer — Tech', ctc: '₹ 5.5 LPA', location: 'Multiple',
    match: 62, applied: 512, deadline: 'Apr 2 11:59 PM', daysLeft: '5d left',
    status: 'eligible', type: 'on-campus', category: 'Standard', oaDate: 'Apr 8',
  },
  {
    id: 3, company: 'Infosys', initial: 'I', logo: 'infosys.com',
    bgColor: '#F3F4F8', textColor: '#9CA3AF',
    role: 'Systems Engineer', ctc: '₹ 3.6 LPA', location: 'Multiple',
    match: 0, applied: 634, deadline: 'Apr 3 11:59 PM', daysLeft: '6d left',
    status: 'not-eligible', type: 'on-campus', category: 'Standard',
    notEligibleReason: 'CGPA requirement 7.5 (you have 6.9)',
  },
  {
    id: 4, company: 'Razorpay', initial: 'R', logo: 'razorpay.com',
    bgColor: '#FFF1F2', textColor: '#BE123C',
    role: 'Software Engineer — Payments', ctc: '₹ 18 LPA', location: 'Bangalore',
    match: 78, applied: 384, deadline: 'Mar 28 11:59 PM', daysLeft: '8d left',
    status: 'eligible', type: 'off-campus', category: 'Dream',
  },
  {
    id: 5, company: 'Zepto', initial: 'Z', logo: 'zeptonow.com',
    bgColor: '#F5F3FF', textColor: '#7C3AED',
    role: 'SDE I — Platforms', ctc: '₹ 12 LPA', location: 'Mumbai',
    match: 71, applied: 210, deadline: 'Apr 5 11:59 PM', daysLeft: '16d left',
    status: 'eligible', type: 'off-campus', category: 'Standard', oaDate: 'April 12',
  },
];

const APP_ENTRIES: AppEntry[] = [
  {
    id: 1, company: 'Microsoft', initial: 'M', logo: 'microsoft.com',
    bgColor: '#EFF6FF', textColor: '#1D4ED8',
    role: 'SDE I — Azure Cloud', ctc: '₹ 14 LPA', appliedCount: 218,
    stage: 'registered', stageLabel: 'Registered',
    nextAction: { label: 'OA Round · Today 10:00 AM', sub: 'HackerRank · link in your registered email', urgency: 'high' },
    rounds: 5, currentRound: 1,
    timeline: [
      { date: 'Mar 18', event: 'Application Submitted', note: 'Via Winnify Drive Portal', status: 'done' },
      { date: 'Mar 19', event: 'Shortlisted for OA', note: 'Email confirmation received', status: 'done' },
      { date: 'Today · 10 AM', event: 'OA Round — HackerRank', note: 'Link sent to registered email', status: 'current' },
      { date: 'Apr 5 (est.)', event: 'Tech Interview Round 1', note: 'Pending OA clearance', status: 'pending' },
      { date: 'Apr 10 (est.)', event: 'Tech Interview Round 2', note: 'Result pending', status: 'pending' },
      { date: 'Apr 14 (est.)', event: 'HR Round & Offer', note: 'Final round', status: 'pending' },
    ],
  },
  {
    id: 6, company: 'Amazon', initial: 'A', logo: 'amazon.com',
    bgColor: '#FFF7ED', textColor: '#EA580C',
    role: 'SDE I — AWS', ctc: '₹ 16 LPA', appliedCount: 287,
    stage: 'offer', stageLabel: 'Offer',
    nextAction: { label: 'Upload Offer Letter', sub: 'Company sent offer directly · deadline in 2 days', urgency: 'medium' },
    rounds: 5, currentRound: 5,
    timeline: [
      { date: 'Mar 5', event: 'Application Submitted', note: 'Via Amazon Campus portal', status: 'done' },
      { date: 'Mar 8', event: 'OA Round Completed', note: 'Score: 85/100', status: 'done' },
      { date: 'Mar 14', event: 'Tech Interview Round 1', note: 'Cleared', status: 'done' },
      { date: 'Mar 17', event: 'Tech Interview Round 2', note: 'Cleared', status: 'done' },
      { date: 'Mar 19', event: 'HR Round & Offer', note: '₹ 16 LPA offer received 🎉', status: 'done' },
    ],
  },
  {
    id: 7, company: 'Google', initial: 'G', logo: 'google.com',
    bgColor: '#EEF2FF', textColor: '#5B4BDB',
    role: 'Software Engineer — New Grad', ctc: '₹ 18 LPA', appliedCount: 342,
    stage: 'active', stageLabel: 'Round 2',
    nextAction: { label: 'Technical Interview · Apr 5', sub: 'Google Meet · link will be emailed 1hr before', urgency: 'medium' },
    rounds: 5, currentRound: 2,
    timeline: [
      { date: 'Mar 10', event: 'Application Submitted', note: 'Via Winnify Drive Portal', status: 'done' },
      { date: 'Mar 14', event: 'OA Round Completed', note: 'Score: 90/100', status: 'done' },
      { date: 'Apr 5', event: 'Technical Interview R1', note: 'Google Meet · preparing now', status: 'current' },
      { date: 'Apr 9 (est.)', event: 'Technical Interview R2', note: 'Pending R1 result', status: 'pending' },
      { date: 'Apr 12 (est.)', event: 'HR Round & Offer', note: 'Final round', status: 'pending' },
    ],
  },
  {
    id: 8, company: 'TCS', initial: 'T', logo: 'tcs.com',
    bgColor: '#F3F4F8', textColor: '#9CA3AF',
    role: 'Associate Software Engineer', ctc: '₹ 3.6 LPA', appliedCount: 890,
    stage: 'not-shortlisted', stageLabel: 'Not Shortlisted',
    nextAction: { label: 'Not shortlisted for OA Round', sub: 'You may reapply in the next cycle', urgency: 'low' },
    rounds: 5, currentRound: 1,
    timeline: [
      { date: 'Mar 1', event: 'Application Submitted', note: 'Via TCS NextStep portal', status: 'done' },
      { date: 'Mar 8', event: 'OA Round Attempted', note: 'Score below cutoff', status: 'done' },
      { date: 'Mar 10', event: 'Not Shortlisted', note: 'Did not clear OA round cutoff', status: 'pending' },
    ],
  },
];

/* ── CompanyLogo ────────────────────────────────────────────────── */
const KNOWN_FAVICON_DOMAINS = new Set([
  'microsoft.com', 'google.com', 'amazon.com', 'wipro.com',
  'infosys.com', 'razorpay.com', 'zeptonow.com', 'accenture.com',
  'cognizant.com', 'ibm.com', 'oracle.com', 'salesforce.com',
]);

function CompanyLogo({ domain, initial, textColor }: { domain: string; initial: string; textColor: string }) {
  const [failed, setFailed] = useState(false);
  const canTry = KNOWN_FAVICON_DOMAINS.has(domain) && !failed;

  if (!canTry) {
    return <span className="font-bold text-lg" style={{ color: textColor }}>{initial}</span>;
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={initial}
      className="w-8 h-8 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

/* ── SectionLabel ───────────────────────────────────────────────── */
function SectionLabel({ label, count, color }: { label: string; count: number; color: 'primary' | 'amber' }) {
  const isPrimary = color === 'primary';
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-xl border',
        isPrimary ? 'bg-primary/10 border-primary/20' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30'
      )}>
        <div className={cn('w-1.5 h-1.5 rounded-full', isPrimary ? 'bg-primary' : 'bg-amber-500')} />
        <span className={cn('text-[11px] font-bold uppercase tracking-wider', isPrimary ? 'text-primary' : 'text-amber-600 dark:text-amber-400')}>
          {label}
        </span>
      </div>
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] text-muted-foreground font-medium">{count} drives</span>
    </div>
  );
}

/* ── HorizTimeline ──────────────────────────────────────────────── */
interface TimelineStage {
  label: string;
  date: string;
  note: string;
  status: 'done' | 'current' | 'pending';
}

function HorizTimeline({ stages, accent = '#EF4444' }: { stages: TimelineStage[]; accent?: string }) {
  const [expanded, setExpanded] = useState(false);

  const dotColor = (s: TimelineStage) =>
    s.status === 'done' || s.status === 'current' ? accent : '#D1D5DB';
  const dotBg = (s: TimelineStage) =>
    s.status === 'done' ? accent : s.status === 'current' ? '#fff' : '#F3F4F6';
  const labelColor = (s: TimelineStage) =>
    s.status === 'done' || s.status === 'current' ? accent : '#9CA3AF';
  const ringColor = (s: TimelineStage) =>
    s.status === 'current' ? `0 0 0 3px ${accent}28` : 'none';

  const DotRow = ({ size }: { size: 'sm' | 'lg' }) => (
    <div className="flex items-center flex-1">
      {stages.map((s, i) => {
        const isLast = i === stages.length - 1;
        const d = size === 'sm' ? 'w-3 h-3' : 'w-[11px] h-[11px]';
        return (
          <div key={i} className="flex items-center flex-1">
            <div className={`${d} rounded-full border-2 flex-shrink-0 transition-all`}
              style={{
                background: dotBg(s),
                borderColor: dotColor(s),
                boxShadow: ringColor(s),
              }}
            />
            {!isLast && <div className="flex-1 h-[2px]" style={{ background: s.status === 'done' ? accent : '#E5E7EB' }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="border-t border-border">
      {!expanded ? (
        <div className="flex items-center px-4 py-2.5 gap-2">
          <DotRow size="sm" />
          <button onClick={() => setExpanded(true)}
            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-muted/80 transition-colors">
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex px-4 pt-3 pb-1 w-full">
            {stages.map((s, i) => {
              const isLast = i === stages.length - 1;
              return (
                <div key={i} className={cn('flex flex-col', isLast ? 'flex-shrink-0' : 'flex-1 min-w-[70px]')}>
                  <div className="flex items-center">
                    <div className="w-[11px] h-[11px] rounded-full border-2 flex-shrink-0"
                      style={{
                        background: dotBg(s),
                        borderColor: dotColor(s),
                        boxShadow: ringColor(s),
                      }}
                    />
                    {!isLast && <div className="h-[2px] flex-1" style={{ background: s.status === 'done' ? accent : '#E5E7EB' }} />}
                  </div>
                  <div className="pt-2 pr-2">
                    <p className="text-[9px] text-muted-foreground leading-tight">{s.date}</p>
                    <p className="text-[10px] font-bold leading-tight mt-0.5" style={{ color: labelColor(s) }}>{s.label}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{s.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
            <button onClick={() => setExpanded(false)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ChevronUp className="h-3.5 w-3.5" /> Less
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DriveCard ──────────────────────────────────────────────────── */
function DriveCard({
  drive: d,
  onNavigate,
  onApply,
  onTrack,
}: {
  drive: Drive;
  onNavigate: () => void;
  onApply: () => void;
  onTrack: () => void;
}) {
  const navigate = useNavigate();
  const isNotEligible = d.status === 'not-eligible';
  const isApplied = d.status === 'applied';
  const isEligible = d.status === 'eligible';
  const isDream = d.category === 'Dream';

  return (
    <div className={cn(
      'bg-card rounded-[20px] overflow-hidden border transition-all',
      d.urgentHours
        ? 'border-red-200 dark:border-red-900/50 shadow-[0_4px_20px_rgba(220,38,38,0.1)]'
        : 'border-border shadow-sm',
      isNotEligible && 'opacity-60'
    )}>
      {/* Urgent banner */}
      {d.urgentHours && (
        <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-b border-red-100 dark:border-red-900/30">
          <CircleAlert className="h-3 w-3 text-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-500">Registration closes in {d.urgentHours} hours!</span>
        </div>
      )}

      {/* Main content */}
      <div className="p-5 space-y-4 cursor-pointer" onClick={onNavigate}>
        {/* Company row */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden"
            style={{ background: d.bgColor }}
          >
            <CompanyLogo domain={d.logo} initial={d.initial} textColor={d.textColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground font-[family-name:var(--font-heading)]">{d.company}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{d.role}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Users className="h-3 w-3" /> {d.applied} applied
            </div>
          </div>
          <span className={cn(
            'text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0',
            isDream ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {d.category}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <MapPin className="h-3 w-3" /> {d.location}
          </div>
          <span className="text-xs text-muted-foreground font-medium">Full-time</span>
          {d.match > 0 && <span className="text-xs font-bold text-primary">Match {d.match}%</span>}
        </div>

        {/* Stage / deadline / not-eligible box */}
        {isApplied && d.nextStage ? (
          <div className={cn(
            'rounded-xl p-4 flex items-center justify-between border',
            d.urgentHours
              ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
              : 'bg-muted/50 border-border'
          )}>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Your Next Stage</p>
              <p className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">{d.nextStage.label}</p>
              {d.nextStage.platform && (
                <p className="text-xs text-muted-foreground mt-0.5">Online · {d.nextStage.platform}</p>
              )}
            </div>
            <span className="text-sm font-bold text-red-500 shrink-0">{d.nextStage.date}</span>
          </div>
        ) : isNotEligible && d.notEligibleReason ? (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <CircleAlert className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-red-500">{d.notEligibleReason}</span>
          </div>
        ) : (
          <div className="rounded-xl p-4 flex items-center justify-between bg-muted/50 border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Registration Closes</p>
              <p className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">{d.deadline}</p>
              {d.oaDate && <p className="text-xs text-muted-foreground mt-0.5">OA Round begins {d.oaDate}</p>}
            </div>
            <span className={cn(
              'text-sm font-bold shrink-0',
              d.daysLeft === 'Today' ? 'text-red-500' : d.daysLeft.startsWith('5') ? 'text-primary' : 'text-amber-500'
            )}>
              {d.daysLeft}
            </span>
          </div>
        )}

        {/* Mock buttons for applied */}
        {isApplied && (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/home/mocktest/briefing', { state: { company: d.company, topic: `${d.company} OA`, difficulty: 'Medium' } });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground border border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" /> Mock Assessment
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/home/winspeak/practice/recording', { state: { question: `${d.company} — Tell me about yourself and why you want to join ${d.company}.`, category: 'Company Specific', difficulty: 'Medium' } });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground border border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5" /> Mock Interview
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        'flex items-center justify-between px-5 py-3.5 border-t border-border',
        isNotEligible ? 'bg-red-50 dark:bg-red-950/20' : 'bg-muted/20'
      )}>
        <div>
          <p className={cn(
            'font-black text-base font-[family-name:var(--font-heading)]',
            isNotEligible ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {d.ctc}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">CTC Fixed</p>
        </div>
        <div className="flex items-center gap-3">
          {isApplied && (
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Check className="h-3 w-3" strokeWidth={3} /> Applied
            </div>
          )}
          {isEligible && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" strokeWidth={3} /> Eligible
            </div>
          )}
          {isNotEligible && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
              <X className="h-3 w-3" strokeWidth={3} /> Not Eligible
            </div>
          )}
          <button
            onClick={onNavigate}
            className="flex items-center gap-1 text-xs font-bold text-primary cursor-pointer hover:opacity-70 transition-opacity"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </button>
          {isApplied && (
            <button
              onClick={(e) => { e.stopPropagation(); onTrack(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer"
            >
              Track <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          {isEligible && (
            <button
              onClick={(e) => { e.stopPropagation(); onApply(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── AppDetailView ──────────────────────────────────────────────── */
function AppDetailView({ entry, onBack }: { entry: AppEntry; onBack: () => void }) {
  const navigate = useNavigate();
  const [alertsOn, setAlertsOn] = useState(true);
  const isOffer = entry.stage === 'offer';
  const isNotShortlisted = entry.stage === 'not-shortlisted';

  const urgencyStyles = {
    high: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400',
    medium: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400',
    low: 'bg-muted border-border text-muted-foreground',
  };

  const stageBadgeStyles: Record<AppStage, string> = {
    registered: 'bg-primary/10 text-primary',
    active: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    offer: 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    'not-shortlisted': 'bg-red-100 dark:bg-red-950/30 text-red-500',
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </button>

      {/* Header card */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden"
            style={{ background: entry.bgColor }}
          >
            <CompanyLogo domain={entry.logo} initial={entry.initial} textColor={entry.textColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-lg text-foreground font-[family-name:var(--font-heading)]">{entry.company}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Dream</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', stageBadgeStyles[entry.stage])}>
                {entry.stageLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{entry.role}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{entry.ctc}</span>
              <span>·</span>
              <span>{entry.appliedCount} applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next action alert */}
      <div className={cn('rounded-[20px] border p-4 flex items-start justify-between gap-3', urgencyStyles[entry.nextAction.urgency])}>
        <div className="flex items-start gap-3">
          <CircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">{entry.nextAction.label}</p>
            <p className="text-xs mt-0.5 opacity-80">{entry.nextAction.sub}</p>
          </div>
        </div>
        {!isNotShortlisted && (
          <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer">
            {isOffer ? <><Upload className="h-3 w-3" /> Upload</> : <><ChevronRight className="h-3 w-3" /> Open</>}
          </button>
        )}
      </div>

      {/* Prep grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/home/mocktest/briefing', { state: { company: entry.company, topic: `${entry.company} OA`, difficulty: 'Medium' } })}
          className="bg-card rounded-[20px] border border-border p-4 flex flex-col items-start gap-2 hover:bg-muted/30 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Mock Assessment</p>
          <p className="text-xs text-muted-foreground">Practice OA questions</p>
        </button>
        <button
          onClick={() => navigate('/home/winspeak/practice/recording', { state: { question: `${entry.company} — Tell me about yourself.`, category: 'Company Specific', difficulty: 'Medium' } })}
          className="bg-card rounded-[20px] border border-border p-4 flex flex-col items-start gap-2 hover:bg-muted/30 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Mock Interview</p>
          <p className="text-xs text-muted-foreground">Practice HR & tech rounds</p>
        </button>
        <button className="bg-card rounded-[20px] border border-border p-4 flex flex-col items-start gap-2 hover:bg-muted/30 transition-colors cursor-pointer text-left">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold text-foreground">Company JD</p>
          <p className="text-xs text-muted-foreground">View job description</p>
        </button>
        <button
          onClick={() => navigate('/home/ai-chat')}
          className="bg-card rounded-[20px] border border-border p-4 flex flex-col items-start gap-2 hover:bg-muted/30 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Winni Agent</p>
          <p className="text-xs text-muted-foreground">AI prep assistant</p>
        </button>
      </div>

      {/* Journey Timeline */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm p-5">
        <p className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)] mb-4">Journey Timeline</p>
        <div className="space-y-0">
          {entry.timeline.map((item, i) => {
            const isLast = i === entry.timeline.length - 1;
            return (
              <div key={i} className="flex gap-4">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 shrink-0 mt-0.5',
                    item.status === 'done' ? 'bg-primary border-primary' :
                    item.status === 'current' ? 'bg-background border-primary ring-2 ring-primary/30' :
                    'bg-muted border-border'
                  )} />
                  {!isLast && <div className={cn('w-px flex-1 my-1', item.status === 'done' ? 'bg-primary/30' : 'bg-border')} />}
                </div>
                {/* Content */}
                <div className={cn('pb-4', isLast && 'pb-0')}>
                  <p className={cn(
                    'text-xs font-semibold',
                    item.status === 'done' ? 'text-muted-foreground' :
                    item.status === 'current' ? 'text-primary' : 'text-muted-foreground/60'
                  )}>
                    {item.date}
                  </p>
                  <p className={cn(
                    'text-sm font-bold mt-0.5',
                    item.status === 'pending' ? 'text-muted-foreground/60' : 'text-foreground'
                  )}>
                    {item.event}
                  </p>
                  <p className={cn(
                    'text-xs mt-0.5',
                    item.status === 'pending' ? 'text-muted-foreground/40' : 'text-muted-foreground'
                  )}>
                    {item.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drive Alerts toggle */}
      <div className="bg-card rounded-[20px] border border-border shadow-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Drive Alerts</p>
            <p className="text-xs text-muted-foreground">Get notified for stage updates</p>
          </div>
        </div>
        <button
          onClick={() => setAlertsOn((v) => !v)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
            alertsOn ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            alertsOn ? 'translate-x-5' : 'translate-x-0.5'
          )} />
        </button>
      </div>

      {/* Schedule Prep Session */}
      <button
        onClick={() => navigate('/home/mocktest')}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[20px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Calendar className="h-4 w-4" /> Schedule Prep Session
      </button>
    </div>
  );
}

/* ── ApplicationsPanel ──────────────────────────────────────────── */
function ApplicationsPanel({ appliedDrives }: {
  appliedDrives: Drive[];
  onNavigate: (id: number) => void;
}) {
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [stageFilter, setStageFilter] = useState<'all' | 'active' | 'offer' | 'not-shortlisted'>('all');

  // Show all APP_ENTRIES plus any newly applied drives not already in APP_ENTRIES
  const allEntries: AppEntry[] = [
    ...APP_ENTRIES,
    ...appliedDrives
      .filter((d) => !APP_ENTRIES.some((e) => e.id === d.id))
      .map((d): AppEntry => ({
        id: d.id,
        company: d.company,
        initial: d.initial,
        logo: d.logo,
        bgColor: d.bgColor,
        textColor: d.textColor,
        role: d.role,
        ctc: d.ctc,
        appliedCount: d.applied,
        stage: 'registered',
        stageLabel: 'Registered',
        nextAction: { label: 'Application submitted', sub: 'Awaiting shortlist', urgency: 'low' },
        rounds: 5,
        currentRound: 1,
        timeline: [{ date: 'Today', event: 'Application Submitted', note: 'Via Winnify Drive Portal', status: 'current' }],
      })),
  ];

  if (selectedApp !== null) {
    const entry = allEntries.find((e) => e.id === selectedApp);
    if (entry) {
      return <AppDetailView entry={entry} onBack={() => setSelectedApp(null)} />;
    }
  }

  const counts = {
    applied: allEntries.length,
    active: allEntries.filter((e) => e.stage === 'active').length,
    offer: allEntries.filter((e) => e.stage === 'offer').length,
    notShortlisted: allEntries.filter((e) => e.stage === 'not-shortlisted').length,
  };

  const stageBadgeStyles: Record<AppStage, string> = {
    registered: 'bg-primary/10 text-primary',
    active: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    offer: 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    'not-shortlisted': 'bg-red-100 dark:bg-red-950/30 text-red-500',
  };

  return (
    <div className="space-y-4">
      {/* Action required banner — shows offer entry if exists, else urgent */}
      {(() => {
        const actionEntry = allEntries.find((e) => e.stage === 'offer') ?? allEntries.find((e) => e.nextAction.urgency === 'high');
        if (!actionEntry) return null;
        const isOffer = actionEntry.stage === 'offer';
        return (
          <button
            onClick={() => setSelectedApp(actionEntry.id)}
            className="w-full rounded-[20px] p-5 flex items-center gap-4 cursor-pointer transition-all hover:opacity-95 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#065F46,#059669)', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}
          >
            <div className="w-12 h-12 rounded-[20px] flex items-center justify-center flex-shrink-0 border border-white/20"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
              {isOffer
                ? <Upload className="h-5 w-5" style={{ stroke: 'rgba(255,255,255,0.92)' }} />
                : <Clock className="h-5 w-5" style={{ stroke: 'rgba(255,255,255,0.92)' }} />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] text-white/65 font-bold uppercase tracking-wider mb-1">Action Required</p>
              <p className="font-bold text-white text-sm">
                {actionEntry.company} · {isOffer ? 'Upload Offer Letter' : actionEntry.nextAction.label}
              </p>
              <p className="text-xs text-white/65 mt-0.5">{actionEntry.nextAction.sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ stroke: 'rgba(255,255,255,0.7)' }} />
          </button>
        );
      })()}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Applied', value: counts.applied, color: 'text-foreground', filter: 'all' as const },
          { label: 'Active', value: counts.active, color: 'text-amber-500', filter: 'active' as const },
          { label: 'Offer', value: counts.offer, color: 'text-green-500', filter: 'offer' as const },
          { label: 'Rejected', value: counts.notShortlisted, color: 'text-red-500', filter: 'not-shortlisted' as const },
        ].map((s) => {
          const isActive = stageFilter === s.filter;
          return (
            <button
              key={s.label}
              onClick={() => setStageFilter(isActive ? 'all' : s.filter)}
              className={cn(
                'rounded-xl border p-3 text-center cursor-pointer transition-all',
                isActive
                  ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                  : 'bg-card border-border hover:border-primary/20'
              )}
            >
              <p className={cn('text-xl font-black font-[family-name:var(--font-heading)]', s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Entry cards */}
      {allEntries
        .filter((e) => stageFilter === 'all' || e.stage === stageFilter)
        .map((entry) => {
        const isOffer = entry.stage === 'offer';
        const isUrgent = entry.nextAction.urgency === 'high';
        const accentColor =
          entry.stage === 'offer' ? '#059669' :
          entry.stage === 'not-shortlisted' ? '#EF4444' :
          entry.stage === 'active' ? '#F59E0B' :
          '#EF4444'; // registered/urgent = red

        return (
          <div key={entry.id} className={cn(
            'rounded-[20px] border shadow-sm overflow-hidden transition-all',
            isUrgent ? 'bg-card border-red-200 dark:border-red-900/50' :
            isOffer   ? 'bg-card border-green-200 dark:border-green-800/40' :
            entry.stage === 'not-shortlisted' ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30 opacity-70' :
            'bg-card border-border'
          )}>
            {/* Urgent / offer banner */}
            {isUrgent && (
              <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-b border-red-100 dark:border-red-900/30">
                <CircleAlert className="h-3 w-3 text-red-500 shrink-0" />
                <span className="text-xs font-bold text-red-500">Action required today</span>
              </div>
            )}
            {isOffer && !isUrgent && (
              <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-b border-green-100 dark:border-green-800/30">
                <Check className="h-3 w-3 text-green-500 shrink-0" />
                <span className="text-xs font-bold text-green-600 dark:text-green-400">Offer received 🎉</span>
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Company row */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden"
                  style={{ background: entry.bgColor }}
                >
                  <CompanyLogo domain={entry.logo} initial={entry.initial} textColor={entry.textColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground font-[family-name:var(--font-heading)]">{entry.company}</p>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', stageBadgeStyles[entry.stage])}>
                      {entry.stageLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{entry.role}</p>
                  <p className="text-xs font-bold text-foreground mt-1">{entry.ctc}</p>
                </div>
              </div>

              {/* Next action box */}
              <div className={cn(
                'rounded-xl px-4 py-3 flex items-center justify-between border',
                entry.nextAction.urgency === 'high'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                  : entry.stage === 'offer'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/30'
                  : entry.stage === 'active'
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-800/30'
                  : entry.stage === 'not-shortlisted'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                  : 'bg-muted/50 border-border'
              )}>
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Your Next Stage</p>
                  <p className="text-sm font-bold leading-snug font-[family-name:var(--font-heading)] text-foreground">
                    {entry.nextAction.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{entry.nextAction.sub}</p>
                </div>
                <span className={cn(
                  'text-[11px] font-black shrink-0 px-2.5 py-1 rounded-full',
                  entry.nextAction.urgency === 'high'   ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                  entry.stage === 'offer'               ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  entry.stage === 'active'              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  entry.stage === 'not-shortlisted'     ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                  'bg-muted text-muted-foreground'
                )}>
                  {entry.nextAction.urgency === 'high' ? 'Today' :
                   entry.stage === 'offer'             ? 'Action' :
                   entry.stage === 'active'            ? entry.nextAction.label.split('·').pop()?.trim() ?? 'Soon' :
                   entry.stage === 'not-shortlisted'   ? 'Closed' :
                   'Pending'}
                </span>
              </div>
            </div>

            {/* Horizontal scrollable timeline */}
            <HorizTimeline accent={accentColor} stages={entry.timeline.map((t) => ({
              label: t.event.length > 8 ? t.event.split(' ').slice(0, 2).join(' ') : t.event,
              date: t.date,
              note: t.note.length > 12 ? t.note.split(' ').slice(0, 2).join(' ') : t.note,
              status: t.status,
            }))} />

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
              {/* Left: contextual status */}
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {entry.stage === 'registered' && (
                  <>
                    <Clock className="h-3 w-3 text-red-500 shrink-0" />
                    <span className="text-muted-foreground">HackerRank link in your email</span>
                  </>
                )}
                {entry.stage === 'offer' && (
                  <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:opacity-70 transition-opacity">
                    <Upload className="h-3 w-3" /> Upload offer letter
                  </button>
                )}
                {entry.stage === 'active' && (
                  <>
                    <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="text-muted-foreground">{entry.nextAction.label}</span>
                  </>
                )}
                {entry.stage === 'not-shortlisted' && (
                  <>
                    <X className="h-3 w-3 text-red-500 shrink-0" strokeWidth={3} />
                    <span className="font-bold text-red-500">Not shortlisted for OA Round</span>
                  </>
                )}
              </div>
              {/* Right: View button */}
              <button
                onClick={() => setSelectedApp(entry.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                View <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Drives page ───────────────────────────────────────────── */
export default function Drives() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('drives');
  const [filter, setFilter] = useState<FilterType>('all');
  const [drives, setDrives] = useState<Drive[]>(initialDrives);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'match' | 'ctc' | 'trending'>('urgency');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0) + (filter !== 'all' ? 1 : 0) + (sortBy !== 'urgency' ? 1 : 0);

  function applyToDrive(id: number) {
    setDrives((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'applied' as DriveStatus, applied: d.applied + 1 } : d)
    );
    setTab('applications');
  }

  const appliedDrives = drives.filter((d) => d.status === 'applied');

  function applyFilters(list: Drive[]) {
    const q = searchQuery.trim().toLowerCase();
    let result = list
      .filter((d) => filter === 'all' || d.type === filter)
      .filter((d) => statusFilter === 'all' || d.status === statusFilter)
      .filter((d) => categoryFilter === 'all' || d.category === categoryFilter)
      .filter((d) => !q || d.company.toLowerCase().includes(q) || d.role.toLowerCase().includes(q) || d.location.toLowerCase().includes(q));

    // Sort
    if (sortBy === 'match') result = [...result].sort((a, b) => b.match - a.match);
    else if (sortBy === 'ctc') result = [...result].sort((a, b) => parseFloat(b.ctc.replace(/[^\d.]/g, '')) - parseFloat(a.ctc.replace(/[^\d.]/g, '')));
    else if (sortBy === 'trending') result = [...result].sort((a, b) => b.applied - a.applied);
    else result = [...result].sort((a, b) => (b.urgentHours ?? 0) - (a.urgentHours ?? 0)); // urgency

    return result;
  }

  const filteredDrives = applyFilters(drives);
  const onCampus = filteredDrives.filter((d) => d.type === 'on-campus');
  const offCampus = filteredDrives.filter((d) => d.type === 'off-campus');

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 pt-5 pb-0">
          {/* Title row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Campus Drives</h1>
            </div>
            <button
              onClick={() => navigate('/home/mocktest')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Mocktest Hub
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {drives.filter((d) => d.status !== 'not-eligible').length} open · {drives.filter((d) => d.urgentHours).length} closing soon
          </p>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 mb-3 border border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, roles…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(true)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                  activeFilterCount > 0
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-0">
            <button
              onClick={() => setTab('applications')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer',
                tab === 'applications'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border border-b-0'
              )}
            >
              My Applications
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                tab === 'applications' ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
              )}>
                {APP_ENTRIES.length + appliedDrives.filter((d) => !APP_ENTRIES.some((e) => e.id === d.id)).length}
              </span>
            </button>
            <button
              onClick={() => setTab('drives')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer',
                tab === 'drives'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border border-b-0'
              )}
            >
              Drives
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                tab === 'drives' ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
              )}>
                {drives.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-10 space-y-4">
        {tab === 'drives' && (
          <>
            {/* Filter pills */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-muted">
              {(['all', 'on-campus', 'off-campus'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer',
                    filter === f ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'on-campus' ? 'On Campus' : 'Off Campus'}
                </button>
              ))}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="h-3 w-3" /> Registration open · sorted by urgency
              </div>
              <span className="text-xs text-muted-foreground font-medium">{filteredDrives.length} drives</span>
            </div>

            {(filter === 'all' || filter === 'on-campus') && onCampus.length > 0 && (
              <>
                <SectionLabel label="On Campus Drives" count={onCampus.length} color="primary" />
                {onCampus.map((d) => (
                  <DriveCard
                    key={d.id}
                    drive={d}
                    onNavigate={() => navigate(`/home/drives/${d.id}`)}
                    onApply={() => applyToDrive(d.id)}
                    onTrack={() => navigate(`/home/drives/${d.id}`)}
                  />
                ))}
              </>
            )}

            {(filter === 'all' || filter === 'off-campus') && offCampus.length > 0 && (
              <>
                <SectionLabel label="Off Campus Drives" count={offCampus.length} color="amber" />
                {offCampus.map((d) => (
                  <DriveCard
                    key={d.id}
                    drive={d}
                    onNavigate={() => navigate(`/home/drives/${d.id}`)}
                    onApply={() => applyToDrive(d.id)}
                    onTrack={() => navigate(`/home/drives/${d.id}`)}
                  />
                ))}
              </>
            )}

            {filteredDrives.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-[20px] bg-muted flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground">No drives found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}

        {tab === 'applications' && (
          <ApplicationsPanel
            appliedDrives={appliedDrives}
            onNavigate={(id) => navigate(`/home/drives/${id}`)}
          />
        )}
      </div>

      {/* ── Filter Side Panel ─────────────────────────────────── */}
      {filterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">Filter Drives</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Narrow down what matters to you</p>
              </div>
              <button onClick={() => setFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 px-5 py-5 space-y-6">
              {/* Sort By */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[3px] h-4 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-foreground">Sort By</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Clock className="h-4 w-4" />, label: 'Urgency', sub: 'Closing soon', value: 'urgency' as const },
                    { icon: <Target className="h-4 w-4" />, label: 'Match %', sub: 'Best fit', value: 'match' as const },
                    { icon: <TrendingUp className="h-4 w-4" />, label: 'Top CTC', sub: 'Highest pay', value: 'ctc' as const },
                    { icon: <Users className="h-4 w-4" />, label: 'Trending', sub: 'Most applied', value: 'trending' as const },
                  ].map((s) => {
                    const isActive = sortBy === s.value;
                    return (
                      <button key={s.label} onClick={() => setSortBy(s.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 px-3 py-3 rounded-xl transition-all cursor-pointer text-left',
                          !isActive && 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        style={isActive ? { background: 'linear-gradient(145deg,#5B4BDB,#4F46E5)', boxShadow: '0 4px 14px rgba(87,61,171,0.25)' } : {}}
                      >
                        <span className={isActive ? 'text-white/80' : ''}>{s.icon}</span>
                        <span className={cn('text-xs font-bold', isActive ? 'text-white' : 'text-foreground')}>{s.label}</span>
                        <span className={cn('text-[10px]', isActive ? 'text-white/60' : 'text-muted-foreground')}>{s.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Eligibility */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[3px] h-4 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Eligibility</span>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: <List className="h-4 w-4" />, label: 'Show All', sub: 'Including ineligible drives', value: 'all' as StatusFilter },
                    { icon: <Check className="h-4 w-4" />, label: 'Eligible Only', sub: 'You meet all criteria', value: 'eligible' as StatusFilter },
                    { icon: <Star className="h-4 w-4" />, label: 'Dream Companies', sub: 'Top-tier aspirational roles', value: 'not-eligible' as StatusFilter },
                  ].map((e) => {
                    const isActive = statusFilter === e.value;
                    return (
                      <button key={e.label} onClick={() => setStatusFilter(e.value)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-left border',
                          isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          {e.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-bold', isActive ? 'text-primary' : 'text-foreground')}>{e.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{e.sub}</p>
                        </div>
                        <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          isActive ? 'bg-primary border-primary' : 'border-border'
                        )}>
                          {isActive && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Drive Type */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[3px] h-4 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-foreground">Drive Type</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Briefcase className="h-4 w-4" />, label: 'All', sub: '5 drives', value: 'all' as FilterType },
                    { icon: <GraduationCap className="h-4 w-4" />, label: 'On Campus', sub: '3 drives', value: 'on-campus' as FilterType },
                    { icon: <Globe className="h-4 w-4" />, label: 'Off Campus', sub: '2 drives', value: 'off-campus' as FilterType },
                  ].map((t) => {
                    const isActive = filter === t.value;
                    return (
                      <button key={t.label} onClick={() => setFilter(t.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer border',
                          isActive ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
                        )}
                      >
                        {t.icon}
                        <span className={cn('text-[11px] font-bold', isActive ? 'text-primary' : 'text-foreground')}>{t.label}</span>
                        <span className="text-[9px] text-muted-foreground">{t.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <button
                onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setFilter('all'); setSortBy('urgency'); }}
                className="px-5 py-3 rounded-xl text-sm font-bold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#5B4BDB,#4F46E5)', boxShadow: '0 4px 14px rgba(87,61,171,0.25)' }}
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
