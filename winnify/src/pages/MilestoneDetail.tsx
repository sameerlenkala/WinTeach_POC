import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { milestones } from '@/components/plan/PlanExecution';
import { usePlan } from '@/contexts/PlanContext';
import SkillsTimeline from '@/components/plan/SkillsTimeline';
import WinSpeakAnalytics from '@/components/plan/WinSpeakAnalytics';
import ResumeBuilder from '@/pages/ResumeBuilder';
import {
  ArrowLeft, CheckCircle, Clock, Calendar,
  FileText, Eye, AlertTriangle, TrendingUp,
  ArrowUp, ArrowDown, BookOpen, Building2, Code,
  Briefcase, Target, Mic, BarChart3, ChevronRight, Zap,
  Users, MessageSquare, Award, Lightbulb, Play, RotateCcw, ClipboardList,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: LucideIcon; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Per-milestone extra content ──────────────────────────────── */
const milestoneExtras: Record<string, {
  stats: { label: string; value: string; sub?: string; icon: LucideIcon; color: string }[];
  actions: { title: string; description: string; icon: LucideIcon; to: string; color: string }[];
  tips?: string[];
}> = {
  revision: {
    stats: [
      { label: 'Chapters', value: '8', sub: 'All completed', icon: BookOpen, color: 'bg-primary/10 text-primary' },
      { label: 'Lessons', value: '29', sub: '26 completed, 3 assessed', icon: FileText, color: 'bg-w-blue/10 text-w-blue' },
      { label: 'Time Spent', value: '42h', sub: 'Avg 2.8h/day', icon: Clock, color: 'bg-w-orange/10 text-w-orange' },
      { label: 'Strongest', value: 'DSA', sub: 'Arrays, Trees, Graphs', icon: Award, color: 'bg-w-green/10 text-w-green' },
    ],
    actions: [
      { title: 'Review Course', description: 'Revisit the skills timeline and brush up on weak areas', icon: BookOpen, to: '/home/90-day-plan/revision', color: 'bg-primary/10 text-primary' },
      { title: 'DBMS Refresher', description: 'Quick refresher on normalization and SQL joins before assessments', icon: Code, to: '/home/90-day-plan/revision/dbms-normalization', color: 'bg-w-blue/10 text-w-blue' },
    ],
    tips: [
      'DBMS scored lowest — review normalization and SQL joins before company assessments.',
      'Dynamic Programming was assessed but not fully completed. Revisit 2D DP problems.',
      'System Design basics covered. Consider deeper dives for senior-level company OAs.',
    ],
  },
  resume: {
    stats: [],
    actions: [
      { title: 'Resume Builder', description: 'Edit your resume sections, bullet points, and formatting', icon: FileText, to: '/home/resume', color: 'bg-primary/10 text-primary' },
      { title: 'ATS Report', description: 'View detailed ATS compatibility analysis and suggestions', icon: TrendingUp, to: '/home/resume', color: 'bg-w-blue/10 text-w-blue' },
      { title: 'Preview & Templates', description: 'Switch between Classic, Modern, and Minimal templates', icon: Eye, to: '/home/resume', color: 'bg-w-green/10 text-w-green' },
    ],
    tips: [
      'Add more quantifiable achievements — numbers make bullet points 40% more impactful.',
      'Keywords from job descriptions are missing. Tailor your resume per company.',
      'Format check flagged inconsistent spacing between sections. Fix before manual review.',
    ],
  },
  'company-assessments': {
    stats: [
      { label: 'Total Companies', value: '8', sub: '4 attempted · 4 pending', icon: Building2, color: 'bg-primary/10 text-primary' },
      { label: 'Best Score', value: '72%', sub: 'TCS NQT — target met', icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Avg Score', value: '65%', sub: 'Across 4 attempted', icon: BarChart3, color: 'bg-w-blue/10 text-w-blue' },
    ],
    actions: [
      { title: 'Mocktest Hub', description: 'Access all mock tests — aptitude, technical, and company-specific', icon: Zap, to: '/home/mocktest', color: 'bg-primary/10 text-primary' },
      { title: 'Company OA', description: 'Practice company-specific online assessment patterns', icon: Building2, to: '/home/mocktest/company-oa', color: 'bg-w-blue/10 text-w-blue' },
      { title: 'Technical Tests', description: 'DSA, algorithms, and coding problems for technical rounds', icon: Code, to: '/home/mocktest/technical', color: 'bg-w-green/10 text-w-green' },
      { title: 'Behavioural', description: 'Aptitude, logical reasoning, and verbal ability practice', icon: Briefcase, to: '/home/mocktest/aptitude', color: 'bg-w-orange/10 text-w-orange' },
      { title: 'Company Specific', description: 'Targeted prep for TCS, Infosys, Wipro, Google patterns', icon: Target, to: '/home/mocktest/company-oa', color: 'bg-w-pink/10 text-w-pink' },
    ],
    tips: [
      'Google OA at 50% — focus on medium/hard DSA problems and time management.',
      'Infosys InfyTQ is 2 points away from target. One more practice round should close the gap.',
      'TCS NQT and Wipro NLTH targets met. Maintain scores with weekly revision.',
    ],
  },
  winspeak: {
    stats: [
      { label: 'Challenges', value: '32/40', sub: '32 completed · 8 pending', icon: Mic, color: 'bg-primary/10 text-primary' },
      { label: 'WinSpeak Score', value: '32', sub: 'Overall score', icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Best Area', value: 'Fluency', sub: '74 / 80 target', icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Weakest Area', value: 'Structure', sub: '65 / 80 target', icon: AlertTriangle, color: 'bg-w-red/10 text-w-red' },
    ],
    actions: [
      { title: 'WinSpeak Hub', description: 'Dashboard with all speaking challenges and progress', icon: Mic, to: '/home/winspeak', color: 'bg-primary/10 text-primary' },
      { title: 'Weekly Challenge', description: 'This week\'s topic: "Explain a technical project to a non-technical audience"', icon: Zap, to: '/home/winspeak/challenge', color: 'bg-w-blue/10 text-w-blue' },
      { title: 'Score Dashboard', description: 'Detailed analytics on fluency, confidence, clarity, and structure', icon: BarChart3, to: '/home/winspeak/scores', color: 'bg-w-orange/10 text-w-orange' },
    ],
    tips: [
      'Structure score is lowest at 65. Practice the STAR method for every response.',
      'Fluency is your strongest area at 74 — keep it up with daily practice.',
      'Record yourself and review. Self-awareness is the fastest path to improvement.',
    ],
  },
  employability: {
    stats: [
      { label: 'Behavioural', value: '66%', sub: '2 rounds done · avg score', icon: MessageSquare, color: 'bg-primary/10 text-primary' },
      { label: 'Technical', value: '50%', sub: '1 round done · target: 80%', icon: Code, color: 'bg-w-blue/10 text-w-blue' },
      { label: 'Company Specific', value: '0/3', sub: 'Not started', icon: Building2, color: 'bg-w-orange/10 text-w-orange' },
    ],
    actions: [
      { title: 'Mock Interview Hub', description: 'Schedule and take mock interviews with AI feedback', icon: Briefcase, to: '/home/mocktest', color: 'bg-primary/10 text-primary' },
      { title: 'Tech Round Prep', description: 'Practice DSA, system design, and language-specific questions', icon: Code, to: '/home/mocktest/technical', color: 'bg-w-blue/10 text-w-blue' },
      { title: 'Company Round Prep', description: 'Behavioral questions, company culture fit, and HR rounds', icon: Building2, to: '/home/mocktest/company-oa', color: 'bg-w-green/10 text-w-green' },
    ],
    tips: [
      'Decorators & memory management flagged as weak. Review before next technical mock.',
      'System Design basics need reinforcement — practice drawing architecture diagrams.',
      'For behavioral rounds, prepare 5 STAR stories covering leadership, conflict, and failure.',
    ],
  },
  'in-person': {
    stats: [
      { label: 'Attempts', value: '1/3', sub: '2 remaining', icon: Users, color: 'bg-primary/10 text-primary' },
      { label: 'Next Slot', value: 'Apr 30', sub: '10:00 AM · Technical', icon: Calendar, color: 'bg-w-blue/10 text-w-blue' },
    ],
    actions: [
      { title: 'Schedule Interview', description: 'Book your next in-person mock slot with an AI interviewer', icon: Calendar, to: '/home/mocktest', color: 'bg-primary/10 text-primary' },
      { title: 'Practice Interview', description: 'Simulate in-person interview with timed whiteboard coding', icon: Mic, to: '/home/winspeak/practice', color: 'bg-w-blue/10 text-w-blue' },
    ],
    tips: [
      'Body language scored low — practice maintaining eye contact and confident posture.',
      'Whiteboard coding: talk through your approach before writing code.',
      'Ask clarifying questions. Interviewers want to see structured problem-solving.',
    ],
  },
};

/* ── Component ────────────────────────────────────────────────── */
export default function MilestoneDetail() {
  const { milestoneId } = useParams<{ milestoneId: string }>();
  const { skills, weeklySkills, selectedAreas, duration, track } = usePlan();

  // Build dynamic revision milestone
  const revisionDayEnd = duration ? duration.days : 15;
  const areaList = selectedAreas.length > 0
    ? selectedAreas.slice(0, 3).join(', ') + (selectedAreas.length > 3 ? ` and ${selectedAreas.length - 3} more` : '')
    : 'Computer Science';

  const currentRoleTitle = sessionStorage.getItem('plan-role-title') ?? '';
  let roleHours = skills.length * 5;
  if (currentRoleTitle === 'AI Engineer') {
    roleHours = 78;
  } else if (currentRoleTitle === 'Automotive Engineer') {
    roleHours = 90;
  } else if (currentRoleTitle === 'Full Stack Developer') {
    roleHours = 87;
  }

  const revisionSummary = `Covering ${skills.length} skills across ${weeklySkills.length} weeks — ${areaList}. ${duration ? `At ${Math.round((roleHours) / duration.totalWeeks * 10) / 10}h/week pace (${duration.label}).` : ''
    } Focus on Mandatory skills first before Extra edge topics.`;

  // Shared revision completion numbers — same formula as PlanExecution card
  const revisionTotalSkills = skills.length;
  const revisionDoneSkills = Math.round(revisionTotalSkills * 0.35);

  const rawMilestone = milestones.find((ms) => ms.id === milestoneId);

  // Stream-aware interview questions and attempt log for employability
  const streamInterviewQuestions = (() => {
    const isMech = track === 'MECH';
    const isEEE = track === 'EEE';
    const isECE = track === 'ECE';
    const behavioural = [
      { category: 'Behavioural' as const, question: 'Tell me about a time you handled a conflict in a team.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Behavioural' as const, question: 'Describe a situation where you failed and what you learned.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Behavioural' as const, question: 'Give an example of when you showed leadership.', difficulty: 'Easy' as const, status: 'done' as const },
    ];
    const technical = isMech ? [
      { category: 'Technical' as const, question: 'Explain the difference between stress and strain with a real-world example.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Technical' as const, question: 'Walk through the FMEA process for a mechanical component.', difficulty: 'Hard' as const, status: 'pending' as const },
      { category: 'Technical' as const, question: 'What is GD&T and why is it important in manufacturing?', difficulty: 'Medium' as const, status: 'pending' as const },
    ] : isEEE ? [
      { category: 'Technical' as const, question: 'Explain the working principle of a 3-phase induction motor.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Technical' as const, question: 'What is power factor and how do you improve it?', difficulty: 'Medium' as const, status: 'pending' as const },
      { category: 'Technical' as const, question: 'Describe the operation of a PID controller with an example.', difficulty: 'Hard' as const, status: 'pending' as const },
    ] : isECE ? [
      { category: 'Technical' as const, question: 'Explain the difference between RISC and CISC architectures.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Technical' as const, question: 'What is the purpose of a phase-locked loop (PLL)?', difficulty: 'Hard' as const, status: 'pending' as const },
      { category: 'Technical' as const, question: 'Describe the VLSI design flow from RTL to GDSII.', difficulty: 'Medium' as const, status: 'pending' as const },
    ] : [
      { category: 'Technical' as const, question: 'Explain Python decorators with an example.', difficulty: 'Medium' as const, status: 'done' as const },
      { category: 'Technical' as const, question: 'Design a URL shortener system.', difficulty: 'Hard' as const, status: 'pending' as const },
      { category: 'Technical' as const, question: 'What is memory management in Python? Explain GC.', difficulty: 'Medium' as const, status: 'pending' as const },
    ];
    const companySpecific = [
      { category: 'Company Specific' as const, question: 'Why do you want to join this company?', difficulty: 'Easy' as const, status: 'pending' as const },
      { category: 'Company Specific' as const, question: 'Where do you see yourself in 5 years?', difficulty: 'Easy' as const, status: 'pending' as const },
      { category: 'Company Specific' as const, question: 'How do you align with our company values?', difficulty: 'Medium' as const, status: 'pending' as const },
    ];
    return [...behavioural, ...technical, ...companySpecific];
  })();

  const streamAttemptLog = (() => {
    const isMech = track === 'MECH';
    const isEEE = track === 'EEE';
    const isECE = track === 'ECE';
    return [
      { round: 'Behavioural #1', score: 62, date: 'Apr 18', feedback: 'Good STAR structure on Q1. Lacked specifics on failure question.' },
      { round: 'Behavioural #2', score: 70, date: 'Apr 21', feedback: 'Improved confidence. Leadership example was strong.' },
      {
        round: 'Technical #1', score: 50, date: 'Apr 23', feedback: isMech
          ? 'Stress-strain explanation was partial. FMEA process needs more depth.'
          : isEEE
            ? 'Motor working principle partially explained. Power factor correction needs more depth.'
            : isECE
              ? 'RISC/CISC difference explained well. PLL operation needs more depth.'
              : 'Decorators explained partially. System design needs more depth.'
      },
    ];
  })();

  // Compute employability stat values dynamically from attempt log
  const employabilityStats = (() => {
    const log = streamAttemptLog;
    const bRounds = log.filter(a => a.round.startsWith('Behavioural'));
    const tRounds = log.filter(a => a.round.startsWith('Technical'));
    const cRounds = log.filter(a => a.round.startsWith('Company'));
    return [
      { label: 'Behavioural', value: `${bRounds.length}/5`, sub: `${bRounds.length} done · ${5 - bRounds.length} pending`, icon: MessageSquare, color: 'bg-primary/10 text-primary' },
      { label: 'Technical', value: `${tRounds.length}/3`, sub: `${tRounds.length} done · ${3 - tRounds.length} pending`, icon: Code, color: 'bg-w-blue/10 text-w-blue' },
      { label: 'Company Specific', value: `${cRounds.length}/3`, sub: cRounds.length > 0 ? `${cRounds.length} done · ${3 - cRounds.length} pending` : 'Not started', icon: Building2, color: 'bg-w-orange/10 text-w-orange' },
    ];
  })();

  const m = rawMilestone && rawMilestone.id === 'revision'
    ? { ...rawMilestone, dayRange: `Day 1–${revisionDayEnd}`, summary: revisionSummary }
    : rawMilestone && rawMilestone.id === 'employability'
      ? { ...rawMilestone, interviewQuestions: streamInterviewQuestions, attemptLog: streamAttemptLog }
      : rawMilestone;

  // Build dynamic revision extras from plan context
  const dynamicRevisionExtras = {
    stats: [
      { label: 'Skills', value: String(revisionTotalSkills), sub: `${revisionDoneSkills} completed`, icon: BookOpen, color: 'bg-primary/10 text-primary' },
      { label: 'Weeks', value: String(weeklySkills.length), sub: duration?.label || 'Not set', icon: Clock, color: 'bg-w-blue/10 text-w-blue' },
      { label: 'Total Hours', value: `${roleHours}h`, sub: duration ? `${Math.round((roleHours) / duration.totalWeeks * 10) / 10}h/week` : '—', icon: Zap, color: 'bg-w-orange/10 text-w-orange' },
    ],
    actions: [],
    tips: selectedAreas.length > 0
      ? [
        `You selected ${selectedAreas.length} area${selectedAreas.length > 1 ? 's' : ''}: ${selectedAreas.slice(0, 2).join(', ')}${selectedAreas.length > 2 ? ` and ${selectedAreas.length - 2} more` : ''}.`,
        duration ? `At your chosen pace (${duration.label}), you'll cover ${Math.round((roleHours) / duration.totalWeeks * 10) / 10}h per week.` : 'Set a duration to see your weekly pace.',
        'Focus on Mandatory skills first before moving to Extra edge skills.',
      ]
      : milestoneExtras.revision?.tips || [],
  };

  if (!m) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Milestone not found.</p>
        <Link to="/home/90-day-plan" className="text-primary text-sm mt-2 inline-block">← Back to Slog Overs</Link>
      </div>
    );
  }

  const Icon = m.icon;
  const isCompleted = m.status === 'completed';

  // Track-aware extras override
  const isMechTrack = track === 'MECH';
  const isEEETrack = track === 'EEE';
  const isECETrack = track === 'ECE';
  const isNonCSTrack = isMechTrack || isEEETrack || isECETrack || track === 'CIVIL' || track === 'CHEM' || track === 'BIO';

  const trackExtrasOverride: Partial<typeof milestoneExtras> = isNonCSTrack ? {
    revision: {
      stats: [
        { label: 'Skills', value: String(revisionTotalSkills), sub: `${revisionDoneSkills} completed`, icon: BookOpen, color: 'bg-primary/10 text-primary' },
        { label: 'Weeks', value: String(weeklySkills.length), sub: duration?.label || 'Not set', icon: Clock, color: 'bg-w-blue/10 text-w-blue' },
        { label: 'Total Hours', value: `${roleHours}h`, sub: duration ? `${Math.round((roleHours) / duration.totalWeeks * 10) / 10}h/week` : '—', icon: Zap, color: 'bg-w-orange/10 text-w-orange' },
      ],
      actions: [
        { title: 'Review Course', description: 'Revisit the skills timeline and brush up on weak areas', icon: BookOpen, to: '/home/90-day-plan/revision', color: 'bg-primary/10 text-primary' },
      ],
      tips: [
        `You selected ${selectedAreas.length} area${selectedAreas.length !== 1 ? 's' : ''}: ${selectedAreas.slice(0, 2).join(', ')}${selectedAreas.length > 2 ? ` and ${selectedAreas.length - 2} more` : ''}.`,
        duration ? `At your chosen pace (${duration.label}), you'll cover ${Math.round((roleHours) / duration.totalWeeks * 10) / 10}h per week.` : 'Set a duration to see your weekly pace.',
        'Focus on Mandatory skills first before moving to Extra edge skills.',
      ],
    },
    'company-assessments': {
      stats: [
        { label: 'Total Companies', value: '8', sub: '4 attempted · 4 pending', icon: Building2, color: 'bg-primary/10 text-primary' },
        { label: 'Best Score', value: '72%', sub: 'Target met', icon: Award, color: 'bg-w-green/10 text-w-green' },
        { label: 'Avg Score', value: '65%', sub: 'Across 4 attempted', icon: BarChart3, color: 'bg-w-blue/10 text-w-blue' },
      ],
      actions: [
        { title: 'Mocktest Hub', description: 'Access all mock tests — aptitude, technical, and company-specific', icon: Zap, to: '/home/mocktest', color: 'bg-primary/10 text-primary' },
        { title: 'Technical Tests', description: `Core ${isMechTrack ? 'mechanical' : isEEETrack ? 'electrical' : isECETrack ? 'electronics' : 'engineering'} problems and aptitude`, icon: Code, to: '/home/mocktest/technical', color: 'bg-w-green/10 text-w-green' },
        { title: 'Aptitude Practice', description: 'Quantitative, logical reasoning, and verbal ability', icon: Briefcase, to: '/home/mocktest/aptitude', color: 'bg-w-orange/10 text-w-orange' },
      ],
      tips: [
        `Focus on core ${isMechTrack ? 'mechanical engineering' : isEEETrack ? 'electrical engineering' : isECETrack ? 'electronics & communication' : 'engineering'} aptitude sections.`,
        'Practice time management — most OA rounds are 90 minutes for 60–80 questions.',
        'Review company-specific patterns from previous years before each attempt.',
      ],
    },
    winspeak: {
      stats: milestoneExtras.winspeak.stats,
      actions: milestoneExtras.winspeak.actions,
      tips: [
        `Structure your answers using the STAR method — especially for ${isMechTrack ? 'project and design' : isEEETrack ? 'lab and circuit' : 'technical'} experience questions.`,
        'Practice explaining technical concepts to non-technical audiences — common in core engineering interviews.',
        'Record yourself and review. Self-awareness is the fastest path to improvement.',
      ],
    },
    employability: {
      stats: [
        { label: 'Behavioural', value: '66%', sub: '2 rounds done · avg score', icon: MessageSquare, color: 'bg-primary/10 text-primary' },
        { label: 'Technical', value: '50%', sub: `1 round done · target: 80%`, icon: Code, color: 'bg-w-blue/10 text-w-blue' },
        { label: 'Company Specific', value: '0/3', sub: 'Not started', icon: Building2, color: 'bg-w-orange/10 text-w-orange' },
      ],
      actions: [
        { title: 'Mock Interview Hub', description: 'Schedule and take mock interviews with AI feedback', icon: Briefcase, to: '/home/mocktest', color: 'bg-primary/10 text-primary' },
        { title: 'Technical Round Prep', description: `Core ${isMechTrack ? 'mechanical' : isEEETrack ? 'electrical' : 'engineering'} concepts and problem-solving`, icon: Code, to: '/home/mocktest/technical', color: 'bg-w-blue/10 text-w-blue' },
        { title: 'HR Round Prep', description: 'Behavioral questions, company culture fit, and HR rounds', icon: Building2, to: '/home/mocktest/company-oa', color: 'bg-w-green/10 text-w-green' },
      ],
      tips: [
        `Review core ${isMechTrack ? 'thermodynamics, strength of materials, and manufacturing' : isEEETrack ? 'power systems, machines, and control theory' : isECETrack ? 'digital electronics, signals, and VLSI' : 'engineering'} concepts before technical rounds.`,
        'System Design basics need reinforcement — practice drawing architecture/process diagrams.',
        'For behavioral rounds, prepare 5 STAR stories covering leadership, conflict, and failure.',
      ],
    },
  } : {};

  const extras = milestoneId === 'revision'
    ? (isNonCSTrack ? (trackExtrasOverride.revision || dynamicRevisionExtras) : dynamicRevisionExtras)
    : (trackExtrasOverride[m.id as keyof typeof trackExtrasOverride] || milestoneExtras[m.id] || { stats: [], actions: [], tips: [] });
  const navigate = useNavigate();
  const lastSkillSlug = milestoneId === 'revision' ? localStorage.getItem('last-skill-slug') : null;
  const resumeTo = lastSkillSlug
    ? `/home/90-day-plan/revision/${lastSkillSlug}`
    : '/home/90-day-plan/revision';
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; logo?: string; tag: string; score?: number; target?: number; to: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAttempt, setExpandedAttempt] = useState<number | null>(null);
  const [attemptPanel, setAttemptPanel] = useState<Record<number, 'analysis' | 'practice' | null>>({});
  const [briefingCompany, setBriefingCompany] = useState<string | null>(null);

  // Real-time scores from localStorage — updated when assessments are completed
  const [liveScores, setLiveScores] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('company-scores') || '{}'); } catch { return {}; }
  });

  // Listen for score updates from other pages (e.g. after completing a test)
  useEffect(() => {
    function onStorage() {
      try { setLiveScores(JSON.parse(localStorage.getItem('company-scores') || '{}')); } catch { /* ignore */ }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Stream-aware company list — same logic as PlanExecution
  const streamCompanyList = (() => {
    const isMech = track === 'MECH';
    const isEEE = track === 'EEE';
    const isECE = track === 'ECE';
    const isCivil = track === 'CIVIL';
    const isChem = track === 'CHEM';
    const isBio = track === 'BIO';
    const isNonCS = isMech || isEEE || isECE || isCivil || isChem || isBio;

    // CS track — use role-specific companies from Learning page selection
    if (!isNonCS) {
      const roleTitle = sessionStorage.getItem('plan-role-title') ?? '';
      const roleCompanyMap: Record<string, { name: string; tag: string; score?: number; target?: number; to: string; logo: string }[]> = {
        'Full Stack Developer': [
          { name: 'Google', tag: 'Product', score: 50, target: 85, to: '/home/mocktest/briefing', logo: 'google.com' },
          { name: 'Microsoft', tag: 'Product', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'microsoft.com' },
          { name: 'Razorpay', tag: 'Fintech', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'razorpay.com' },
          { name: 'Swiggy', tag: 'Consumer Tech', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'swiggy.com' },
        ],
        'AI Engineer': [
          { name: 'Google', tag: 'AI / Product', score: 50, target: 85, to: '/home/mocktest/briefing', logo: 'google.com' },
          { name: 'Microsoft', tag: 'AI / Cloud', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'microsoft.com' },
          { name: 'Amazon', tag: 'Cloud / AI', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'amazon.com' },
          { name: 'Flipkart', tag: 'E-Commerce', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'flipkart.com' },
        ],
      };
      return roleCompanyMap[roleTitle] ?? null;
    }

    const pick = (mechVal: string, eeeVal: string, eceVal: string, civilVal: string, chemVal: string, bioVal: string) =>
      isMech ? mechVal : isEEE ? eeeVal : isECE ? eceVal : isCivil ? civilVal : isChem ? chemVal : bioVal;

    return [
      { name: pick('L&T Engineering', 'ABB India', 'Qualcomm', 'L&T Construction', 'Reliance Industries', 'Biocon'), tag: pick('Manufacturing', 'Power & Automation', 'Semiconductors', 'Infrastructure', 'Petrochemicals', 'Biotechnology'), score: 72, target: 70, to: '/home/mocktest/briefing', logo: pick('larsentoubro.com', 'abb.com', 'qualcomm.com', 'larsentoubro.com', 'ril.com', 'biocon.com') },
      { name: pick('Tata Motors', 'Siemens India', 'Texas Instruments', 'Shapoorji Pallonji', 'ONGC', 'Dr. Reddy\'s'), tag: pick('Automotive', 'Electrical', 'Semiconductors', 'Construction', 'Oil & Gas', 'Pharma'), score: 68, target: 70, to: '/home/mocktest/briefing', logo: pick('tatamotors.com', 'siemens.com', 'ti.com', 'shapoorjipallonji.com', 'ongcindia.com', 'drreddys.com') },
      { name: pick('Mahindra & Mahindra', 'BHEL', 'Intel', 'DLF', 'BASF India', 'Sun Pharma'), tag: pick('Automotive', 'Power Equipment', 'Semiconductors', 'Real Estate', 'Chemicals', 'Pharma'), score: 70, target: 65, to: '/home/mocktest/briefing', logo: pick('mahindra.com', 'bhel.in', 'intel.com', 'dlf.in', 'basf.com', 'sunpharma.com') },
      { name: pick('Bosch India', 'Schneider Electric', 'Samsung Semiconductor', 'NHAI', 'Dow Chemical', 'Cipla'), tag: pick('Auto Components', 'Energy Mgmt', 'Semiconductors', 'Infrastructure', 'Chemicals', 'Pharma'), score: 50, target: 80, to: '/home/mocktest/briefing', logo: pick('bosch.com', 'se.com', 'samsung.com', 'nhai.gov.in', 'dow.com', 'cipla.com') },
      { name: pick('Caterpillar India', 'Havells India', 'Broadcom', 'Gammon India', 'Tata Chemicals', 'Lupin'), tag: pick('Heavy Equipment', 'Electrical', 'Semiconductors', 'Construction', 'Chemicals', 'Pharma'), to: '/home/mocktest/briefing', logo: pick('cat.com', 'havells.com', 'broadcom.com', 'gammonindia.com', 'tatachemicals.com', 'lupin.com') },
      { name: pick('Cummins India', 'Crompton Greaves', 'MediaTek', 'Afcons Infrastructure', 'UPL Limited', 'Wockhardt'), tag: pick('Power Systems', 'Electrical', 'Semiconductors', 'Construction', 'Agrochemicals', 'Pharma'), to: '/home/mocktest/briefing', logo: pick('cummins.com', 'cromptongreaves.com', 'mediatek.com', 'afcons.com', 'upl-ltd.com', 'wockhardt.com') },
      { name: pick('Thermax India', 'Emerson Electric', 'NXP Semiconductors', 'Sterlite Power', 'Pidilite Industries', 'Piramal Pharma'), tag: pick('Energy & Env', 'Automation', 'Semiconductors', 'Infrastructure', 'Specialty Chem', 'Pharma'), to: '/home/mocktest/briefing', logo: pick('thermaxglobal.com', 'emerson.com', 'nxp.com', 'sterlitepower.com', 'pidilite.com', 'piramal.com') },
      { name: pick('Godrej & Boyce', 'Legrand India', 'Renesas Electronics', 'IRB Infrastructure', 'Coromandel International', 'Aurobindo Pharma'), tag: pick('Engineering', 'Electrical', 'Semiconductors', 'Roads & Highways', 'Fertilizers', 'Pharma'), to: '/home/mocktest/briefing', logo: pick('godrej.com', 'legrand.com', 'renesas.com', 'irb.co.in', 'coromandel.com', 'aurobindo.com') },
    ];
  })();

  // Merge live scores into companyList — use stream-aware list if available
  const baseCompanyList = streamCompanyList ?? m.companyList ?? [];
  const companyListWithScores = baseCompanyList.map((c) => ({
    ...c,
    score: liveScores[c.name] ?? c.score,
  }));

  // Dynamic company assessment tips — built from actual company data
  const dynamicCompanyTips = (() => {
    const list = companyListWithScores || [];
    const attempted = list.filter((c) => c.score !== undefined);
    const failed = attempted.filter((c) => c.score! < (c.target ?? 70));
    const passed = attempted.filter((c) => c.score! >= (c.target ?? 70));
    const tips: string[] = [];
    if (failed.length > 0) {
      const worst = failed.sort((a, b) => a.score! - b.score!)[0];
      tips.push(`${worst.name} at ${worst.score}% — focus on improving before the next attempt.`);
    }
    if (failed.length > 1) {
      const second = failed.sort((a, b) => (b.target! - b.score!) - (a.target! - a.score!))[1];
      if (second) tips.push(`${second.name} is ${second.target! - second.score!} points away from target. One more practice round should close the gap.`);
    }
    if (passed.length > 0) {
      tips.push(`${passed.map(c => c.name).join(', ')} target${passed.length > 1 ? 's' : ''} met. Maintain scores with weekly revision.`);
    }
    if (tips.length === 0) tips.push('Practice time management — most OA rounds are 90 minutes for 60–80 questions.');
    return tips.slice(0, 3);
  })();

  // Dynamic company-assessments stats — computed from actual companyList
  const dynamicCompanyStats = (() => {
    const list = companyListWithScores || [];
    const attempted = list.filter((c) => c.score !== undefined);
    const pending = list.filter((c) => c.score === undefined);
    const scores = attempted.map((c) => c.score!);
    const best = scores.length > 0 ? Math.max(...scores) : 0;
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestCompany = attempted.find((c) => c.score === best);
    const bestMet = bestCompany && bestCompany.score! >= (bestCompany.target ?? 70);
    return [
      { label: 'Total Companies', value: String(list.length), sub: `${attempted.length} attempted · ${pending.length} pending`, icon: Building2, color: 'bg-primary/10 text-primary' },
      { label: 'Best Score', value: `${best}%`, sub: bestCompany ? `${bestCompany.name}${bestMet ? ' — target met' : ''}` : '—', icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Avg Score', value: `${avg}%`, sub: `Across ${attempted.length} attempted`, icon: BarChart3, color: 'bg-w-blue/10 text-w-blue' },
    ];
  })();

  // Dynamic WinSpeak stats — computed from challengeHistory
  const dynamicWinSpeakStats = (() => {
    const history = m?.challengeHistory?.filter((c) => c.status === 'submitted') ?? [];
    const total = m?.completionCount?.total ?? m?.challengeHistory?.length ?? 0;
    const done = m?.completionCount?.done ?? history.length;
    const latest = history[0]; // most recent first
    const allFluency = history.map((c) => c.fluency ?? 0).filter(Boolean);
    const bestFluency = allFluency.length > 0 ? Math.max(...allFluency) : 0;
    const latestStructure = latest?.structure ?? 0;
    return [
      { label: 'Challenges', value: `${done}/${total}`, sub: `${done} completed · ${total - done} pending`, icon: Mic, color: 'bg-primary/10 text-primary' },
      { label: 'WinSpeak Score', value: String(m?.winSpeakScore ?? 60), sub: 'Overall score', icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Best Area', value: 'Fluency', sub: `${bestFluency} / 80 target`, icon: Award, color: 'bg-w-green/10 text-w-green' },
      { label: 'Weakest Area', value: 'Structure', sub: `${latestStructure} / 80 target`, icon: AlertTriangle, color: 'bg-w-red/10 text-w-red' },
    ];
  })();

  // Dynamic WinSpeak tips — from actual scores
  const dynamicWinSpeakTips = (() => {
    const history = m?.challengeHistory?.filter((c) => c.status === 'submitted') ?? [];
    const latest = history[0];
    if (!latest) return milestoneExtras.winspeak?.tips ?? [];
    return [
      `Structure score is lowest at ${latest.structure}. Practice the STAR method for every response.`,
      `Fluency is your strongest area at ${latest.fluency} — keep it up with daily practice.`,
      'Record yourself and review. Self-awareness is the fastest path to improvement.',
    ];
  })();

  // Dynamic In-Person stats — computed from attempts and scheduledInterviews
  const dynamicInPersonStats = (() => {
    const attempts = m?.attempts ?? [];
    const done = attempts.filter((a) => a.score > 0).length;
    const total = attempts.length;
    const nextUpcoming = m?.scheduledInterviews?.find((s) => s.status === 'upcoming');
    return [
      { label: 'Attempts', value: `${done}/${total}`, sub: `${total - done} remaining`, icon: Users, color: 'bg-primary/10 text-primary' },
      { label: 'Next Slot', value: nextUpcoming?.date ?? 'TBD', sub: nextUpcoming ? `${nextUpcoming.time} · ${nextUpcoming.type}` : 'Schedule soon', icon: Calendar, color: 'bg-w-blue/10 text-w-blue' },
    ];
  })();

  // Override all milestone stats/tips with dynamic computed values
  const finalExtras = milestoneId === 'company-assessments'
    ? { ...extras, stats: dynamicCompanyStats, tips: dynamicCompanyTips }
    : milestoneId === 'employability'
      ? { ...extras, stats: employabilityStats }
      : milestoneId === 'winspeak'
        ? { ...extras, stats: dynamicWinSpeakStats, tips: dynamicWinSpeakTips }
        : milestoneId === 'in-person'
          ? { ...extras, stats: dynamicInPersonStats }
          : extras;

  return (
    <div className="p-6 lg:p-8 space-y-6 min-w-0">
      {/* Back */}
      <button
        onClick={() => navigate('/home/90-day-plan')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Slog Overs
      </button>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
          isCompleted ? 'bg-w-green/10 text-w-green' : 'bg-primary/10 text-primary'
        )}>
          <Icon className="h-5.5 w-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold font-[family-name:var(--font-heading)]">{m.title}</h1>
            <Badge variant={isCompleted ? 'success' : 'default'} className="text-[10px]">
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">{m.summary}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 sm:self-start">
          {milestoneId === 'revision' && (
            <button
              onClick={() => navigate(resumeTo)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer border',
                lastSkillSlug
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-sm'
                  : 'bg-w-green/10 text-w-green border-w-green/30 hover:bg-w-green/20'
              )}
            >
              {lastSkillSlug
                ? <><Play className="h-3.5 w-3.5 fill-current" /> Resume</>
                : <><BookOpen className="h-3.5 w-3.5" /> Start Course</>
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards Row ────────────────────────────────────── */}
      {finalExtras.stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {finalExtras.stats.map((s) => {
            // Map stat label to interview question category
            const catMap: Record<string, string> = {
              'Behavioural': 'Behavioural',
              'Technical': 'Technical',
              'Company Specific': 'Company Specific',
            };
            const cat = catMap[s.label];
            const isClickable = !!m.interviewQuestions && !!cat;
            const isActive = selectedCategory === cat;
            return isClickable ? (
              <button
                key={s.label}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all cursor-pointer w-full',
                  isActive ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', s.color)}>
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-xl font-bold font-[family-name:var(--font-heading)] text-foreground">{s.value}</p>
                {s.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>}
              </button>
            ) : (
              <StatCard key={s.label} {...s} />
            );
          })}
        </div>
      )}

      {/* ── Content layout ─────────────────────────────────────── */}
      {(() => {
        const hasDetailData = !!(m.validationSteps || m.manualValidation || m.subItems || m.attempts || m.focusAreas || m.interviewQuestions || m.attemptLog || m.scheduledInterviews || m.companyList || m.challengeHistory || m.practiceArena || m.showWinSpeakAnalytics);

        if (!hasDetailData) {
          /* Single-column layout — actions grid + tips when no detail data */
          return (
            <div className="space-y-6">
              {/* Skills timeline — revision milestone only */}
              {milestoneId === 'revision' && <SkillsTimeline />}

              {/* AI Tips as wider card — hidden for revision */}
              {finalExtras.tips && finalExtras.tips.length > 0 && milestoneId !== 'revision' && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-w-amber" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {finalExtras.tips.map((tip, i) => (
                        <div key={i} className="flex gap-2.5 rounded-lg border border-border bg-muted/20 p-3">
                          <Lightbulb className="h-3.5 w-3.5 text-w-amber shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        }

        /* Two-column layout when there IS detail data */
        return (
          <div className={milestoneId === 'resume' || milestoneId === 'company-assessments' ? 'space-y-5' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
            {/* Left column — detailed data (2/3 width) */}
            <div className={milestoneId === 'resume' || milestoneId === 'company-assessments' ? 'space-y-5' : 'lg:col-span-2 space-y-5'}>

              {/* Validation Steps */}
              {m.validationSteps && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">Validation Pipeline</h3>
                    <div className="relative flex items-start gap-0">
                      {m.validationSteps.map((step, i) => {
                        const isDone = step.status === 'done';
                        const isActive = step.status === 'in-progress';
                        const isLast = i === m.validationSteps!.length - 1;
                        return (
                          <div key={step.label} className="flex-1 flex flex-col items-center relative">
                            {/* Connector line */}
                            {!isLast && (
                              <div className={cn(
                                'absolute top-4 left-1/2 w-full h-0.5',
                                isDone ? 'bg-w-green' : 'bg-border'
                              )} />
                            )}
                            {/* Circle */}
                            <div className={cn(
                              'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                              isDone ? 'bg-w-green text-white' :
                                isActive ? 'bg-w-green text-white ring-4 ring-w-green/20' :
                                  'bg-muted text-muted-foreground border-2 border-border'
                            )}>
                              {isDone ? <CheckCircle className="h-4 w-4" /> :
                                isActive ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> :
                                  <span>{i + 1}</span>}
                            </div>
                            {/* Label + detail */}
                            <div className="mt-2.5 text-center px-1">
                              <p className={cn(
                                'text-[11px] font-semibold leading-tight',
                                isDone ? 'text-w-green' : isActive ? 'text-w-green' : 'text-muted-foreground'
                              )}>
                                {step.label}
                                {step.label === 'Checklist Verification' && isDone && (
                                  <span className="ml-1 text-[9px] font-bold text-w-green">8/10</span>
                                )}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug hidden sm:block">
                                {step.detail}
                              </p>
                              <span className={cn(
                                'inline-block mt-1 text-[9px] font-bold uppercase tracking-wider',
                                isDone ? 'text-w-green' : isActive ? 'text-w-green' : 'text-muted-foreground/40'
                              )}>
                                {isDone ? '✓ Done' : isActive ? '● In Progress' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resume Builder — full inline */}
              {milestoneId === 'resume' && (
                <Card>
                  <CardContent className="p-0 overflow-hidden">
                    <ResumeBuilder />
                  </CardContent>
                </Card>
              )}

              {/* Company List */}
              {milestoneId === 'company-assessments' && companyListWithScores.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Company Assessments</h3>
                    <div className="space-y-2">
                      {companyListWithScores.slice(0, 4).map((c) => {
                        const attempted = c.score !== undefined;
                        const met = attempted && c.score! >= c.target!;
                        const isSelected = selectedCompany?.name === c.name;
                        return (
                          <div key={c.name}>
                            <button
                              onClick={() => attempted
                                ? setSelectedCompany(isSelected ? null : c)
                                : navigate(c.to)
                              }
                              className={cn(
                                'group w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm cursor-pointer text-left',
                                isSelected ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' :
                                  met ? 'border-w-green/20 bg-w-green/5 hover:border-w-green/40' :
                                    attempted ? 'border-primary/15 bg-primary/5 hover:border-primary/30' :
                                      'border-border bg-card hover:border-primary/20'
                              )}
                            >
                              {/* Logo */}
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white shrink-0 overflow-hidden p-1">
                                {c.logo ? (
                                  <img src={`https://www.google.com/s2/favicons?domain=${c.logo}&sz=64`} alt={c.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                  <span className="text-xs font-bold text-muted-foreground">{c.name[0]}</span>
                                )}
                              </div>

                              {/* Name + tag */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold font-[family-name:var(--font-heading)] truncate">{c.name}</p>
                                <p className="text-[10px] text-muted-foreground">{c.tag}</p>
                              </div>

                              {/* Status */}
                              {attempted ? (
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant={met ? 'success' : 'default'} className="text-[9px]">
                                    {met ? 'Completed' : 'Attempted'}
                                  </Badge>
                                  <span className={cn('text-sm font-bold tabular-nums', met ? 'text-w-green' : 'text-primary')}>
                                    {c.score}%
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/home/mocktest/briefing'); }}
                                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="h-3 w-3" /> Retry
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground shrink-0 bg-muted rounded-full px-2 py-0.5">Pending</span>
                              )}

                              <ChevronRight className={cn('h-4 w-4 shrink-0 transition-all', isSelected ? 'rotate-90 text-primary' : 'text-muted-foreground group-hover:text-primary')} />
                            </button>

                            {/* Inline detail panel */}
                            {isSelected && attempted && (
                              <div className="mt-1 rounded-xl border border-primary/20 bg-card overflow-hidden">
                                {/* Score summary */}
                                <div className="px-4 py-4 space-y-3">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                                      <p className={cn('text-xl font-extrabold font-[family-name:var(--font-heading)]', met ? 'text-w-green' : 'text-primary')}>{c.score}%</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Your Score</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                                      <p className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-foreground">{c.target}%</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Target</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                                      <p className={cn('text-xl font-extrabold font-[family-name:var(--font-heading)]', met ? 'text-w-green' : 'text-w-red')}>
                                        {met ? '+' : ''}{c.score! - c.target!}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Gap</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {met
                                      ? `You passed ${c.name} with ${c.score}% — ${c.score! - c.target!} points above target. Well done!`
                                      : `You scored ${c.score}% on ${c.name}. You need ${c.target! - c.score!} more points to meet the target. Practice more and retry.`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Inline briefing panel — triggered by Retry button */}
                            {briefingCompany === c.name && (
                              <div className="mt-1 rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-w-purple/10 shrink-0">
                                    <ClipboardList className="h-5 w-5 text-w-purple" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold font-[family-name:var(--font-heading)]">{c.name} — OA Briefing</p>
                                    <p className="text-[11px] text-muted-foreground">Review before you begin</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { label: 'Topic', value: c.tag },
                                    { label: 'Difficulty', value: 'Medium' },
                                    { label: 'Questions', value: '20' },
                                    { label: 'Time Limit', value: '30 min' },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col items-center gap-0.5 rounded-lg bg-card border border-border p-2.5 text-center">
                                      <span className="text-[10px] text-muted-foreground">{label}</span>
                                      <span className="text-xs font-bold font-[family-name:var(--font-heading)]">{value}</span>
                                    </div>
                                  ))}
                                </div>
                                <ol className="space-y-1.5">
                                  {[
                                    'You cannot go back to a previous question once you move forward.',
                                    'Only one answer can be selected per question.',
                                    'The timer starts immediately when you begin.',
                                    'No negative marking for incorrect answers.',
                                    'Results shown immediately after submission.',
                                  ].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-w-purple/10 text-w-purple text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                      {rule}
                                    </li>
                                  ))}
                                </ol>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate('/home/mocktest/test')}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" /> Start Test
                                  </button>
                                  <button
                                    onClick={() => setBriefingCompany(null)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-border text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-foreground"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* WinSpeak Analytics */}
              {m.showWinSpeakAnalytics && <WinSpeakAnalytics />}

              {/* Aptitude for Company Assessments */}
              {milestoneId === 'company-assessments' && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Aptitude for Company Assessments</h3>
                    <div className="space-y-2">
                      {([
                        { topic: 'Quantitative Aptitude', sub: 'Number systems, percentages, basic reasoning', difficulty: 'Easy' as const, icon: BarChart3, color: 'bg-w-green/10 text-w-green' },
                        { topic: 'Quantitative Aptitude', sub: 'Data interpretation, logical reasoning, verbal', difficulty: 'Medium' as const, icon: BarChart3, color: 'bg-w-orange/10 text-w-orange' },
                        { topic: 'Quantitative Aptitude', sub: 'Advanced quant, critical reasoning, coding', difficulty: 'Hard' as const, icon: BarChart3, color: 'bg-w-red/10 text-w-red' },
                      ] as const).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.difficulty} className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm border-border bg-card hover:border-primary/30">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${item.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold font-[family-name:var(--font-heading)] truncate">{item.topic} — {item.difficulty}</p>
                              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                            </div>
                            <button
                              onClick={() => navigate('/home/mocktest/briefing')}
                              className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              Start
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Breakdown */}
              {m.subItems && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Score Breakdown</h3>
                    <div className="space-y-4">
                      {m.subItems.map((sub) => {
                        const subMet = sub.score >= sub.target;
                        const gap = sub.target - sub.score;
                        return (
                          <div key={sub.label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{sub.label}</span>
                                {subMet && <CheckCircle className="h-3 w-3 text-w-green" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn('text-sm font-bold font-[family-name:var(--font-heading)]', subMet ? 'text-w-green' : 'text-foreground')}>
                                  {sub.score}%
                                </span>
                                <span className="text-[10px] text-muted-foreground">/ {sub.target}%</span>
                                {!subMet && gap > 0 && (
                                  <span className="text-[10px] text-w-red font-medium">-{gap}</span>
                                )}
                              </div>
                            </div>
                            <div className="relative">
                              <Progress value={sub.score} indicatorColor={subMet ? '#88B033' : '#5B4BDB'} className="h-2.5 rounded-full" />
                              {/* Target marker */}
                              <div
                                className="absolute top-0 h-2.5 w-px bg-foreground/30"
                                style={{ left: `${sub.target}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attempts */}
              {m.attempts && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Attempt History</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {m.attempts.map((a, i) => {
                        const isLatest = i === m.attempts!.length - 1 && a.score > 0;
                        const prevScore = i > 0 ? m.attempts![i - 1].score : 0;
                        const diff = a.score > 0 && prevScore > 0 ? a.score - prevScore : 0;
                        return (
                          <div key={a.id} className={cn(
                            'rounded-xl border p-4 text-center transition-all',
                            isLatest ? 'border-primary/30 bg-primary/5' :
                              a.score > 0 ? 'border-border' : 'border-dashed border-border/50 bg-muted/20'
                          )}>
                            {isLatest && (
                              <Badge variant="default" className="text-[8px] px-1.5 py-0 mb-2">Latest</Badge>
                            )}
                            <p className="text-[10px] text-muted-foreground mb-1">Attempt #{a.id}</p>
                            <p className={cn(
                              'text-2xl font-bold font-[family-name:var(--font-heading)]',
                              a.score > 0 ? 'text-foreground' : 'text-muted-foreground/20'
                            )}>
                              {a.score > 0 ? a.score : '--'}
                            </p>
                            {a.score > 0 && <p className="text-[10px] text-muted-foreground mt-1">{a.date}</p>}
                            {diff !== 0 && (
                              <div className={cn('flex items-center justify-center gap-0.5 mt-1', diff > 0 ? 'text-w-green' : 'text-w-red')}>
                                {diff > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                                <span className="text-[10px] font-bold">{diff > 0 ? '+' : ''}{diff}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Focus Areas */}
              {m.focusAreas && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-w-orange" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-w-orange">AI-Identified Focus Areas</h3>
                    </div>
                    <div className="space-y-2.5">
                      {m.focusAreas.map((area) => (
                        <div key={area} className="flex items-start gap-3 rounded-lg border border-w-orange/20 bg-w-orange/5 p-3">
                          <Lightbulb className="h-4 w-4 text-w-orange shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scheduled Interviews */}
              {m.scheduledInterviews && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Scheduled Interviews</h3>
                    <div className="space-y-2.5">
                      {m.scheduledInterviews.map((s, i) => (
                        <div key={i} className={cn(
                          'flex items-center gap-3 rounded-lg border p-3',
                          s.status === 'upcoming' && 'bg-primary/5 border-primary/20',
                          s.status === 'completed' && 'bg-muted/30 border-border/60',
                          s.status === 'cancelled' && 'bg-muted/20 border-border/40 opacity-60',
                        )}>
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                            s.status === 'upcoming' && 'bg-primary/10 text-primary',
                            s.status === 'completed' && 'bg-w-green/10 text-w-green',
                            s.status === 'cancelled' && 'bg-muted text-muted-foreground',
                          )}>
                            {s.status === 'completed'
                              ? <CheckCircle className="h-4 w-4" />
                              : <Calendar className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold font-[family-name:var(--font-heading)]">{s.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{s.date} · {s.time} · {s.type}</p>
                          </div>
                          <span className={cn(
                            'shrink-0 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5',
                            s.status === 'upcoming' && 'bg-primary/10 text-primary',
                            s.status === 'completed' && 'bg-w-green/10 text-w-green',
                            s.status === 'cancelled' && 'bg-muted text-muted-foreground',
                          )}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interview Questions — only shown when a category stat card is selected */}
              {m.interviewQuestions && selectedCategory && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Questions</h3>
                      {selectedCategory && (
                        <button onClick={() => setSelectedCategory(null)} className="text-[10px] text-primary hover:underline cursor-pointer">
                          Show all
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(['Behavioural', 'Technical', 'Company Specific'] as const)
                        .filter((cat) => !selectedCategory || cat === selectedCategory)
                        .map((cat) => {
                          const qs = m.interviewQuestions!.filter((q) => q.category === cat);
                          if (!qs.length) return null;
                          return (
                            <div key={cat}>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 mt-3 first:mt-0">{cat}</p>
                              <div className="space-y-1.5">
                                {qs.map((q, i) => (
                                  <button
                                    key={i}
                                    onClick={() => navigate('/home/winspeak/practice/recording', {
                                      state: { question: q.question, category: q.category, difficulty: q.difficulty }
                                    })}
                                    className={cn(
                                      'w-full flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all hover:shadow-sm cursor-pointer',
                                      q.status === 'done' ? 'bg-w-green/5 border-w-green/20 hover:border-w-green/40' : 'bg-muted/30 border-border/60 hover:border-primary/30'
                                    )}>
                                    <div className="shrink-0 mt-0.5">
                                      {q.status === 'done'
                                        ? <CheckCircle className="h-3.5 w-3.5 text-w-green" />
                                        : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn('text-xs leading-relaxed', q.status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{q.question}</p>
                                    </div>
                                    <span className={cn(
                                      'shrink-0 text-[9px] font-bold rounded px-1.5 py-0.5',
                                      q.difficulty === 'Easy' && 'bg-w-green/10 text-w-green',
                                      q.difficulty === 'Medium' && 'bg-w-orange/10 text-w-orange',
                                      q.difficulty === 'Hard' && 'bg-w-red/10 text-w-red',
                                    )}>{q.difficulty}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attempt Log */}
              {m.attemptLog && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Attempt Log</h3>
                    <div className="space-y-2">
                      {m.attemptLog.map((a, i) => {
                        const isOpen = expandedAttempt === i;
                        const panel = attemptPanel[i] ?? null;
                        return (
                          <div key={i} className="rounded-lg border border-border overflow-hidden">
                            {/* Row header */}
                            <button
                              onClick={() => { setExpandedAttempt(isOpen ? null : i); setAttemptPanel((p) => ({ ...p, [i]: null })); }}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold font-[family-name:var(--font-heading)]">{a.round}</span>
                                  <span className="text-[10px] text-muted-foreground">{a.date}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed truncate">{a.feedback}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold text-primary tabular-nums">{a.score}%</span>
                                <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isOpen && 'rotate-90')} />
                              </div>
                            </button>

                            {/* Expanded content */}
                            {isOpen && (
                              <div className="border-t border-border/60 bg-muted/20 px-3 py-3 space-y-3">
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{a.feedback}</p>

                                {/* Action buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    onClick={() => navigate('/home/winspeak/practice/recording', {
                                      state: { question: a.round, category: a.round.split(' ')[0], difficulty: 'Medium' }
                                    })}
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-2 text-[11px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="h-3 w-3" /> Retry
                                  </button>
                                  <button
                                    onClick={() => setAttemptPanel((p) => ({ ...p, [i]: p[i] === 'analysis' ? null : 'analysis' }))}
                                    className={cn(
                                      'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors cursor-pointer',
                                      panel === 'analysis' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted border-border text-foreground hover:bg-muted/80'
                                    )}
                                  >
                                    <BarChart3 className="h-3 w-3" /> Analysis
                                  </button>
                                  <button
                                    onClick={() => setAttemptPanel((p) => ({ ...p, [i]: p[i] === 'practice' ? null : 'practice' }))}
                                    className={cn(
                                      'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors cursor-pointer',
                                      panel === 'practice' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted border-border text-foreground hover:bg-muted/80'
                                    )}
                                  >
                                    <BookOpen className="h-3 w-3" /> Practice
                                  </button>
                                </div>

                                {/* Inline Analysis panel */}
                                {panel === 'analysis' && (
                                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score Breakdown — {a.round}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { label: 'Clarity', score: Math.round(a.score * 0.95) },
                                        { label: 'Structure', score: Math.round(a.score * 0.85) },
                                        { label: 'Confidence', score: Math.round(a.score * 1.05) },
                                        { label: 'Relevance', score: Math.round(a.score * 0.9) },
                                      ].map(({ label, score }) => (
                                        <div key={label}>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-muted-foreground">{label}</span>
                                            <span className="text-[10px] font-bold text-foreground tabular-nums">{Math.min(score, 100)}%</span>
                                          </div>
                                          <Progress value={Math.min(score, 100)} indicatorColor="#5B4BDB" className="h-1.5" />
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">{a.feedback}</p>
                                  </div>
                                )}

                                {/* Inline Practice panel */}
                                {panel === 'practice' && (
                                  <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recommended Practice</p>
                                    {[
                                      { label: 'STAR Method Drill', desc: 'Practice structuring answers with Situation, Task, Action, Result', icon: Target },
                                      { label: 'Mock Question Bank', desc: `${a.round.split(' ')[0]} questions — 10 curated prompts to sharpen your responses`, icon: MessageSquare },
                                      { label: 'Timed Response', desc: '2-minute timed answer — builds confidence under pressure', icon: Clock },
                                    ].map(({ label, desc, icon: Icon }) => (
                                      <button
                                        key={label}
                                        onClick={() => navigate('/home/winspeak/practice/recording', {
                                          state: { question: label, category: a.round.split(' ')[0], difficulty: 'Medium' }
                                        })}
                                        className="w-full flex items-start gap-2.5 rounded-lg border border-border p-2.5 text-left hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                                      >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                                          <Icon className="h-3 w-3" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[11px] font-semibold text-foreground">{label}</p>
                                          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{desc}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Challenge History */}
              {m.challengeHistory && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Challenge History</h3>
                    <div className="space-y-2">
                      {m.challengeHistory.map((ch, i) => (
                        <details key={i} className="group rounded-lg border border-border overflow-hidden">
                          <summary className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer list-none select-none',
                            ch.status === 'submitted' ? 'hover:bg-muted/30' : 'opacity-60'
                          )}>
                            <div className={cn(
                              'shrink-0 h-2 w-2 rounded-full',
                              ch.status === 'submitted' ? 'bg-w-green' : 'bg-muted-foreground/30'
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold font-[family-name:var(--font-heading)] truncate">{ch.topic}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{ch.week}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {ch.status === 'submitted' && ch.score !== undefined ? (
                                <span className="text-xs font-bold text-primary tabular-nums">{ch.score}</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Not submitted</span>
                              )}
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                            </div>
                          </summary>
                          {ch.status === 'submitted' && (
                            <div className="border-t border-border/60 px-3 py-3 bg-muted/20">
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                                {[
                                  { label: 'Fluency', val: ch.fluency },
                                  { label: 'Grammar', val: ch.grammar },
                                  { label: 'Clarity', val: ch.clarity },
                                  { label: 'Structure', val: ch.structure },
                                  { label: 'Relevance', val: ch.relevance },
                                  { label: 'Vocabulary', val: ch.vocabulary },
                                ].map(({ label, val }) => (
                                  <div key={label} className="text-center rounded-lg bg-card border border-border p-2">
                                    <p className="text-sm font-bold font-[family-name:var(--font-heading)] text-primary tabular-nums">{val}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground">Submitted: {ch.submittedAt}</p>
                            </div>
                          )}
                        </details>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Practice Arena */}
              {m.practiceArena && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Practice Arena</h3>
                      <div className="text-right">
                        <p className="text-lg font-extrabold font-[family-name:var(--font-heading)] text-primary tabular-nums">{m.practiceArena.totalSessions}</p>
                        <p className="text-[9px] text-muted-foreground -mt-0.5">total sessions</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {m.practiceArena.modes.map((mode) => (
                        <div key={mode.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5">
                          <span className="text-[11px] text-muted-foreground truncate">{mode.name}</span>
                          <span className="text-[11px] font-bold text-foreground tabular-nums ml-2 shrink-0">{mode.count}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Last session: {m.practiceArena.lastSession}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column — hidden for resume and company-assessments */}
            {milestoneId !== 'resume' && milestoneId !== 'company-assessments' && (
              <div className="space-y-5">
                {/* AI Tips — hidden for resume (shown inline in left column) */}
                {finalExtras.tips && finalExtras.tips.length > 0 && milestoneId !== 'resume' && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-w-amber" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {milestoneId === 'in-person' ? 'Interviewer Notes' : 'AI Recommendations'}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {finalExtras.tips.map((tip, i) => (
                          <div key={i} className="flex gap-2.5">
                            <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-w-amber" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

