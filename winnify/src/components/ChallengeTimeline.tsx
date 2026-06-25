import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface Challenge {
  week: number;
  category: string;
  title: string;
  status: 'completed' | 'active' | 'missed' | 'locked';
  score?: number;
  rank?: number;
  trend?: 'up' | 'down';
  trendValue?: number;
  timeLeft?: string;
  lockedText?: string;
  question?: string;
}

const challenges: Challenge[] = [
  { week: 15, category: '', title: '', status: 'locked', lockedText: 'Coming Soon' },
  { 
    week: 14, 
    category: 'Workplace', 
    title: 'Communicating Project Delays', 
    status: 'active', 
    timeLeft: '3 days left',
    question: 'How would you communicate a 2-week project delay to your leadership team?'
  },
  { week: 13, category: 'Leadership', title: 'Persuading a Manager', status: 'completed', score: 76, rank: 12, trend: 'up', trendValue: 3 },
  { week: 12, category: 'Career', title: 'Interview Introduction', status: 'completed', score: 73, rank: 14, trend: 'down', trendValue: 2 },
  { week: 11, category: 'Workplace', title: 'Team Conflict Resolution', status: 'missed' },
  { week: 10, category: 'Business', title: 'Product Pitch', status: 'completed', score: 78, rank: 11, trend: 'up', trendValue: 5 },
];

function StatusBadge({ status, timeLeft }: { status: Challenge['status']; timeLeft?: string }) {
  if (status === 'locked') return null;
  if (status === 'missed') {
    return <span className="text-[10px] px-2 py-0.5 rounded-full bg-w-red text-white font-semibold">Missed</span>;
  }
  if (status === 'active' && timeLeft) {
    return <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/15 text-primary-foreground/90 font-medium">{timeLeft}</span>;
  }
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Completed</span>;
}

function ScoreDisplay({ score, trend, trendValue }: { score?: number; trend?: 'up' | 'down'; trendValue?: number }) {
  if (!score) return null;
  return (
    <div className="text-right">
      <div className="text-xl font-bold font-[family-name:var(--font-heading)] text-primary">{score}</div>
      <div className="text-[10px] font-semibold mt-0.5 flex items-center gap-0.5 justify-end">
        {trend && trendValue && (
          <span className={cn(trend === 'up' ? "text-w-green" : "text-w-red")}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

function LockedCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="bg-muted/50 border border-border rounded-xl p-4 opacity-60">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Lock size={14} className="text-muted-foreground" />
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground">Week {challenge.week}</div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">{challenge.lockedText}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Challenge will be available soon</div>
    </div>
  );
}

function ActiveCard({ challenge }: { challenge: Challenge }) {
  const navigate = useNavigate();
  return (
    <div className="bg-primary rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wide">Week {challenge.week} · {challenge.category}</span>
        <StatusBadge status={challenge.status} timeLeft={challenge.timeLeft} />
      </div>
      <p className="text-sm font-medium text-primary-foreground/95 leading-relaxed mb-3">
        "{challenge.question}"
      </p>
      <div className="flex justify-between items-center gap-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-card text-muted-foreground font-medium">Not Attempted</span>
        <button 
          onClick={() => navigate('/home/winspeak/challenge/detail')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card text-primary hover:opacity-90 transition-opacity"
        >
          Start Challenge
        </button>
      </div>
    </div>
  );
}

function CompletedCard({ challenge }: { challenge: Challenge }) {
  const navigate = useNavigate();
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Week {challenge.week} · {challenge.category}</span>
          <div className="text-sm font-semibold text-foreground mt-2">{challenge.title}</div>
        </div>
        <ScoreDisplay score={challenge.score} trend={challenge.trend} trendValue={challenge.trendValue} />
      </div>
      <div className="flex gap-2 items-center">
        {challenge.rank && (
          <span 
            onClick={() => navigate('/home/winspeak/leaderboard')}
            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold cursor-pointer hover:bg-primary hover:text-white transition-colors"
          >
            Rank #{challenge.rank}
          </span>
        )}
        <button 
          onClick={() => navigate('/home/winspeak/report')}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View Report →
        </button>
      </div>
    </div>
  );
}

function MissedCard({ challenge }: { challenge: Challenge }) {
  const navigate = useNavigate();
  return (
    <div className="bg-w-red/10 border border-w-red/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-w-red/20 text-w-red font-semibold">Week {challenge.week} · {challenge.category}</span>
          <div className="text-sm font-semibold text-foreground mt-2">{challenge.title}</div>
        </div>
        <StatusBadge status={challenge.status} />
      </div>
      <button 
        onClick={() => navigate('/home/winspeak/recording')}
        className="text-xs font-semibold text-w-red hover:underline"
      >
        Retake Challenge →
      </button>
    </div>
  );
}

function TimelineItem({ challenge }: { challenge: Challenge }) {
  const getCard = () => {
    switch (challenge.status) {
      case 'locked': return <LockedCard challenge={challenge} />;
      case 'active': return <ActiveCard challenge={challenge} />;
      case 'completed': return <CompletedCard challenge={challenge} />;
      case 'missed': return <MissedCard challenge={challenge} />;
      default: return null;
    }
  };

  return (
    <div className={`timeline-item ${challenge.status}`}>
      <div className="timeline-marker">
        <div className={`marker-dot ${challenge.status}`}></div>
        <div className="marker-line"></div>
      </div>
      <div className="timeline-content">
        {getCard()}
      </div>
    </div>
  );
}

export function ChallengeTimeline() {
  return (
    <div className="space-y-0">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Challenge Timeline</p>
      <div className="challenge-timeline">
        {challenges.map((challenge) => (
          <TimelineItem 
            key={challenge.week} 
            challenge={challenge}
          />
        ))}
      </div>
    </div>
  );
}
