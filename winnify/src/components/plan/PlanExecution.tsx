import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { usePlan } from '@/contexts/PlanContext';
import {
  BookOpen, FileText, Building2, Mic, Briefcase, Users, Award,
  Lock, CheckCircle, ChevronRight,
  ArrowLeft, Target, Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── Types ────────────────────────────────────────────────────── */
export interface Attempt {
  id: number;
  score: number;
  date: string;
}

export interface Milestone {
  id: string;
  title: string;
  icon: LucideIcon;
  dayRange: string;
  status: 'completed' | 'active' | 'locked';
  score: number;
  targetScore: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  attempts?: Attempt[];
  focusAreas?: string[];
  subItems?: { label: string; score: number; target: number }[];
  summary: string;
  validationSteps?: { label: string; status: 'done' | 'in-progress' | 'pending'; detail: string }[];
  manualValidation?: { status: 'verified' | 'pending' | 'not-submitted'; reviewer: string; date: string; notes: string };
  statusChips?: { label: string; status: 'done' | 'in-progress' | 'pending' }[];
  completionCount?: { done: number; total: number; label?: string };
  winSpeakScore?: number;
  interviewQuestions?: { category: string; question: string; difficulty: 'Easy' | 'Medium' | 'Hard'; status: 'done' | 'pending' }[];
  attemptLog?: { round: string; score: number; date: string; feedback: string }[];
  scheduledInterviews?: { title: string; date: string; time: string; type: string; status: 'upcoming' | 'completed' | 'cancelled' }[];
  companyList?: { name: string; logo?: string; tag: string; score?: number; target?: number; to: string }[];
  challengeHistory?: {
    week: string; topic: string; status: 'submitted' | 'not-submitted';
    score?: number; fluency?: number; grammar?: number; clarity?: number;
    structure?: number; relevance?: number; vocabulary?: number; submittedAt?: string;
  }[];
  practiceArena?: {
    totalSessions: number; lastSession: string;
    modes: { name: string; count: number }[];
  };
  showWinSpeakAnalytics?: boolean;
}

interface Props {
  track: string;
  domain: string;
  onReconfigure: () => void;
  onBack: () => void;
}

/* ── Milestone Data (exported for detail page) ────────────────── */
export const milestones: Milestone[] = [
  {
    id: 'revision',
    title: 'Revision Course',
    icon: BookOpen,
    dayRange: 'Day 1–15',
    status: 'active',
    score: 78,
    targetScore: 75,
    trend: 'up',
    trendValue: '+12%',
    summary: 'Covered all core CS fundamentals across 8 chapters and 29 lessons — Arrays & Strings, Linked Lists, Trees & BST, Graphs, DP, Sorting, and System Design. DSA and OS were strongest. DBMS could use a quick refresher. Target met — milestone complete.',
    completionCount: { done: 26, total: 29, label: 'completed' },
  },
  {
    id: 'resume',
    title: 'Resume Builder',
    icon: FileText,
    dayRange: 'Day 16–25',
    status: 'active',
    score: 72,
    targetScore: 85,
    trend: 'up',
    trendValue: '+8%',
    summary: 'Resume built with Classic template. ATS scan passed at 78/100. Content and format reviews are in progress. Manual validation by Prof. Sharma is scheduled for Apr 28. Score improved from 58 to 72 across 3 attempts.',
    validationSteps: [
      { label: 'Checklist Verification', status: 'done', detail: 'All required sections verified against placement checklist · 8/10 completed' },
      { label: 'Resume Build', status: 'pending', detail: 'Built using Classic template — content review in progress' },
      { label: 'ATS Validation', status: 'pending', detail: 'Automated scan for keyword match and formatting compliance' },
      { label: 'Download', status: 'pending', detail: 'Final resume approved and ready to download' },
    ],
    manualValidation: {
      status: 'pending',
      reviewer: 'Prof. Sharma (Placement Cell)',
      date: 'Scheduled — Apr 28',
      notes: 'Submit final version by Apr 26 for manual review',
    },
    statusChips: [
      { label: 'In Progress', status: 'in-progress' },
    ],
  },
  {
    id: 'company-assessments',
    title: 'Company Assessments',
    icon: Building2,
    dayRange: 'Day 26–40',
    status: 'active',
    score: 65,
    targetScore: 80,
    trend: 'up',
    trendValue: '+5%',
    summary: 'Practicing OA rounds for TCS NQT, Infosys InfyTQ, Wipro NLTH, and Google. TCS and Wipro targets met. Google OA needs significant improvement — focus on DSA hard problems and time management.',
    completionCount: { done: 4, total: 8, label: 'attempted' },
    companyList: [
      { name: 'TCS NQT', tag: 'IT Services', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'tcs.com' },
      { name: 'Infosys InfyTQ', tag: 'IT Services', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'infosys.com' },
      { name: 'Wipro NLTH', tag: 'IT Services', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'wipro.com' },
      { name: 'Google', tag: 'Product', score: 50, target: 85, to: '/home/mocktest/briefing', logo: 'google.com' },
      { name: 'Microsoft', tag: 'Product', to: '/home/mocktest/briefing', logo: 'microsoft.com' },
      { name: 'Amazon', tag: 'Product', to: '/home/mocktest/briefing', logo: 'amazon.com' },
      { name: 'Cognizant', tag: 'IT Services', to: '/home/mocktest/briefing', logo: 'cognizant.com' },
      { name: 'Accenture', tag: 'Consulting', to: '/home/mocktest/briefing', logo: 'accenture.com' },
    ],
  },
  {
    id: 'winspeak',
    title: 'WinSpeak Challenges',
    icon: Mic,
    dayRange: 'Day 41–55',
    status: 'active',
    score: 60,
    targetScore: 80,
    trend: 'up',
    trendValue: '+10%',
    summary: 'Communication skills improving steadily. Fluency is the strongest area at 74. Structure needs the most work — practice with timed responses and STAR method for behavioral questions.',
    completionCount: { done: 32, total: 40, label: 'Challenges' },
    winSpeakScore: 32,
    showWinSpeakAnalytics: true,
    challengeHistory: [
      { week: 'Week 4 — 22 Apr 2025', topic: 'Explain a technical project to a non-technical audience', status: 'submitted', score: 72, fluency: 74, grammar: 70, clarity: 68, structure: 65, relevance: 78, vocabulary: 72, submittedAt: '22 Apr 2025, 3:45 PM' },
      { week: 'Week 3 — 15 Apr 2025', topic: 'Pitch your final year project idea in 2 minutes', status: 'submitted', score: 65, fluency: 68, grammar: 62, clarity: 60, structure: 58, relevance: 70, vocabulary: 65, submittedAt: '15 Apr 2025, 5:12 PM' },
      { week: 'Week 2 — 08 Apr 2025', topic: 'Describe a challenge you overcame using STAR method', status: 'submitted', score: 58, fluency: 60, grammar: 55, clarity: 55, structure: 52, relevance: 62, vocabulary: 58, submittedAt: '08 Apr 2025, 7:30 PM' },
      { week: 'Week 1 — 01 Apr 2025', topic: 'Introduce yourself for a campus placement interview', status: 'not-submitted' },
    ],
  },
  {
    id: 'employability',
    title: 'Winnify AI Interview',
    icon: Briefcase,
    dayRange: 'Day 56–70',
    status: 'active',
    score: 61,
    targetScore: 80,
    trend: 'up',
    trendValue: '+3%',
    summary: 'Mock interview rounds started. Behavioural average at 66 across 2 rounds. Technical round at 50 — needs work on decorators, memory management, and system design basics. Company Specific not yet started.',
    statusChips: [
      { label: 'Behavioural', status: 'in-progress' },
      { label: 'Technical', status: 'in-progress' },
      { label: 'Company Specific', status: 'pending' },
    ],
    interviewQuestions: [
      { category: 'Behavioural', question: 'Tell me about a time you handled a conflict in a team.', difficulty: 'Medium', status: 'done' },
      { category: 'Behavioural', question: 'Describe a situation where you failed and what you learned.', difficulty: 'Medium', status: 'done' },
      { category: 'Behavioural', question: 'Give an example of when you showed leadership.', difficulty: 'Easy', status: 'done' },
      { category: 'Technical', question: 'Explain Python decorators with an example.', difficulty: 'Medium', status: 'done' },
      { category: 'Technical', question: 'Design a URL shortener system.', difficulty: 'Hard', status: 'pending' },
      { category: 'Technical', question: 'What is memory management in Python? Explain GC.', difficulty: 'Medium', status: 'pending' },
      { category: 'Company Specific', question: 'Why do you want to join this company?', difficulty: 'Easy', status: 'pending' },
      { category: 'Company Specific', question: 'Where do you see yourself in 5 years?', difficulty: 'Easy', status: 'pending' },
      { category: 'Company Specific', question: 'How do you align with our company values?', difficulty: 'Medium', status: 'pending' },
    ],
    attemptLog: [
      { round: 'Behavioural #1', score: 62, date: 'Apr 18', feedback: 'Good STAR structure on Q1. Lacked specifics on failure question.' },
      { round: 'Behavioural #2', score: 70, date: 'Apr 21', feedback: 'Improved confidence. Leadership example was strong.' },
      { round: 'Technical #1', score: 50, date: 'Apr 23', feedback: 'Decorators explained partially. System design needs more depth.' },
    ],
  },
  {
    id: 'in-person',
    title: 'In-Person Interview',
    icon: Users,
    dayRange: 'Day 71–85',
    status: 'active',
    score: 30,
    targetScore: 80,
    trend: 'neutral',
    trendValue: '+0%',
    summary: 'First mock in-person interview completed with a score of 30. Two more attempts remaining. Focus on body language, whiteboard coding, and structured problem-solving under pressure.',
    attempts: [
      { id: 1, score: 30, date: 'Apr 22' },
      { id: 2, score: 0, date: '--' },
      { id: 3, score: 0, date: '--' },
    ],
    statusChips: [
      { label: '1st Interview', status: 'done' },
      { label: '2nd Interview', status: 'pending' },
    ],
    scheduledInterviews: [
      { title: 'In-Person Mock #2', date: 'Apr 30', time: '10:00 AM', type: 'Technical', status: 'upcoming' },
      { title: 'In-Person Mock #3', date: 'May 5', time: '2:00 PM', type: 'Full Round', status: 'upcoming' },
      { title: 'In-Person Mock #1', date: 'Apr 22', time: '11:00 AM', type: 'Technical', status: 'completed' },
    ],
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function PlanExecution({ track, domain, onReconfigure, onBack }: Props) {
  const navigate = useNavigate();
  const { selectedAreas, duration, skills, weeklySkills } = usePlan();

  const cgpa = localStorage.getItem('student-cgpa') || '7.8';
  const arrears = localStorage.getItem('student-arrears') || '0';

  const isMech = track === 'MECH';
  const isEEE  = track === 'EEE';
  const isECE  = track === 'ECE';
  const isCivil = track === 'CIVIL';
  const isChem = track === 'CHEM';
  const isBio  = track === 'BIO';
  const isNonCS = isMech || isEEE || isECE || isCivil || isChem || isBio;

  // Build dynamic revision milestone values
  const revisionDayEnd = duration ? duration.days : 15;
  const revisionDayRange = `Day 1–${revisionDayEnd}`;
  const areaList = selectedAreas.length > 0
    ? selectedAreas.slice(0, 3).join(', ') + (selectedAreas.length > 3 ? ` and ${selectedAreas.length - 3} more` : '')
    : domain || 'Computer Science';
  const revisionSummary = `Covering ${skills.length} skills across ${weeklySkills.length} weeks — ${areaList}. ${
    duration ? `At ${Math.round((skills.length * 5) / duration.totalWeeks * 10) / 10}h/week pace (${duration.label}).` : ''
  } Focus on Mandatory skills first before Extra edge topics.`;

  // Role-based company list for CS track (driven by selected job role from Learning page)
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
  const csCompanyList = roleCompanyMap[roleTitle] ?? milestones.find(m => m.id === 'company-assessments')!.companyList!;

  // Dynamic company list per stream
  const streamCompanyList = isNonCS ? [
    isMech ? { name: 'L&T Engineering', tag: 'Manufacturing', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'larsentoubro.com' } :
    isEEE  ? { name: 'ABB India', tag: 'Power & Automation', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'abb.com' } :
    isECE  ? { name: 'Qualcomm', tag: 'Semiconductors', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'qualcomm.com' } :
    isCivil ? { name: 'L&T Construction', tag: 'Infrastructure', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'larsentoubro.com' } :
    isChem  ? { name: 'Reliance Industries', tag: 'Petrochemicals', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'ril.com' } :
    { name: 'Biocon', tag: 'Biotechnology', score: 72, target: 70, to: '/home/mocktest/briefing', logo: 'biocon.com' },

    isMech ? { name: 'Tata Motors', tag: 'Automotive', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'tatamotors.com' } :
    isEEE  ? { name: 'Siemens India', tag: 'Electrical', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'siemens.com' } :
    isECE  ? { name: 'Texas Instruments', tag: 'Semiconductors', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'ti.com' } :
    isCivil ? { name: 'Shapoorji Pallonji', tag: 'Construction', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'shapoorjipallonji.com' } :
    isChem  ? { name: 'ONGC', tag: 'Oil & Gas', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'ongcindia.com' } :
    { name: 'Dr. Reddy\'s', tag: 'Pharma', score: 68, target: 70, to: '/home/mocktest/briefing', logo: 'drreddys.com' },

    isMech ? { name: 'Mahindra & Mahindra', tag: 'Automotive', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'mahindra.com' } :
    isEEE  ? { name: 'BHEL', tag: 'Power Equipment', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'bhel.in' } :
    isECE  ? { name: 'Intel', tag: 'Semiconductors', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'intel.com' } :
    isCivil ? { name: 'DLF', tag: 'Real Estate', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'dlf.in' } :
    isChem  ? { name: 'BASF India', tag: 'Chemicals', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'basf.com' } :
    { name: 'Sun Pharma', tag: 'Pharma', score: 70, target: 65, to: '/home/mocktest/briefing', logo: 'sunpharma.com' },

    isMech ? { name: 'Bosch India', tag: 'Auto Components', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'bosch.com' } :
    isEEE  ? { name: 'Schneider Electric', tag: 'Energy Mgmt', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'se.com' } :
    isECE  ? { name: 'Samsung Semiconductor', tag: 'Semiconductors', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'samsung.com' } :
    isCivil ? { name: 'NHAI', tag: 'Infrastructure', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'nhai.gov.in' } :
    isChem  ? { name: 'Dow Chemical', tag: 'Chemicals', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'dow.com' } :
    { name: 'Cipla', tag: 'Pharma', score: 50, target: 80, to: '/home/mocktest/briefing', logo: 'cipla.com' },

    isMech ? { name: 'Caterpillar India', tag: 'Heavy Equipment', to: '/home/mocktest/briefing', logo: 'cat.com' } :
    isEEE  ? { name: 'Havells India', tag: 'Electrical', to: '/home/mocktest/briefing', logo: 'havells.com' } :
    isECE  ? { name: 'Broadcom', tag: 'Semiconductors', to: '/home/mocktest/briefing', logo: 'broadcom.com' } :
    isCivil ? { name: 'Gammon India', tag: 'Construction', to: '/home/mocktest/briefing', logo: 'gammonindia.com' } :
    isChem  ? { name: 'Tata Chemicals', tag: 'Chemicals', to: '/home/mocktest/briefing', logo: 'tatachemicals.com' } :
    { name: 'Lupin', tag: 'Pharma', to: '/home/mocktest/briefing', logo: 'lupin.com' },

    isMech ? { name: 'Cummins India', tag: 'Power Systems', to: '/home/mocktest/briefing', logo: 'cummins.com' } :
    isEEE  ? { name: 'Crompton Greaves', tag: 'Electrical', to: '/home/mocktest/briefing', logo: 'cromptongreaves.com' } :
    isECE  ? { name: 'MediaTek', tag: 'Semiconductors', to: '/home/mocktest/briefing', logo: 'mediatek.com' } :
    isCivil ? { name: 'Afcons Infrastructure', tag: 'Construction', to: '/home/mocktest/briefing', logo: 'afcons.com' } :
    isChem  ? { name: 'UPL Limited', tag: 'Agrochemicals', to: '/home/mocktest/briefing', logo: 'upl-ltd.com' } :
    { name: 'Wockhardt', tag: 'Pharma', to: '/home/mocktest/briefing', logo: 'wockhardt.com' },

    isMech ? { name: 'Thermax India', tag: 'Energy & Env', to: '/home/mocktest/briefing', logo: 'thermaxglobal.com' } :
    isEEE  ? { name: 'Emerson Electric', tag: 'Automation', to: '/home/mocktest/briefing', logo: 'emerson.com' } :
    isECE  ? { name: 'NXP Semiconductors', tag: 'Semiconductors', to: '/home/mocktest/briefing', logo: 'nxp.com' } :
    isCivil ? { name: 'Sterlite Power', tag: 'Infrastructure', to: '/home/mocktest/briefing', logo: 'sterlitepower.com' } :
    isChem  ? { name: 'Pidilite Industries', tag: 'Specialty Chem', to: '/home/mocktest/briefing', logo: 'pidilite.com' } :
    { name: 'Piramal Pharma', tag: 'Pharma', to: '/home/mocktest/briefing', logo: 'piramal.com' },

    isMech ? { name: 'Godrej & Boyce', tag: 'Engineering', to: '/home/mocktest/briefing', logo: 'godrej.com' } :
    isEEE  ? { name: 'Legrand India', tag: 'Electrical', to: '/home/mocktest/briefing', logo: 'legrand.com' } :
    isECE  ? { name: 'Renesas Electronics', tag: 'Semiconductors', to: '/home/mocktest/briefing', logo: 'renesas.com' } :
    isCivil ? { name: 'IRB Infrastructure', tag: 'Roads & Highways', to: '/home/mocktest/briefing', logo: 'irb.co.in' } :
    isChem  ? { name: 'Coromandel International', tag: 'Fertilizers', to: '/home/mocktest/briefing', logo: 'coromandel.com' } :
    { name: 'Aurobindo Pharma', tag: 'Pharma', to: '/home/mocktest/briefing', logo: 'aurobindo.com' },
  ] : csCompanyList;

  // Dynamic summaries per stream
  const streamSummaries: Record<string, Partial<Record<string, string>>> = {
    resume: {
      MECH: 'Resume built highlighting CAD/CAM skills and project experience. ATS scan passed at 78/100. Manual validation by Prof. Sharma scheduled for Apr 28.',
      EEE:  'Resume built highlighting power systems and circuit design. ATS scan passed at 78/100. Manual validation scheduled for Apr 28.',
      ECE:  'Resume built highlighting embedded systems and VLSI skills. ATS scan passed at 78/100. Manual validation scheduled for Apr 28.',
      default: 'Resume built with Classic template. ATS scan passed at 78/100. Content and format reviews are in progress. Manual validation by Prof. Sharma is scheduled for Apr 28.',
    },
    'company-assessments': {
      MECH: `Practicing OA rounds for core engineering companies — L&T, Tata Motors, Mahindra, and Bosch. L&T and Mahindra targets nearly met. Bosch OA needs improvement — focus on core mechanical and aptitude sections.`,
      EEE:  `Practicing OA rounds for ABB, Siemens, BHEL, and Schneider Electric. ABB and BHEL targets nearly met. Schneider OA needs improvement — focus on power systems and electrical aptitude.`,
      ECE:  `Practicing OA rounds for Qualcomm, TI, Intel, and Samsung. Qualcomm and Intel targets nearly met. Samsung OA needs improvement — focus on VLSI and signal processing.`,
      default: 'Practicing OA rounds for TCS NQT, Infosys InfyTQ, Wipro NLTH, and Google. TCS and Wipro targets met. Google OA needs significant improvement — focus on DSA hard problems and time management.',
    },
    winspeak: {
      MECH: 'Communication skills improving steadily. Technical presentation and project explanation are strongest. Work on structured problem-solving explanations for engineering interviews.',
      EEE:  'Communication skills improving. Technical explanation of circuit concepts is strongest. Work on clarity when explaining power systems concepts to non-technical audiences.',
      ECE:  'Communication skills improving. Explaining embedded systems concepts clearly is strongest. Work on structured responses for technical deep-dives.',
      default: 'Communication skills improving steadily. Fluency is the strongest area at 74. Structure needs the most work — practice with timed responses and STAR method for behavioral questions.',
    },
    employability: {
      MECH: 'Mock interview rounds started. Technical round at 50 — needs work on core mechanical concepts, design principles, and manufacturing processes. Behavioral round improving.',
      EEE:  'Mock interview rounds started. Technical round at 50 — needs work on power systems, machines, and control theory. Behavioral round improving.',
      ECE:  'Mock interview rounds started. Technical round at 50 — needs work on digital electronics, communication systems, and VLSI. Behavioral round improving.',
      default: 'Mock interview rounds started. Behavioural average at 66 across 2 rounds. Technical round at 50 — needs work on decorators, memory management, and system design basics. Company Specific not yet started.',
    },
    'in-person': {
      MECH: 'First mock in-person interview completed with a score of 30. Focus on whiteboard problem-solving, design calculations, and structured engineering reasoning under pressure.',
      EEE:  'First mock in-person interview completed with a score of 30. Focus on circuit analysis on whiteboard, power calculations, and structured technical reasoning.',
      ECE:  'First mock in-person interview completed with a score of 30. Focus on digital circuit design on whiteboard, signal analysis, and structured technical reasoning.',
      default: 'First mock in-person interview completed with a score of 30. Two more attempts remaining. Focus on body language, whiteboard coding, and structured problem-solving under pressure.',
    },
  };

  function getSummary(milestoneId: string, fallback: string): string {
    const map = streamSummaries[milestoneId];
    if (!map) return fallback;
    return map[track] || map['default'] || fallback;
  }

  // Shared revision completion numbers — single source of truth
  const revisionTotalSkills = skills.length;
  const revisionDoneSkills = Math.round(revisionTotalSkills * 0.35);

  // Inject dynamic values into all milestones
  const dynamicMilestones = milestones.map((m) => {
    let updatedM = { ...m, summary: getSummary(m.id, m.summary) };

    const currentRoleTitle = sessionStorage.getItem('plan-role-title') ?? '';
    const isSpecialRole = currentRoleTitle === 'AI Engineer' || currentRoleTitle === 'Automotive Engineer';
    
    if (isSpecialRole && (m.id === 'resume' || m.id === 'winspeak')) {
      updatedM.status = 'completed';
      updatedM.score = 100;
      if (m.id === 'resume') {
        updatedM.statusChips = [{ label: 'Completed', status: 'done' }];
      } else if (m.id === 'winspeak') {
        updatedM.completionCount = { done: 40, total: 40, label: 'Challenges' };
      }
    }

    if (m.id === 'revision') {
      return {
        ...updatedM,
        dayRange: revisionDayRange,
        summary: revisionSummary,
        // Keep score/status as demo values — only update the pill count
        completionCount: { done: revisionDoneSkills, total: revisionTotalSkills, label: 'completed' },
      };
    }
    if (m.id === 'company-assessments') {
      return { ...updatedM, companyList: streamCompanyList };
    }
    return updatedM;
  });

  const completedCount = dynamicMilestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = dynamicMilestones.length;
  const overallProgress = Math.round((completedCount / totalMilestones) * 100);
  const placementReady = dynamicMilestones.every((m) => m.score >= m.targetScore);

  // Dynamic day counter — based on when plan was generated vs today
  const totalDays = duration ? duration.days : 90;
  const planStartRaw = sessionStorage.getItem('plan-start-date');
  const planStart = planStartRaw ? new Date(planStartRaw) : null;
  const currentDay = planStart
    ? Math.min(Math.max(1, Math.floor((Date.now() - planStart.getTime()) / 86_400_000) + 1), totalDays)
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back link — goes directly to /home/learning */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Slog Overs
      </button>

      {/* Header row — title left, CGPA/Arrears/stats right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Slog Overs — Execution Plan</h1>
          <Badge variant="default">{track.toUpperCase()}</Badge>
          <Badge variant="info">{sessionStorage.getItem('plan-display-domain') || domain}</Badge>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* CGPA */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">CGPA</span>
            <span className="text-xs font-bold text-primary tabular-nums">{cgpa}</span>
          </div>
          {/* Arrears */}
          <div className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5', Number(arrears) > 0 ? 'border-w-red/30 bg-w-red/5' : 'border-border bg-card')}>
            <span className="text-[11px] text-muted-foreground font-medium">Arrears</span>
            <span className={cn('text-xs font-bold tabular-nums', Number(arrears) > 0 ? 'text-w-red' : 'text-w-green')}>{arrears}</span>
          </div>
          {/* Day / Progress / Milestones */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-semibold font-[family-name:var(--font-heading)]">
                {currentDay ? `Day ${currentDay} of ${totalDays}` : `${totalDays} days`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span className="font-semibold font-[family-name:var(--font-heading)]">{overallProgress}%</span>
              <span>complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placement Readiness */}
      <Card className={cn('hover:shadow-md transition-shadow', placementReady && 'border-w-green/40')}>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                placementReady ? 'bg-w-green/10 text-w-green' : 'bg-muted text-muted-foreground'
              )}>
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-[family-name:var(--font-heading)]">
                  {placementReady ? 'Placement Ready!' : 'Placement Readiness'}
                </h3>
                {/* <p className="text-xs text-muted-foreground">
                  {placementReady
                    ? 'You have met all the criteria. You are ready for placements.'
                    : `${completedCount}/${totalMilestones} milestones completed`}
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {dynamicMilestones.slice(0, -1).map((m) => {
                const isDone = m.status === 'completed';
                return (
                  <div key={m.id} className="flex items-center gap-1.5" title={m.title}>
                    {isDone ? (
                      <CheckCircle className="h-4 w-4 text-w-green shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                    )}
                    <span className="text-[10px] text-muted-foreground hidden lg:inline">
                      {m.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Cards — summary only */}
      <div className="space-y-3">
        {dynamicMilestones.map((m) => {
          const isLocked = m.status === 'locked';
          const isCompleted = m.status === 'completed';
          const useGreenBar = isCompleted && m.id !== 'revision';
          const iconColor = '#5B4BDB';

          const cardContent = (
            <>
              {/* Card header */}
              <div className="flex items-center gap-3 p-4">
                {/* Icon */}
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-primary/10'
                )} style={{ color: iconColor }}>
                  {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> :
                   <m.icon className="h-4 w-4" />}
                </div>

                {/* Title + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-[family-name:var(--font-heading)] truncate">{m.title}</span>
                  </div>
                  {!isLocked && (
                    <Progress value={m.score} indicatorColor={useGreenBar ? 'var(--color-w-green)' : '#5B4BDB'} className="h-1.5 mt-2" />
                  )}
                </div>

                {/* Right-side extras */}
                {!isLocked && (
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Status chips */}
                    {m.statusChips && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        {m.statusChips.map((chip) => (
                          <span key={chip.label} className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                            chip.status === 'done'        && 'bg-w-green/10 text-w-green',
                            chip.status === 'in-progress' && 'bg-primary/10 text-primary',
                            chip.status === 'pending'     && 'bg-muted/80 text-muted-foreground',
                          )}>
                            {chip.status === 'done'        && <CheckCircle className="h-2.5 w-2.5 shrink-0" />}
                            {chip.status === 'in-progress' && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
                            {chip.status === 'pending'     && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />}
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Completion count */}
                    {m.completionCount && (
                      <div className="hidden sm:flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap bg-primary/10 text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                          {m.completionCount.done}/{m.completionCount.total} {m.completionCount.label ?? 'done'}
                        </span>
                      </div>
                    )}

                    {/* WinSpeak score */}
                    {m.winSpeakScore !== undefined && (
                      <div className="hidden sm:flex">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap bg-w-blue/10 text-w-blue">
                          <span className="h-1.5 w-1.5 rounded-full bg-w-blue shrink-0" />
                          WinSpeak Score {m.winSpeakScore}
                        </span>
                      </div>
                    )}

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Card body — always visible */}
              {!isLocked && (
                <CardContent className="pt-0 pb-3 px-4">
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.summary}</p>
                  </div>
                </CardContent>
              )}
            </>
          );

          return isLocked ? (
            <Card
              key={m.id}
              className="hover:shadow-md transition-shadow overflow-hidden opacity-50"
            >
              {cardContent}
            </Card>
          ) : (
            <Card
              key={m.id}
              className="hover:shadow-md hover:cursor-pointer transition-shadow overflow-hidden"
              onClick={() => navigate(`/home/90-day-plan/milestone/${m.id}`)}
            >
              {cardContent}
            </Card>
          );
        })}
      </div>


      <Button size="lg" className="w-full" variant="outline" onClick={onReconfigure}>
        Reconfigure Plan
      </Button>
    </div>
  );
}
