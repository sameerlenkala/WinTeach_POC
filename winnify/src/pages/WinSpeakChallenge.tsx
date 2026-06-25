import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';

export default function WinSpeakChallenge() {
  const navigate = useNavigate();
  const challenges = [
    { week: 15, status: 'future', title: 'Future Challenge', date: 'Coming Soon', locked: true },
    { week: 14, status: 'current', title: 'Communicating a Delay', category: 'Workplace', question: 'How would you communicate a 2-week project delay to your leadership team?', daysLeft: 3, attempted: false },
    { week: 13, status: 'completed', title: 'Persuading a Manager', category: 'Leadership', score: 76, rank: 12, improvement: 3 },
    { week: 12, status: 'completed', title: 'Interview Introduction', category: 'Career', score: 73, rank: 14, improvement: -2 },
    { week: 11, status: 'missed', title: 'Team Conflict Resolution', category: 'Workplace' },
    { week: 10, status: 'completed', title: 'Product Pitch', category: 'Business', score: 78, rank: 11, improvement: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate('/home/winspeak')}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Challenge Dashboard</h1>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Compact Leaderboard Card */}
        <div className="bg-card border border-border rounded-[20px] overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border">
            <span className="text-xs font-bold">Leaderboard · Week 14</span>
            <button 
              onClick={() => navigate('/home/winspeak/leaderboard')}
              className="text-[10px] font-bold text-primary hover:opacity-80"
            >
              See All
            </button>
          </div>
          {[
            { rank: 1, name: 'Priya Sharma', school: 'BITS Pilani', score: 89 },
            { rank: 2, name: 'Arjun Mehta', school: 'IIT Bombay', score: 86 },
            { rank: 12, name: 'You', school: 'CBIT Hyderabad', score: 74, isMe: true }
          ].map((entry, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 px-4 py-2.5 ${i < 2 ? 'border-b border-border' : ''} ${entry.isMe ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${entry.isMe ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-muted border border-border text-muted-foreground'}`}>
                {entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${entry.isMe ? 'text-primary' : ''}`}>{entry.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{entry.school}</div>
              </div>
              <div className={`text-xs font-bold ${entry.isMe ? 'text-primary' : ''}`}>{entry.score}</div>
            </div>
          ))}
        </div>

        {/* Timeline Label */}
        <div className="ds-section-label">Challenge Timeline</div>

        {/* Challenge Cards Timeline */}
        <div className="space-y-3">
          {challenges.map((challenge, index) => {
            if (challenge.status === 'future') {
              return (
                <div key={index} className="bg-muted/30 border border-border rounded-[20px] p-4 opacity-60">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Week {challenge.week}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{challenge.date}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Challenge will be available soon</div>
                </div>
              );
            }

            if (challenge.status === 'current') {
              return (
                <div key={index} className="bg-primary rounded-[20px] p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-wide">Week {challenge.week} · {challenge.category}</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/70">{challenge.daysLeft} days left</span>
                  </div>
                  <div className="text-sm italic text-primary-foreground/90 leading-relaxed mb-3">
                    "{challenge.question}"
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">Not Attempted</span>
                    <button 
                      onClick={() => navigate('/home/winspeak/challenge/detail')}
                      className="px-4 py-1.5 rounded-full bg-primary-foreground text-primary text-xs font-bold hover:opacity-90"
                    >
                      Start Challenge
                    </button>
                  </div>
                </div>
              );
            }

            if (challenge.status === 'completed') {
              return (
                <div key={index} className="bg-card border border-border rounded-[20px] p-4">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Week {challenge.week} · {challenge.category}</div>
                      <div className="text-xs font-bold">{challenge.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{challenge.score}</div>
                      <div className={`text-[10px] font-bold mt-0.5 ${challenge.improvement! >= 0 ? 'text-w-green' : 'text-w-red'}`}>
                        {challenge.improvement! >= 0 ? '↑' : '↓'} {Math.abs(challenge.improvement!)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">Rank #{challenge.rank}</span>
                    <button 
                      onClick={() => navigate('/home/winspeak/report')}
                      className="text-[10px] font-bold text-primary hover:opacity-80"
                    >
                      View Report →
                    </button>
                  </div>
                </div>
              );
            }

            if (challenge.status === 'missed') {
              return (
                <div key={index} className="bg-w-red/10 border border-w-red/20 rounded-[20px] p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-[10px] font-bold text-w-red uppercase tracking-wide mb-1">Week {challenge.week} · {challenge.category}</div>
                      <div className="text-xs font-bold">{challenge.title}</div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-card text-w-red font-bold">Missed</span>
                  </div>
                  <button 
                    onClick={() => navigate('/home/winspeak/recording')}
                    className="text-[10px] font-bold text-w-red hover:opacity-80"
                  >
                    Retake Challenge →
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
