import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';

export default function WinSpeakLeaderboard() {
  const navigate = useNavigate();
  const topThree = [
    { rank: 2, name: 'Arjun Mehta', school: 'IIT Bombay', score: 86, avatar: 'AM' },
    { rank: 1, name: 'Priya Sharma', school: 'BITS Pilani', score: 89, avatar: 'PS' },
    { rank: 3, name: 'Neha Gupta', school: 'NIT Trichy', score: 82, avatar: 'NG' }
  ];

  const otherRanks = [
    { rank: 4, name: 'Rahul Kumar', school: 'IIIT Hyderabad', score: 79 },
    { rank: 5, name: 'Ananya Singh', school: 'VIT Vellore', score: 78 },
    { rank: 6, name: 'Karthik Reddy', school: 'BITS Goa', score: 76 },
    { rank: 7, name: 'Divya Patel', school: 'IIT Delhi', score: 75 },
    { rank: 8, name: 'Aditya Sharma', school: 'NIT Surathkal', score: 74 },
    { rank: 9, name: 'Sneha Iyer', school: 'IIIT Bangalore', score: 74 },
    { rank: 10, name: 'Rohan Joshi', school: 'BITS Pilani', score: 73 },
    { rank: 11, name: 'Pooja Nair', school: 'IIT Madras', score: 73 },
    { rank: 12, name: 'You · Sameer', school: 'CBIT Hyderabad', score: 74, isMe: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Week 14 Leaderboard</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">20 Mar - 26 Mar 2026 · 3rd Year</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-w-green/10 text-w-green font-bold">Live</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Challenge name */}
        <div className="bg-muted rounded-[20px] p-3.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1">This Week's Challenge</div>
          <div className="text-xs font-bold">Communicating a Delay</div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 h-44">
          {/* Rank 2 */}
          <div className="flex-1 flex flex-col items-center gap-2.5">
            <div className="w-13 h-13 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {topThree[0].avatar}
            </div>
            <div className="text-center">
              <div className="text-xs font-bold">{topThree[0].name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{topThree[0].school}</div>
              <div className="text-base font-bold text-primary mt-1.5">{topThree[0].score}</div>
            </div>
            <div className="w-full h-15 bg-primary/10 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex-1 flex flex-col items-center gap-2.5">
            <div className="relative">
              <div className="w-15 h-15 rounded-full bg-primary border-3 border-w-amber flex items-center justify-center text-base font-bold text-primary-foreground">
                {topThree[1].avatar}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-w-amber flex items-center justify-center">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold">{topThree[1].name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{topThree[1].school}</div>
              <div className="text-lg font-bold text-primary mt-1.5">{topThree[1].score}</div>
            </div>
            <div className="w-full h-20 bg-primary rounded-t-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">1</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex-1 flex flex-col items-center gap-2.5">
            <div className="w-13 h-13 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {topThree[2].avatar}
            </div>
            <div className="text-center">
              <div className="text-xs font-bold">{topThree[2].name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{topThree[2].school}</div>
              <div className="text-base font-bold text-primary mt-1.5">{topThree[2].score}</div>
            </div>
            <div className="w-full h-12 bg-primary/5 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
          </div>
        </div>

        {/* Ranked List */}
        <div className="bg-card border border-border rounded-[20px] overflow-hidden">
          {otherRanks.map((entry, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < otherRanks.length - 1 ? 'border-b border-border' : ''} ${entry.isMe ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${entry.isMe ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-muted border border-border text-muted-foreground'}`}>
                {entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold truncate ${entry.isMe ? 'text-primary' : ''}`}>{entry.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{entry.school}</div>
              </div>
              <div className={`text-sm font-bold ${entry.isMe ? 'text-primary' : ''}`}>{entry.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Footer - Your Rank */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary px-5 py-3.5 flex items-center gap-3 border-t border-primary-foreground/10 z-30">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 flex items-center justify-center text-sm font-bold text-primary-foreground">
          12
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-primary-foreground">Your Rank</div>
          <div className="text-[10px] text-primary-foreground/70 mt-0.5">CBIT Hyderabad</div>
        </div>
        <div className="text-lg font-bold text-primary-foreground">74</div>
      </div>
    </div>
  );
}
