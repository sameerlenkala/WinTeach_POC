import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, Heart, MapPin, Briefcase, Users, Clock, Check, X,
  Zap, User, GraduationCap, Globe, FileText, Download, Bell,
  Calendar, ChevronRight, ExternalLink, MessageSquare, ArrowLeft,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────
const USER_SKILLS = ['Python', 'Java', 'SQL', 'DSA', 'Data Structures', 'React', 'Git', 'OOPS', 'Communication'];

// ── Types ─────────────────────────────────────────────────────────────
interface EligCrit { text: string; met: boolean }
interface DriveInfo {
  letter: string; letterBg: string; letterColor: string;
  company: string; role: string;
  tag: string; tagBg: string; tagColor: string;
  ctc: string; ctcNote: string;
  location: string; jobType: string; campus: string; campusColor: string;
  match: number | null; eligible: boolean;
  deadline: string; deadlineLeft: string; deadlineColor: string;
  nextRound: string; nextRoundSub: string;
  applied: boolean;
  eligCriteria: EligCrit[];
  rounds: string[]; currentRoundIdx: number;
  jd: string[]; skills: string[];
  about: string; openings: number; applied_count: number;
}

// ── Drive data ────────────────────────────────────────────────────────
const DRIVES: Record<string, DriveInfo> = {
  '1': {
    letter: 'M', letterBg: '#EFF6FF', letterColor: '#1D4ED8',
    company: 'Microsoft', role: 'SDE I — Azure Cloud',
    tag: 'Dream', tagBg: 'hsl(var(--primary)/0.1)', tagColor: 'hsl(var(--primary))',
    ctc: '₹ 14 LPA', ctcNote: 'CTC Fixed + Joining Bonus',
    location: 'Hyderabad', jobType: 'Full-time', campus: 'On Campus', campusColor: 'hsl(var(--primary))',
    match: 84, eligible: true,
    deadline: 'Closes Today 10:00 AM', deadlineLeft: 'Today', deadlineColor: 'hsl(var(--destructive))',
    nextRound: 'Online Assessment', nextRoundSub: 'HackerRank · link sent via email',
    applied: true,
    eligCriteria: [
      { text: 'CGPA ≥ 7.5 (All branches)', met: true },
      { text: 'No active backlogs', met: true },
      { text: 'CS/IT/ECE branches only', met: true },
      { text: 'No year gap > 1 year', met: true },
    ],
    rounds: ['Registration', 'Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'HR + Offer'],
    currentRoundIdx: 1,
    jd: [
      'Design and ship cloud-native services at hyperscale on Azure infrastructure.',
      'Work closely with PMs, designers, and senior engineers across Redmond & Hyderabad.',
      'Own your feature end-to-end — from architecture decisions to production deployments.',
      'Write clean, well-tested code with a focus on reliability and performance.',
    ],
    skills: ['C++ / Java', 'Data Structures', 'System Design', 'Azure', 'Git'],
    about: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.',
    openings: 12, applied_count: 218,
  },
  '2': {
    letter: 'W', letterBg: '#F0FDF4', letterColor: '#16A34A',
    company: 'Wipro', role: 'Project Engineer — Tech',
    tag: 'Standard', tagBg: 'hsl(var(--muted))', tagColor: 'hsl(var(--muted-foreground))',
    ctc: '₹ 5.5 LPA', ctcNote: 'CTC Fixed',
    location: 'Multiple', jobType: 'Full-time', campus: 'On Campus', campusColor: 'hsl(var(--primary))',
    match: 62, eligible: true,
    deadline: 'Closes Apr 2 11:59 PM', deadlineLeft: '5d left', deadlineColor: 'hsl(var(--primary))',
    nextRound: 'Online Assessment', nextRoundSub: 'OA Round begins Apr 8 on AMCAT',
    applied: false,
    eligCriteria: [
      { text: 'CGPA ≥ 6.0', met: true },
      { text: 'No active backlogs', met: true },
      { text: 'All engineering branches', met: true },
      { text: '60% throughout academics', met: true },
    ],
    rounds: ['Registration', 'Online Assessment', 'Technical Interview', 'HR Round', 'Offer'],
    currentRoundIdx: 0,
    jd: [
      'Develop and maintain enterprise software applications using Java / Python.',
      'Collaborate with global delivery teams on client-facing products.',
      'Participate in Agile ceremonies and contribute to sprint planning.',
      'Troubleshoot, debug, and improve existing codebases.',
    ],
    skills: ['Java', 'Python', 'SQL', 'OOPS', 'Communication'],
    about: 'Wipro is a global IT consulting and business process services company.',
    openings: 80, applied_count: 512,
  },
  '3': {
    letter: 'I', letterBg: '#F3F4F8', letterColor: '#9CA3AF',
    company: 'Infosys', role: 'Systems Engineer',
    tag: 'Standard', tagBg: 'hsl(var(--muted))', tagColor: 'hsl(var(--muted-foreground))',
    ctc: '₹ 3.6 LPA', ctcNote: 'CTC Fixed',
    location: 'Multiple', jobType: 'Full-time', campus: 'On Campus', campusColor: 'hsl(var(--primary))',
    match: null, eligible: false,
    deadline: 'Closes Apr 10 11:59 PM', deadlineLeft: '13d left', deadlineColor: 'hsl(var(--muted-foreground))',
    nextRound: 'InfyTQ Assessment', nextRoundSub: 'Infosys internal assessment platform',
    applied: false,
    eligCriteria: [
      { text: 'CGPA ≥ 6.5', met: true },
      { text: 'No active backlogs', met: false },
      { text: 'All engineering branches', met: true },
      { text: '60% throughout academics', met: false },
    ],
    rounds: ['Registration', 'InfyTQ Assessment', 'Verbal Ability Test', 'Technical Interview', 'HR + Offer'],
    currentRoundIdx: 0,
    jd: [
      'Work as part of Agile teams to deliver software for global clients.',
      'Develop, test and maintain applications using Java and .NET.',
      'Understand client requirements and translate them into technical solutions.',
      'Participate in code reviews and continuous improvement initiatives.',
    ],
    skills: ['Java', '.NET', 'SQL', 'Agile', 'Problem Solving'],
    about: 'Infosys is a global leader in next-generation digital services and consulting.',
    openings: 150, applied_count: 634,
  },
  '4': {
    letter: 'R', letterBg: '#FFF1F2', letterColor: '#BE123C',
    company: 'Razorpay', role: 'Software Engineer — Payments',
    tag: 'Dream', tagBg: 'hsl(var(--primary)/0.1)', tagColor: 'hsl(var(--primary))',
    ctc: '₹ 18 LPA', ctcNote: 'CTC Fixed + ESOPs',
    location: 'Bangalore', jobType: 'Full-time', campus: 'Off Campus', campusColor: '#B45309',
    match: 78, eligible: true,
    deadline: 'Closes Mar 28 11:59 PM', deadlineLeft: '8d left', deadlineColor: '#F59E0B',
    nextRound: 'Resume Screening', nextRoundSub: 'Results in 5 business days',
    applied: false,
    eligCriteria: [
      { text: 'CGPA ≥ 7.0', met: true },
      { text: 'No active backlogs', met: true },
      { text: 'Strong DSA fundamentals', met: true },
      { text: 'Prior internship/project experience', met: true },
    ],
    rounds: ['Resume Screening', 'Online Assessment', 'Technical Round 1', 'Technical Round 2', 'Culture Fit + Offer'],
    currentRoundIdx: 0,
    jd: [
      'Build and scale payment infrastructure that processes billions of ₹ daily.',
      'Design fault-tolerant microservices with high availability requirements.',
      'Drive performance improvements across critical payment APIs.',
      'Collaborate with product and design teams to ship new payment experiences.',
    ],
    skills: ['Go / Java', 'Microservices', 'System Design', 'DSA', 'SQL / NoSQL'],
    about: "Razorpay is India's leading payments solution provider powering 8M+ businesses.",
    openings: 6, applied_count: 384,
  },
  '5': {
    letter: 'Z', letterBg: '#F5F3FF', letterColor: '#7C3AED',
    company: 'Zepto', role: 'SDE I — Platforms',
    tag: 'Standard', tagBg: 'hsl(var(--muted))', tagColor: 'hsl(var(--muted-foreground))',
    ctc: '₹ 12 LPA', ctcNote: 'CTC Fixed + Stock Options',
    location: 'Mumbai', jobType: 'Full-time', campus: 'Off Campus', campusColor: '#B45309',
    match: 71, eligible: true,
    deadline: 'Closes Apr 5 11:59 PM', deadlineLeft: '16d left', deadlineColor: 'hsl(var(--primary))',
    nextRound: 'Online Test', nextRoundSub: 'Coding + Aptitude on April 12',
    applied: false,
    eligCriteria: [
      { text: 'CGPA ≥ 6.5', met: true },
      { text: 'No active backlogs', met: true },
      { text: 'Strong problem-solving skills', met: true },
      { text: 'Passion for high-growth startups', met: true },
    ],
    rounds: ['Resume Screening', 'Online Test', 'Technical Interview', 'Founder Round', 'Offer'],
    currentRoundIdx: 0,
    jd: [
      "Build and maintain platform services that power Zepto's 10-minute delivery engine.",
      'Own backend services from design through deployment with a lean team.',
      'Tackle real-time inventory, routing, and fulfilment challenges at scale.',
      'Contribute to internal developer tooling and platform reliability.',
    ],
    skills: ['Python / Node', 'React', 'PostgreSQL', 'Redis', 'DSA'],
    about: "Zepto is India's fastest-growing quick commerce company delivering groceries in under 10 minutes.",
    openings: 8, applied_count: 210,
  },
};

// ── Timeline for Microsoft track ──────────────────────────────────────
const MS_TIMELINE = [
  { date: 'Mar 18',        event: 'Application Submitted',  note: 'Via Winnify Drive Portal',         status: 'done'    },
  { date: 'Mar 19',        event: 'Shortlisted for OA',     note: 'Email confirmation received',      status: 'done'    },
  { date: 'Today · 10 AM', event: 'OA Round — HackerRank',  note: 'Link sent to registered email',    status: 'current' },
  { date: 'Apr 5 (est.)',  event: 'Tech Interview Round 1', note: 'Result pending OA clearance',      status: 'pending' },
  { date: 'Apr 10 (est.)', event: 'Tech Interview Round 2', note: 'Result pending',                   status: 'pending' },
  { date: 'Apr 14 (est.)', event: 'HR Round & Offer',       note: 'Final round',                      status: 'pending' },
];

// ── Skill match helper ────────────────────────────────────────────────
function skillMatched(skill: string): boolean {
  return USER_SKILLS.some(u =>
    skill.toLowerCase().split(/[\s/]+/).some(w =>
      u.toLowerCase().includes(w) || w.includes(u.toLowerCase())
    )
  );
}

// ════════════════════════════════════════════════════════════════════
// ApplicationTrackDetail
// ════════════════════════════════════════════════════════════════════
function ApplicationTrackDetail({
  d,
  onBack,
  onViewDetails,
}: {
  d: DriveInfo;
  onBack: () => void;
  onViewDetails: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Drives
      </button>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 font-[family-name:var(--font-heading)]"
            style={{ background: d.letterBg, color: d.letterColor }}
          >
            {d.letter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg font-[family-name:var(--font-heading)] text-foreground">
                {d.company}
              </span>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {d.tag}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{d.role}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {d.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {d.applied_count} applied
              </span>
              <span className="text-xs font-bold text-primary">Match {d.match}%</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-foreground font-[family-name:var(--font-heading)]">{d.ctc}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{d.ctcNote}</p>
          </div>
        </div>

        {/* View Full Drive Details */}
        <Button
          variant="outline"
          className="w-full mt-4 justify-between text-primary border-primary/30 hover:bg-primary/5"
          onClick={onViewDetails}
        >
          <span>View Full Drive Details</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Action alert */}
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center flex-shrink-0">
          <Clock className="h-4 w-4 text-destructive-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-0.5">
            Action Required Now
          </p>
          <p className="text-sm font-bold text-foreground">OA Round · Today 10:00 AM</p>
          <p className="text-xs text-muted-foreground mt-0.5">HackerRank · link in your registered email</p>
        </div>
        <Button
          size="sm"
          variant="destructive"
          className="flex-shrink-0 gap-1"
          onClick={() => navigate('/home/mocktest/briefing', { state: { company: d.company, topic: `${d.company} OA`, difficulty: 'Medium' } })}
        >
          Open <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Prep grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Prepare Now</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Zap className="h-4 w-4 text-primary" />,
              iconBg: 'bg-primary/10',
              label: 'Mock Assessment',
              sub: 'Prepare for OA',
              action: () => navigate('/home/mocktest/briefing', { state: { company: d.company, topic: `${d.company} OA`, difficulty: 'Medium' } }),
            },
            {
              icon: <User className="h-4 w-4 text-emerald-600" />,
              iconBg: 'bg-emerald-500/10',
              label: 'Mock Interview',
              sub: 'Practice rounds',
              action: () => navigate('/home/winspeak/practice/recording', { state: { question: `${d.company} — Tell me about yourself and why you want to join ${d.company}.`, category: 'Company Specific', difficulty: 'Medium' } }),
            },
            {
              icon: <FileText className="h-4 w-4 text-amber-500" />,
              iconBg: 'bg-amber-500/10',
              label: 'Company JD',
              sub: `${d.company} prep kit`,
              action: () => {},
              extra: <Download className="h-3 w-3 text-muted-foreground" />,
            },
            {
              icon: <MessageSquare className="h-4 w-4 text-violet-500" />,
              iconBg: 'bg-violet-500/10',
              label: 'Winni Agent',
              sub: 'AI interview coach',
              action: () => navigate('/home/ai-chat'),
            },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.action}
              className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer text-left"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', b.iconBg)}>
                {b.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground flex items-center gap-1">
                  {b.label}
                  {b.extra}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{b.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Journey Timeline
        </p>
        <div className="space-y-0">
          {MS_TIMELINE.map((t, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5',
                    t.status === 'done'    && 'bg-primary border-primary',
                    t.status === 'current' && 'bg-background border-destructive ring-2 ring-destructive/25',
                    t.status === 'pending' && 'bg-muted border-border',
                  )}
                />
                {i < MS_TIMELINE.length - 1 && (
                  <div
                    className={cn(
                      'w-px flex-1 my-1',
                      t.status === 'done' ? 'bg-primary/40' : 'bg-border',
                    )}
                    style={{ minHeight: 28 }}
                  />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(
                      'text-sm font-bold font-[family-name:var(--font-heading)]',
                      t.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                    )}>
                      {t.event}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.note}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold whitespace-nowrap flex-shrink-0 mt-0.5',
                    t.status === 'done'    && 'text-primary',
                    t.status === 'current' && 'text-destructive',
                    t.status === 'pending' && 'text-muted-foreground',
                  )}>
                    {t.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drive Alerts toggle */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Drive Alerts</p>
            <p className="text-[10px] text-muted-foreground">Stage updates · deadline reminders</p>
          </div>
        </div>
        <div className="w-11 h-6 rounded-full bg-primary flex items-center px-1 cursor-pointer">
          <div className="w-4 h-4 rounded-full bg-primary-foreground ml-auto shadow-sm" />
        </div>
      </div>

      {/* Schedule Prep Session */}
      <button className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Schedule Prep Session</p>
            <p className="text-[10px] text-muted-foreground">Book a slot with your placement officer</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Bottom CTA */}
      <div className="pt-2 border-t border-border">
        <Button className="w-full" size="lg">
          Track Application
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// DriveDetailView
// ════════════════════════════════════════════════════════════════════
function DriveDetailView({
  d,
  onBack,
}: {
  d: DriveInfo;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const matchedCount = d.skills.filter(skillMatched).length;

  const matchLabel =
    d.match === null ? 'Ineligible' :
    d.match >= 75    ? 'Strong fit' :
    d.match >= 55    ? 'Good fit'   : 'Partial fit';

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="font-semibold">{d.company}</span>
        </button>
        <button
          onClick={() => setSaved(v => !v)}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-xl border border-border transition-colors',
            saved ? 'bg-destructive/10 border-destructive/30' : 'bg-card hover:bg-muted',
          )}
        >
          <Heart
            className={cn('h-4 w-4', saved ? 'text-destructive fill-destructive' : 'text-muted-foreground')}
          />
        </button>
      </div>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
        {/* Logo + name row */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 font-[family-name:var(--font-heading)]"
            style={{ background: d.letterBg, color: d.letterColor }}
          >
            {d.letter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground font-[family-name:var(--font-heading)]">{d.company}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{d.role}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] font-bold">{d.tag}</Badge>
              <Badge variant="outline" className="text-[10px] font-bold gap-1">
                {d.campus === 'On Campus'
                  ? <GraduationCap className="h-3 w-3" />
                  : <Globe className="h-3 w-3" />}
                {d.campus}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0 gap-1 text-primary border-primary/30 hover:bg-primary/5">
            <FileText className="h-3 w-3" />
            JD
            <Download className="h-3 w-3" />
          </Button>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <MapPin className="h-3 w-3" />,    label: 'Location', value: d.location          },
            { icon: <Briefcase className="h-3 w-3" />, label: 'Type',     value: d.jobType           },
            { icon: <Users className="h-3 w-3" />,     label: 'Applied',  value: `${d.applied_count}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-muted p-3 flex flex-col items-center gap-1">
              <span className="text-muted-foreground">{s.icon}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
              <span className="text-xs font-bold text-foreground font-[family-name:var(--font-heading)]">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* CTC + Match */}
        <div className="flex items-stretch gap-3">
          <div className="flex-1 rounded-xl bg-primary/8 border border-primary/20 p-3.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Package</p>
            <p className="font-bold text-primary font-[family-name:var(--font-heading)]">{d.ctc}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{d.ctcNote}</p>
          </div>
          {d.match !== null ? (
            <div className={cn(
              'flex-1 rounded-xl p-3.5 border',
              d.match >= 75 ? 'bg-emerald-500/8 border-emerald-500/20' :
              d.match >= 55 ? 'bg-amber-500/8 border-amber-500/20' :
                              'bg-destructive/8 border-destructive/20',
            )}>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Profile Match</p>
              <p className={cn(
                'font-bold font-[family-name:var(--font-heading)]',
                d.match >= 75 ? 'text-emerald-600' :
                d.match >= 55 ? 'text-amber-500'   : 'text-destructive',
              )}>
                {d.match}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{matchLabel}</p>
            </div>
          ) : (
            <div className="flex-1 rounded-xl bg-destructive/8 border border-destructive/20 p-3.5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Eligibility</p>
              <p className="font-bold text-destructive font-[family-name:var(--font-heading)]">Ineligible</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Criteria not met</p>
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {d.deadline}
            </p>
            <p className="text-xs text-muted-foreground">{d.nextRound} · {d.nextRoundSub}</p>
          </div>
          <Badge variant="outline" className="font-bold text-[10px]">{d.deadlineLeft}</Badge>
        </div>

        {/* Mock prep shortcuts */}
        {d.eligible && (
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => navigate('/home/mocktest/briefing', { state: { company: d.company, topic: `${d.company} OA`, difficulty: 'Medium' } })}
            >
              <Zap className="h-3.5 w-3.5" /> Mock Assessment
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => navigate('/home/winspeak/practice/recording', { state: { question: `${d.company} — Tell me about yourself and why you want to join ${d.company}.`, category: 'Company Specific', difficulty: 'Medium' } })}
            >
              <User className="h-3.5 w-3.5" /> Mock Interview
            </Button>
          </div>
        )}
      </div>

      {/* Eligibility criteria */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className={cn('w-1 h-4 rounded-full', d.eligible ? 'bg-emerald-500' : 'bg-destructive')} />
          <span className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">Eligibility Criteria</span>
          <Badge
            variant={d.eligible ? 'success' : 'destructive'}
            className="ml-auto text-[10px] font-bold"
          >
            {d.eligible ? 'You qualify' : 'Not eligible'}
          </Badge>
        </div>
        <div className="space-y-2.5">
          {d.eligCriteria.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                c.met ? 'bg-emerald-500/10' : 'bg-destructive/10',
              )}>
                {c.met
                  ? <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                  : <X className="h-3 w-3 text-destructive" strokeWidth={3} />}
              </div>
              <span className="text-xs text-foreground/80">{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills required */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-amber-500" />
          <span className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">Skills Required</span>
          <Badge
            variant={matchedCount === d.skills.length ? 'success' : matchedCount >= d.skills.length / 2 ? 'warning' : 'destructive'}
            className="ml-auto text-[10px] font-bold"
          >
            {matchedCount} / {d.skills.length} matched
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">Highlighted skills are already in your profile</p>
        <div className="flex flex-wrap gap-2">
          {d.skills.map((s) => {
            const has = skillMatched(s);
            return (
              <span
                key={s}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl',
                  has
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {has && <Check className="h-3 w-3" strokeWidth={3} />}
                {s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Selection process */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">Selection Process</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-medium">{d.rounds.length} rounds</span>
        </div>
        <div className="space-y-0">
          {d.rounds.map((round, i) => {
            const isLast = i === d.rounds.length - 1;
            const isElim = /assessment|interview|technical|aptitude|test|screening|infy|amcat|hackerrank|verbal/i.test(round);
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0 w-6">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black',
                    isLast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {i + 1}
                  </div>
                  {!isLast && <div className="w-px mt-0.5 mb-0.5 bg-border" style={{ minHeight: 22 }} />}
                </div>
                <div className="flex items-center gap-2 pb-4 flex-1 flex-wrap">
                  <span className="text-sm font-bold text-foreground">{round}</span>
                  {isElim && (
                    <Badge variant="destructive" className="text-[9px] font-bold px-2 py-0.5">
                      Elimination
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* About company */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-emerald-500" />
          <span className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">About {d.company}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.about}</p>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs font-bold text-primary">{d.openings} openings</p>
            <p className="text-[10px] text-muted-foreground">For this role</p>
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{d.applied_count} applied</p>
            <p className="text-[10px] text-muted-foreground">From your campus</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-2 border-t border-border">
        {d.applied ? (
          <Button className="w-full" size="lg">
            Track Application
          </Button>
        ) : d.eligible ? (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
            Apply Now
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            Not Eligible
          </Button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Page entry point
// ════════════════════════════════════════════════════════════════════
export default function DriveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const d = DRIVES[id ?? '1'] ?? DRIVES['1'];
  const [showTrack, setShowTrack] = useState(d.applied);
  const handleBack = () => navigate('/home/drives');
  if (showTrack && d.applied) {
    return <ApplicationTrackDetail d={d} onBack={handleBack} onViewDetails={() => setShowTrack(false)} />;
  }
  return <DriveDetailView d={d} onBack={d.applied ? () => setShowTrack(true) : handleBack} />;
}
